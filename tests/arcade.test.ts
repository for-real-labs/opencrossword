import { describe, it, expect } from "vitest";
import {
  answerFor,
  answers,
  dateKey,
  grade,
  submit,
  finished,
  readDaily,
} from "../src/games/wordGuess";
import { newRaid, stepRaid } from "../src/games/raiders";
describe("daily word game", () => {
  it("scores repeated letters only as often as they exist", () => {
    expect(grade("ALLEY", "APPLE")).toEqual([
      "correct",
      "present",
      "absent",
      "present",
      "absent",
    ]);
    expect(grade("EERIE", "SPEED")).toEqual([
      "present",
      "present",
      "absent",
      "absent",
      "absent",
    ]);
  });
  it("has a stable daily answer and local rollover", () => {
    expect(answerFor("2026-10-31")).toBe(answerFor("2026-10-31"));
    expect(answerFor("2026-11-01")).not.toBe(answerFor("2026-10-31"));
    expect(dateKey(new Date(2026, 9, 31, 23, 59))).toBe("2026-10-31");
    expect(new Set(answers).size).toBe(answers.length);
    expect(answers.every((w) => /^[A-Z]{5}$/.test(w))).toBe(true);
  });
  it("enforces validation, six attempts, and winning", () => {
    let g = { day: "2026-10-31", guesses: [] as string[] };
    expect(() => submit(g, "AB")).toThrow("five");
    expect(() => submit(g, "ZZZZZ")).toThrow("word list");
    const win = submit(g, answerFor(g.day));
    expect(finished(win)).toBe(true);
    expect(() => submit(win, "APPLE")).toThrow();
    for (const word of answers
      .filter((w) => w !== answerFor(g.day))
      .slice(0, 6))
      g = submit(g, word);
    expect(finished(g)).toBe(true);
    expect(() => submit(g, "ZEBRA")).toThrow();
  });
  it("restores guesses, preserves previous state, and resets a new day", () => {
    const g = submit({ day: "2026-10-31", guesses: [] }, "APPLE");
    expect(readDaily(JSON.stringify(g), g.day)).toEqual(g);
    expect(readDaily(JSON.stringify(g), "2026-11-01").guesses).toEqual([]);
    expect(() => readDaily("{", "2026-10-31")).toThrow();
    expect(() =>
      readDaily(JSON.stringify({ day: g.day, guesses: ["ZZZZZ"] }), g.day)
    ).toThrow();
  });
});
describe("Galactic Raiders", () => {
  it("stays still until started and when paused", () => {
    const s = newRaid();
    expect(stepRaid(s, 1, true)).toBe(s);
    const p = { ...s, status: "paused" as const };
    expect(stepRaid(p, 1, true)).toBe(p);
  });
  it("moves within bounds and limits fire rate", () => {
    let s = { ...newRaid(), status: "playing" as const };
    s = stepRaid(s, 1, true) as typeof s;
    expect(s.shots).toHaveLength(1);
    s = stepRaid(s, 1, true) as typeof s;
    expect(s.shots).toHaveLength(1);
    expect(stepRaid({ ...s, player: 95 }, 1, false).player).toBe(95);
  });
  it("awards hits, starts the next wave, and ends on losing the last life", () => {
    let s = {
      ...newRaid(),
      status: "playing" as const,
      enemies: [{ id: 0, x: 50, y: 30 }],
      shots: [{ x: 50, y: 33 }],
    };
    const win = stepRaid(s, 0, false);
    expect(win.score).toBe(10);
    expect(win.wave).toBe(2);
    expect(win.enemies).toHaveLength(24);
    const lose = stepRaid(
      { ...newRaid(), status: "playing", lives: 1, bombs: [{ x: 50, y: 88 }] },
      0,
      false
    );
    expect(lose.status).toBe("over");
    expect(lose.lives).toBe(0);
  });
  it("turns at the edge and descends", () => {
    const next = stepRaid(
      { ...newRaid(), status: "playing", enemies: [{ id: 0, x: 94, y: 20 }] },
      0,
      false
    );
    expect(next.direction).toBe(-1);
    expect(next.enemies[0].y).toBe(23);
  });
});
