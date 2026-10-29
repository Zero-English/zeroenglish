# Action Plan: zeroenglish.org SEO & GEO Optimization

**Generated from:** Full Website SEO Audit  
**Target:** [https://zeroenglish.org](https://zeroenglish.org)  
**Starting Health Score:** 83 / 100  
**Target Health Score:** 95+ / 100  

---

## Phase 1: Critical Fixes (Completed on branch seo/fix)
*Goal: Remove crawlability barriers and unlock AI search indexing.*

- [x] **1. Prerender Static Hero with H1 on Homepage**
  - **File:** [src/components/skeletons.tsx](file:///c:/code/zeroenglish/src/components/skeletons.tsx)
  - **Action:** Added semantic, screen-reader accessible `<h1>` and summary description to `HomeSkeleton` so crawlers streaming the initial HTML instantly receive the primary semantic headline and platform context before JS hydration.
  - **Status:** Completed.

- [x] **2. Publish `/llms.txt` for AI Citation Engines**
  - **File:** [public/llms.txt](file:///c:/code/zeroenglish/public/llms.txt)
  - **Action:** Created structured Markdown knowledge sheet introducing Zero English, CEFR vocabulary tiers, grammar guides, and canonical entry points.
  - **Status:** Completed.

- [x] **3. Update `robots.ts` with Explicit AI Crawler Directives**
  - **File:** [src/app/robots.ts](file:///c:/code/zeroenglish/src/app/robots.ts)
  - **Action:** Explicitly allowed AI search & agent crawlers (`PerplexityBot`, `ChatGPT-User`, `Claude-Web`, `OAI-SearchBot`, `Applebot-Extended`).
  - **Status:** Completed.

---

## Phase 2: High-Impact On-Page & Schema Enhancements (Completed on branch seo/fix)
*Goal: Fix heading hierarchy and tighten metadata across programmatic pages.*

- [x] **4. Fix Heading Hierarchy in Written Article Pages**
  - **File:** [src/components/written/written-article-reader.tsx](file:///c:/code/zeroenglish/src/components/written/written-article-reader.tsx)
  - **Action:** Added semantic `<h2>` section outline to fix heading hierarchy from H1 ➔ H2 ➔ H3.
  - **Status:** Completed.

- [x] **5. Cap Vocabulary Meta Descriptions at 155 Characters**
  - **File:** [src/lib/level-copy.ts](file:///c:/code/zeroenglish/src/lib/level-copy.ts)
  - **Action:** Optimized `levelMetaDescription` down from 214 characters to 130 characters to prevent SERP ellipsis truncation.
  - **Status:** Completed.

- [x] **6. Link Article Schema Author to Person Entity (`@id`)**
  - **File:** [src/app/(frontend)/written/[slug]/page.tsx](file:///c:/code/zeroenglish/src/app/(frontend)/written/[slug]/page.tsx)
  - **Action:** Linked `author` to canonical Person `@id` with canonical URL.
  - **Status:** Completed.

---

## Phase 3: Security & Vocabulary Schema Breadth (Completed on branch seo/fix)
*Goal: Harden technical posture and unlock dictionary rich results.*

- [x] **7. Add Security Headers in `next.config.ts`**
  - **File:** [next.config.ts](file:///c:/code/zeroenglish/next.config.ts)
  - **Action:** Added `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: origin-when-cross-origin`.
  - **Status:** Completed.

- [x] **8. Add `DefinedTermSet` Schema to Vocabulary Pages**
  - **File:** [src/app/(frontend)/vocabulary/[level]/[pageNum]/page.tsx](file:///c:/code/zeroenglish/src/app/(frontend)/vocabulary/[level]/[pageNum]/page.tsx)
  - **Action:** Added `DefinedTermSet` and `BreadcrumbList` schema to all 150+ paginated vocabulary routes.
  - **Status:** Completed.
  - **Impact:** Makes CEFR vocabulary entries eligible for dictionary and linguistic rich cards.

---

## Phase 4: Monitoring & Regression Tracking (Ongoing)

- [ ] **9. Track SEO Drift Across Releases**
  - Run drift monitoring before and after deploying new features:
    ```bash
    py claude-seo/scripts/runtime.py run drift_baseline.py https://zeroenglish.org
    ```
- [ ] **10. Monitor Search Console Coverage**
  - Inspect indexing status for the 150+ vocabulary pagination URLs in Google Search Console to verify crawl velocity.
