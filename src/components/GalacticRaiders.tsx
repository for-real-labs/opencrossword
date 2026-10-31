import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { newRaid, stepRaid, Raid } from "../games/raiders";
import { colors, fonts } from "../theme";
export function GalacticRaiders() {
  const [game, setGame] = useState(newRaid),
    [best, setBest] = useState(0),
    [error, setError] = useState("");
  const direction = useRef(0),
    fire = useRef(false),
    current = useRef(game);
  function update(next: Raid) {
    current.current = next;
    setGame(next);
  }
  useEffect(() => {
    void AsyncStorage.getItem("poop-games.raiders.best")
      .then((v) => {
        if (v && Number.isFinite(Number(v))) setBest(Number(v));
      })
      .catch(() => setError("High score could not load."));
    const timer = setInterval(() => {
      const next = stepRaid(current.current, direction.current, fire.current);
      if (next !== current.current) update(next);
    }, 33);
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        direction.current = 0;
        fire.current = false;
        if (current.current.status === "playing")
          update({ ...current.current, status: "paused" });
      }
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (game.status === "over" && game.score > best) {
      setBest(game.score);
      void AsyncStorage.setItem(
        "poop-games.raiders.best",
        String(game.score)
      ).catch(() => setError("High score could not save."));
    }
  }, [game.status, game.score, best]);
  function play() {
    direction.current = 0;
    fire.current = false;
    update(
      game.status === "paused"
        ? { ...game, status: "playing" }
        : { ...newRaid(), status: "playing" }
    );
  }
  return (
    <View style={s.page}>
      <View style={s.titleRow}>
        <Text accessibilityRole="header" style={s.title}>
          Galactic Raiders
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pause game"
          disabled={game.status !== "playing"}
          onPress={() => {
            direction.current = 0;
            fire.current = false;
            update({ ...game, status: "paused" });
          }}
        >
          <Text style={s.pause}>Ⅱ</Text>
        </Pressable>
      </View>
      <View style={s.stats}>
        <Text style={s.stat}>SCORE {String(game.score).padStart(4, "0")}</Text>
        <Text style={s.stat}>BEST {best}</Text>
        <Text style={s.stat}>♥ {game.lives}</Text>
      </View>
      <View style={s.field}>
        {Array.from({ length: 24 }, (_, i) => (
          <View
            key={"s" + i}
            style={[
              s.star,
              { left: `${(i * 37) % 98}%`, top: `${(i * 23) % 97}%` },
            ]}
          />
        ))}
        {game.enemies.map((e) => (
          <View
            key={e.id}
            style={[s.alien, { left: `${e.x - 3}%`, top: `${e.y - 2}%` }]}
          >
            <View style={s.eyes}>
              <View style={s.eye} />
              <View style={s.eye} />
            </View>
            <View style={s.feet}>
              <View style={s.foot} />
              <View style={s.foot} />
            </View>
          </View>
        ))}
        {game.shots.map((p, i) => (
          <View
            key={"p" + i}
            style={[s.shot, { left: `${p.x}%`, top: `${p.y}%` }]}
          />
        ))}
        {game.bombs.map((p, i) => (
          <View
            key={"b" + i}
            style={[s.bomb, { left: `${p.x}%`, top: `${p.y}%` }]}
          />
        ))}
        <View style={[s.ship, { left: `${game.player - 4}%`, top: "90%" }]}>
          <View style={s.nose} />
          <View style={s.wing} />
        </View>
        <Text style={s.wave}>WAVE {game.wave}</Text>
        {game.status !== "playing" && (
          <View style={s.overlay}>
            <Text style={s.overlayTitle}>
              {game.status === "ready"
                ? "Ready, raider?"
                : game.status === "paused"
                ? "Take your time."
                : "Good run."}
            </Text>
            <Text style={s.hint}>
              {game.status === "over"
                ? `${game.score} points · Wave ${game.wave}`
                : "Hold arrows to move. Hold fire to shoot."}
            </Text>
            <Pressable accessibilityRole="button" onPress={play} style={s.play}>
              <Text style={s.playText}>
                {game.status === "paused"
                  ? "Resume"
                  : game.status === "over"
                  ? "Play again"
                  : "Play"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
      <View style={s.controls}>
        {([-1, 1] as const).map((d) => (
          <Pressable
            key={d}
            accessibilityRole="button"
            accessibilityLabel={d < 0 ? "Move left" : "Move right"}
            onPressIn={() => {
              direction.current = d;
            }}
            onPressOut={() => {
              if (direction.current === d) direction.current = 0;
            }}
            style={s.move}
          >
            <Text style={s.controlText}>{d < 0 ? "←" : "→"}</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fire"
          onPressIn={() => {
            fire.current = true;
          }}
          onPressOut={() => {
            fire.current = false;
          }}
          style={s.fire}
        >
          <Text style={s.fireText}>FIRE</Text>
        </Pressable>
      </View>
      <Text style={s.note}>
        {error || "HOLD TO MOVE & FIRE · NO ADS, EVER"}
      </Text>
    </View>
  );
}
const s = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 27,
    letterSpacing: -1,
    color: colors.ink,
  },
  pause: { fontSize: 25, padding: 12, color: colors.ink },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  stat: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.ink,
  },
  field: {
    flex: 1,
    minHeight: 250,
    maxHeight: 700,
    backgroundColor: colors.ink,
    borderRadius: 24,
    overflow: "hidden",
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: colors.muted,
  },
  alien: {
    position: "absolute",
    width: "6%",
    height: 14,
    backgroundColor: colors.onDarkPink,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  eyes: { flexDirection: "row", justifyContent: "space-around", marginTop: 5 },
  eye: { width: 3, height: 3, backgroundColor: colors.ink },
  feet: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  foot: { width: 4, height: 4, backgroundColor: colors.onDarkPink },
  shot: {
    position: "absolute",
    height: 13,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.onDarkBlue,
  },
  bomb: {
    position: "absolute",
    height: 10,
    width: 4,
    backgroundColor: colors.onDarkPink,
  },
  ship: { position: "absolute", width: "8%", height: 18, alignItems: "center" },
  nose: { width: 6, height: 10, backgroundColor: colors.onDarkBlue },
  wing: {
    width: "100%",
    height: 8,
    backgroundColor: colors.onDarkBlue,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  wave: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.onDarkMuted,
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  overlayTitle: { fontFamily: fonts.bold, fontSize: 30, color: colors.white },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onDarkMuted,
    marginTop: 12,
    textAlign: "center",
  },
  play: {
    marginTop: 26,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 42,
    borderRadius: 15,
  },
  playText: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
  controls: { flexDirection: "row", gap: 12, marginTop: 20 },
  move: {
    height: 66,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
  },
  controlText: { fontSize: 28, color: colors.ink },
  fire: {
    flex: 1.7,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  fireText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 3,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.muted,
    textAlign: "center",
    marginTop: 15,
    letterSpacing: 1,
  },
});
