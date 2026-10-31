import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  AppState,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  BackHandler,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { Lora_500Medium } from "@expo-google-fonts/lora";
import * as Haptics from "expo-haptics";
import { State, openGame, updateCell } from "./src/game";
import { repository } from "./src/storage";
import { Home } from "./src/components/Home";
import { PuzzleScreen } from "./src/components/PuzzleScreen";
import { Button } from "./src/components/Button";
import { colors, fonts } from "./src/theme";
import { Dashboard, Screen } from "./src/components/Dashboard";
import { WordGuess } from "./src/components/WordGuess";
import { GalacticRaiders } from "./src/components/GalacticRaiders";
export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "dashboard") return false;
      setScreen("dashboard");
      return true;
    });
    return () => sub.remove();
  }, [screen]);
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Lora_500Medium,
  });
  const [state, setState] = useState<State | null>(null),
    [selected, setSelected] = useState<number | null>(null),
    [now, setNow] = useState(new Date()),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setError(null);
    try {
      setState(await repository.load());
    } catch {
      setError("Couldn’t open your puzzles.");
    }
  }, []);
  useEffect(() => {
    void load();
    const timer = setInterval(() => setNow(new Date()), 30000);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setNow(new Date());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [load]);
  const save = (next: State) => {
    setState(next);
    void repository
      .save(next)
      .then(() => setError(null))
      .catch(() => setError("Couldn’t save. Tap Retry."));
  };
  async function start() {
    if (busy) return;
    setBusy(true);
    try {
      const previous = repository.state.next;
      const next = await repository.start(new Date());
      setState(next);
      setNow(new Date());
      if (next.next > previous) setSelected(next.games[0].puzzleId);
    } catch {
      setError("Couldn’t save. Tap Retry.");
      setState(repository.state);
    } finally {
      setBusy(false);
    }
  }
  function changeCell(key: string, value: string) {
    if (selected === null) return;
    const next = updateCell(repository.state, selected, key, value);
    const game = next.games.find((g) => g.puzzleId === selected);
    const before = repository.state.games.find((g) => g.puzzleId === selected);
    save(next);
    if (game?.completedAt && !before?.completedAt)
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
  }
  const game = state?.games.find((g) => g.puzzleId === selected);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        {(!fontsLoaded && !fontError) || (!state && !error) ? (
          <View style={s.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <>
            {screen !== "dashboard" && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to games"
                onPress={() => {
                  setSelected(null);
                  setScreen("dashboard");
                }}
                style={{ paddingHorizontal: 24, paddingVertical: 12 }}
              >
                <Text
                  style={{
                    fontFamily: fonts.bold,
                    color: colors.ink,
                    fontSize: 14,
                  }}
                >
                  ‹ Games
                </Text>
              </Pressable>
            )}
            {screen === "dashboard" && <Dashboard onOpen={setScreen} />}
            {screen === "word" && <WordGuess />}
            {screen === "raiders" && <GalacticRaiders />}
            {screen === "crossword" && error && (
              <View accessibilityRole="alert" style={s.error}>
                <Text style={s.errorText}>{error}</Text>
                <Button
                  quiet
                  label="Retry"
                  onPress={() => {
                    if (!repository.ready) void load();
                    else save(repository.state);
                  }}
                />
              </View>
            )}
            {screen === "crossword" &&
              state &&
              (game ? (
                <PuzzleScreen
                  key={game.puzzleId}
                  game={game}
                  onCell={changeCell}
                  onBack={() => setSelected(null)}
                />
              ) : (
                <Home
                  state={state}
                  now={now}
                  busy={busy}
                  onStart={() => void start()}
                  onOpen={(id) => {
                    save(openGame(repository.state, id));
                    setSelected(id);
                  }}
                  onError={() => setError("Couldn’t open the link.")}
                />
              ))}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.error,
    fontSize: 13,
    flex: 1,
  },
});
