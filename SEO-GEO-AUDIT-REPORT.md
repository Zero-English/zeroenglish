# Zero English — Complete SEO + GEO + Content Quality Audit

**Website:** https://zeroenglish.org/
**Audit date:** 28 September 2026
**Type:** Audit and improvement-planning report (read-only — no code, CMS, or site changes were made)

**Method:** Direct crawl of 30+ URLs (curl + rendered-text extraction), full sitemap/robots analysis, read-only inspection of the site's source repository (`app/`, `components/`), Google index checks via `site:` queries, and SERP observation for target keywords.

**Severity legend:** 🔴 Critical · 🟠 High Priority · 🟡 Medium Priority · 🟢 Low Priority

---

## Table of Contents

1. Crawl Report
2. Executive Summary (SEO & Content Health)
3. Technical SEO Audit
4. Site Architecture Audit
5. Keyword & Search Intent Audit
6. Content Quality Audit
7. AI-Like / Unnatural Content Audit
8. Hyphen / Em Dash / Punctuation Audit
9. Humanization Audit
10. Brand Voice Audit + Style Guide
11. E-E-A-T / Trust Audit
12. Educational Authority Audit
13. GEO / AI Search Visibility Audit
14. AI Citation Opportunity Report
15. Entity / Brand Authority Audit
16. Internal Linking Audit
17. Metadata Audit
18. Structured Data Audit
19. Content Gap Analysis
20. Competitor / Alternative Analysis
21. Content Cannibalization Audit
22. Thin Content Audit
23. Programmatic SEO Audit
24. UX + SEO Audit
25. Free Marketing Audit
26. Backlink Opportunity Audit
27. Content Authenticity Audit
28–29. Humanization Rules + Page-by-Page Action List
30. Top 10 Things to Fix First
31. 30-Day Action Plan
32. 90-Day Growth Plan
33. Content Roadmap
34. Final Deliverables (A–T)

---

## 1. Crawl Report — What Was Accessed, What Was Not

### ✅ Verified accessible (HTTP 200)

| URL | Notes |
|---|---|
| `/` | 4,101,359 bytes HTML (~993 KB compressed) |
| `/robots.txt` | Valid, 136 bytes |
| `/sitemap.xml` | Valid, **520 URLs** |
| `/about`, `/contact`, `/privacy`, `/contribute` | 200 |
| `/vocabulary`, `/vocabulary/a1` … `/vocabulary/c2` + paginated pages | 200 |
| `/quiz`, `/quiz/exam`, `/quiz/grammar`, `/quiz/class`, `/quiz/quick`, `/quiz/vocabulary` | 200 |
| `/search`, `/leaderboard`, `/login`, `/news`, `/news/new-features-are-here` | 200 |
| `/profile/1` (public user profile) | 200, **indexable** |
| `/quiz/question/1` | 200 but "Not Found" title + `noindex` (soft-404) |
| `/docs` | 200 + `noindex,nofollow` (also robots-disallowed) |
| `/api/v1/words/all` | 200, 3,705,576 bytes JSON (robots-disallowed) |
| `/manifest.webmanifest` | 200 |

### ✅ Verified correct 404s

`/blog`, `/faq`, `/grammar`, `/nonexistent-page-xyz` → **404 with proper status code** and a usable 404 page (title "404 - Page Not Found", links back to `/vocabulary`).

### ⚠️ Redirect behavior (verified)

| URL | Result | Assessment |
|---|---|---|
| `http://zeroenglish.org` | **308** → `https://zeroenglish.org/` | ✅ |
| `https://www.zeroenglish.org` | **307** → `https://zeroenglish.org/` | 🟡 works, but should be **301/308** (permanent) |
| `https://zeroenglish.org/about/` | **308** → `/about` | ✅ trailing slash normalized |
| `https://zeroenglish.org/vocabulary/A1` | **200** (canonical → `/vocabulary/a1`) | 🟡 soft-duplicate; better to 308 to lowercase |
| Old domain `zeroenglish.tahmidhasan.net` | **307** → new domain | 🟡 works, but should be **301/308** (permanent) |

### ❌ Could not be verified (and why)

1. **JavaScript-rendered content** — my extraction tooling does not execute JS. I verified server HTML directly instead (which is what matters for SEO): **`/vocabulary/a1` server HTML contains zero word entries and no H1** (grep for `apple` = 0 matches; `<h1` count = 0).
2. **Google Search Console data** (index coverage, CWV field data, manual actions) — not accessible. **You must check this**; all indexation statements are based on public `site:` queries.
3. **Core Web Vitals field data** — not measurable from outside; lab-observable proxies are reported instead (HTML weight, TTFB, asset counts).
4. **`/admin`** — returns 307 (redirect), robots-disallowed; not audited beyond that.
## 2. Zero English SEO & Content Health Summary

| Dimension | Assessment | One-line rationale |
|---|---|---|
| **Overall SEO health** | 🟠 Weak foundation, working basics | Indexable, fast TTFB, valid robots/sitemap — but the core content (511 vocabulary pages) is **not present in server HTML**, and there is **zero structured data** |
| **Technical SEO health** | 🟠 | Redirects/canonicals/404s mostly correct; critical flaws: client-only word content + `Disallow: /api` + 4.1 MB homepage |
| **Content quality** | 🟡 | Real, useful word dataset; but only 1 blog post, generic About copy, no learning guides, thin C2 |
| **Search intent alignment** | 🔴 | No pages target the highest-value Bangla search intents ("English words with Bangla meaning", "Oxford 3000 Bangla", etc.) |
| **GEO / AI-search readiness** | 🔴 | No JSON-LD anywhere; word content invisible to non-JS AI crawlers; no citable reference pages |
| **Internal linking** | 🟡 | Footer nav is solid; hub→level and pagination links are **client-rendered only**; no breadcrumbs, no contextual links |
| **Website structure** | 🟡 | Logical top-level structure exists, but hierarchy stops at "level pages" — **no individual word pages**, no grammar/composition content pages |
| **Metadata quality** | 🟡 | Titles/descriptions exist on main pages, but OG/Twitter is homepage-default on every page; titles inconsistent (some lack brand); homepage promises content that doesn't exist |
| **Content originality / authenticity** | 🟡 | Word definitions/examples are a genuine original asset; About/blog copy is generic and formulaic |
| **E-E-A-T signals** | 🟡 | Founders named + contact channels = good start; missing: sources/methodology, author attribution, editorial policy, domain email |
| **UX / content readability** | 🟡 | Clean modern UI; but empty states for guests ("এখনো কোনো কুইজ নেই"), tool-first pages with little explanatory text |
| **Indexability** | 🟠 | Paginated vocabulary pages **confirmed indexed**; homepage/About not confirmed by my queries; `/profile/*` indexable (shouldn't be) |
| **Structured data** | 🔴 | **0 JSON-LD blocks on every page tested** (homepage, about, vocabulary, A1, quiz, news, contact, privacy) |
| **Brand / entity clarity** | 🟡 | Consistent name "Zero English"/"জিরো ইংলিশ", Facebook page exists; no Organization schema, no canonical description used consistently, Gmail contact address |

*(No single numeric "SEO score" is given, per the brief. Severity is assigned by: impact on indexing/ranking × number of pages affected × user impact.)*

---

## 3. Technical SEO Audit

Each issue: **Problem → URL → Why it matters → Severity → Solution → Example implementation.**

### T1. Vocabulary content does not exist in server HTML 🔴

- **Problem:** `/vocabulary/a1`, `/vocabulary/a1/2` … all 511 level pages render only nav + footer in server HTML. Words are fetched in the browser from `/api/v1/words/all`. Verified: `grep apple` on `/vocabulary/a1` = **0 matches**; `<h1` count = **0**; no pagination links.
- **URLs affected:** all 511 `/vocabulary/{level}` and `/vocabulary/{level}/{n}` URLs.
- **Why it matters:** Search engines (and AI crawlers like GPTBot, PerplexityBot, ClaudeBot — which generally **don't run JavaScript**) see empty pages. The meta description promises "Bangla meanings, examples, synonyms and antonyms" that don't exist in the HTML.
- **Severity:** 🔴 Critical
- **Solution:** Server-render (SSR/SSG) the 10 words per page — metadata is already server-rendered per page via `generateMetadata`, so render the words in the server component too. With `revalidate`, this costs nothing.
- **Example:** In `app/(frontend)/vocabulary/[level]/page.tsx`, fetch the page's words server-side (same data source `getWordsByLevel` uses in `sitemap.ts`) and pass them into `LevelPageContent` as props so the table is in the HTML.

### T2. `robots.txt` blocks the API that the page content depends on 🔴

- **Problem:** `Disallow: /api` while all word content is loaded from `/api/v1/words/all`.
- **URL:** `https://zeroenglish.org/robots.txt`
- **Why it matters:** When Googlebot renders a page, subresource fetches obey robots.txt. It **cannot fetch the words**, so the rendered DOM stays empty even for Google's JS renderer. This compounds T1.
- **Severity:** 🔴 Critical
- **Solution:** Prefer fixing T1 (server rendering) so robots can stay tight. If content must come from the API, explicitly **allow** the public data endpoint.
- **Example implementation:**

  ```
  User-Agent: *
  Allow: /
  Allow: /api/v1/words/
  Disallow: /admin
  Disallow: /docs
  Disallow: /api
  Disallow: /offline
  ```

  (Specific `Allow` wins over the broader `Disallow` in Google's rules.)

### T3. Homepage HTML is 4.1 MB 🔴

- **Problem:** `app/(frontend)/page.tsx` calls `getAllWords()` and passes **all 5,089 words** plus the full leaderboard (user names, user IDs, Google avatar URLs) as props. Verified: `Content-Length: 4101359`, ~993 KB after compression; `apple` appears 8× in homepage HTML.
- **URL:** `https://zeroenglish.org/`
- **Why it matters:** Slow LCP/TBT on mobile (your audience is largely mobile, Bangla-market); wastes Googlebot crawl capacity; exposes user PII in public HTML.
- **Severity:** 🔴 Critical (performance + privacy)
- **Solution:** Pass only what the homepage renders (level counts, top-3 posts, top-3 leaderboard) and lazy-load word search data on demand.
- **Example:** `const words = await getAllWords();` → remove; have `HomeOrDashboard` fetch words only when the search widget opens.
### T4. Zero structured data site-wide 🟠

- **Problem:** `grep 'schema.org'` = 0 on every page tested.
- **Why it matters:** No Organization/WebSite entity for Google Knowledge Panel; no BreadcrumbList; the About page's genuine FAQ section earns no FAQ rich results; AI systems get no machine-readable entity.
- **Severity:** 🟠 High (direct GEO impact)
- **Solution:** Add JSON-LD in the layout (Organization, WebSite) + per-page (BreadcrumbList, Article for news, FAQPage on About).
- **Example:** a `<script type="application/ld+json">` with `{"@type":"Organization","name":"Zero English","url":"https://zeroenglish.org","sameAs":["https://facebook.com/zeroenglishorg"]}`.

### T5. Sitemap is incomplete and lastmod is fake 🟠

- **Problem:** 520 URLs, but **missing**: `/about`, `/privacy`, `/contribute`, `/quiz/grammar`, `/quiz/class`, `/quiz/quick`, `/quiz/vocabulary`. Every entry has the identical `lastmod: 2026-09-22T04:10:07.782Z` (generated from `new Date()` at build time).
- **Why it matters:** Priority pages (About = E-E-A-T) aren't declared; fake lastmod erodes trust in the sitemap; `changefreq: daily` on 500+ static pages is meaningless.
- **Severity:** 🟠 High
- **Solution:** Add all indexable routes to `staticRoutes` in `app/sitemap.ts`; use real content update dates (blog already uses `updatedAt` correctly).

### T6. `/profile/*` pages are indexable 🟠

- **Problem:** `/profile/1` returns `index, follow` with title "Tahmid Hasan | Profile | Zero English".
- **Why it matters:** Hundreds of thin personal pages dilute crawl quality and expose user names in SERPs (privacy + thin-content risk).
- **Severity:** 🟠 High
- **Solution:** `robots: { index: false }` in `app/(frontend)/profile/[id]/page.tsx` metadata (the same pattern is already correctly used by `/profile` itself, which has `noindex, nofollow`).

### T7. Soft-404 on quiz question URLs 🟡

- **Problem:** `/quiz/question/1` returns **HTTP 200** with title "Quiz Question Not Found".
- **Why it matters:** Wrong status code for missing content; wasted crawl.
- **Severity:** 🟡 Medium
- **Solution:** `notFound()` instead of a 200 "Not Found" render (the pattern already exists in `news/[slug]/page.tsx`).

### T8. `html lang="en"` on Bangla-default pages 🟠

- **Problem:** `<html lang="en">` (verified in homepage HTML) while default visible content is Bangla ("শূন্য থেকে ইংরেজি আয়ত্ত…").
- **Why it matters:** Screen readers announce the wrong language; Google may mismatch page language to Bangla queries; wrong accessibility signal.
- **Severity:** 🟠 High
- **Solution:** `lang="bn"` as default (or set dynamically with the language provider server-side).

### T9. www and legacy domain use temporary redirects 🟡

- **Problem:** `www.zeroenglish.org` → 307; `zeroenglish.tahmidhasan.net` → 307.
- **Why it matters:** 307 = temporary; link-equity consolidation for the domain migration is weaker than 301/308. Google still shows the old domain with its legacy title ("Learn English Oxford 3000 Word Vocabulary in Bangla") in results.
- **Severity:** 🟡 Medium
- **Solution:** Permanent 301/308 on both; verify in Search Console that old URLs drop out.

### T10. Case-variant URL serves 200 🟡

- **Problem:** `/vocabulary/A1` → 200 (canonical → lowercase). Works, but every case variant costs a crawl and relies on canonicalization.
- **Severity:** 🟡 Medium — 308 redirect to the lowercase path (same for other case variants).

### T11. Canonical missing on `/contribute` 🟡

- **Problem:** No `<link rel="canonical">` on `/contribute` (all other main pages have one).
- **Severity:** 🟡 Medium — add `alternates: { canonical: "/contribute" }`.

### T12. Verified as ✅ (no action needed)

- HTTPS + HSTS (`max-age=63072000`) ✅
- Compression active (~4:1 on homepage) ✅
- TTFB fast: 0.21s homepage, 0.46s A1 (Vercel prerender) ✅
- 404s return correct status ✅
- Trailing slash normalized (308) ✅
- Images: `next/image`, all 6 homepage images `loading="lazy"`, no empty `alt` ✅
- Fonts: woff2, preloaded (8 files) ✅
- Query-param URLs canonicalize to clean path ✅
- `/profile` (self), `/quiz/question/*`, `/docs` correctly noindex ✅
- Pagination titles unique per page ("…(Page 2)") ✅

**Core Web Vitals note:** Field CWV cannot be measured externally. Lab proxies: 993 KB compressed HTML on homepage + 23 script tags + an admin-layout JS chunk (`app/(admin)/layout-*.js`) loading on public pages → expect **LCP/INP risk on mobile**. Validate in PageSpeed Insights / Search Console after fixing T3.
---

## 4. Site Architecture Audit

### Current architecture (verified)

```
Zero English (/)
├── Vocabulary (/vocabulary)                ← hub (level links CLIENT-RENDERED only)
│   ├── A1 … C2 (/vocabulary/{level})       ← 6 hubs, words CLIENT-RENDERED only
│   └── Pages 2..N (/{level}/{n})           ← 505 paginated lists
├── Search (/search)                        ← tool page, no server H1
├── Quiz (/quiz)
│   └── /quiz/vocabulary · /quiz/grammar · /quiz/class · /quiz/quick · /quiz/exam · /quiz/results
├── News (/news + /news/{slug})             ← 1 article
├── Leaderboard (/leaderboard)
├── About / Contact / Privacy / Contribute
└── Login / Profile (noindex) / Admin (307) / Docs (noindex)
```

### Problems

1. **Hierarchy stops prematurely.** There is no layer for **individual words** (`/word/abandon`) — the single biggest missing architectural tier. A dictionary-style platform without word pages can never rank for word-level queries ("abandon meaning in Bangla"), the longest-tail traffic of this category. 🟠
2. **Missing categories entirely:** no `/grammar/` learning section (only a grammar *quiz*), no `/composition/`, no `/guides/`, no `/faq/`. The homepage meta description promises "grammar, vocabulary, composition" — **grammar and composition content pages do not exist**. 🔴
3. **Weak hub:** `/vocabulary` in raw HTML has **zero links to level pages** (`grep href="/vocabulary/[a-z0-9]*"` = 0 matches). Crawl paths to 505 paginated pages exist only via the sitemap. 🟠
4. **Excessive clicks for discovery:** Home → vocabulary → level → paginate 10-at-a-time (C1 has 130 pages). No A–Z index, no topic lists, no search-engine-friendly category pages. 🟡
5. **Orphan-ish pages:** `/about` and `/privacy` are **not in the sitemap** (linked from footer only). `/contribute` is only shown to logged-in users in the sidebar and is not in the sitemap. 🟡
6. **Quiz hub pages compete subtly:** `/quiz` (hub) vs 6 sub-hubs — titles are distinct ✅, but sub-hubs aren't in the sitemap. 🟡

### Recommended sitemap / architecture

```
/                                  (home: brand + entry points, NOT a data dump)
├── /vocabulary/                   (hub: server-rendered links to all levels + A–Z index)
│   ├── /vocabulary/a1/ … /vocabulary/c2/     (server-rendered words, breadcrumbs)
│   │   └── /vocabulary/a1/page-2 …           (server-rendered, rel prev/next)
│   ├── /vocabulary/oxford-3000/              (NEW — cross-level list)
│   ├── /vocabulary/topics/daily-usage/ …     (NEW — thematic lists)
│   └── /word/{slug}/                         (NEW — one page per word, phased)
├── /guides/                       (NEW — learning articles)
│   ├── /guides/how-to-memorize-english-words/
│   ├── /guides/oxford-3000-list-bangla/
│   └── …
├── /grammar/                      (NEW — grammar in Bangla; hub → topic pages)
├── /quiz/ + sub-modes             (existing; add sub-hubs to sitemap)
├── /news/                         (article hub)
├── /about/ /contact/ /privacy/ /faq/ (NEW dedicated FAQ)
└── /leaderboard/ /search/ /contribute/
```
---

## 5. Keyword & Search Intent Audit

Observed SERPs (Bangla Google) for target topics — **what actually ranks**:

| Keyword / topic | Intent | What ranks now (observed) | Zero English coverage | Dedicated page? | Recommended content type |
|---|---|---|---|---|---|
| english vocabulary with bangla meaning | Informational / list | YouTube, 999wordsbd.com, elynbd, shikhidini, dictionary sites | ❌ No matching page (hub title is just "Vocabulary") | ✅ **Yes — top priority** | Cornerstone list page: 500 most useful words table + Bangla meaning + example, linking to levels |
| oxford 3000 word list bangla pdf / oxford 3000 bangla meaning | Informational | PDFs, oglaliks, englishkaku, Facebook files | 🟡 Data exists (`category: "Oxford3000"`) but no page frames it | ✅ **Yes** | "Oxford 3000 Word List with Bangla Meaning (+ free practice)" — explain what Oxford 3000 is, CEFR mapping, table + quiz CTA; **attribute Oxford properly, no affiliation claim** |
| english vocabulary for beginners / A1 english vocabulary bangla | Informational | mix of BD sites & YouTube | 🟡 `/vocabulary/a1` exists, title ok, **content client-rendered** | Fix rendering first; page itself is right | Level hub (server-rendered) + intro/FAQ block above the list |
| daily english vocabulary (words/day habit) | Informational / habit | Apps, YouTube | 🟡 Homepage claims "প্রতিদিন ৫০টি নতুন শব্দ" but no page explains the system | ✅ Yes | "Daily English Vocabulary: Learn 5 Words a Day (Bangla Guide)" — realistic, method-based |
| english vocabulary quiz | Transactional | Quiz platforms, YouTube | 🟡 `/quiz/vocabulary` exists (good title/desc), thin body text | Improve, don't create new | Add explanation, sample questions, level-selector copy above the widget |
| how to memorize english words | Informational (how-to) | Long-form articles, YouTube | 🔴 None | ✅ Yes | Evergreen guide with spaced-repetition method, tied to Zero English's progress features |
| oxford 5000 | Informational | Oxford Press, dictionaries | 🟡 Claimed on About/home ("Oxford 5000 শব্দ") but no explainer page | ✅ Yes (after Oxford 3000) | Explainer: what Oxford 5000 adds over 3000, level breakdown (your own counts are a unique asset) |
| english words for bangla speakers | Informational | generic lists | 🔴 None | ✅ Yes | Curated "100 English words Bangla speakers commonly mistranslate" — original angle |
| english grammar in bangla / ইংরেজি গ্রামার | Informational | grammarbd.com, bdresults, YouTube (very high volume) | 🟡 Quiz only — **no grammar content at all** | ✅ Yes, phased | Grammar hub + tense/preposition/article pages (Bangla explanation) |
| how to learn english vocabulary | Informational | big competitors | 🔴 None | ✅ | Method guide (part of /guides) |
| A1/A2/B1 … vocabulary | Informational | weak competition in Bangla SERP | 🟡 URLs exist, content not server-rendered | Fix rendering | Same pages |
| english learning for bangladesh | Informational | — | 🟡 About page touches it | Not worth a standalone page | Fold into About |
| composition / writing (রচনা) | Informational | Bangla education sites | 🔴 Promised in meta description, absent | Phase 3 | Composition hub with SSC/HSC patterns |

**Do not target:** "english to bangla dictionary" head terms (dictionary giants own them) — instead own **word-list + CEFR-level + quiz** combinations where you have unique data.
---

## 6. Content Quality Audit (page by page)

### `/` (Homepage)

- **Genuinely useful:** level cards with real counts (A1 924, A2 800, B1 739, B2 1329, C1 1296, C2 **1**), tool explanations, leaderboard = social proof. ✅
- **Problem — the hero:** *"Oxford 5000 শব্দ বাংলা অর্থসহ। প্রতিদিন ৫০টি নতুন শব্দ শিখুন, নিজের লেভেল বেছে নিন, আর আত্মবিশ্বাসটা বাড়তে দেখুন — শব্দে শব্দে, এক ধাপ থেকে আরেক ধাপে।"* — motivational filler; the middle sentence stacks three imperatives and says nothing concrete about how the platform works.
- **Problem — C2 = 1টি শব্দ** displayed publicly while claiming "Oxford 5000": visible incompleteness that undercuts credibility. Either finish C2, hide incomplete levels, or label them "coming soon".
- **Problem — meta description** promises "grammar, vocabulary, composition, quizzes" — grammar/composition pages don't exist. Misleading snippet = trust issue.
- **Problem — leaderboard shows real names/scores of 3 users** in homepage HTML (with Google avatar URLs).

### `/about` — best page on the site, still generic

- **Genuinely good:** founders named with roles (Tahmid Hasan — প্রতিষ্ঠাতা; মো. মাহির আসেফ — সহ-প্রতিষ্ঠাতা), real FAQ with concrete answers ("জিরো ইংলিশ কী?", "অফলাইনে শেখা যাবে?" — PWA answer is specific and verifiable ✅), stats strip (5,000+ / 6 CEFR / 2 ভাষা / 100% free).
- **Generic sections needing rewrite:** *"আমরা বিশ্বাস করি, ভাষা শেখা সবার হাতের নাগালে হওয়া উচিত।"* / *"আমরা এখনও শুরুতে আছি, কিন্তু আমাদের স্বপ্ন বড়"* — motivational boilerplate common to thousands of sites.
- **Missing for E-E-A-T:** how words were selected/verified, whether examples were written by humans, sources, update history, contact for corrections.

### `/news/new-features-are-here` (only article)

- A personal dev-log / changelog, ~800 words, heavy Bangla–English code-switching (*"কিছুদিন কাজের বিরতির পর আবার নতুনভাবে Zero English নিয়ে কাজ শুরু করেছি"*), emoji section headers, **no author name**, ambiguous date "9/12/2026" (M/D/Y vs D/M/Y unreadable for Bangla users), ends with *"আমাদের লক্ষ্য হচ্ছে সবার জন্য একটি সহজ, accessible এবং useful English learning platform তৈরি করা"* — a changelog is fine, but **it is not educational content** and cannot earn search traffic.

### `/vocabulary` hub

- After render it shows progress widgets; in server HTML it's nearly empty (no level links!). For a guest, widgets show "0 / 0" empty states — first-time visitor sees numbers, not an explanation of the method.

### `/vocabulary/{level}` pages

- Meta promises *"Bangla meanings, examples, synonyms and antonyms"* — none of it in HTML (see T1). No H1 server-side, no intro paragraph, no FAQ, no links to related levels or the matching quiz.

### `/quiz/*`

- Card descriptions are concrete and good (*"২০টি প্রশ্ন, প্রতিটি ২০ সেকেন্ডে"* ✅). But pages open with guest empty-states ("এখনো কোনো কুইজ নেই") instead of explaining what the quiz covers and who it's for.

### `/contact` — good

Email + two WhatsApp numbers + Facebook + 24–48h response promise. ✅ Nothing to fix except adding Organization schema + domain email.

### `/contribute` — empty shell in server HTML (and unlisted in sitemap).

### `/privacy` — exists, standard.

---

## 7. AI-Like / Unnatural Content Audit

Phrases below are **flagged only where generic or unnecessary in context** — none are proof of AI generation.

| Location | Quote | Verdict |
|---|---|---|
| Meta description (site-wide) | "Master English in one place with Zero English — learn grammar, vocabulary, composition, quizzes, and more through a complete English learning experience." | 🟠 Generic + overpromising: "in one place", "complete English learning experience", em-dash list, claims nonexistent content |
| Homepage title | "Everything You Need to Master English" | 🟠 Classic "Everything you need to…" template; unverifiable claim |
| About → "আমাদের স্বপ্ন" | "ভাষা আর বাধা নয় এমন একটি জগৎ যেখানে ইংরেজি শেখা সবার নাগালে" | 🟡 visionary filler; specific to nobody |
| About → mission/dream/value triad | "লক্ষ্য, স্বপ্ন ও পদ্ধতি তিনটি স্তম্ভ আমাদের প্রতিটি পদক্ষেপকে পরিচালিত করে" | 🟡 formulaic "three pillars" structure |
| Homepage CTA band | "আজই প্রথম শব্দটি শিখুন" + "শেখা শুরু করুন" repeated 5× | 🟡 repeated CTA phrase; acceptable but stale |
| News article | "genuinely useful features যুক্ত করার চেষ্টা করছি" | 🟢 actually personal/human — keep this voice |
| "Why … is Important", "In today's world", "Key takeaways", "Final thoughts" | — | ✅ **Not found** — the site does NOT use these patterns. Credit where due |

**Headings:** homepage H2s are functional Bangla ("আপনার লেভেল বেছে নিন", "কুইজে নিজেকে যাচাই করুন") — natural, keep. The only generic heading is the English meta title pattern.
---

## 8. Hyphen / Em Dash / Punctuation Audit

The site uses **em dash (—) as a default separator in English marketing strings**. Bangla body text also uses it, sometimes naturally, sometimes as a crutch.

| Where | Quote | Assessment |
|---|---|---|
| Site meta description | "…with Zero English — learn grammar, vocabulary…" | Unnecessary; a period is cleaner |
| Homepage hero | "…আত্মবিশ্বাসটা বাড়তে দেখুন — শব্দে শব্দে, এক ধাপ থেকে আরেক ধাপে।" | Decorative; the trailing phrase adds no information |
| About | "ইংরেজি একটি বাধা হয়ে থাকে — জটিল পদ্ধতি, উপযোগী সরঞ্জামের অভাবের কারণে" | ✅ natural use (list introduction) — keep |
| About stats/CTA | "শব্দে শব্দে, ধাপে ধাপে, কোনো ভয় ছাড়াই" | Rhyming triple-parallel = slogan style, not teaching voice |
| Contact | "প্রশ্ন, মতামত, পার্টনারশিপ কিংবা প্রযুক্তিগত সহায়তা — আমরা শুনতে প্রস্তুত।" | ✅ fine |

- Semicolons, colons, long sentences, excessive parens/quotes: **not a problem** on this site.
- **Rewrite examples:**
  - CURRENT: "Master English in one place with Zero English — learn grammar, vocabulary, composition, quizzes, and more through a complete English learning experience."
  - PROBLEM: promises 3 things that don't exist as pages, uses "in one place… and more" filler.
  - BETTER: "Learn English vocabulary with Bangla meanings at Zero English — 5,000+ words from A1 to C2, with quizzes, exams and progress tracking. Free."
  - CURRENT hero: "… আত্মবিশ্বাসটা বাড়তে দেখুন — শব্দে শব্দে, এক ধাপ থেকে আরেক ধাপে।"
  - BETTER: "… নিজের লেভেল বেছে নিন, প্রতিদিন ১০–২০টি শব্দ শিখুন, আর কুইজ দিয়ে দেখুন কতটা মনে আছে।"

---

## 9. Humanization Audit (targeted rewrites)

**Sounds natural/real:** the news article's first paragraph; founder bios; FAQ answers on About; contact page copy ("আমরা সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আপনার মেসেজের উত্তর দিই।"); quiz card descriptions.

**Sounds generic:** About mission/dream/values; homepage meta; hero tagline.

**Sounds machine/marketing-templated:** "Everything You Need to Master English"; "Master English in one place… through a complete English learning experience".

**Priority rewrites (only where material):**

1. **Site title + description (highest leverage — appears in every SERP)**
   - CURRENT: "Everything You Need to Master English | Zero English"
   - PROBLEM: template phrase + unverifiable "everything" claim + no keyword.
   - BETTER title: `English Vocabulary with Bangla Meaning (A1–C2) | Zero English`
   - CURRENT desc: "Master English in one place with Zero English — learn grammar, vocabulary, composition, quizzes, and more through a complete English learning experience."
   - BETTER desc: `৫,০০০+ ইংরেজি শব্দ বাংলা অর্থসহ — A1 থেকে C2, CEFR লেভেল অনুযায়ী। অর্থ, সংজ্ঞা, উদাহরণ ও কুইজ এক জায়গায়, সম্পূর্ণ ফ্রি।`

2. **About — "কেন আমরা এখানে" section**
   - CURRENT: "আমরা বিশ্বাস করি, ভাষা শেখা সবার হাতের নাগালে হওয়া উচিত। কিন্তু অনেক শিক্ষার্থীর জন্য ইংরেজি একটি বাধা…"
   - PROBLEM: universal-truth opening; every ed-tech site writes this.
   - BETTER: "বাংলাদেশের শিক্ষার্থীরা SSC থেকে IELTS পর্যন্ত ইংরেজি শেখ। সমস্যা হলো শব্দভাণ্ডার — একই ৫০০টি শব্দ ঘুরে ঘুরে আসে, আর নতুন শব্দ মনে থাকে না। জিরো ইংলিশ সেই ফাঁক পূরণ করতে শুরু হয়েছে: CEFR লেভেল অনুযায়ী সাজানো শব্দ, বাংলা অর্থ আর কুইজ — যাতে শেখা থেমে না যায়।" *(Verify any factual claim you add — don't state word counts of other books unless sourced.)*
   - **Rule:** replace abstract belief statements with concrete observations you can verify.

3. **Homepage hero** — as shown in §8.

4. **Level pages — add a real intro (currently none):**
   - Suggested above the word table: "A1 (শিক্ষানবিস) লেভেলের ৯২৪টি শব্দ — Oxford 3000 তালিকা থেকে, বাংলা অর্থ ও উদাহরণসহ। প্রতিটি শব্দে ক্লিক করে অর্থ, সংজ্ঞা ও সমার্থক দেখুন, শেষে কুইজ দিয়ে যাচাই করুন। কোনো অ্যাকাউন্ট ছাড়াই শুরু করা যায়।" (counts verified from homepage).

**Do NOT:** invent personal stories, statistics, fake reviews, or deliberately unpolish writing (per the humanization rules in §28).

---

## 10. Brand Voice Audit + Editorial Style Guide

**Current voice:** friendly Bangla with English terms sprinkled in ("feature", "platform", "quiz"), slogan-heavy, optimistic, occasionally first-person in the blog ("আমি…"), but marketing-formal in About/meta. Inconsistent: English SERP copy vs Bangla UI copy vs code-switched blog.

### Recommended Zero English Editorial Style Guide

| Element | Rule |
|---|---|
| **Tone** | A helpful senior student explaining to a younger one — warm, direct, never hype |
| **Sentence length** | Bangla: ≤ 25 words. English meta: ≤ 15 words. One idea per sentence in teaching content |
| **Headings** | Describe the content, not the benefit. Use "কীভাবে শব্দ মনে রাখবেন" — not "শেখার ক্ষমতা বাড়ান" |
| **Paragraphs** | 2–4 sentences; teaching pages: always one concrete example per concept |
| **Vocabulary** | Use the English term first, Bangla gloss in brackets on first use: "spaced repetition (আলাদা করে বারবার দেখা)" |
| **EN/BN rule** | Bangla = primary UI/teaching voice. English = meta titles, technical terms, headings for search. Never mix mid-sentence in meta titles |
| **Punctuation** | Em dash max 1 per paragraph; no exclamation marks in educational text; Bangla দাঁড়ি (।) in Bangla prose |
| **CTA style** | One clear verb: "শব্দভাণ্ডার দেখুন", "কুইজ দিন". Max 1 CTA phrase per section; avoid repeating "শেখা শুরু করুন" 5×/page |
| **Words to avoid** | "Everything you need", "in one place", "unlock", "next level", "journey", unverifiable superlatives |
| **Preferred patterns** | State the number; name the level; show the example; link to the practice |
| **Claims rule** | Every factual claim must be checkable on the page (counts from DB, dates, sources) |
---

## 11. E-E-A-T / Trust Audit

**Present (verified):**

- ✅ About page with named founders + roles
- ✅ Contact page: email, 2 WhatsApp numbers, Facebook page, response-time promise
- ✅ Privacy policy page
- ✅ Free-product transparency, PWA/offline honesty in FAQ
- ✅ Social proof: leaderboard, user counts

**Missing (exactly what):**

1. **No sources or attribution** for the Oxford 3000/5000 claim anywhere. State the relationship clearly, e.g.: "Oxford 3000 হলো Oxford University Press-এর তৈরি একটি ফ্রি ওয়ার্ড লিস্ট; আমরা সেটি ব্যবহার করে শব্দগুলো সাজিয়েছি — আমরা Oxford-এর সাথে সম্পৃক্ত নই।" 🟠
2. **No content methodology page** — who wrote the definitions/examples? how verified? how updated? 🟠
3. **No author attribution** on the blog (the article shows only "Zero English Blog"). 🟠
4. **Gmail as contact address** (`zeroenglishweb@gmail.com`) despite owning the domain → use `hello@zeroenglish.org`. 🟡
5. **No Organization schema / sameAs block** (Facebook is the only verifiable social). 🟠
6. **No update dates on evergreen pages** (blog has dates ✅).
7. **C2 = 1 word inconsistency** vs "5000+" claim damages trust when noticed. 🟠
8. No team page beyond the two founders — fine for a startup; don't inflate.

**Do not invent:** credentials, partnerships, statistics, testimonials.

---

## 12. Educational Authority Audit

**What the dataset already has (verified from `/api/v1/words/all`):** `word`, `meaningBn[]`, `definitionEn`, `definitionBn`, `examplesEn[]`, `examples_bn[]`, `synonyms[]`, `antonyms[]`, `level`, `category` (Oxford3000), `wordType[]`.

That's **better raw material than most Bangla vocabulary sites** — but none of it is exposed as indexable, linkable, citable units.

**Gaps:** no phonetic/pronunciation, no collocations, no word-family relations, no review/revision schedule surfaced in UI copy, no per-word quiz deep-links, no A–Z index.

### Recommended structure for future Grammar content

```
/grammar/                        Hub: topic map + level tags + "কোন টপিক কোন ক্লাসের জন্য"
/grammar/tenses/                 Topic: rule in Bangla → formula table → 5 example
                                 sentences (EN + BN) → 3 common errors (Bangla
                                 learners' actual mistakes) → embedded quiz CTA
                                 → links to vocabulary used in examples
/grammar/prepositions/           Same template
/grammar/{topic}/quiz            Ties content to your existing quiz engine
```

Each topic page: one H1, tables for rules, ❌/✅ error boxes, 1 internal link to related topic, 1 link to the relevant class-level quiz (SSC/HSC/IELTS).

### What makes Zero English better than a dictionary

1. **CEFR-ordered learning path** (dictionaries are alphabetical).
2. **Bilingual definitions + examples** (not just translations).
3. **Built-in retrieval practice** (quizzes/exams) attached to every list.
4. **Progress tracking + streaks.**

You currently communicate #1 and #3 weakly and #2/#4 not at all on landing pages. Each should become a sentence on `/vocabulary` and every level page.
---

## 13. GEO / AI Search Visibility Audit

**Verified facts:** robots.txt allows all user-agents (no AI-bot blocking) ✅; **zero JSON-LD** ❌; word content invisible to non-JS crawlers ❌; `/api` blocked ❌; homepage HTML *does* contain all 5,089 words (a hidden asset — it's how AI crawlers currently see your data, in raw dump form).

| GEO factor | Status |
|---|---|
| Clear entity identity | 🟡 Name consistent; no machine-readable org entity |
| Direct answers / FAQ | 🟡 About has a real FAQ (great asset) — but no FAQ schema, no dedicated /faq |
| Strong headings | 🟡 homepage OK; level pages lack H1 in HTML |
| Definitions / lists / tables | 🔴 The best content (definitions) is locked behind JS + blocked API |
| Factual claims + sources | 🔴 Oxford claims unsourced |
| Author info | 🔴 none on articles |
| Unique data | 🟡 per-level word counts are unique and citable — unused |
| Consistent brand info | 🟡 name/URL/social consistent; description varies |

**Pages that could become strong AI citation sources (after fixes):** About FAQ (entity Q&A), a future `/guides/oxford-3000-list-bangla/` (definitive reference), level pages with server-rendered tables (AI systems favor tables), word pages ("abandon meaning in Bangla" = perfect snippet), the per-level counts page (unique data).

**No claim is made that any AI system currently cites Zero English — unverifiable.**

---

## 14. AI Citation Opportunity Report

| Topic | Existing Page | Content Quality | AI Citation Potential | Missing Information | Recommended Action |
|---|---|---|---|---|---|
| English words with Bangla meaning | `/vocabulary` (JS-only) | Data good, page weak | 🔴→🟠 after SSR | Intro, sample table in HTML | Server-render 10–20 sample words + full table on hub |
| Oxford 3000 in Bangla | ❌ none | — | 🟠 High (few good sources) | Explainer, level mapping, attribution | New guide page using your `category:Oxford3000` data |
| English vocabulary quizzes | `/quiz/vocabulary` | Meta good, body thin | 🟡 | What's tested, sample question, difficulty logic | Add explanatory copy above widget |
| CEFR A1–C2 word counts | `/` (counts shown) | ✅ unique data | 🟠 | Per-level word lists in HTML | Publish counts + top-100 words per level as tables |
| Vocabulary learning techniques | ❌ none | — | 🟠 | Method content (spaced repetition etc.) | Evergreen guide tied to your streak/progress features |
| Beginner English vocabulary (Bangla) | `/vocabulary/a1` | Meta good, empty body | 🔴→🟠 | Words in HTML, intro, FAQ | SSR + FAQ block ("A1 কী?", "কয় দিনে শিখব?") |
| Oxford 5000 vs 3000 | ❌ none | — | 🟠 | Clear difference + which levels | Second guide after Oxford 3000 |
| Word definitions (e.g., "abandon") | ❌ no word pages | — | 🔴 Huge long-tail | Per-word URL | Phase: `/word/{slug}` pages from your dataset |

---

## 15. Entity / Brand Authority Audit

| Signal | Verified state |
|---|---|
| Brand name | "Zero English" (EN) / "জিরো ইংলিশ" (BN) — consistent ✅ |
| Logo | `main-logo.webp` + favicon ✅ |
| Description | 3 different descriptions in play (layout default, `SITE_DEFAULT_DESCRIPTION`, About) 🟡 |
| Organization info | No legal entity/address stated (not required, but schema needs it) |
| Social | Facebook `facebook.com/zeroenglishorg` (linked in footer ✅); GitHub org `Zero-English` exists but **repository is private** (no backlink) |
| About / Contact / Footer | Present ✅; footer © "জিরো ইংলিশ" ✅ |
| Metadata | OG/Twitter = homepage defaults everywhere 🟡 |
| Structured data | None 🔴 |

**Canonical one-sentence description (use everywhere — footer, schema, GitHub, Facebook bio, directories):**

> **"Zero English is a free bilingual (Bangla–English) learning platform that helps Bangla-speaking learners build English vocabulary and grammar through CEFR-level word lists (A1–C2), quizzes, exams and progress tracking."**

Bangla version:

> **"জিরো ইংলিশ — বাংলাভাষী শিক্ষার্থীদের জন্য ফ্রি দ্বিভাষিক ইংরেজি লার্নিং প্ল্যাটফর্ম, যেখানে A1–C2 লেভেলের শব্দভাণ্ডার, কুইজ, পরীক্ষা ও অগ্রগতি ট্র্যাকিং পাওয়া যায়।"**
---

## 16. Internal Linking Audit

**Verified server-HTML links (homepage):** `/vocabulary` ×6, `/quiz` ×6, `/news` ×3, `/about` ×1, `/privacy` ×2 — footer carries the site ✅.

| Finding | Detail | Severity |
|---|---|---|
| Hub → levels: **not in server HTML** | `/vocabulary` has 0 links to `/vocabulary/{level}` without JS | 🔴 |
| Pagination links: **not in server HTML** | `/vocabulary/a1` has 0 links to `/vocabulary/a1/2..93` | 🔴 |
| Level page → quiz | only 1 link (`/quiz`) | 🟡 |
| No breadcrumbs anywhere | Users/bots can't see hierarchy | 🟡 |
| Orphan-ish | `/about`, `/privacy`, `/contribute`, 4 quiz sub-hubs missing from sitemap | 🟠 |
| Word→word links | Impossible (no word pages) | 🟠 |
| Blog→content | Single article links nowhere relevant; no related-articles pattern | 🟡 |
| Anchor text | Footer anchors are good Bangla labels ("শব্দভাণ্ডার") ✅; no keyword-rich contextual anchors exist because there's no body copy | 🟡 |

### Recommended internal-link structure

```
Home → Vocabulary hub, Quiz hub, Guides (new), About
Vocabulary hub → 6 level hubs + Oxford 3000 list + topic lists  (SERVER-RENDERED)
Level hub → hub (breadcrumb) + prev/next level + matching quiz + topic list links
Word page (future) → level hub + 5 related words + synonym/antonym pages + quiz
Guides → level hub (anchor: "A1 শব্দভাণ্ডার দেখুন") + quiz
Blog/news → guides cross-links
Every page → footer (exists ✅) + breadcrumb (new)
```

**Rule:** every indexable page gets ≥3 internal inlinks (breadcrumb, footer, one contextual).

---

## 17. Metadata Audit

**Verified current state (raw HTML):**

| URL | Title | Meta desc | H1 in HTML | Canonical | OG specific? |
|---|---|---|---|---|---|
| `/` | Everything You Need to Master English \| Zero English | generic overpromise | ✅ (Bangla) | `/` ✅ | ✅ |
| `/about` | About Us \| Zero English | good, specific ✅ | ✅ | ✅ | ❌ homepage default |
| `/vocabulary` | Vocabulary \| Zero English | decent | ✅ "শব্দভাণ্ডার" | ✅ | ❌ |
| `/vocabulary/a1` | English Vocabulary - Level A1 (Beginner) | good (mixed EN/BN) | ❌ **none** | ✅ | ❌ |
| `/vocabulary/a1/2` | …(Page 2) ✅ unique | …page 2 ✅ | ❌ | ✅ | ❌ |
| `/quiz` | Quizzes \| Practice Vocabulary, Grammar & More \| Zero English | good | ✅ | ✅ | ❌ |
| `/quiz/grammar` | Grammar Topic Quizzes - Practise English Grammar | good | (client) | ✅ | ❌ |
| `/search` | **Search Words - Vocabulary** 🟠 odd | "Search through the vocabulary word list." (too thin) | ❌ | ✅ | ❌ |
| `/leaderboard` | **Leaderboard** (no brand) | decent | ✅ | ✅ | ❌ |
| `/login` | Login \| Zero English | fine | — | ✅ | ❌ |
| `/contribute` | Contribute Quiz Questions \| Zero English | fine | — | ❌ **missing** | ❌ |
| `/news` | News & Blog \| Zero English | fine | ✅ | ✅ | ❌ |
| `/news/new-features-are-here` | from CMS (metaTitle) ✅ | ✅ | ✅ | ✅ | ✅ **article OG** (only page with specific OG) |
| `/contact` | Contact Us \| Zero English | good | ✅ | ✅ | ❌ |
| `/privacy` | Privacy Policy \| Zero English | good | ✅ | ✅ | ❌ |
**Suggested metadata for key pages:**

```text
Title: English Vocabulary with Bangla Meaning (A1–C2) | Zero English
Meta Description: ৫,০০০+ ইংরেজি শব্দ বাংলা অর্থসহ। A1 থেকে C2 লেভেলে সাজানো,
অর্থ-সংজ্ঞা-উদাহরণসহ, প্রতিটি শব্দে কুইজ। ফ্রি ও অ্যাকাউন্ট ছাড়াও চলে।
H1: ইংরেজি শব্দভাণ্ডার — বাংলা অর্থসহ (A1–C2)
URL: /vocabulary  (keep)
```

```text
Title: Oxford 3000 Word List with Bangla Meaning | Free A1–B2 Words
Meta Description: Oxford 3000 তালিকার ইংরেজি শব্দ বাংলা অর্থসহ — CEFR লেভেল,
সংজ্ঞা, উদাহরণ ও অনুশীলনের লিংকসহ। কে Oxford 3000 তৈরি করেছে এবং কীভাবে
ব্যবহার করবেন তাও জানুন।
H1: Oxford 3000 Word List — বাংলা অর্থ ও অনুশীলনসহ
URL: /guides/oxford-3000-word-list-bangla
```

```text
Title: A1 Vocabulary (Beginner): 924 English Words with Bangla Meaning
Meta Description: A1 লেভেলের ৯২৪টি শুরুর ইংরেজি শব্দ — বাংলা অর্থ, সংজ্ঞা,
উদাহরণ ও সমার্থকসহ। ধাপে ধাপে শিখে শেষে কুইজ দিন।
H1: A1 ইংরেজি শব্দভাণ্ডার (শিক্ষানবিস) — বাংলা অর্থসহ
URL: /vocabulary/a1 (keep)
```

```text
Title: Search English Words – Bangla Meaning | Zero English
Meta Description: ইংরেজি শব্দ খুঁজুন — বাংলা অর্থ, সংজ্ঞা ও উদাহরণ একসাথে।
পূর্ণ A1–C2 শব্দভাণ্ডারে সার্চ করুন, অর্থ দেখুন ও কুইজ দিন।
H1: ইংরেজি শব্দ অনুসন্ধান
URL: /search (keep)
```

**Also fix:** every page needs **page-specific `openGraph.title/description/url`** (currently homepage defaults on ~20 pages); add brand suffix to `/leaderboard`, `/search`, level titles (e.g., "English Vocabulary – Level A1 (Beginner) | Zero English").

---

## 18. Structured Data Audit

**Existing schema:** none (verified `schema.org` count = 0 across 8 major pages).

| Schema | Status | Recommendation (genuine-use only) |
|---|---|---|
| Organization | ❌ | **Add** — name, url, logo, sameAs (Facebook), contactPoint (email/WhatsApp) |
| WebSite | ❌ | **Add** — with SearchAction only if `/search` truly supports it (it does — client-side; acceptable) |
| WebPage | ❌ | Inherited via pages; low priority |
| Article | ❌ | **Add to `/news/[slug]`** — headline, datePublished/Modified, author ("Zero English Editorial"), image (exists in OG already) |
| BreadcrumbList | ❌ | **Add** on level pages: Home › Vocabulary › A1 |
| FAQPage | ❌ | **Add on About** — 6 genuine Q&Os already exist there; matches content exactly ✅ |
| EducationalOrganization | ❌ | Don't claim school/university status — use Organization |
| Course / LearningResource | ❌ | Skip until a structured course exists (no manipulation) |

**Unsupported-claims check:** don't add `aggregateRating` or `review` schema — no real reviews exist.

---

## 19. Content Gap Analysis (prioritized)

- **Vocabulary** 🔴 (highest): Oxford 3000 Bangla list · Oxford 5000 explainer · "500 daily-use words" list · word lists by topic (office, travel, exam) · A–Z index · per-word pages.
- **Grammar** 🔴: hub + tenses, prepositions, articles, voice, narration (you already quiz these topics — content must exist first).
- **Quizzes** 🟠: quiz landing copy, sample questions, "which quiz should I take" guide.
- **Learning guides** 🟠: how to memorize words · spaced repetition in Bangla · 30-day vocabulary plan · CEFR explained in Bangla.
- **Beginner resources** 🟠: A1 starter page · "first 100 English words" · pronunciation basics.
- **Bangla-specific** 🔴: common Bangla-speaker mistakes (article/preposition errors) · Bangla false friends (ভুল বন্ধু) · "সরল বাক্য থেকে কথোপকথন".
- **Reading** 🟡: graded short texts per level.
- **Writing / Composition** 🟡: SSC/HSC patterns, email/paragraph writing (promised in your meta!).
- **Speaking** 🟢: out of scope until product supports it — don't promise.

**Priorities:** 1) Vocabulary cornerstone pages, 2) Grammar hub, 3) Guides, 4) Composition.
---

## 20. Competitor / Alternative Analysis (observed, not ranked)

| Platform | Coverage | Bangla support | Quizzes | Structured learning | Brand / AI visibility |
|---|---|---|---|---|---|
| **LanGeek** (langeek.co/en/bn) | Big multilingual dictionary | ✅ Bangla locale | weak | word lists by theme | strong (clean entity, many languages) |
| **englishkaku.com** | Lessons + word lists | ✅ native Bangla | basic | lesson-based | decent BD search presence (appeared for Oxford 3000 query) |
| **999wordsbd / elynbd / shikhidini** | Word-list articles | ✅ | ❌ | ❌ article format | ranks for "bangla meaning" queries via content depth |
| **grammarbd.com** | Grammar encyclopedia | ✅ | ❌ | topic trees | strong for "english grammar bangla" |
| **Spoken English Guru** | Books/app funnel | ✅ | app | commercial | strong brand, YouTube |
| **YouTube (various)** | videos | ✅ | ❌ | ❌ | dominates visual SERPs for vocabulary queries |

**What Zero English lacks vs these:** indexable body content (all rivals at least render text), topical content pages, brand searches, backlinks. **What Zero English uniquely has:** CEFR-ordered bilingual dataset + working quiz/exam engine + progress tracking — **none of the Bangla list-sites combine those**, but you can't win on it until it's server-rendered and explained in words.

---

## 21. Content Cannibalization Audit

| Conflict | Intent | Similarity | Primary | Action |
|---|---|---|---|---|
| `/` (all 5,089 words embedded) vs `/vocabulary` vs `/vocabulary/{level}` | "browse words" | Homepage embeds entire dataset | `/vocabulary` | Remove word dump from home (T3) → home becomes gateway |
| 505 paginated pages `/{level}/{n}` | "A1 words page 2" | identical templates, 10 words each | level hub | Keep indexed (fine) but make hubs carry unique intro/FAQ so hubs win head terms; ensure pagination is server-rendered |
| Old domain `zeroenglish.tahmidhasan.net` vs new | legacy brand queries | exact duplicates (307 now) | zeroenglish.org | switch to 301; monitor in GSC |
| `/quiz` vs 6 sub-hubs | "english quiz" | hub + modes, titles distinct ✅ | `/quiz` | Add sub-hubs to sitemap; hub links contextually (exists) |
| `/search` vs `/vocabulary` | "find word" | overlapping function | differentiate: `/search` = tool, `/vocabulary` = learning lists | retitle both (see §17) |
| No true duplicate-title pairs found elsewhere | — | — | — | ✅ |

---

## 22. Thin Content Audit

| URL | Current purpose | Why thin | Action |
|---|---|---|---|
| `/vocabulary/c2` | C2 list | **1 word total** (verified: "C2 পারদর্শী 1টি শব্দ") | 🟠 **Improve** — finish the dataset; until then show "C2 লিস্ট আপডেট হচ্ছে" and noindex the level (honest + protects quality) |
| `/vocabulary/a1/2`… (505 pages) | pagination | ~10 words each, no unique HTML content | 🔴 fix rendering (T1); don't remove — paginated lists are legitimately useful |
| `/search` | tool | 1-line description, no server H1 | 🟡 add explanatory copy (what the search covers) |
| `/contribute` | submission tool | empty server HTML | 🟡 server-render the explainer + add to sitemap if public |
| `/profile/{id}` | user pages | name + stats only | 🔴 noindex (T6) |
| `/leaderboard` | dynamic ranking | has explanatory copy ✅ | keep indexable, fine |
| `/login` | auth | indexable utility | 🟢 optional noindex; low impact |

**Do not delete short pages that fully satisfy intent** (e.g., `/contact` is complete).

---

## 23. Programmatic SEO Audit

**Current template reality (verified):** server HTML = title + meta + nav + footer. No words, no H1, no intro, no links, no schema. The pagination exists in the sitemap only. **As programmatic SEO, this is a sitemap without content.**

**Template for an ideal Zero English vocabulary page:**

```html
<!-- /vocabulary/a1 (server-rendered) -->
H1: A1 English Vocabulary (শিক্ষানবিস) — 924 Words with Bangla Meaning
Breadcrumb: Home › Vocabulary › A1

[Intro, 40–60 words, unique per level, e.g.]
A1 লেভেলের শব্দগুলো Oxford 3000 তালিকা থেকে নেওয়া — প্রতিদিনের কথোপকথনে
সবচেয়ে বেশি লাগে। প্রতিটি শব্দে বাংলা অর্থ, সংজ্ঞা, উদাহরণ ও সমার্থক আছে।

[Level switcher — links to A2…C2, server-rendered]

[Table, server-rendered, 10 rows per page]
| Word | বাংলা অর্থ | Example | Synonyms | Practice |
each word → future /word/{slug}; Practice → /quiz/vocabulary?word={id}

[Related: "A1 শব্দ দিয়ে কুইজ দিন" → /quiz/vocabulary
          "A1 থেকে A2 কীভাবে যাবেন" → guide link]

[Pagination: ← আগের পৃষ্ঠা | পরবর্তী →  server-rendered rel prev/next]

[FAQ (unique per level), 3 Q&A]
JSON-LD: BreadcrumbList + FAQPage
```

**Unique-value requirements per page:** unique intro (level-specific), unique FAQs, real pagination links, level cross-links, quiz CTA, word-count data. The 10-word body itself is necessarily thin — **the surrounding context is what makes it rank.**

**Template duplication check:** all 505 paginated pages currently share one near-identical shell → risk flagged. Differentiation comes from: level intro, FAQ, cross-links, and (future) per-topic grouping.
---

## 24. UX + SEO Audit

| Area | Finding | SEO-safe UX fix |
|---|---|---|
| Navigation | Clear (sidebar + footer) ✅ | Keep; ensure server-rendered |
| Guest empty states | "এখনো কোনো কুইজ নেই", "0 / 0" shown to first-time visitors on `/quiz`, `/vocabulary` | Show explainer content instead of empty dashboards to logged-out users — **this doubles as indexable content** 🔴🟠 |
| Vocabulary discovery | No A–Z, no topics, search is a separate tool | Add topic lists (doubles as landing pages) |
| Learning flow | Home → pick level → list → (nothing tells you what to do next) | Add "next step" strip: learn → quiz → review |
| Mobile | PWA + bottom nav ✅ | Validate CWV after T3 fix |
| CTA repetition | "শেখা শুরু করুন" ×5 on home | One primary CTA per view |
| Page distractions | Homepage leaderboard + news + stats compete with the core CTA | Prioritize level-picker above the fold |
| Progress tracking | Exists but unexplained to guests | One sentence on hub: "অ্যাকাউন্ট খুললে অগ্রগতি সেভ হবে" |
| Typography / readability | Modern, clean ✅ | Bangla line-length fine; keep |

**Principle:** every UX improvement above also creates indexable text — SEO and learner experience point the same direction here.

---

## 25. Free Marketing Audit (no spam)

| Channel | Content strategy | Frequency | Example content | Natural mention | ❌ Don't |
|---|---|---|---|---|---|
| **Facebook Page** (exists ✅) | Bangla word-of-the-day cards (made from your data) + quiz links | 4–5×/week | "আজকের শব্দ: abandon — পরিত্যাগ করা + ২টি উদাহরণ + মিনি-কুইজ" | Link to `/vocabulary/b1` for full list | Never post without value first; no "সেরা প্ল্যাটফর্ম!" self-praise |
| **Facebook Groups** (BD English-learning groups) | Answer questions genuinely; share a list only when it directly answers | 2–3 helpful replies/week | Answer "Oxford 3000 কী?" fully in-group; link your guide as "বিস্তারিত এখানে" | Soft link after full value | No copy-paste spam across 20 groups; read each group's rules |
| **YouTube + Shorts** | "Word of the day" 30–45s Shorts from your definitions; 5-min level guides | 3 Shorts + 1 long/week | "A1-এর ১০টি শব্দ যেগুলো প্রতিদিন লাগে" | Pinned comment + description → `/vocabulary/a1` | Don't repost the same Short everywhere on day 1 |
| **Instagram** | Word cards + reel reposts of Shorts | 4×/week | carousel: "৫টি ভুল — I am agree ✗" | link in bio → weekly guide | Buying followers |
| **TikTok** | Repurpose Shorts | 3–5×/week | same as Shorts | bio link | Off-brand slang |
| **Reddit** | r/languagelearning, r/ENGLISH — answer methodology questions in English | 1–2 genuine comments/week | explain spaced repetition; mention your free tracker only if relevant | only when it adds value | Never drop links unprompted (instant ban culture) |
| **Quora** | Answer "how to learn vocabulary in Bangla" type questions | 2/week | 300-word genuine answer + source link | link the matching guide | Copy-pasting identical answers |
| **LinkedIn** | Founder story: building a free English platform for Bangla speakers | 1–2×/week | "কীভাবে ৫,০৮৯টি শব্দ সাজিয়েছি" build-in-public | company page link | Corporate filler |
| **GitHub** | Repo is **private** — publishing a dataset/glossary repo = free backlink + credibility | one-time + updates | public repo with CEFR word list JSON + README | link to zeroenglish.org | Publishing private user data or .env! |
| **Dev.to / Medium** | Technical + pedagogical posts: "How we structured 5,000 words by CEFR" | 1–2/month | build story + learning-science rationale | canonical link back | Duplicate posting without canonical |
| **BD student communities** (education pages, uni groups) | Offer free SSC/HSC vocab PDFs made from your lists | 1–2×/month | "SSC ইংরেজি শব্দ ৫০০ + বাংলা অর্থ (ফ্রি)" | footer link to `/quiz/class` | Unsolicited promo posts |

---

## 26. Backlink Opportunity Audit (legitimate only)

1. **GitHub public repo** (org exists; repo private) 🟠 — one high-trust educational backlink, plus developer credibility.
2. **Product Hunt / BetaList / Uneed / launch directories** — free listings for free ed-tech tools 🟡.
3. **Bangla education directories & resource lists** (BD university/college resource pages, scholarship/education blogs) — request inclusion with a genuine description 🟡.
4. **Build-in-public showcases**: post Zero English in Next.js/Dev.to community showcases; framework showcase pages often list user sites 🟢.
5. **Guest contributions**: write "teaching vocabulary to Bangla speakers" for education blogs (contributor programs where open) — earned bylines 🟡.
6. **Wikipedia / Wikidata**: only if truly notable — do not attempt otherwise 🟢 (no manipulation).
7. **Open-source education lists** (public CEFR resources, awesome-lists for language learning) — contribute genuinely useful lists that mention your tool 🟡.

**Never:** paid link schemes, PBNs, comment spam, mass directory blasts, automated submissions.

---

## 27. Content Authenticity Audit

*(Phrasing used per the brief's rule: characteristics commonly associated with generic AI-assisted writing — never a definitive claim.)*

| Section | Characteristics present | Fix |
|---|---|---|
| Homepage meta + title | template phrasing, unverifiable "everything/complete" claims | rewrite per §9 |
| About "মূল্যবোধ/স্বপ্ন" | generic inspirational structure, zero specifics | replace 1 pillar with a concrete, verifiable story (e.g., how the Oxford list was organized) |
| About mission/dream | vague statements, parallel slogan triples | anchor each to a number (words, levels, quizzes) |
| Blog article | **opposite problem** — very human, but unstructured (emoji headers, code-switching) | keep voice, add author + clean headings |
| Everywhere else | little filler (site is mostly UI) ✅ | — |

**Unsupported claims to verify or soften:** "Oxford 5000" completeness (C2=1 word contradicts it); "complete English learning experience" (no grammar/composition yet); date format "9/12/2026" ambiguity.
---

## 28. Humanization Rules

When suggesting rewrites:

**DO:**

- Use natural sentence structures
- Prefer clear language
- Use concrete examples
- Remove unnecessary filler
- Use Zero English's own voice
- Make explanations specific
- Keep educational value
- Use varied sentence lengths
- Use natural transitions
- Write for actual learners

**DO NOT:**

- Add random mistakes
- Intentionally make grammar worse
- Add fake personal experiences, stories, statistics, or opinions
- Add excessive slang
- Remove punctuation just to "fool detectors"
- Replace every em dash mechanically
- Use awkward wording to "look human"
- Attempt to bypass AI detection systems

The goal is **better human-centered content**, not detector evasion.

---

## 29. Page-by-Page Action List

| URL | Issue | Severity | Category | Recommended Change | Priority |
|---|---|---|---|---|---|
| `/vocabulary/{level}` ×511 | No words/H1 in server HTML | 🔴 | Technical SEO | SSR/SSG the word table | **P0** |
| `robots.txt` | `/api` blocks content fetch | 🔴 | Technical SEO | Allow `/api/v1/words/` (or fix SSR) | **P0** |
| `/` | 4.1MB HTML, all words + user PII embedded | 🔴 | Performance / UX | Remove `getAllWords()` from home props | **P0** |
| `/vocabulary` | No server links to levels | 🔴 | Internal Linking | Server-render level cards | **P0** |
| all pages | Zero JSON-LD | 🟠 | Structured Data | Organization+WebSite now; Breadcrumb/FAQ/Article next | **P1** |
| all pages | OG = homepage defaults | 🟡 | Metadata | page-specific OG on all templates | **P1** |
| `/sitemap.xml` | Missing about/privacy/4 quiz hubs; fake lastmod | 🟠 | Technical SEO | Add routes; real dates | **P1** |
| `/profile/*` | Indexable thin pages | 🟠 | Technical SEO | noindex | **P1** |
| `<html lang>` | lang="en" on Bangla content | 🟠 | Technical SEO | lang="bn" default | **P1** |
| `/` + About + meta | Overpromising (grammar/composition) | 🟠 | Content | rewrite title/desc (§9) or ship those sections | **P1** |
| `/vocabulary/c2` | 1 word vs "5000+" claim | 🟠 | Content / Brand | finish data or noindex + "আপডেট হচ্ছে" | **P1** |
| `/about` | Generic mission copy; no methodology/sources | 🟠 | E-E-A-T / Content | add "কীভাবে তৈরি হয়" section + Oxford attribution | **P1** |
| — | No cornerstone guide pages (Oxford 3000 etc.) | 🔴 | Content / GEO | build §33 roadmap | **P1–P2** |
| `/news/*` | No author, ambiguous date, no Article schema | 🟠 | E-E-A-T | author line + schema + unambiguous date | **P2** |
| `/search` | Odd title, thin desc, no H1 | 🟡 | Metadata | §17 block | **P2** |
| `/leaderboard` | Title lacks brand | 🟡 | Metadata | append " \| Zero English" | **P2** |
| `/contribute` | Missing canonical; not in sitemap | 🟡 | Technical SEO | add canonical; list or keep out deliberately | **P2** |
| `/quiz/question/*` | 200 on missing | 🟡 | Technical SEO | return 404 | **P2** |
| www + old domain | 307 redirects | 🟡 | Technical SEO | 301/308 | **P2** |
| `/vocabulary/A1` | 200 case-variant | 🟡 | Technical SEO | 308 lowercase | **P3** |
| homepage logo alt | alt="Logo" | 🟢 | Metadata | alt="Zero English" | **P3** |
| admin JS chunk on public pages | extra bundle | 🟢 | Performance | exclude admin layout from frontend | **P3** |

---

## 30. Top 10 Things I Should Fix First

1. **Server-render vocabulary pages** (words + H1 + intro + pagination in HTML) — unlocks all 511 URLs; everything else depends on it. *Impact 🔴 / Effort: dev sprint / Risk: low.*
2. **Fix robots.txt ↔ API contradiction** (`Allow: /api/v1/words/`) — 10-minute fix that unblocks rendering fallback. *Impact 🔴 / Effort: minutes.*
3. **Stop embedding 5,089 words + leaderboard PII in homepage HTML** — biggest perf + privacy win. *Impact 🔴 / Effort: small dev.*
4. **Rewrite site title + meta description** to honest, keyword-relevant Bangla/English (§9) — appears on every SERP instantly. *Impact 🟠 / Effort: 30 min / zero risk.*
5. **Add Organization + WebSite JSON-LD** (and FAQPage on About) — GEO foundation. *Impact 🟠 / Effort: 1–2 h.*
6. **Complete the sitemap** (about, privacy, 4 quiz hubs) + real lastmod. *Impact 🟠 / Effort: 1 h.*
7. **noindex `/profile/*`** + 404 on missing quiz questions. *Impact 🟠 / Effort: minutes.*
8. **`lang="bn"` + page-specific Open Graph.** *Impact 🟠 / Effort: 1–2 h.*
9. **Build the first cornerstone guide: Oxford 3000 Word List with Bangla Meaning** (using your own dataset) — biggest GEO/content-gap win. *Impact 🔴 long-term / Effort: 2–3 days.*
10. **Resolve the C2 = 1 word / "5000+" credibility gap** + add Oxford attribution & content methodology to About. *Impact 🟠 / Effort: content decision + 1 h.*
---

## 31. 30-Day Action Plan

### Week 1 — Technical fixes

| Task | Page/Area | Why | Benefit | Difficulty | Time |
|---|---|---|---|---|---|
| SSR word tables on level pages | `/vocabulary/[level]` | content invisible | indexable core | Dev | 1–2 days |
| Allow `/api/v1/words/` in robots | robots.txt | unblock rendering | safety net | Easy | 15 min |
| Remove `getAllWords()` from home | `/` | 4.1MB → ~100KB | CWV + crawl | Dev | 2–4 h |
| Sitemap completion + lastmod | `app/sitemap.ts` | discovery | indexing | Easy | 1 h |
| noindex profiles; 404 questions | profile/quiz routes | thin / soft-404 | quality | Easy | 1 h |
| lang + OG + title brand suffix | layout + pages | language / snippets | CTR | Easy | 2 h |

### Week 2 — Content fixes

| Task | Area | Why | Benefit | Difficulty | Time |
|---|---|---|---|---|---|
| Rewrite site title/description (§9) | layout metadata | honest + keyworded | CTR / GEO | Easy | 1 h |
| About: methodology + Oxford attribution + de-genericize mission | `/about` | E-E-A-T | trust | Medium | 3–4 h |
| Level-page intros + FAQs (unique per level) | 6 hub pages | unique content | rankings | Medium | 1 day |
| Guest empty-states → explanatory copy | `/vocabulary`, `/quiz` | UX + content | conversion + SEO | Medium | 4 h |
| Blog: author byline + readable dates + Article schema | `/news/*` | E-E-A-T | snippets | Easy | 2 h |
| C2 decision (finish or noindex) | `/vocabulary/c2` | claim integrity | trust | Medium | varies |

### Week 3 — GEO + authority

| Task | Area | Why | Benefit | Difficulty | Time |
|---|---|---|---|---|---|
| Organization/WebSite/Breadcrumb/FAQ JSON-LD | layout, About, level pages | machine-readable entity | AI / SERP snippets | Medium | 4 h |
| Publish Oxford 3000 Bangla guide | `/guides/…` | biggest gap | citations | Medium | 2–3 days |
| Publish "how to memorize words" guide | `/guides/…` | evergreen intent | links + citations | Medium | 1–2 days |
| Canonical description everywhere (§15) | footer, schema, FB, GitHub | entity consistency | Knowledge Panel | Easy | 1 h |
| GitHub public dataset repo | external | backlink + trust | authority | Medium | 1 day |

### Week 4 — Distribution + measurement

| Task | Area | Why | Benefit | Difficulty | Time |
|---|---|---|---|---|---|
| Verify property in GSC; submit sitemap; inspect key URLs | Search Console | you currently fly blind | data | Easy | 1 h |
| PageSpeed test home + A1 (mobile) before/after | PSI | validate T3 | CWV | Easy | 1 h |
| Launch FB word-of-day series + 4 Shorts | social | distribution | traffic | Easy | 3 h/wk |
| Baseline: track 10 target queries weekly | sheet | measure | iteration | Easy | 30 min/wk |
| Publish 2nd guide (memorization) + 1 list article | `/guides` | cadence | compounding | Medium | 2 days |

---

## 32. 90-Day Growth Plan

### Month 1 — Foundation

All Week 1–2 items + GSC + schema + first cornerstone guide.
**Exit criteria:** all 511 pages render words in HTML; sitemap complete; brand metadata live.

### Month 2 — Content & Authority

Publish 8–10 guides (roadmap §33), launch `/grammar/tenses` + `/grammar/prepositions` pilots, GitHub repo public, 2 list-shaped pages (50 daily words; A1 first-100). Start guest/contributor outreach to BD education blogs.
**Exit criteria:** ≥12 indexable non-product pages; internal links from guides → level hubs live.

### Month 3 — Distribution & Optimization

Sustained 3–4 social posts/week + 8 Shorts; Quora/Reddit genuine answers; review GSC queries → expand pages that get impressions; add word pages (`/word/{slug}`) for top-100 most-searched words first; A/B test level-page intros for CTR.
**Exit criteria:** measurable non-brand impressions growth; ≥1 page in top-10 for a long-tail Bangla query.

All plans are free-channel based — no paid acquisition required.
---

## 33. Content Roadmap

### 30 article / guide topics

(prioritized: search intent × user usefulness × Zero English relevance × content gap × AI citation potential)

1. Oxford 3000 Word List with Bangla Meaning (complete guide)
2. Oxford 5000 vs Oxford 3000: কোনটা কার জন্য
3. How to memorize English words (spaced repetition, Bangla)
4. A1 vocabulary: first 100 words every Bangla speaker needs
5. Daily English vocabulary: learn 5 words a day (30-day plan)
6. 50 English words used in Bangla daily conversation (ভুল ব্যবহারসহ)
7. English words with Bangla false friends (ভুল বন্ধু)
8. CEFR A1–C2 কী? (Bangla explainer with your counts)
9. SSC English vocabulary: 300 essential words
10. HSC vocabulary list with Bangla meaning
11. IELTS vocabulary for Bangla speakers (band-focused)
12. BCS / preliminary English word list
13. 100 most common English verbs with examples
14. English prepositions with Bangla sentences (common errors)
15. Tenses in Bangla: complete guide with formulas
16. Article rules (a/an/the) for Bangla learners
17. Voice change (active–passive) guide in Bangla
18. Narration / change of speech guide in Bangla
19. How to use a bilingual dictionary properly
20. English synonyms & antonyms: how to learn pairs
21. 30-day vocabulary challenge (uses your streak feature)
22. How to read an English dictionary entry
23. Common English collocations for Bangla speakers
24. English pronunciation basics for Bangla learners
25. Word forms (noun/verb/adjective) made simple
26. How to learn 50 words in one week (method + quiz)
27. English learning for Bangladesh: study plan by class
28. Guest mode → account: how progress tracking works
29. Weekly quiz: how Zero English exams are scored
30. Composition: email writing patterns (SSC/HSC)

### 20 vocabulary resources

Oxford 3000 full list · Oxford 5000 list · A1–C2 level top-500 pages (6 pages) · Topic lists: travel, office, phone/internet, food, health, classroom/exam, weather, emotions, shopping, family (10 thematic pages) → ≥20 total with an A–Z index page.

### 10 quiz / content ideas

1. Quiz sample-question pages (show 3 real questions per mode)
2. "Which level am I?" diagnostic guide
3. Vocabulary quiz for SSC (landing)
4. Preposition error quiz landing
5. Tense quiz landing
6. Weekly exam results explainer ("কীভাবে স্কোর হিসাব হয়")
7. Spaced-repetition review quiz
8. False-friend quiz
9. Synonym-matching demo
10. Leaderboard scoring methodology article

### 10 educational guides

1. CEFR roadmap (কোন লেভেলে কী করবেন)
2. Spaced repetition in practice
3. Dictionary skills
4. Learning with example sentences
5. Reading graded texts
6. From vocabulary to full sentences
7. Avoiding Bangla-to-English translation habits
8. A 15-minute daily English routine
9. When to take a quiz (testing effect)
10. How to review your mistakes

### 10 Bangla-specific English learning topics

1. ভুল বন্ধু শব্দ (false friends Bangla↔English)
2. Bangla sentence interference: prepositions & articles
3. Greetings and register: Bangla politeness → English choices
4. Code-switching habits and how to speak full sentences
5. Myths about মুখস্থ (rote memorization) and what works instead
6. SSC/HSC pattern alignment for self-learners
7. Learning English with limited screen time / low data
8. Bangla proverb → English equivalent pairs
9. BCS / government job English patterns
10. English for study abroad (IELTS first steps, Bangla guide)
---

# Final Deliverables (A–T)

## A. Executive Summary

Solid engineering foundation (fast TTFB, clean URLs, valid robots/sitemap, correct 404s, canonicals on almost every page) wrapped around **an SEO-invisible product**: the 511 vocabulary pages — your entire value proposition — contain **no content in server HTML**, and the API that feeds them is **robots-blocked**. There is **zero structured data**, the homepage is a **4.1 MB data dump including user PII**, metadata overpromises nonexistent grammar/composition content, and there are **no content pages targeting a single high-value Bangla keyword**. Your unique asset — 5,089 bilingual CEFR-tagged word entries with definitions and examples — is better data than most Bangla competitors have, but it is neither rendered, structured, nor packaged into citable pages. Fix rendering + metadata + schema first (weeks 1–2), then convert the dataset into cornerstone guides (weeks 3–4+).

## B. Critical Problems

1. 🔴 Vocabulary pages empty in server HTML (511 URLs) — §3 T1
2. 🔴 `Disallow: /api` blocks the content feed — §3 T2
3. 🔴 4.1 MB homepage with all words + leaderboard PII — §3 T3
4. 🔴 Zero structured data site-wide — §3 T4, §18
5. 🔴 No content pages for any priority keyword — §5, §19
6. 🔴 `<html lang="en">` on a Bangla-default site — §3 T8

## C. Technical SEO Problems

T1–T12 in §3: SSR gap, robots/API conflict, homepage weight, no schema, incomplete sitemap + fake lastmod, indexable profiles, soft-404 questions, wrong lang, 307 permanent-redirect cases, case-variant 200, missing canonical on `/contribute`. Verified-good: HTTPS/HSTS, compression, TTFB, 404s, trailing-slash normalization, canonicals on 15/16 main pages, noindex on `/profile`, `/quiz/question/*`, `/docs`.

## D. Content Problems

Homepage overpromise (meta), C2 = 1 word vs "5000+" claim, generic About mission sections, single changelog-style blog post with no author/ambiguous date, empty guest states on `/quiz` + `/vocabulary`, no intros/FAQs on level pages, `/search` thin, `/contribute` shell — details §6.

## E. AI-Like / Unnatural Content Problems

"Everything You Need to Master English"; "Master English in one place… complete English learning experience"; About's "three pillars / dream / values" template; repetitive "শেখা শুরু করুন" CTA. Explicitly **not** found: "In today's world", "Key takeaways", "In conclusion" patterns — the site's UI copy is largely natural Bangla (§7).

## F. Humanization Recommendations

Targeted rewrites with CURRENT/PROBLEM/BETTER in §9 (site title + description, About mission, hero line, level-page intro), plus punctuation guidance in §8. No mass rewriting — the blog's personal voice should be **kept**, only structured.

## G. GEO / AI Search Opportunities

Allow AI crawlers to see: (1) server-rendered word tables (biggest lever), (2) Organization/WebSite/FAQ JSON-LD, (3) About FAQ as entity Q&A, (4) unique per-level counts as citable data, (5) Oxford 3000/5000 guides, (6) future `/word/*` pages. No AI-system recommendation is claimed — unverifiable (§13–14).

## H. E-E-A-T Problems

No sources for Oxford claims, no content methodology, no author on articles, Gmail contact instead of domain email, C2 data inconsistency, no Organization schema, no update dates on evergreen pages. Present: named founders, multi-channel contact, privacy policy, honest free-tier messaging (§11).
## I. Information Architecture Problems

Hierarchy stops at level pages (no word tier), grammar/composition promised but absent, hub→levels not server-rendered, no breadcrumbs, no topic lists/A–Z, `/about` + `/privacy` + 4 quiz hubs missing from sitemap. Recommended architecture in §4.

## J. Internal Linking Problems

Hub→level links and pagination exist only client-side; level pages have 1 contextual link; no word-to-word linking (impossible today); no breadcrumbs; weak contextual anchors (no body copy to anchor in). Recommended structure in §16.

## K. Metadata Problems

OG/Twitter homepage-default on ~20 pages; titles missing brand on 3 templates; odd `/search` title; thin `/search` description; homepage title/desc unverifiable; no H1 server-side on level + search pages; canonical missing on `/contribute`. Full suggested blocks in §17.

## L. Structured Data Problems

None exists. Add: Organization + WebSite (week 1), BreadcrumbList + FAQPage on About (week 2), Article on news (week 2). Do **not** add review/rating/course schema (no genuine data) — §18.

## M. Content Gaps

Prioritized groups in §19. Top five: Oxford 3000 Bangla guide · vocabulary-with-Bangla-meaning cornerstone · grammar hub (content, not just quizzes) · how-to-memorize guide · topic word lists.

## N. Competitor / Alternative Comparison

§20. Zero English's edge = CEFR structure + bilingual definitions + quizzes in one platform; its absence in SERPs = no indexable prose, no content pages, no brand/backlink signals. LanGeek shows a clean multi-locale entity; englishkaku/999wordsbd show Bangla content depth winning queries you should own with better data.

## O. Free Marketing Opportunities

§25 — channel-by-channel: FB Page/Groups, YouTube+Shorts, Instagram, TikTok, Reddit, Quora, LinkedIn build-in-public, GitHub, Dev.to/Medium, BD student communities — each with strategy, cadence, example, natural mention, and what NOT to do.

## P. Backlink Opportunities

§26 — public GitHub repo (highest priority; org exists, repo private), launch directories, BD education resource pages, contributor bylines, dev showcases, open-source awesome-lists. No paid/spam/automated tactics.

## Q. Top 10 Fixes

§30 — 1) SSR vocabulary pages, 2) robots `Allow: /api/v1/words/`, 3) strip homepage data dump, 4) rewrite title/description, 5) Organization+WebSite+FAQ schema, 6) sitemap completion, 7) noindex profiles + real 404s, 8) lang + page-specific OG, 9) Oxford 3000 Bangla cornerstone guide, 10) C2/claim integrity + About methodology.

## R. 30-Day Action Plan

§31 — Week 1 technical (SSR, robots, home weight, sitemap, noindex, lang/OG), Week 2 content (metadata rewrite, About, level intros, guest copy, blog E-E-A-T, C2), Week 3 GEO (schema, 2 cornerstone guides, canonical description, GitHub), Week 4 distribution (GSC, PSI baselines, social cadence, query tracking).

## S. 90-Day Action Plan

§32 — Month 1 foundation (rendering + metadata + schema), Month 2 content & authority (10–12 guides, grammar pilots, GitHub, outreach), Month 3 distribution & optimization (social engine, GSC-driven iteration, top-100 word pages, CTR tests).

## T. Long-Term SEO + GEO Strategy

1. **Own the data layer:** render every word as a `/word/{slug}` page (5,089 pages, phased by search demand) with bilingual definition, examples, synonyms/antonyms, level, and quiz links — your durable moat against dictionaries and list-sites.
2. **Own the intent layer:** one pillar page per CEFR level + per topic list + Oxford 3000/5000 explainers, all interlinked with breadcrumbs and quizzes.
3. **Own the entity layer:** consistent one-sentence description, Organization schema, sameAs, domain email, methodology page — building toward Knowledge Panel and AI-citation trust.
4. **Own the practice loop:** every content page ends in a quiz; every quiz links back to the list — the engagement signal competitors' static articles can't match.
5. **Measure honestly:** GSC impressions/queries monthly, CWV after each perf fix, one new guide per week, social → content → internal links. No shortcuts: no bought links, no fake reviews, no keyword stuffing, and never at the learner's expense.

---

**Verification statement:** All "verified" claims came from direct fetches on 28 September 2026 (status codes, HTML greps, sitemap parsing, API checks, `site:` queries). Recommendations are clearly separated from observations; no rankings, traffic, AI citations, credentials, or statistics were invented. No website, code, database, or CMS content was modified during this audit.
