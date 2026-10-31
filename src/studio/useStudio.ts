import { useState, useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import * as Apple from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { auth, api, CreatedGame, Job, Account } from "./client";
export function useStudio() {
  const [session, setSession] = useState<Session | null>(null);
  const [games, setGames] = useState<CreatedGame[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const user = useRef<string | undefined>(undefined);
  const lock = useRef(false);
  const refresh = useCallback(async () => {
    const uid = user.current;
    if (!uid) return;
    // Fetch status first so a completed job is always followed by its latest source.
    const j = await api<Job[]>("/jobs");
    const [g, a] = await Promise.all([
      api<CreatedGame[]>("/games"),
      api<Account>("/me"),
    ]);
    if (uid !== user.current) return;
    setGames(g);
    setAccount(a);
    setJob(j[0] ?? null);
    await AsyncStorage.setItem(`studio.games.${uid}`, JSON.stringify(g));
  }, []);
  useEffect(() => {
    if (!auth) return;
    void auth.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = auth.auth.onAuthStateChange((_event, s) => setSession(s));
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        auth?.auth.startAutoRefresh();
        void refresh().catch(() => {});
      } else auth?.auth.stopAutoRefresh();
    });
    return () => {
      data.subscription.unsubscribe();
      sub.remove();
    };
  }, [refresh]);
  useEffect(() => {
    user.current = session?.user.id;
    setGames([]);
    setAccount(null);
    setJob(null);
    setError("");
    const uid = session?.user.id;
    if (!uid) return;
    void (async () => {
      try {
        const cached = await AsyncStorage.getItem(`studio.games.${uid}`);
        if (cached && user.current === uid) setGames(JSON.parse(cached));
      } catch {}
      try {
        await refresh();
      } catch (e) {
        if (user.current === uid) setError((e as Error).message);
      }
    })();
  }, [session?.user.id, refresh]);
  useEffect(() => {
    if (job?.status !== "pending") return;
    const timer = setInterval(() => void refresh().catch(() => {}), 2500);
    return () => clearInterval(timer);
  }, [job?.status, refresh]);
  async function signIn() {
    if (!auth) return;
    setError("");
    setBusy(true);
    try {
      const nonce = Crypto.randomUUID();
      const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );
      const credential = await Apple.signInAsync({
        requestedScopes: [
          Apple.AppleAuthenticationScope.EMAIL,
          Apple.AppleAuthenticationScope.FULL_NAME,
        ],
        nonce: hashed,
      });
      if (!credential.identityToken)
        throw new Error("Apple didn’t return a sign-in token.");
      const { error } = await auth.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
        nonce,
      });
      if (error) throw error;
    } catch (e) {
      if ((e as { code?: string }).code !== "ERR_REQUEST_CANCELED")
        setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function generate(prompt: string, gameId?: string) {
    if (lock.current || job?.status === "pending") return;
    lock.current = true;
    setBusy(true);
    setError("");
    const uid = user.current;
    // Persist the request ID before sending so a lost response can be retried without another charge.
    const requestKey = `studio.request.${uid}`;
    try {
      const stored = await AsyncStorage.getItem(requestKey);
      const previous = stored ? JSON.parse(stored) : null;
      const payload =
        previous?.prompt === prompt && previous?.gameId === (gameId ?? null)
          ? previous
          : { requestId: Crypto.randomUUID(), prompt, gameId: gameId ?? null };
      await AsyncStorage.setItem(requestKey, JSON.stringify(payload));
      const result = await api<Job>("/generateGame", payload);
      if (user.current === uid) setJob(result);
      await AsyncStorage.removeItem(requestKey);
      await refresh();
    } catch (e) {
      if (user.current === uid) setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(game: CreatedGame, saved = true) {
    setError("");
    try {
      await api(`/games/${game.id}`, { saved }, "PATCH");
      await refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  async function signOut() {
    const result = await auth?.auth.signOut();
    if (result?.error) setError(result.error.message);
  }
  async function deleteAccount() {
    try {
      await api("/account", undefined, "DELETE");
      await AsyncStorage.removeItem(`studio.games.${user.current}`);
      await auth?.auth.signOut({ scope: "local" });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return {
    session,
    games,
    account,
    job,
    error,
    busy,
    signIn,
    signOut,
    generate,
    save,
    refresh,
    deleteAccount,
  };
}
export type Studio = ReturnType<typeof useStudio>;
