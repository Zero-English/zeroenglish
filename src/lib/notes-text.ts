const EXCERPT_LENGTH = 220;
export const MAX_TAGS = 12;
export const MAX_TAG_LENGTH = 24;

/**
 * Converts BlockNote markdown into short, readable plain text.
 * Shared by the API (excerpts) and the client (previews / word counts).
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\|/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function deriveExcerpt(markdown: string): string {
  const plain = markdownToPlainText(markdown).replace(/\s+/g, " ").trim();
  if (plain.length <= EXCERPT_LENGTH) return plain;
  return plain.slice(0, EXCERPT_LENGTH).trimEnd();
}

export function countWords(markdown: string): number {
  const plain = markdownToPlainText(markdown).replace(/\s+/g, " ").trim();
  if (!plain) return 0;
  return plain.split(" ").length;
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  for (const tag of tags) {
    const normalized = tag.trim().toLowerCase().replace(/\s+/g, " ");
    if (!normalized) continue;
    seen.add(normalized.slice(0, MAX_TAG_LENGTH));
    if (seen.size >= MAX_TAGS) break;
  }
  return Array.from(seen);
}
