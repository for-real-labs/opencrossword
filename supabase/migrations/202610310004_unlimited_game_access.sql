-- Private operator-managed allowances; clients cannot read or modify emails.
create table public.game_unlimited_emails (
 email text primary key check (email = lower(btrim(email)) and email <> ''),
 created_at timestamptz not null default now()
);
alter table public.game_unlimited_emails enable row level security;
revoke all on public.game_unlimited_emails from public, anon, authenticated;
grant select, insert, update, delete on public.game_unlimited_emails to service_role;

-- Preserve the original owner policy and any existing verified allowances.
insert into public.game_unlimited_emails(email) values ('jakejohnson3700@gmail.com');
insert into public.game_unlimited_emails(email)
select distinct lower(btrim(u.email))
from public.game_accounts a join auth.users u on u.id = a.user_id
where a.unlimited and u.email_confirmed_at is not null and nullif(btrim(u.email), '') is not null
on conflict do nothing;

create or replace function public.ensure_game_account(uid uuid) returns public.game_accounts
language plpgsql security definer set search_path = '' as $$
declare result public.game_accounts;
begin
 insert into public.game_accounts(user_id, unlimited)
 select u.id, u.email_confirmed_at is not null and exists (
  select 1 from public.game_unlimited_emails a where a.email = lower(btrim(u.email))
 )
 from auth.users u where u.id = uid
 on conflict (user_id) do update set unlimited = excluded.unlimited
 returning * into result;
 return result;
end $$;
revoke execute on function public.ensure_game_account(uuid) from public, anon, authenticated;
grant execute on function public.ensure_game_account(uuid) to service_role;
