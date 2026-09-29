/**
 * Turns the stored category key into a human label.
 * "Oxford3000" -> "Oxford 3000", "PartsOfSpeech" -> "Parts Of Speech".
 */
export const formatCategoryLabel = (cat: string) =>
  cat
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2");

const OXFORD_3000 = "Oxford3000";
const OXFORD_5000 = "Oxford5000";

/**
 * The two source lists behind the vocabulary database. The words are headwords
 * drawn from these public lists; Zero English is not affiliated with Oxford
 * University Press, so the label says which lists were used rather than
 * claiming to *be* the "Oxford 5000".
 */
const SOURCE_LIST_LABEL = "Oxford 3000 + 5000";

/**
 * A single accurate label for a set of words.
 *
 * The database mixes headwords from the Oxford 3000 and the Oxford 5000, so
 * reporting a single one of them (the old behaviour always said "Oxford 5000")
 * misstated where roughly two thirds of the entries came from.
 */
export const mainCategoryLabel = (words: { category?: string }[]): string => {
  const present = new Set(
    words.map((w) => w.category).filter((c): c is string => Boolean(c))
  );

  if (present.has(OXFORD_3000) && present.has(OXFORD_5000)) {
    return SOURCE_LIST_LABEL;
  }
  if (present.has(OXFORD_5000)) return "Oxford 5000";
  if (present.has(OXFORD_3000)) return "Oxford 3000";

  const counts = new Map<string, number>();
  for (const w of words) {
    const cat = w.category || "";
    if (!cat) continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  if (counts.size === 0) return SOURCE_LIST_LABEL;

  const dominant = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  return dominant ? formatCategoryLabel(dominant) : SOURCE_LIST_LABEL;
};
