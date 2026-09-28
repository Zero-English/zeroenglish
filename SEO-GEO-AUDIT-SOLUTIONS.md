# Zero English — Production-Ready SEO + GEO Solutions Playbook

**Companion to:** `SEO-GEO-AUDIT-REPORT.md` (audit date: 28 September 2026)
**Status:** Recommendations only — **no code, config, database, or CMS content has been changed.** Every snippet below is a *proposed* change you (or a developer) apply manually.
**Goal:** Copy-paste-ready fixes, in dependency order, with verification steps.

**Labels used:**
- 🔴 P0 (blocking) · 🟠 P1 (high) · 🟡 P2 (medium) · 🟢 P3 (low)
- **[NO-CODE]** = editable in CMS/admin/dashboard only · **[DEV]** = requires a code change · **[CONFIG]** = hosting/DNS/dashboard setting

---

## How to use this playbook

1. Work top to bottom — items are ordered by dependency (S1 must precede S5's validation, etc.).
2. Each solution: **What to change → Exact change → Why → Verify**.
3. Copy blocks marked `RECOMMENDED` verbatim, adjusting only what's marked `[verify]`.
4. After each deploy, run the verification line for that item.
5. Never ship content claims you can't check on the page (per audit §27).

---

## Quick-Win Checklist (first 90 minutes, mostly [NO-CODE] / small [DEV])

- [ ] Rewrite site title + meta description (S5.1) — [DEV] one file, 5 minutes
- [ ] Add `Allow: /api/v1/words/` to robots (S1) — [DEV] 1 file, 2 minutes
- [ ] Add Organization + WebSite JSON-LD (S7.1) — [DEV] one component
- [ ] Add missing routes to sitemap (S4) — [DEV] one array
- [ ] noindex `/profile/[id]` (S6.1) — [DEV] 1 line
- [ ] Page-specific Open Graph on main templates (S5.3) — [DEV]
- [ ] `lang="bn"` default (S5.4) — [DEV] 1 attribute
- [ ] Add About-page "কীভাবে তৈরি হয়" methodology section (S10.1) — [NO-CODE] CMS/manual
- [ ] Facebook bio + footer canonical description (S10.3) — [NO-CODE]
- [ ] Verify site in Google Search Console + submit sitemap (S12.1) — [CONFIG]

---

## Change Map (audit issue → file/page → solution)

| # | Issue (audit ref) | Where to change | Solution |
|---|---|---|---|
| 1 | robots blocks content API (T2) | `app/robots.ts` | **S1** |
| 2 | Vocabulary pages empty in HTML (T1) | `app/(frontend)/vocabulary/[level]/page.tsx` + `components/level-page-content.tsx` | **S2** |
| 3 | Homepage 4.1 MB + PII (T3) | `app/(frontend)/page.tsx` + `components/home-or-dashboard.tsx` | **S3** |
| 4 | Sitemap incomplete / fake lastmod (T5) | `app/sitemap.ts` | **S4** |
| 5 | Titles/descriptions/OG/lang (T8, §17) | `app/(frontend)/layout.tsx` + page metadata | **S5** |
| 6 | Indexable profiles, soft-404, case URLs, 307s (T6, T7, T9, T10, T11) | page metadata + hosting config | **S6** |
| 7 | Zero structured data (T4, §18) | new `components/seo/*` + layout | **S7** |
| 8 | Weak/overpromising copy (§6, §9) | CMS / page copy | **S8** |
| 9 | Missing cornerstone content (§19) | CMS / new pages | **S9** |
| 10 | E-E-A-T gaps (§11) | About page, blog author | **S10** |
| 11 | Voice + internal-link rules (§10, §16) | editorial process | **S11** |
| 12 | Measurement + rollout (§31–32) | process | **S12** |
---

## S1. Unblock the content API in robots.txt 🔴 P0 — [DEV] `app/robots.ts` (2 minutes)

**What:** `Disallow: /api` currently prevents crawlers from fetching `/api/v1/words/all`, the feed your vocabulary pages depend on during rendering.

**Exact change** — replace the whole file with:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/v1/words/"],
        disallow: ["/admin", "/docs", "/api", "/offline"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

**Why it's safe:** Google picks the *most specific* path rule — `/api/v1/words/` (longer path) beats `/api`, so the public word data is crawlable while `/api` auth/profile routes stay blocked. Auth endpoints also keep their own protections.

**Verify after deploy:**
```
https://zeroenglish.org/robots.txt        → contains: Allow: /api/v1/words/
https://www.google.com/search?q=site:zeroenglish.org/api/v1/words/all → should NOT get blocked-by-robots test in URL Inspection
```

---

## S2. Server-render vocabulary pages 🔴 P0 — [DEV] (1–2 days)

**What:** Make the word table, H1, intro, and pagination exist in the HTML instead of arriving via `/api/v1/words/all`.

**Two options — pick one:**

### Option A (recommended): pass page words as props from the server component

`app/(frontend)/vocabulary/[level]/page.tsx` — RECOMMENDED (keeps your existing `generateMetadata`, adds data fetch):

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWordsByLevel } from "@/lib/data";
import { LevelPageContent } from "@/components/level-page-content";

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const ITEMS_PER_PAGE = 10; // keep in sync with sitemap.ts

const LEVEL_LABELS: Record<(typeof VALID_LEVELS)[number], { label: string; labelBn: string }> = {
  A1: { label: "Beginner", labelBn: "শিক্ষানবিস" },
  A2: { label: "Elementary", labelBn: "প্রাথমিক" },
  B1: { label: "Intermediate", labelBn: "মাঝারি" },
  B2: { label: "Upper Intermediate", labelBn: "উচ্চ-মাঝারি" },
  C1: { label: "Advanced", labelBn: "উন্নত" },
  C2: { label: "Mastery", labelBn: "পারদর্শী" },
};

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const upper = level.toUpperCase();
  if (!VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number])) {
    return { title: "Level Not Found", robots: { index: false, follow: false } };
  }
  const labels = LEVEL_LABELS[upper as (typeof VALID_LEVELS)[number]];
  return {
    title: `English Vocabulary - Level ${upper} (${labels.label}) | Zero English`,
    description: `Learn essential English words at ${upper} level (${labels.label}). ${labels.labelBn} vocabulary list with Bangla meanings, examples, synonyms and antonyms.`,
    alternates: { canonical: `/vocabulary/${upper.toLowerCase()}` },
    openGraph: {
      title: `English Vocabulary - Level ${upper} (${labels.label}) | Zero English`,
      description: `Learn essential English words at ${upper} level (${labels.label}). ${labels.labelBn} vocabulary list with Bangla meanings, examples and antonyms.`,
      url: `/vocabulary/${upper.toLowerCase()}`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const upper = level.toUpperCase();
  if (!VALID_LEVELS.includes(upper as (typeof VALID_LEVELS)[number])) notFound();

  const allWords = await getWordsByLevel(upper as (typeof VALID_LEVELS)[number]);
  const initialWords = allWords.slice(0, ITEMS_PER_PAGE); // page 1

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `A1 Vocabulary`.replace("A1", upper),
            url: `/vocabulary/${upper.toLowerCase()}`,
          }),
        }}
      />
      <LevelPageContent level={level} initialWords={initialWords} totalCount={allWords.length} />
    </>
  );
}
```

`components/level-page-content.tsx` — RECOMMENDED behavioral change:
1. Accept `initialWords?: Word[]` and `totalCount?: number`.
2. Seed `useCachedWords` with `initialWords` so the **first server paint already contains the table** (no flash, no empty state, HTML contains words).
3. Keep the client fetch as *revalidation only* (existing cache logic stays).
4. Render the **H1 + level intro (S8.2 text) server-side** above the table.
5. Add server-rendered level switcher links (A1…C2) and pagination links.

Same pattern for `app/(frontend)/vocabulary/[level]/[pageNum]/page.tsx` (slice `((page-1)*10, page*10)`).

`components/vocabulary/page.tsx` hub — RECOMMENDED: render the six level cards as plain server HTML links (`/vocabulary/a1` … `/vocabulary/c2`) — today they exist only after JS.

**Why:** 511 pages become indexable *and* citable by AI crawlers; pagination becomes crawlable without the sitemap.

**Verify:**
```
curl -s https://zeroenglish.org/vocabulary/a1 | grep -c "apple"   → > 0 (was 0)
curl -s https://zeroenglish.org/vocabulary/a1 | grep -c "<h1"     → 1 (was 0)
curl -s https://zeroenglish.org/vocabulary | grep -o 'href="/vocabulary/a1"' → present
URL Inspection (GSC) → "View crawled page" shows word rows
```
---

## S3. Shrink the homepage from 4.1 MB 🔴 P0 — [DEV] (2–4 hours)

**What:** Stop shipping all 5,089 words + full leaderboard (names, IDs, Google avatar URLs) inside homepage HTML.

**Exact change** in `app/(frontend)/page.tsx` — RECOMMENDED:

```tsx
// BEFORE (current)
const words = await getAllWords();
// ...
return <HomeOrDashboard words={words} posts={posts} leaderboard={leaderboard} />;

// AFTER (recommended)
const topLeaderboard = (leaderboardResult.success && leaderboardResult.data ? leaderboardResult.data : []).slice(0, 3);
// remove: const words = await getAllWords();
return <HomeOrDashboard posts={posts} leaderboard={topLeaderboard} />;
```

Companion changes in `components/home-or-dashboard.tsx` [verify exact prop names]:
1. Remove the `words` prop; make the homepage search widget lazy-load `/api/v1/words/all` only when opened (existing `useCachedWords` already caches it — first open pays the cost, not every visit).
2. Keep only 3 leaderboard rows in the server payload (matches what's visible above the fold).
3. If a full leaderboard is needed client-side, fetch `/api/v1/leaderboard` on click rather than embedding.

**Why:** ~100× HTML reduction fixes LCP/INP risk for mobile Bangla users, cuts Googlebot bandwidth per crawl, and removes bulk user PII (names + Google avatar URLs + scores) from a public document.

**Verify:**
```
curl -sI https://zeroenglish.org/ | grep -i content-length   → target < 300,000 bytes (was 4,101,359)
curl -s https://zeroenglish.org/ | grep -c "apple"           → 0 (was 8)
curl -s https://zeroenglish.org/ | grep -c "googleusercontent" → 0 (was 3+)
PageSpeed Insights (mobile): LCP < 2.5s target
```

**Note:** search still works — it pulls from the API on demand (which S1 keeps crawlable for other pages).

---

## S4. Complete the sitemap + honest lastmod 🟠 P1 — [DEV] `app/sitemap.ts` (1 hour)

**Exact change** — extend `staticRoutes` (keep everything else as-is):

```ts
const staticRoutes = [
  { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1 },
  { url: `${BASE_URL}/vocabulary`, changeFrequency: "weekly" as const, priority: 0.9 },
  { url: `${BASE_URL}/search`, changeFrequency: "weekly" as const, priority: 0.8 },
  { url: `${BASE_URL}/quiz`, changeFrequency: "weekly" as const, priority: 0.8 },
  { url: `${BASE_URL}/quiz/exam`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/quiz/vocabulary`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/quiz/grammar`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/quiz/class`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/quiz/quick`, changeFrequency: "weekly" as const, priority: 0.6 },
  { url: `${BASE_URL}/news`, changeFrequency: "daily" as const, priority: 0.7 },
  { url: `${BASE_URL}/leaderboard`, changeFrequency: "daily" as const, priority: 0.5 },
  { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
  { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.5 },
  { url: `${BASE_URL}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
  // Only if the page is publicly reachable (it currently shows for logged-in users only):
  // { url: `${BASE_URL}/contribute`, changeFrequency: "monthly" as const, priority: 0.4 },
];
```

**lastmod honesty** (choose one, recommended in order):
1. **Best:** for vocabulary URLs, set `lastModified` from your words table's real `updatedAt` (e.g., `getWordsUpdatedAt()` if you add it — one-line MAX query). Blog entries already use `blog.updatedAt` ✅.
2. **Acceptable:** keep build time but stop claiming `changefreq: "daily"` on unchanged pages → `"monthly"` for level pages.
3. **Do not** ship the same timestamp for every URL forever — Google treats that as "no dates".

**Verify:** `https://zeroenglish.org/sitemap.xml` → count rises 520 → 527+; includes `/about`, `/privacy`, 4 quiz hubs; GSC Sitemap report shows "Success".

**Also:** keep `/profile/*`, `/login` out (noindex pages don't belong in sitemaps) ✅ current behavior.
---

## S5. Metadata fixes 🟠 P1 — [DEV]

### S5.1 Site title + description (rewrite the overpromise) 🔴 highest leverage

**Exact change** in `app/(frontend)/layout.tsx` — RECOMMENDED:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "English Vocabulary with Bangla Meaning (A1–C2) | Zero English",
    template: "%s | Zero English",
  },
  description:
    "৫,০০০+ ইংরেজি শব্দ বাংলা অর্থসহ — A1 থেকে C2, CEFR লেভেল অনুযায়ী সাজানো। অর্থ, সংজ্ঞা, উদাহরণ ও কুইজ এক জায়গায়, সম্পূর্ণ ফ্রি।",
  manifest: "/manifest.webmanifest",
  icons: "/assets/logo/favicon.webp",
  // openGraph: see S5.3
  other: { "theme-color": "#000000" },
  robots: { index: true, follow: true },
};
```

- The `title.template` removes manual `| Zero English` suffixes on subpages (they'd double up — strip suffixes from child pages that already append it, or skip the template and add suffixes manually; **pick one approach**).
- Why: current title "Everything You Need to Master English" claims grammar/composition content that doesn't exist; the new title targets the #1 query class (audit §5) and stays true.

**English alternative (if you prefer EN descriptions):**
```text
Title: English Vocabulary with Bangla Meaning (A1–C2) | Zero English
Description: 5,000+ English words with Bangla meanings, definitions and examples,
organized A1 to C2 by CEFR level. Practice with quizzes and track your progress. Free.
```

### S5.2 Per-page title/desc targets (apply via each page's `metadata`)

| Page | Title | Meta description |
|---|---|---|
| `/vocabulary` | `Vocabulary with Bangla Meaning (A1–C2) \| Zero English` | `৫,০৮৯টি ইংরেজি শব্দ, ৬টি CEFR লেভেলে সাজানো — বাংলা অর্থ, সংজ্ঞা ও উদাহরণসহ। লেভেল বেছে নিন, শিখুন, কুইজ দিন।` |
| `/search` | `Search English Words – Bangla Meaning \| Zero English` | `ইংরেজি শব্দ খুঁজুন — বাংলা অর্থ, সংজ্ঞা ও উদাহরণ একসাথে। পূর্ণ A1–C2 শব্দভাণ্ডারে সার্চ করুন।` |
| `/leaderboard` | `Quiz Leaderboard \| Zero English` | (keep current description) |
| `/vocabulary/a1` | `A1 Vocabulary (Beginner): 924 Words with Bangla Meaning \| Zero English` | `A1 লেভেলের ৯২৪টি শুরুর ইংরেজি শব্দ — বাংলা অর্থ, সংজ্ঞা, উদাহরণ ও সমার্থকসহ। শেখার পর কুইজ দিন।` |
| levels A2–C2 | same pattern with their verified counts (800 / 739 / 1329 / 1296 / 1) | same pattern |

Counts above are the live homepage numbers — re-verify if the dataset changed.

### S5.3 Page-specific Open Graph (kill homepage-default shares)

**Exact change** — keep the layout `openGraph` as site defaults, then override per template, e.g. in `vocabulary/[level]/page.tsx` (already included in S2 snippet) and:

```ts
// app/(frontend)/about/page.tsx — add to existing metadata
openGraph: {
  title: "About Zero English — Free English Learning for Bangla Speakers",
  description: "জিরো ইংলিশ কী, কে তৈরি করেছে, কীভাবে শব্দ সাজানো হয় এবং কেন এটি সম্পূর্ণ ফ্রি — সব প্রশ্নের উত্তর।",
  url: "/about",
  siteName: SITE_NAME,
},
```
Repeat pattern for `/vocabulary`, `/quiz`, `/news`, `/contact` (5 files, ~10 lines each).

### S5.4 Fix `html lang`

In `app/(frontend)/layout.tsx` (or the root shell `components/html-shell.tsx` where `<html>` is emitted) [verify location]:
- `lang="en"` → **`lang="bn"`** (default content is Bangla).
- If the language toggle stays client-side, optionally set `lang` dynamically after hydration, but SSR default should match the server-rendered language: `bn`.

### S5.5 Twitter cards

Current cards inherit layout OG ✅ — after S5.1/S5.3 they become page-specific automatically. No separate change needed; verify one inner page:
```
curl -s https://zeroenglish.org/vocabulary/a1 | grep 'twitter:title'  → matches page title, not homepage
```

**Verify S5 overall:**
```
curl -s https://zeroenglish.org/ | grep '<title>'        → new title
curl -s https://zeroenglish.org/about | grep 'og:title'   → about-specific (was homepage title)
curl -s https://zeroenglish.org/ | grep '<html'          → lang="bn"
```
---

## S6. Indexation hygiene 🟠 P1 — [DEV] / [CONFIG]

### S6.1 noindex public user profiles (1 line)

`app/(frontend)/profile/[id]/page.tsx` — add to `generateMetadata` return:

```ts
return {
  title: `${name} | Profile | Zero English`,
  robots: { index: false, follow: false },
};
```
Why: hundreds of thin name+stats pages dilute crawl quality and expose user names in SERPs. (Self `/profile` already noindexes ✅.)

### S6.2 Soft-404 → real 404

`app/(frontend)/quiz/question/[id]/page.tsx` — when the question doesn't exist, call `notFound()` instead of rendering "Question Not Found" with HTTP 200 (pattern already used in `news/[slug]/page.tsx`).

### S6.3 Missing canonical on `/contribute`

```ts
// app/(frontend)/contribute/page.tsx — add to existing metadata
alternates: { canonical: "/contribute" },
```

### S6.4 Permanent redirects [CONFIG] (hosting dashboard, not code)

| Setting | From | To | Why |
|---|---|---|---|
| Vercel domain redirect | `www.zeroenglish.org` | `zeroenglish.org` (**Permanent/301**) | currently 307 (temporary) |
| Vercel domain redirect | `zeroenglish.tahmidhasan.net` (+ apex) | `zeroenglish.org` (**Permanent/301**) | currently 307; consolidate the old domain's indexed URLs + legacy title |
| Trailing slash | already 308-stripped ✅ | — | no change |

Then in GSC: submit the old domain as a property → Sitemaps/URL Inspection → monitor old URLs dropping out (allow 2–6 weeks).

### S6.5 Case-variant URLs 🟢 P3 (optional)

`/vocabulary/A1` currently 200s (canonical → lowercase ✅). To fully close it, add a middleware/redirect: `^/vocabulary/([A-Z0-9]+)$` → 308 → lowercase. Low priority — canonical already handles it.

**Verify S6:**
```
curl -sI https://zeroenglish.org/profile/1 | grep -i 'x-robots\|< meta'  → view source: robots noindex
curl -sI https://www.zeroenglish.org/     → 301 (was 307)
curl -sI https://zeroenglish.org/quiz/question/999999999 → 404 (was 200)
```

---

## S7. Structured data (JSON-LD) 🟠 P1 — [DEV] (~4 hours total)

All blocks below are **copy-paste components**. No unsupported claims: no `aggregateRating`, no `review`, no `Course` schema (you have no enrolled-course data).

### S7.1 Organization + WebSite (site-wide)

Create `components/seo/site-schema.tsx`:

```tsx
const SITE_URL = "https://zeroenglish.org";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Zero English",
  alternateName: "জিরো ইংলিশ",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo/favicon.webp`,
  description:
    "Free bilingual (Bangla–English) learning platform that helps Bangla-speaking learners build English vocabulary and grammar through CEFR-level word lists (A1–C2), quizzes, exams and progress tracking.",
  sameAs: ["https://facebook.com/zeroenglishorg"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "zeroenglishweb@gmail.com",
    availableLanguage: ["bn", "en"],
  },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zero English",
  url: SITE_URL,
  inLanguage: "bn",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export function SiteSchema() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
```
Render `<SiteSchema />` once in `app/(frontend)/layout.tsx`.
[verify] `/search?q=` — confirm the search page actually reads the `q` param; if it doesn't, drop `potentialAction` (don't advertise a search box that ignores it).

### S7.2 BreadcrumbList (level pages)

Add inside the level page (S2 snippet area):

```ts
const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://zeroenglish.org/" },
    { "@type": "ListItem", position: 2, name: "Vocabulary", item: "https://zeroenglish.org/vocabulary" },
    { "@type": "ListItem", position: 3, name: `Level ${upper}`, item: `https://zeroenglish.org/vocabulary/${upper.toLowerCase()}` },
  ],
};
```
Pair it with **visible** breadcrumbs in the UI (schema must reflect real page content).
### S7.3 FAQPage on `/about` (matches existing genuine content ✅)

The About page already answers these six questions — the schema only mirrors what's on the page (allowed; it must stay in sync):

```ts
const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "জিরো ইংলিশ কী?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "জিরো ইংলিশ একটি দ্বিভাষিক ইংরেজি শেখার প্ল্যাটফর্ম — বাংলা অর্থসহ অক্সফোর্ড ৫০০০ শব্দের তালিকা থেকে A1 থেকে C2 লেভেল পর্যন্ত শেখানো হয়।",
      },
    },
    {
      "@type": "Question",
      name: "এটি কি সত্যিই বিনামূল্যে?",
      acceptedAnswer: { "@type": "Answer", text: "হ্যাঁ। সব শব্দ, কুইজ ও পরীক্ষা — সবকিছুই বিনামূল্যে।" },
    },
    {
      "@type": "Question",
      name: "কোন লেভেলগুলো কভার করা হয়?",
      acceptedAnswer: { "@type": "Answer", text: "A1, A2, B1, B2, C1 ও C2 — ছয়টি CEFR লেভেলই। আপনি যেকোনো লেভেল থেকে শুরু করে ধীরে ধীরে এগিয়ে যেতে পারেন।" },
    },
    {
      "@type": "Question",
      name: "কীভাবে শেখা শুরু করব?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "শব্দভান্ডার পেজ থেকে আপনার লেভেল বেছে নিন, অ্যাকাউন্ট খুলুন (ঐচ্ছিক) এবং দৈনিক লক্ষ্য রাখুন। শেখার পর কুইজ দিয়ে নিজেকে যাচাই করুন।",
      },
    },
    {
      "@type": "Question",
      name: "আমার অগ্রগতি কি ট্র্যাক হবে?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "হ্যাঁ — শেখা শব্দ, বুকমার্ক ও কুইজের ফলাফল সংরক্ষিত হয় এবং প্রোফাইল থেকে সারাংশ ও অগ্রগতি চার্ট দেখা যায়।",
      },
    },
    {
      "@type": "Question",
      name: "অফলাইনে শেখা যাবে?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "জিরো ইংলিশ একটি PWA — ওয়েব অ্যাপ হিসেবে ইন্সটল করলে অফলাইনেও শেখা চালিয়ে যেতে পারেন, প্রগতি ডিভাইসে সংরক্ষিত হয়।",
      },
    },
  ],
};
```
Render on `/about` only. **Rule:** if you edit an FAQ answer on the page, edit this block the same day (schema/content mismatch = spammy).

### S7.4 Article on `/news/[slug]`

Extend the existing `openGraph` in `news/[slug]/page.tsx`'s `generateMetadata` — and add a JSON-LD in the page component:

```ts
const article = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: blog.titleBn, // or titleEn if the EN version is primary
  datePublished: blog.createdAt.toISOString(),
  dateModified: blog.updatedAt.toISOString(),
  author: { "@type": "Organization", name: "Zero English", url: "https://zeroenglish.org" },
  publisher: {
    "@type": "Organization",
    name: "Zero English",
    logo: { "@type": "ImageObject", url: "https://zeroenglish.org/assets/logo/open-graph.png" },
  },
  image: blog.featuredMedia ? [blog.featuredMedia.url] : undefined,
  mainEntityOfPage: `https://zeroenglish.org/news/${blog.slug}`,
  inLanguage: "bn",
};
```

**Verify S7:**
```
Rich Results Test (search.google.com/test/rich-results) on:
  https://zeroenglish.org/about        → FAQPage valid
  https://zeroenglish.org/             → Organization, WebSite valid
  https://zeroenglish.org/news/new-features-are-here → Article valid
  https://zeroenglish.org/vocabulary/a1 → BreadcrumbList valid
```
---

## S8. Content copy bank (paste-ready) 🟠 P1 — [NO-CODE] unless noted

### S8.1 Homepage copy rewrites

**H1 (keep structure, sharpen):**
```text
শূন্য থেকে ইংরেজি আয়ত্ত — শব্দভাণ্ডার, কুইজ ও অগ্রগতি এক জায়গায়
```

**Hero paragraph — CURRENT vs BETTER:**
```text
CURRENT:
Oxford 5000 শব্দ বাংলা অর্থসহ। প্রতিদিন ৫০টি নতুন শব্দ শিখুন, নিজের লেভেল বেছে নিন,
আর আত্মবিশ্বাসটা বাড়তে দেখুন — শব্দে শব্দে, এক ধাপ থেকে আরেক ধাপে।

BETTER:
৫,০৮৯টি ইংরেজি শব্দ বাংলা অর্থ ও উদাহরণসহ, A1 থেকে C2 — ৬টি লেভেলে সাজানো।
নিজের লেভেল বেছে নিন, প্রতিদিন ১০–২০টি শব্দ শিখুন, আর কুইজ দিয়ে দেখুন
কতটা মনে আছে। কোনো টাকা লাগে না।
```
Why: concrete counts (verifiable: 5089 = 924+800+739+1329+1296+1), realistic daily target (50/day is unsustainable for beginners; 10–20 is credible), drops the decorative em-dash phrase.

**If C2 stays at 1 word**, replace public text "৬টি লেভেলে" honestly:
```text
…A1 থেকে C2 — ৫টি পূর্ণ লেভেল ও ১টি চলমান লেভেল (C2 আপডেট হচ্ছে)।
```
or hide the C2 card until it's filled (preferred).

### S8.2 Level page intro (server-rendered above the table; write once per level)

**A1 (template — counts verified live):**
```text
H1: A1 ইংরেজি শব্দভাণ্ডার (শিক্ষানবিস) — ৯২৪টি শব্দ, বাংলা অর্থসহ

A1 লেভেলের ৯২৪টি শব্দ প্রতিদিনের কথোপকথনে সবচেয়ে বেশি লাগে — greeting,
পরিবার, খাবার, সংখ্যা ও সাধারণ ক্রিয়া। প্রতিটি শব্দে পাবেন বাংলা অর্থ,
ইংরেজি সংজ্ঞা, উদাহরণ বাক্য (বাংলা অনুবাদসহ), সমার্থক ও বিপরীত শব্দ।
শেষে A1 কুইজ দিয়ে যাচাই করুন — অ্যাকাউন্ট ছাড়াও চলবে।
```

**A2–C2:** same structure, swap count + level character (one sentence each — keep it specific):
- A2 (৮০০): "…দৈনন্দিন কাজের ইংরেজি — মল, পরিবহণ, অফিসের সাধারণ কথা…"
- B1 (৭৩৯): "…সংবাদ ও গল্প বুঝতে লাগা শব্দ, বাক্যের ভেতরে মানে বদলায় এমন শব্দ…"
- B2 (১৩২৯): "…নিজের মত প্রকাশ করা ও তর্ক করার শব্দ, ফরমাল-ইনফরমাল পার্থক্য…"
- C1 (১২৯৬): "…শিক্ষা, কাজ ও মাধ্যমে যাওয়ার পেশাদার শব্দ, nuanced অর্থের শব্দ…"
- C2: (only if data exists — otherwise show the "আপডেট হচ্ছে" notice from S8.4)

**FAQ block (per level page, 3 Q&A — schema-ready):**
```text
Q: A1 কী মানে?  A: CEFR স্কেলের শুরুর লেভেল — কোনো আগের জ্ঞান ছাড়াই শুরু করা যায়।
   প্রায় ৯০০ শব্দে দৈনন্দিন কথা বলা যায়।
Q: একটি লেভেল শেষ কত দিনে হবে?  A: দিনে ১০টি করে গেলে A1 (৯২৪টি) প্রায় ৩ মাস;
   নিজের গতিতে কুইজ দিয়ে এগোবেন। কোনো ডেডলাইন নেই।
Q: শব্দগুলো কোথা থেকে?  A: Oxford 3000/5000 তালিকা অনুযায়ী সাজানো (Oxford
   University Press-এর ফ্রি ওয়ার্ড লিস্ট) — প্রতিটি শব্দে বাংলা অর্থ ও নিজস্ব উদাহরণ দেওয়া আছে।
```
[verify] last answer only after adding the Oxford attribution note (S10.2).

### S8.3 `/quiz` guest-state copy (replace empty dashboards for logged-out users)

```text
আপনার কুইজ বেছে নিন                     ← H1 (existing)
শব্দভাণ্ডার, গ্রামার, শ্রেণি কিংবা নির্ধারিত পরীক্ষা — যেভাবে চান কুইজ দিয়ে অনুশীলন করুন।
(গেস্ট ভিজিটরের জন্য নতুন:) অ্যাকাউন্ট ছাড়াই কুইজ দেওয়া যায়। রেজাল্ট সেভ করতে
চাইলে লগইন করুন — আগের স্কোর, দুর্বল টপিক ও ধারা প্রোফাইলে জমা থাকে।
```
Hide "এখনো কোনো কুইজ নেই" / "0 / 0" widgets from logged-out users (show them only after login). This copy also becomes indexable text.

### S8.4 C2 honesty notice (until data is complete)

```text
C2 (পারদর্শী) লিস্ট এখন আপডেট হচ্ছে — শীঘ্রই যুক্ত হবে।
এখনই A1–C1 দিয়ে শুরু করুন → [A1 লিস্ট]
```
Plus: add `robots: { index: false }` on `/vocabulary/c2` until it has a real list.

### S8.5 Blog article header fix (editorial, [NO-CODE])

- Date: always `12 September 2026` format (never `9/12/2026`).
- Add visible byline: `লেখক: Zero English Team` (or a real name) under the title.
- Keep the existing personal voice — it's the most human content on the site.
---

## S9. New page specifications (production outlines) 🟠 P1–P2 — [NO-CODE]/CMS

### S9.1 `/guides/oxford-3000-word-list-bangla` — cornerstone #1 (build first)

**Title:** `Oxford 3000 Word List with Bangla Meaning | Free A1–B2 Words`
**H1:** `Oxford 3000 Word List — বাংলা অর্থ ও অনুশীলনসহ`
**Word count target:** 1,800–2,500 + tables
**Structure:**

```text
1. কী এই পাতা (60 words) — কেন ৩,০০০ শব্দ, কার জন্য
2. Oxford 3000 কী? (150) — WHAT: Oxford University Press-এর তৈরি ফ্রি ওয়ার্ড লিস্ট;
   কেন এই ৩,০০০টি: দৈনন্দিন ইংরেজির ৯৫%+ কভার করে বলে অনুমান — সূত্র লিংকসহ।
   স্বচ্ছতা: "জিরো ইংলিশ Oxford-এর সাথে সম্পৃক্ত নয়; তালিকা ব্যবহার করে শব্দ সাজানো হয়েছে।"
   [উৎস যোগ করুন: Oxford Learner's Dictionaries ওয়েবসাইটের কর্পাস-ভিত্তিক তালিকা]
3. CEFR লেভেল ম্যাপিং (100) — table: A1 924 / A2 800 / B1 739 (+ cross-links)
   (আপনার নিজের কাউন্ট = unique data, কোনো competitor-এর সাইটে নেই)
4. টেবিল: প্রথম ২০০ শব্দ — Word | বাংলা অর্থ | CEFR | উদাহরণ (each row links
   to /vocabulary/{level}); বাকি ২,৮০০ → /vocabulary এর লিংক
5. কীভাবে ব্যবহার করবেন (200) — ৩টি ধাপ: দেখুন → উদাহরণ লিখুন → কুইজ দিন
   (links: /quiz/vocabulary)
6. ঘন ঘন ভুল প্রশ্ন (FAQ, 4 Q&A → FAQPage schema):
   "Oxford 3000 কি ফ্রি?" / "Oxford 5000 কী?" / "কত দিনে শেষ?" / "বাংলা অর্থ নিয়ে কি
   নির্ভর করা যায়?"
সম্পর্কিত: Oxford 5000 guide (সপ্তাহ ৪) → A1 list → memorize guide
```

### S9.2 `/guides/how-to-memorize-english-words` — cornerstone #2

**Title:** `কীভাবে ইংরেজি শব্দ মনে রাখবেন — 7টি কাজের নিয়ম (Bangla Guide)`
**Structure:** সমস্যা স্বীকার (রটনা মুখস্থ কেন কাজ করে না) → পুনরাবৃত্তি ব্যবধান
(spaced repetition, বাংলা ব্যাখ্যা + উদাহরণ) → উদাহরণ বাক্য লেখা → নিজের ভাষায়
ব্যবহার → কুইজ = retrieval practice (আপনার ফিচারের সাথে যুক্ত) → ভুল কুইজ-রেজাল্ট
রিভিউ → ৩০ দিনের প্ল্যান টেবিল → FAQ. **No fake statistics** — explain mechanisms, cite
well-known memory research only if you link the source.

### S9.3 Ideal vocabulary page (already specified) — audit §23 template is the spec

Priority order for building: hub (S2) → level pages (S2) → topic lists → `/word/{slug}`.

### S9.4 `/word/{slug}` template spec (phase 2 — after S2 ships)

```text
URL:     /word/abandon
H1:      abandon — বাংলা অর্থ ও সংজ্ঞা
Title:   abandon Meaning in Bangla, Definition & Examples | Zero English
Blocks:  [উচ্চারণ/phonetic if available] → বাংলা অর্থ (list) → ইংরেজি সংজ্ঞা →
         বাংলা সংজ্ঞা → ২ উদাহরণ বাক্য (EN+BN) → synonyms/antonyms (internal links)
         → wordType + level badge → "এই শব্দ নিয়ে কুইজ" (deep-link) →
         related 5 words (same level/topic) → breadcrumb + BreadcrumbList
Crawl:   static/ISR (revalidate 3600); sitemap: start with top-100 searched words,
         grow to all 5,089 over 3 months
```
Why it matters: this is the only structure that can rank for "abandon meaning in Bangla" — the longest-tail demand your dataset already answers.

### S9.5 Grammar topic template — audit §12 (copy this shell when writing the first topic)

```text
H1: Simple Present Tense — বাংলা ব্যাখ্যা ও উদাহরণ
[1. নিয়ম + ফর্মুলা টেবিল] [2. ৫টি উদাহরণ (EN + BN)] [3. ৩টি ভুল — বাংলাভাষীরা
যা করে (❌ I am go / ✅ I go)] [4. সম্পর্কিত শব্দ তালিকার লিংক] [5. এই টপিকের কুইজ CTA]
[6. পরবর্তী টপিক: Past Simple →]
```
---

## S10. E-E-A-T pack 🟠 P1 — [NO-CODE]

### S10.1 New About section: "কীভাবে আমাদের শব্দভাণ্ডার তৈরি হয়"

Insert after the "আমাদের পদ্ধতি" block. **Draft — verify every claim before publishing:**

```text
কীভাবে আমাদের শব্দভাণ্ডার তৈরি হয়

প্রতিটি শব্দের জন্য আমরা চারটি কিছু রাখি: বাংলা অর্থ, ছোট ইংরেজি সংজ্ঞা,
একটি উদাহরণ বাক্য (বাংলা অনুবাদসহ) এবং সমার্থক/বিপরীত শব্দ। শব্দগুলো
Oxford 3000/5000 তালিকা অনুযায়ী CEFR লেভেলে সাজানো — কোন শব্দ কোন লেভেলে
সেটি তালিকার নিজস্ব মানদণ্ড অনুসরণ করে।

সংশোধন ও আপডেট: কোনো শব্দ বা উদাহরণ ভুল মনে হলে আমাদের জানান —
যোগাযোগ পাতায় ইমেইল বা হোয়াটসঅ্যাপে। ত্রুটি পাওয়া গেলে সম্পাদনা করা হয়
এবং পাতার আপডেট তারিখ ওয়েবসাইটে থাকে।
```
Rules: only describe process you actually follow; if a human doesn't currently review entries, publish the correction channel instead of claiming review.

### S10.2 Oxford attribution note (About FAQ answer + S9.1 guide)

```text
Oxford 3000 ও Oxford 5000 হলো Oxford University Press-এর প্রকাশিত ওয়ার্ড লিস্ট।
জিরো ইংলিশ সেই তালিকা অনুসরণ করে শব্দগুলো লেভেল অনুযায়ী সাজিয়েছে এবং প্রতিটি
শব্দে নিজস্ব বাংলা অর্থ ও উদাহরণ যোগ করেছে। জিরো ইংলিশ Oxford University Press-এর
সাথে কোনো অধিভুক্তি বা অনুমোদন ছাড়া সম্পৃক্ত নয়।
```
Why: removes an E-E-A-T risk (implied affiliation) while keeping the keyword.

### S10.3 Canonical brand description (one sentence, everywhere)

```text
EN: Zero English is a free bilingual (Bangla–English) learning platform that helps
    Bangla-speaking learners build English vocabulary and grammar through CEFR-level
    word lists (A1–C2), quizzes, exams and progress tracking.
BN: জিরো ইংলিশ — বাংলাভাষী শিক্ষার্থীদের জন্য ফ্রি দ্বিভাষিক ইংরেজি লার্নিং প্ল্যাটফর্ম,
    যেখানে A1–C2 লেভেলের শব্দভাণ্ডার, কুইজ, পরীক্ষা ও অগ্রগতি ট্র্যাকিং পাওয়া যায়।
```
Paste into: Organization schema `description` (S7.1), Facebook page bio, GitHub org/repo README, YouTube channel about, directory listings, footer about line.

### S10.4 Contact & bylines

- Prefer a **domain email** in public contact slots (`hello@zeroenglish.org` forwarding to Gmail); Gmail stays as fallback.
- Blog posts: visible byline (`লেখক: …`) + `author` in Article schema (S7.4).
- No invented credentials, awards, or testimonials — ever.

### S10.5 Methodology page (optional, month 2)

`/about/methodology` — word selection criteria, level assignment rules, example-writing policy, correction log. The strongest E-E-A-T page an educational site can add, and it's genuinely yours to write.
---

## S11. Editorial + internal-linking rules (production style guide) 🟡 — [NO-CODE]

**Tone:** helpful senior student to a younger one — warm, direct, never hype.
**Sentences:** Bangla ≤ 25 words; English meta ≤ 15; one idea per sentence in teaching content.
**Headings:** describe content, not benefits (`কীভাবে শব্দ মনে রাখবেন`, not `শেখার ক্ষমতা বাড়ান`).
**Language split:** Bangla = UI + teaching; English = titles/meta/technical terms; never mix mid-sentence in meta titles.
**Punctuation:** max 1 em dash per paragraph; no `!` in educational text; দাঁড়ি (।) in Bangla prose.
**CTA:** one verb per section (`শব্দভাণ্ডার দেখুন` / `কুইজ দিন`); max one CTA phrase per viewport.
**Banned phrasings:** "Everything you need", "in one place", "unlock", "next level", "সবকিছু এক প্ল্যাটফর্মে" (unless the parts are named), unverifiable superlatives.
**Claim rule:** every number/date on a page must be checkable on that page.

**Internal-link rules (every new page must obey):**

1. ≥ 3 internal inlinks: breadcrumb + footer + 1 contextual.
2. Every guide links 1 level hub with a descriptive anchor (`A1 শব্দভাণ্ডার দেখুন` — never `click here`).
3. Every level page links: hub (up), 2 sibling levels (across), matching quiz (action).
4. New content links back to the nearest pillar page; pillars link out to quizzes.
5. Never internal-nofollow. Orphan check: every new URL appears in the sitemap + ≥1 hub within 24h of publish.

---

## S12. Rollout, verification & measurement 🟢 — process

### S12.1 Rollout order (respect dependencies)

| Step | Item | Effort | Risk | Notes |
|---|---|---|---|---|
| 1 | S1 robots allow | 2 min | none | deploy with step 2 |
| 2 | S4 sitemap routes | 1 h | none | with step 1 |
| 3 | S5.1 / S5.4 title + lang | 1 h | low (watch CTR) | with 1–2 |
| 4 | S6.1–6.3 noindex / 404 / canonical | 1 h | none | batch |
| 5 | S7 Organization + WebSite | 2 h | none | batch |
| 6 | S2 SSR vocab pages | 1–2 days | **medium — test first** | deploy alone |
| 7 | S3 homepage slimming | 2–4 h | **medium — test first** | deploy alone |
| 8 | S5.3 OG per page + Breadcrumb/FAQ/Article schema | 3 h | none | batch |
| 9 | S8 copy bank (CMS) | 2–4 h | low | whenever |
| 10 | S10 E-E-A-T sections | 3 h | low | with step 9 |
| 11 | S9 cornerstone guides | 2–3 days each | low | weekly cadence |
| 12 | S6.4 permanent redirects [CONFIG] | 10 min | low | week 2 |

### S12.2 Post-deploy verification checklist

```text
[ ] curl -s https://zeroenglish.org/robots.txt | grep "/api/v1/words/"   → Allow present
[ ] curl -s https://zeroenglish.org/vocabulary/a1 | grep -c "<h1"         → 1
[ ] curl -s https://zeroenglish.org/vocabulary/a1 | grep -ci "apple"      → > 0 (after S2)
[ ] curl -sI https://zeroenglish.org/ | grep -i content-length           → < 300000 (after S3)
[ ] curl -s https://zeroenglish.org/ | grep '<html'                       → lang="bn"
[ ] curl -s https://zeroenglish.org/about | grep 'og:title'               → About-specific
[ ] curl -s https://zeroenglish.org/sitemap.xml | grep -c "<loc>"         → 527+
[ ] Rich Results Test on / , /about , /vocabulary/a1 , /news/...           → 0 errors
[ ] GSC URL Inspection /vocabulary/a1 → crawled page shows word rows (after S2)
[ ] PageSpeed Insights mobile /                                           → LCP improved
```

### S12.3 Measurement setup

1. **GSC (week 1):** verify property → submit `sitemap.xml` → request indexing for `/`, `/vocabulary`, `/vocabulary/a1`, `/about`.
2. **Weekly (30 min):** record positions for 10 target queries (GSC Performance → Pages filter): `english vocabulary with bangla meaning`, `oxford 3000 bangla`, `a1 vocabulary bangla`, `english vocabulary quiz bangla`, brand query `জিরো ইংলিশ`, plus 5 you add.
3. **Monthly KPIs:** non-brand impressions (must rise), pages with ≥1 impression, avg CTR after meta rewrites, CWV pass rate, indexed count vs sitemap count.
4. **Leading indicators first:** "URLs can be indexed" climbing after S2 matters more than rankings in months 1–2.

### S12.4 Assumptions to verify before coding `[verify]`

- `getWordsByLevel(level)` returns a plain `Word[]` (sitemap.ts reads `.length` — confirm shape).
- `getLeaderboard()` returns a large array (homepage payload shows 70+ users — confirm before slicing to 3).
- `LevelPageContent` can accept `initialWords` without breaking its client cache (currently only takes `level`).
- `<html lang>` is emitted in `components/html-shell.tsx` (layout wraps children in `<HtmlShell>`).
- `/search` reads a `q` query param (drop SearchAction schema if not).
- Description language: Bangla (chosen above) vs English — decide once, use everywhere.

### S12.5 Do-not list (unchanged from audit rules)

- ❌ No paid links, PBNs, comment spam, directory blasts, automated submissions
- ❌ No keyword stuffing / repeated exact-match anchors
- ❌ No fake reviews, testimonials, statistics, or credentials
- ❌ No AI-detector evasion hacks (mechanical em-dash swaps, deliberate errors)
- ❌ No schema for content that isn't on the page
- ❌ No deleting short pages that fully satisfy their intent
- ❌ No SEO change that makes a page worse for a learner — learner first, always

---

*End of playbook. No source code, configuration, database, or CMS content was modified in producing this document.*
