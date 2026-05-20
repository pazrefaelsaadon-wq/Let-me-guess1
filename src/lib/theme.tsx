import { useEffect, type ReactNode } from "react";
import { usePrefs, type Accent, type ThemeMode } from "./local-store";

const ACCENTS: Record<Accent, { from: string; to: string; ring: string; glow: string }> = {
  violet:  { from: "168 85 247",  to: "217 70 239",  ring: "168 85 247",  glow: "168 85 247" },
  cyan:    { from: "34 211 238",  to: "59 130 246",  ring: "34 211 238",  glow: "34 211 238" },
  emerald: { from: "16 185 129",  to: "20 184 166",  ring: "16 185 129",  glow: "16 185 129" },
  rose:    { from: "244 63 94",   to: "236 72 153",  ring: "244 63 94",   glow: "244 63 94" },
  amber:   { from: "245 158 11",  to: "249 115 22",  ring: "245 158 11",  glow: "245 158 11" },
  sky:     { from: "56 189 248",  to: "99 102 241",  ring: "56 189 248",  glow: "56 189 248" },
};

export const ACCENT_OPTIONS: { id: Accent; label: string; preview: string }[] = [
  { id: "violet",  label: "Violet",  preview: "linear-gradient(135deg, rgb(168 85 247), rgb(217 70 239))" },
  { id: "cyan",    label: "Cyan",    preview: "linear-gradient(135deg, rgb(34 211 238), rgb(59 130 246))" },
  { id: "emerald", label: "Emerald", preview: "linear-gradient(135deg, rgb(16 185 129), rgb(20 184 166))" },
  { id: "rose",    label: "Rose",    preview: "linear-gradient(135deg, rgb(244 63 94),  rgb(236 72 153))" },
  { id: "amber",   label: "Amber",   preview: "linear-gradient(135deg, rgb(245 158 11), rgb(249 115 22))" },
  { id: "sky",     label: "Sky",     preview: "linear-gradient(135deg, rgb(56 189 248), rgb(99 102 241))" },
];

function applyTheme(mode: ThemeMode, accent: Accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  let dark = mode === "dark";
  if (mode === "system") {
    dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  root.classList.toggle("dark", dark);

  const a = ACCENTS[accent];
  root.style.setProperty("--accent-from", a.from);
  root.style.setProperty("--accent-to", a.to);
  root.style.setProperty("--accent-ring", a.ring);
  root.style.setProperty("--accent-glow", a.glow);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs] = usePrefs();

  useEffect(() => {
    applyTheme(prefs.themeMode, prefs.accent);
  }, [prefs.themeMode, prefs.accent]);

  useEffect(() => {
    if (prefs.themeMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system", prefs.accent);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [prefs.themeMode, prefs.accent]);

  return <>{children}</>;
}
