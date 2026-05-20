const KEY = "pmail.labels.v1";

export type Label = { id: string; name: string; color: string };

export const LABEL_COLORS = [
  { name: "Emerald", className: "bg-emerald-500" },
  { name: "Amber", className: "bg-amber-500" },
  { name: "Violet", className: "bg-violet-500" },
  { name: "Rose", className: "bg-rose-500" },
  { name: "Sky", className: "bg-sky-500" },
  { name: "Pink", className: "bg-pink-500" },
  { name: "Lime", className: "bg-lime-500" },
  { name: "Orange", className: "bg-orange-500" },
];

export function loadLabels(): Label[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLabels(labels: Label[]) {
  localStorage.setItem(KEY, JSON.stringify(labels));
  window.dispatchEvent(new Event("pmail-labels"));
}
