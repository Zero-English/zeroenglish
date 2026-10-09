// In-memory cache for downloaded font ArrayBuffers
const fontCache = new Map<string, ArrayBuffer>();

interface FontConfig {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: "normal" | "italic";
}

/**
 * Downloads a font from Google Fonts or CDN as an ArrayBuffer
 * and caches it in memory for high-performance server-side rendering.
 */
async function fetchFont(family: string, weight: number = 400): Promise<ArrayBuffer | null> {
  // Normalize family name
  let targetFamily = family || "Inter";
  if (["Arial", "Helvetica", "sans-serif", "system-ui"].includes(targetFamily)) {
    targetFamily = "Inter";
  } else if (["serif", "Times New Roman"].includes(targetFamily)) {
    targetFamily = "Playfair Display";
  }

  const cacheKey = `${targetFamily}-${weight}`;
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!;
  }

  try {
    // Standard Google Fonts CSS API with text/subset
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      targetFamily
    )}:wght@${weight}&display=swap`;

    const cssRes = await fetch(cssUrl, {
      headers: {
        // User agent requested for TrueType/OpenType format
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
      next: { revalidate: 86400 * 30 }, // Cache CSS for 30 days
    });

    if (!cssRes.ok) return null;
    const css = await cssRes.text();

    // Extract font file URL from src: url(...)
    const matches = Array.from(css.matchAll(/src:\s*url\((https:\/\/[^)]+)\)/gi));
    if (!matches.length) return null;

    // Use the first (primary/bengali/main) subset URL
    const fontUrl = matches[0][1];
    const fontRes = await fetch(fontUrl, {
      next: { revalidate: 86400 * 30 },
    });

    if (!fontRes.ok) return null;
    const buffer = await fontRes.arrayBuffer();
    fontCache.set(cacheKey, buffer);
    return buffer;
  } catch (err) {
    console.error(`[FontLoader] Failed to fetch font: ${family} (${weight})`, err);
    return null;
  }
}

/**
 * Loads the fonts needed for a template based on the font families used in the elements
 */
export async function loadFontsForTemplate(
  fontFamilies: { name: string; weight: number }[]
): Promise<FontConfig[]> {
  // Always include standard Inter or Poppins fallback + Hind Siliguri for Bengali
  const required = [
    { name: "Inter", weight: 400 },
    { name: "Inter", weight: 700 },
    { name: "Hind Siliguri", weight: 400 },
    { name: "Hind Siliguri", weight: 700 },
    ...fontFamilies,
  ];

  // Deduplicate
  const uniqueKeys = new Set<string>();
  const uniqueList: { name: string; weight: number }[] = [];
  for (const item of required) {
    const key = `${item.name}-${item.weight}`;
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      uniqueList.push(item);
    }
  }

  const results: FontConfig[] = [];

  await Promise.all(
    uniqueList.map(async (font) => {
      const buffer = await fetchFont(font.name, font.weight);
      if (buffer) {
        results.push({
          name: font.name,
          data: buffer,
          weight: (font.weight as 400 | 500 | 600 | 700 | 800) || 400,
          style: "normal",
        });
      }
    })
  );

  return results;
}
