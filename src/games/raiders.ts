export type Point = { x: number; y: number };
export type Raider = Point & { id: number };
export type Raid = {
  player: number;
  enemies: Raider[];
  shots: Point[];
  bombs: Point[];
  direction: number;
  score: number;
  lives: number;
  wave: number;
  tick: number;
  fireAt: number;
  status: "ready" | "playing" | "paused" | "over";
};
export function fleet(wave: number): Raider[] {
  return Array.from({ length: 24 }, (_, id) => ({
    id,
    x: 12 + (id % 6) * 13,
    y: 8 + Math.floor(id / 6) * 7 + Math.min(wave, 8),
  }));
}
export function newRaid(): Raid {
  return {
    player: 50,
    enemies: fleet(1),
    shots: [],
    bombs: [],
    direction: 1,
    score: 0,
    lives: 3,
    wave: 1,
    tick: 0,
    fireAt: -10,
    status: "ready",
  };
}
export function stepRaid(s: Raid, movement: number, firing: boolean): Raid {
  if (s.status !== "playing") return s;
  const tick = s.tick + 1,
    player = Math.max(5, Math.min(95, s.player + movement * 2));
  let shots = s.shots.map((p) => ({ ...p, y: p.y - 3 })).filter((p) => p.y > 0);
  let fireAt = s.fireAt;
  if (firing && tick - fireAt >= 5) {
    shots.push({ x: player, y: 88 });
    fireAt = tick;
  }
  let direction = s.direction;
  let enemies = s.enemies.map((e) => ({
    ...e,
    x: e.x + direction * (0.25 + Math.min(s.wave, 15) * 0.06),
  }));
  if (enemies.some((e) => e.x > 94 || e.x < 6)) {
    direction *= -1;
    enemies = enemies.map((e) => ({
      ...e,
      x: Math.max(6, Math.min(94, e.x)),
      y: e.y + 3,
    }));
  }
  let score = s.score;
  shots = shots.filter((p) => {
    const hit = enemies.findIndex(
      (e) => Math.abs(e.x - p.x) < 4 && Math.abs(e.y - p.y) < 3.6
    );
    if (hit < 0) return true;
    enemies.splice(hit, 1);
    score += 10;
    return false;
  });
  let bombs = s.bombs
    .map((p) => ({ ...p, y: p.y + 1.2 + Math.min(s.wave, 12) * 0.07 }))
    .filter((p) => p.y < 100);
  if (tick % Math.max(12, 40 - s.wave * 2) === 0 && enemies.length) {
    const enemy = enemies[Math.floor(tick / 17) % enemies.length];
    bombs.push({ x: enemy.x, y: enemy.y + 3 });
  }
  const hit = bombs.some(
    (p) => Math.abs(p.x - player) < 5 && Math.abs(p.y - 90) < 4
  );
  const lives = s.lives - (hit ? 1 : 0);
  if (hit) bombs = [];
  const over = lives <= 0 || enemies.some((e) => e.y >= 85);
  const wave = enemies.length ? s.wave : s.wave + 1;
  if (!enemies.length) {
    enemies = fleet(wave);
    shots = [];
    bombs = [];
  }
  return {
    player,
    enemies,
    shots,
    bombs,
    direction,
    score,
    lives,
    wave,
    tick,
    fireAt,
    status: over ? "over" : "playing",
  };
}
