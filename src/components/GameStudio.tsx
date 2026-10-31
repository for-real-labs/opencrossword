import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
  KeyboardAvoidingView,
} from "react-native";
import * as Apple from "expo-apple-authentication";
import { Studio } from "../studio/useStudio";
import { configured } from "../studio/client";
import { Button } from "./Button";
import { GamePlayer } from "./GamePlayer";
import { colors, fonts } from "../theme";
export function GameStudio({
  studio,
  initialId,
  onSaved,
}: {
  studio: Studio;
  initialId: string | null;
  onSaved: () => void;
}) {
  const [id, setId] = useState(initialId);
  const wasGenerating = useRef(studio.job?.status === "pending");
  const [prompt, setPrompt] = useState("");
  const [playing, setPlaying] = useState(!!initialId);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const game = studio.games.find((g) => g.id === id);
  const generating = studio.job?.status === "pending";
  useEffect(() => {
    void Apple.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (
      wasGenerating.current &&
      studio.job?.status === "complete" &&
      studio.job.game_id
    ) {
      setId(studio.job.game_id);
      setPrompt("");
    }
    wasGenerating.current = studio.job?.status === "pending";
  }, [studio.job?.id, studio.job?.status, initialId]);
  if (playing && game)
    return (
      <View style={{ flex: 1 }}>
        <Button label="Edit game" quiet onPress={() => setPlaying(false)} />
        <GamePlayer html={game.html} />
      </View>
    );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.page}
      >
        <Text style={s.title}>{game?.title || "Create a game"}</Text>
        <Text style={s.subtitle}>Your idea. Your rules. 2D or 3D.</Text>
        {!configured ? (
          <Text style={s.note}>Game creation isn’t configured yet.</Text>
        ) : !studio.session ? (
          <>
            <Text style={s.note}>
              Sign in to create and save games. Start with 10 free credits.
            </Text>
            {appleAvailable ? (
              <Apple.AppleAuthenticationButton
                buttonType={Apple.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={{ height: 48, width: "100%" }}
                onPress={() => void studio.signIn()}
              />
            ) : (
              <Text style={s.note}>
                Sign in with Apple on your iPhone or iPad to create games.
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={s.note}>
              {studio.account?.unlimited
                ? "Unlimited credits"
                : `${studio.account?.credits ?? "…"} credits`}{" "}
              · 1 credit per creation or revision
            </Text>
            <TextInput
              accessibilityLabel={
                game ? "Describe your changes" : "Describe your game"
              }
              multiline
              value={prompt}
              onChangeText={setPrompt}
              maxLength={12000}
              placeholder={
                game
                  ? "What would you like to change?"
                  : "A 3D skateboarding game on the moon…"
              }
              placeholderTextColor={colors.muted}
              style={s.input}
              editable={!generating && !studio.busy}
            />
            <Button
              label={
                generating ? "Creating…" : game ? "Update game" : "Create game"
              }
              disabled={generating || studio.busy || !prompt.trim()}
              onPress={() => void studio.generate(prompt, id ?? undefined)}
            />
            {generating && (
              <View style={s.progress}>
                <ActivityIndicator />
                <Text style={s.note}>
                  Building your game. You can leave this screen.
                </Text>
              </View>
            )}
            {studio.job?.status === "failed" && (
              <Text style={s.error}>{studio.job.error}</Text>
            )}
            {game && (
              <View style={s.actions}>
                <Button label="Play" onPress={() => setPlaying(true)} />
                <Button
                  label={
                    saving
                      ? "Saving…"
                      : game.saved
                      ? "Saved to games"
                      : "Save to games"
                  }
                  disabled={saving || generating || game.saved}
                  onPress={() => {
                    setSaving(true);
                    void studio
                      .save(game)
                      .then((ok) => {
                        if (ok) onSaved();
                      })
                      .finally(() => setSaving(false));
                  }}
                />
                {game.saved && (
                  <Button
                    quiet
                    label="Remove from dashboard"
                    onPress={() => void studio.save(game, false)}
                  />
                )}
              </View>
            )}
            {studio.games
              .filter((g) => !g.saved && g.id !== id)
              .map((g) => (
                <Button
                  key={g.id}
                  quiet
                  label={`Continue: ${g.title}`}
                  onPress={() => {
                    setId(g.id);
                    setPrompt("");
                  }}
                />
              ))}
            <View style={s.account}>
              <Button
                quiet
                label="Privacy"
                onPress={() =>
                  void Linking.openURL(
                    "https://for-real-labs.github.io/poop-games/#privacy"
                  )
                }
              />
              <Button
                quiet
                label="Withdraw AI permission"
                onPress={() => void studio.withdrawConsent()}
              />
              <Button
                quiet
                label="Sign out"
                onPress={() => void studio.signOut()}
              />
              <Button
                quiet
                label="Delete account"
                onPress={() =>
                  Alert.alert(
                    "Delete your account?",
                    "Your saved games and credits will be permanently deleted.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => void studio.deleteAccount(),
                      },
                    ]
                  )
                }
              />
            </View>
          </>
        )}
        {!!studio.error && (
          <Text accessibilityRole="alert" style={s.error}>
            {studio.error}
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  page: {
    padding: 24,
    gap: 18,
    width: "100%",
    maxWidth: 660,
    alignSelf: "center",
    flexGrow: 1,
  },
  title: { fontFamily: fonts.bold, fontSize: 32, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 17, color: colors.muted },
  note: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    minHeight: 150,
    textAlignVertical: "top",
  },
  progress: { gap: 12, alignItems: "center" },
  actions: { gap: 12 },
  account: { marginTop: "auto", paddingTop: 30 },
  error: { color: colors.error, fontFamily: fonts.body, lineHeight: 21 },
});
