// Local mail store: sent messages, drafts, starred IDs, user prefs.
// All client-side (localStorage) — mail.tm free tier is receive-only,
// so outgoing PMail-to-PMail mail is staged here.

import { useEffect, useState, useCallback } from "react";

export type LocalMessage = {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string; // ISO
  from: string; // sender address (the active pmail account)
};

export type Draft = LocalMessage & { updatedAt: string };

const SENT_KEY = "pmail.sent";
const DRAFTS_KEY = "pmail.drafts";
const STARRED_KEY = "pmail.starred";
const PREFS_KEY = "pmail.prefs";
const EVT = "pmail-local-store";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}

// ----- Sent -----
export function loadSent(): LocalMessage[] {
  return read<LocalMessage[]>(SENT_KEY, []);
}
export function saveSent(list: LocalMessage[]) {
  write(SENT_KEY, list);
}
export function appendSent(m: LocalMessage) {
  saveSent([m, ...loadSent()]);
}
export function removeSent(id: string) {
  saveSent(loadSent().filter((m) => m.id !== id));
}

// ----- Drafts -----
export function loadDrafts(): Draft[] {
  return read<Draft[]>(DRAFTS_KEY, []);
}
export function saveDrafts(list: Draft[]) {
  write(DRAFTS_KEY, list);
}
export function upsertDraft(d: Draft) {
  const list = loadDrafts();
  const idx = list.findIndex((x) => x.id === d.id);
  if (idx >= 0) list[idx] = d;
  else list.unshift(d);
  saveDrafts(list);
}
export function removeDraft(id: string) {
  saveDrafts(loadDrafts().filter((d) => d.id !== id));
}

// ----- Starred / Flagged -----
export function loadStarred(): string[] {
  return read<string[]>(STARRED_KEY, []);
}
export function toggleStarred(id: string) {
  const s = new Set(loadStarred());
  if (s.has(id)) s.delete(id);
  else s.add(id);
  write(STARRED_KEY, Array.from(s));
}

// ----- Preferences -----
export type ThemeMode = "light" | "dark" | "system";
export type Accent = "violet" | "cyan" | "emerald" | "rose" | "amber" | "sky";

export type Prefs = {
  themeMode: ThemeMode;
  accent: Accent;
  displayName: string;
  signature: string;
  density: "comfortable" | "compact";
  showPreviews: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  themeMode: "dark",
  accent: "violet",
  displayName: "",
  signature: "",
  density: "comfortable",
  showPreviews: true,
};

export function loadPrefs(): Prefs {
  return { ...DEFAULT_PREFS, ...read<Partial<Prefs>>(PREFS_KEY, {}) };
}
export function savePrefs(p: Prefs) {
  write(PREFS_KEY, p);
}

// ----- Hooks -----
function useStoreSlice<T>(loader: () => T, key?: string): T {
  const [v, setV] = useState<T>(loader);
  useEffect(() => {
    const handler = (e: Event) => {
      if (!key || (e as CustomEvent).detail === key || (e as CustomEvent).detail === undefined) {
        setV(loader());
      }
    };
    const storage = () => setV(loader());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", storage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

export function useSent() {
  return useStoreSlice(loadSent, SENT_KEY);
}
export function useDrafts() {
  return useStoreSlice(loadDrafts, DRAFTS_KEY);
}
export function useStarred(): { ids: Set<string>; toggle: (id: string) => void } {
  const arr = useStoreSlice(loadStarred, STARRED_KEY);
  const toggle = useCallback((id: string) => toggleStarred(id), []);
  return { ids: new Set(arr), toggle };
}
export function usePrefs() {
  const prefs = useStoreSlice(loadPrefs, PREFS_KEY);
  const set = useCallback((next: Partial<Prefs>) => savePrefs({ ...loadPrefs(), ...next }), []);
  return [prefs, set] as const;
}
