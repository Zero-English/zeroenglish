import type { Word } from "./data";

export function getDuplicateWordIds(words: Word[]): Set<number> {
  const seen = new Map<string, number[]>();
  for (const w of words) {
    const key = w.word.toLowerCase();
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(w.id);
  }
  const duplicateIds = new Set<number>();
  for (const ids of seen.values()) {
    if (ids.length > 1) ids.forEach((id) => duplicateIds.add(id));
  }
  return duplicateIds;
}
