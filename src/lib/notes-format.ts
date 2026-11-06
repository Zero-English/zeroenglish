export type NoteLanguage = "bn" | "en";

function localeOf(lang: NoteLanguage): string {
  return lang === "bn" ? "bn-BD" : "en-US";
}

export function formatRelativeTime(
  iso: string,
  lang: NoteLanguage
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSeconds);

  const formatter = new Intl.RelativeTimeFormat(
    lang === "bn" ? "bn" : "en",
    { numeric: "auto" }
  );

  if (abs < 60) return formatter.format(0, "second");
  if (abs < 3600) return formatter.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86_400)
    return formatter.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 604_800)
    return formatter.format(Math.round(diffSeconds / 86_400), "day");
  if (abs < 2_592_000)
    return formatter.format(Math.round(diffSeconds / 604_800), "week");
  if (abs < 31_536_000)
    return formatter.format(Math.round(diffSeconds / 2_592_000), "month");
  return formatter.format(Math.round(diffSeconds / 31_536_000), "year");
}

export function formatDateTime(iso: string, lang: NoteLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeOf(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTime(iso: string, lang: NoteLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeOf(lang), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
