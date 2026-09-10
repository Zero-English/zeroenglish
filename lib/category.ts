export const formatCategoryLabel = (cat: string) => cat.replace(/([a-z])([A-Z])/g, "$1 $2");

export const mainCategoryLabel = (words: { category?: string }[]): string => {
  if (words.some((w) => (w.category || "") === "Oxford3000" || (w.category || "") === "Oxford5000")) {
    return "Oxford 5000";
  }
  const counts = new Map<string, number>();
  for (const w of words) {
    const cat = w.category || "Oxford5000";
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  if (counts.size === 0) return "Oxford 5000";
  const dominant = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  return dominant ? formatCategoryLabel(dominant) : "Oxford 5000";
};