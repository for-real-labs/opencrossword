import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  answerFor,
  dateKey,
  finished,
  grade,
  readDaily,
  submit,
  DailyGame,
  Mark,
} from "../games/wordGuess";
import { colors, fonts } from "../theme";
const KEY = "poop-games.word.v1";
const shades = {
  correct: colors.primary,
  present: colors.accent,
  absent: colors.ink,
};
export function WordGuess() {
  const [game, setGame] = useState<DailyGame | null>(null),
    [input, setInput] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  const lock = useRef(false);
  async function load() {
    try {
      setGame(readDaily(await AsyncStorage.getItem(KEY), dateKey()));
      setFailed(false);
    } catch {
      setFailed(true);
      setMessage("Couldn’t load your game. Tap Retry.");
    }
  }
  useEffect(() => {
    void load();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void load();
    });
    return () => sub.remove();
  }, []);
  async function key(letter: string) {
    if (!game || lock.current || failed) return;
    if (game.day !== dateKey()) {
      setInput("");
      await load();
      return;
    }
    if (finished(game)) return;
    if (letter === "⌫") {
      setInput((v) => v.slice(0, -1));
      return;
    }
    if (letter !== "ENTER") {
      setInput((v) => (v + letter).slice(0, 5));
      setMessage("");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const next = submit(game, input);
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      setGame(next);
      setInput("");
      setMessage("");
    } catch (e) {
      setMessage(
        e instanceof Error && /word|letters|tried|tomorrow/.test(e.message)
          ? e.message
          : "Couldn’t save. Tap Enter to retry."
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const marks: Record<string, Mark> = {};
  const priority = { absent: 0, present: 1, correct: 2 };
  if (game)
    for (const guess of game.guesses)
      grade(guess, answerFor(game.day)).forEach((mark, i) => {
        if (
          marks[guess[i]] === undefined ||
          priority[mark] > priority[marks[guess[i]]]
        )
          marks[guess[i]] = mark;
      });
  const done = game && finished(game),
    won = game?.guesses.includes(answerFor(game.day));
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.overline}>THE DAILY FIVE-LETTER PUZZLE</Text>
      <Text accessibilityRole="header" style={s.title}>
        Word Guess Daily
      </Text>
      <Text style={s.caption}>Find the word in six guesses.</Text>
      <View style={s.grid}>
        {Array.from({ length: 6 }, (_, r) => {
          const guess = game?.guesses[r];
          const word = guess ?? (r === game?.guesses.length ? input : "");
          const result =
            guess && game ? grade(guess, answerFor(game.day)) : null;
          return (
            <View key={r} style={s.row}>
              {Array.from({ length: 5 }, (_, c) => (
                <View
                  key={c}
                  accessibilityLabel={`${word[c] || "Empty"}${
                    result ? ", " + result[c] : ""
                  }`}
                  style={[
                    s.cell,
                    result && {
                      backgroundColor: shades[result[c]],
                      borderColor: shades[result[c]],
                    },
                  ]}
                >
                  <Text style={[s.letter, result && { color: colors.white }]}>
                    {word[c]}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
      <Text accessibilityLiveRegion="polite" style={s.message}>
        {failed
          ? message
          : done
          ? won
            ? "Nicely done. See you tomorrow!"
            : `The word was ${answerFor(game!.day)}. Tomorrow, again.`
          : message ||
            (!game
              ? "Loading…"
              : busy
              ? "Saving…"
              : `${(game?.guesses.length ?? 0) + 1} of 6`)}
      </Text>
      {failed && (
        <Pressable accessibilityRole="button" onPress={() => void load()}>
          <Text style={s.retry}>Retry</Text>
        </Pressable>
      )}
      <View style={s.keyboard}>
        {["QWERTYUIOP", "ASDFGHJKL", "⌫ZXCVBNM"].map((row, i) => (
          <View key={i} style={s.keys}>
            {row.split("").map((letter) => (
              <Pressable
                key={letter}
                accessibilityRole="button"
                accessibilityLabel={letter === "⌫" ? "Delete letter" : letter}
                disabled={!!done || busy || !game || failed}
                onPress={() => void key(letter)}
                style={({ pressed }) => [
                  s.key,
                  marks[letter] && { backgroundColor: shades[marks[letter]] },
                  pressed && { opacity: 0.55 },
                ]}
              >
                <Text
                  style={[s.keyText, marks[letter] && { color: colors.white }]}
                >
                  {letter}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          disabled={!!done || busy || !game || failed}
          onPress={() => void key("ENTER")}
          style={s.enter}
        >
          <Text style={s.enterText}>Enter guess</Text>
        </Pressable>
      </View>
      <View style={s.legend}>
        {[
          ["correct", "Right spot"],
          ["present", "Wrong spot"],
          ["absent", "Not in word"],
        ].map(([mark, label]) => (
          <View key={mark} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: shades[mark as Mark] }]} />
            <Text style={s.legendText}>{label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: {
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  overline: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.8,
    color: colors.muted,
    textAlign: "center",
    marginTop: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 29,
    letterSpacing: -1,
    color: colors.ink,
    textAlign: "center",
    marginTop: 8,
  },
  caption: {
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: "center",
    marginTop: 5,
    fontSize: 13,
  },
  grid: {
    alignSelf: "center",
    width: "78%",
    maxWidth: 320,
    gap: 5,
    marginTop: 22,
  },
  row: { flexDirection: "row", gap: 5 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  letter: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.ink,
    textAlign: "center",
    width: "100%",
  },
  message: {
    fontFamily: fonts.medium,
    color: colors.ink,
    textAlign: "center",
    fontSize: 13,
    minHeight: 42,
    paddingTop: 12,
  },
  keyboard: { gap: 5 },
  keys: { flexDirection: "row", gap: 4, justifyContent: "center" },
  key: {
    flex: 1,
    minHeight: 44,
    borderRadius: 5,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  enter: {
    backgroundColor: shades.correct,
    borderRadius: 8,
    alignItems: "center",
    padding: 14,
    marginTop: 3,
  },
  enterText: { fontFamily: fonts.bold, color: "white", fontSize: 14 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 20,
  },
  legendItem: { flexDirection: "row", gap: 5, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontFamily: fonts.body, color: colors.muted, fontSize: 10 },
  retry: { textAlign: "center", padding: 12, fontFamily: fonts.bold },
});
