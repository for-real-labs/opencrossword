create table public.game_accounts (
 user_id uuid primary key references auth.users on delete cascade,
 credits integer not null default 10 check (credits >= 0),
 unlimited boolean not null default false
);
create table public.created_games (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users on delete cascade,
 title text not null, html text not null,
 saved boolean not null default false,
 revision integer not null default 1,
 updated_at timestamptz not null default now()
);
create table public.game_jobs (
 id uuid primary key,
 user_id uuid not null references auth.users on delete cascade,
 game_id uuid references public.created_games on delete cascade,
 prompt text not null,
 status text not null default 'pending' check(status in ('pending','complete','failed')),
 charged boolean not null default true,
 error text,
 created_at timestamptz not null default now()
);
alter table public.game_accounts enable row level security;
alter table public.created_games enable row level security;
alter table public.game_jobs enable row level security;
create policy own_account on public.game_accounts for select to authenticated using (user_id=auth.uid());
create policy own_games on public.created_games for select to authenticated using (user_id=auth.uid());
create policy own_jobs on public.game_jobs for select to authenticated using (user_id=auth.uid());
-- All mutations go through the authenticated backend. Never trust client credit or owner fields.
revoke all on public.game_accounts,public.created_games,public.game_jobs from anon,authenticated;
grant select on public.game_accounts,public.created_games,public.game_jobs to authenticated;
grant all on public.game_accounts,public.created_games,public.game_jobs to service_role;
create function public.ensure_game_account(uid uuid) returns public.game_accounts
language plpgsql security definer set search_path=public as $$
declare result public.game_accounts;
begin
 insert into game_accounts(user_id,unlimited)
 select id, lower(email)='jakejohnson3700@gmail.com' and email_confirmed_at is not null
 from auth.users where id=uid on conflict do nothing;
 select * into result from game_accounts where user_id=uid;
 return result;
end $$;
create function public.fail_game_job(jid uuid, reason text) returns void
language plpgsql security definer set search_path=public as $$
declare job game_jobs;
begin
 select * into job from game_jobs where id=jid for update;
 if job.status='pending' then
  update game_jobs set status='failed',error=reason where id=jid;
  if job.charged then update game_accounts set credits=credits+1 where user_id=job.user_id; end if;
 end if;
end $$;
create function public.reserve_game_job(uid uuid,jid uuid,gid uuid,instruction text) returns public.game_jobs
language plpgsql security definer set search_path=public as $$
declare account game_accounts; job game_jobs; stale record;
begin
 perform ensure_game_account(uid);
 select * into account from game_accounts where user_id=uid for update;
 for stale in select id from game_jobs where user_id=uid and status='pending' and created_at < now()-interval '10 minutes' loop
  perform fail_game_job(stale.id,'Generation interrupted. Your credit was returned.');
 end loop;
 select * into job from game_jobs where id=jid;
 if found then
  if job.user_id<>uid then raise exception 'Request ID unavailable'; end if;
  return job;
 end if;
 if exists(select 1 from game_jobs where user_id=uid and status='pending') then raise exception 'A game is already generating'; end if;
 if gid is not null and not exists(select 1 from created_games where id=gid and user_id=uid) then raise exception 'Game not found'; end if;
 select * into account from game_accounts where user_id=uid;
 if not account.unlimited and account.credits<1 then raise exception 'No credits remaining'; end if;
 if not account.unlimited then update game_accounts set credits=credits-1 where user_id=uid; end if;
 insert into game_jobs(id,user_id,game_id,prompt,charged) values(jid,uid,gid,instruction,not account.unlimited) returning * into job;
 return job;
end $$;
create function public.complete_game_job(jid uuid,game_title text,game_html text) returns void
language plpgsql security definer set search_path=public as $$
declare job game_jobs; gid uuid;
begin
 select * into job from game_jobs where id=jid for update;
 if job.status<>'pending' then return; end if;
 if job.game_id is null then
  insert into created_games(user_id,title,html) values(job.user_id,game_title,game_html) returning id into gid;
 else
  gid:=job.game_id;
  update created_games set title=game_title,html=game_html,revision=revision+1,updated_at=now() where id=gid and user_id=job.user_id;
 end if;
 update game_jobs set status='complete',game_id=gid where id=jid;
end $$;
revoke execute on function public.ensure_game_account(uuid),public.fail_game_job(uuid,text),public.reserve_game_job(uuid,uuid,uuid,text),public.complete_game_job(uuid,text,text) from public,anon,authenticated;
grant execute on function public.ensure_game_account(uuid),public.fail_game_job(uuid,text),public.reserve_game_job(uuid,uuid,uuid,text),public.complete_game_job(uuid,text,text) to service_role;
