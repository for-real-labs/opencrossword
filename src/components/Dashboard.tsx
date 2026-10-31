import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { colors, fonts } from "../theme";
export type Screen = "dashboard" | "crossword" | "word" | "raiders" | "studio";
const games: {
  id: Screen;
  title: string;
  caption: string;
  mark: string;
  color: string;
}[] = [
  {
    id: "crossword",
    title: "Crossword",
    caption: "A fresh grid. Every day.",
    mark: "#",
    color: colors.highlight,
  },
  {
    id: "word",
    title: "Word Guess Daily",
    caption: "Five letters. Six chances.",
    mark: "W",
    color: colors.highlight,
  },
  {
    id: "raiders",
    title: "Galactic Raiders",
    caption: "Tiny ships. Big high scores.",
    mark: "✦",
    color: colors.highlight,
  },
];
export function Dashboard({
  onOpen,
  savedGames,
  onPlay,
}: {
  onOpen: (screen: Screen) => void;
  savedGames: { id: string; title: string }[];
  onPlay: (id: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.top}>
        <Text style={s.eyebrow}>A BETTER BATHROOM BREAK</Text>
        <Image source={require("../../assets/icon.png")} style={s.logo} />
      </View>
      <Text accessibilityRole="header" style={s.title}>
        Poop Games
      </Text>
      <Text style={s.subtitle}>Less scrolling. More playing.</Text>
      <View style={s.label}>
        <Text style={s.eyebrow}>PICK A GAME</Text>
        <Text style={s.small}>{3 + savedGames.length} games</Text>
      </View>
      {games.map((g) => (
        <Pressable
          key={g.id}
          accessibilityRole="button"
          accessibilityLabel={g.title}
          onPress={() => onOpen(g.id)}
          style={({ pressed }) => [s.card, pressed && { opacity: 0.65 }]}
        >
          <View style={[s.icon, { backgroundColor: g.color }]}>
            <Text style={s.mark}>{g.mark}</Text>
          </View>
          <View style={s.copy}>
            <Text style={s.game}>{g.title}</Text>
            <Text style={s.caption}>{g.caption}</Text>
          </View>
          <Text style={s.arrow}>↗</Text>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => onOpen("studio")}
        style={s.card}
      >
        <View style={s.icon}>
          <Text style={s.mark}>+</Text>
        </View>
        <View style={s.copy}>
          <Text style={s.game}>Create a game</Text>
          <Text style={s.caption}>Dream it. Build it. Play it.</Text>
        </View>
        <Text style={s.arrow}>↗</Text>
      </Pressable>
      {savedGames.map((game) => (
        <Pressable
          key={game.id}
          accessibilityRole="button"
          accessibilityLabel={game.title}
          onPress={() => onPlay(game.id)}
          style={s.card}
        >
          <View style={[s.icon, { backgroundColor: colors.highlight }]}>
            <Text style={s.mark}>✧</Text>
          </View>
          <View style={s.copy}>
            <Text style={s.game}>{game.title}</Text>
            <Text style={s.caption}>Made by you</Text>
          </View>
          <Text style={s.arrow}>↗</Text>
        </Pressable>
      ))}
      <View style={s.footer}>
        <Text style={s.free}>Never any ads. Always 100% free.</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL(
              "https://for-real-labs.github.io/poop-games/"
            ).catch(() => {})
          }
        >
          <Text style={s.link}>Privacy & support</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 660,
    alignSelf: "center",
    padding: 24,
    paddingTop: 24,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.ink,
  },
  logo: { width: 92, height: 92 },
  title: {
    fontFamily: fonts.bold,
    fontSize: 44,
    letterSpacing: -2,
    color: colors.ink,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.muted,
    marginTop: 9,
  },
  label: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 44,
    marginBottom: 14,
    alignItems: "center",
  },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 23,
    borderTopWidth: 1,
    borderColor: colors.line,
    gap: 16,
  },
  icon: {
    height: 58,
    width: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: { fontFamily: fonts.bold, fontSize: 30, color: colors.ink },
  copy: { flex: 1 },
  game: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  arrow: { fontSize: 24, color: colors.ink },
  footer: {
    marginTop: "auto",
    paddingTop: 40,
    alignItems: "center",
    paddingBottom: 8,
  },
  free: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  link: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    padding: 16,
  },
});
