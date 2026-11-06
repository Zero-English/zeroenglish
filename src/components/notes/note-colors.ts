import type { NoteColor } from "@/utils/validation/zod";

export const NOTE_COLOR_LIST: NoteColor[] = [
  "amber",
  "rose",
  "sky",
  "emerald",
  "violet",
  "slate",
];

interface NoteColorMeta {
  labelEn: string;
  labelBn: string;
  dot: string;
  spine: string;
  softBg: string;
  softText: string;
  ring: string;
}

export const NOTE_COLOR_META: Record<NoteColor, NoteColorMeta> = {
  amber: {
    labelEn: "Amber",
    labelBn: "অ্যাম্বার",
    dot: "bg-amber-500",
    spine: "bg-amber-500",
    softBg: "bg-amber-500/10",
    softText: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/40",
  },
  rose: {
    labelEn: "Rose",
    labelBn: "রোজ",
    dot: "bg-rose-500",
    spine: "bg-rose-500",
    softBg: "bg-rose-500/10",
    softText: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/40",
  },
  sky: {
    labelEn: "Sky",
    labelBn: "স্কাই",
    dot: "bg-sky-500",
    spine: "bg-sky-500",
    softBg: "bg-sky-500/10",
    softText: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/40",
  },
  emerald: {
    labelEn: "Emerald",
    labelBn: "এমারেল্ড",
    dot: "bg-emerald-500",
    spine: "bg-emerald-500",
    softBg: "bg-emerald-500/10",
    softText: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/40",
  },
  violet: {
    labelEn: "Violet",
    labelBn: "ভায়োলেট",
    dot: "bg-violet-500",
    spine: "bg-violet-500",
    softBg: "bg-violet-500/10",
    softText: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/40",
  },
  slate: {
    labelEn: "Slate",
    labelBn: "স্লেট",
    dot: "bg-slate-500",
    spine: "bg-slate-500",
    softBg: "bg-slate-500/10",
    softText: "text-slate-600 dark:text-slate-300",
    ring: "ring-slate-500/40",
  },
};

export function noteColorMeta(color: string): NoteColorMeta {
  return NOTE_COLOR_META[(color as NoteColor) in NOTE_COLOR_META ? (color as NoteColor) : "amber"];
}
