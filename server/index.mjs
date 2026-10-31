import express from "express";
import { createClient } from "@supabase/supabase-js";
import { generateGame, allowedUser } from "./generator.mjs";
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY } =
  process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY)
  throw new Error("Missing backend configuration");
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token)
      return res.status(401).json({ error: "Sign in to create games." });
    const { data, error } = await db.auth.getUser(token);
    if (error || !allowedUser(data.user, process.env.APPLE_ONLY !== "false"))
      return res
        .status(401)
        .json({ error: "Sign in with Apple to create games." });
    req.user = data.user;
    next();
  } catch {
    res.status(503).json({ error: "Sign-in is temporarily unavailable." });
  }
});
const check = ({ data, error }) => {
  if (error) throw error;
  return data;
};
const uuid = (s) =>
  typeof s === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s
  );
app.get("/me", async (req, res) => {
  const account = check(
    await db.rpc("ensure_game_account", { uid: req.user.id })
  );
  const stale = check(
    await db
      .from("game_jobs")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 600000).toISOString())
  );
  for (const job of stale)
    check(
      await db.rpc("fail_game_job", {
        jid: job.id,
        reason: "Generation interrupted. Your credit was returned.",
      })
    );
  res.json(
    stale.length
      ? check(await db.rpc("ensure_game_account", { uid: req.user.id }))
      : account
  );
});
app.get("/games", async (req, res) =>
  res.json(
    check(
      await db
        .from("created_games")
        .select("*")
        .eq("user_id", req.user.id)
        .order("updated_at", { ascending: false })
    )
  )
);
app.patch("/games/:id", async (req, res) => {
  if (!uuid(req.params.id) || typeof req.body.saved !== "boolean")
    return res.status(400).json({ error: "Invalid game." });
  const game = check(
    await db
      .from("created_games")
      .update({ saved: req.body.saved })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .maybeSingle()
  );
  if (!game) return res.status(404).json({ error: "Game not found." });
  res.json(game);
});
const running = new Set();
async function run(job) {
  if (running.has(job.id)) return;
  running.add(job.id);
  try {
    const claimed = check(
      await db
        .from("game_jobs")
        .update({ worker_claimed: true })
        .eq("id", job.id)
        .eq("status", "pending")
        .eq("worker_claimed", false)
        .select("id")
        .maybeSingle()
    );
    if (!claimed) return;
    const old = job.game_id
      ? check(
          await db
            .from("created_games")
            .select("html")
            .eq("id", job.game_id)
            .eq("user_id", job.user_id)
            .single()
        )
      : null;
    const game = await generateGame(job.prompt, old?.html, {
      key: ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
    });
    check(
      await db.rpc("complete_game_job", {
        jid: job.id,
        game_title: game.title,
        game_html: game.html,
      })
    );
  } catch (e) {
    console.error("Generation failed", job.id, e.message);
    await db.rpc("fail_game_job", {
      jid: job.id,
      reason: "Couldn’t finish this game. Your credit was returned.",
    });
  } finally {
    running.delete(job.id);
  }
}
app.post("/generateGame", async (req, res) => {
  const { requestId, gameId = null, prompt } = req.body;
  if (
    !uuid(requestId) ||
    (gameId !== null && !uuid(gameId)) ||
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.length > 12000
  )
    return res
      .status(400)
      .json({ error: "Enter a prompt up to 12,000 characters." });
  const { data: existing, error: lookupError } = await db
    .from("game_jobs")
    .select("*")
    .eq("id", requestId)
    .eq("user_id", req.user.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    if (existing.status === "pending") void run(existing);
    return res.status(202).json(existing);
  }
  const { data: job, error } = await db.rpc("reserve_game_job", {
    uid: req.user.id,
    jid: requestId,
    gid: gameId,
    instruction: prompt,
  });
  if (error) return res.status(409).json({ error: error.message });
  if (job.status === "pending") void run(job);
  res.status(202).json(job);
});
app.get("/jobs", async (req, res) =>
  res.json(
    check(
      await db
        .from("game_jobs")
        .select("*")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
    )
  )
);
app.get("/jobs/:id", async (req, res) => {
  if (!uuid(req.params.id))
    return res.status(400).json({ error: "Invalid request." });
  const job = check(
    await db
      .from("game_jobs")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .maybeSingle()
  );
  if (!job) return res.status(404).json({ error: "Request not found." });
  res.json(job);
});
app.delete("/account", async (req, res) => {
  check(await db.auth.admin.deleteUser(req.user.id));
  res.json({ ok: true });
});
app.use((err, req, res, _next) => {
  console.error("Request failed", req.path, err.message);
  res
    .status(err.status === 413 ? 413 : 500)
    .json({ error: "Couldn’t complete the request. Please try again." });
});
app.listen(process.env.PORT || 3000, "0.0.0.0");
