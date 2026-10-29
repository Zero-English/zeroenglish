# Action Plan: zeroenglish.org SEO & GEO Optimization

**Generated from:** Full Website SEO Audit  
**Target:** [https://zeroenglish.org](https://zeroenglish.org)  
**Starting Health Score:** 83 / 100  
**Target Health Score:** 95+ / 100  

---

## Phase 1: Critical Fixes (Week 1)
*Goal: Remove crawlability barriers and unlock AI search indexing.*

- [ ] **1. Prerender Static Hero with H1 on Homepage**
  - **File:** [src/components/home-or-dashboard.tsx](file:///c:/code/zeroenglish/src/components/home-or-dashboard.tsx)
  - **Action:** Ensure server-side rendering delivers the full static `HomeContent` view (containing the `<h1>` headline) on initial render, so search crawlers receive the semantic headline before JavaScript hydration.
  - **Impact:** Critical for Googlebot, Bingbot, and AI crawlers to index primary brand and value keywords.

- [ ] **2. Publish `/llms.txt` for AI Citation Engines**
  - **File:** `public/llms.txt`
  - **Action:** Create a markdown/text summary introducing Zero English, its CEFR vocabulary tiers (A1 to C1), grammar resources, and canonical entry points.
  - **Impact:** High — directly indexed by Perplexity, ChatGPT Search, Claude, and Gemini when users query Bengali-English learning materials.

- [ ] **3. Update `robots.ts` with Explicit AI Crawler Directives**
  - **File:** [src/app/robots.ts](file:///c:/code/zeroenglish/src/app/robots.ts)
  - **Action:** Explicitly allow AI search agents (`PerplexityBot`, `ChatGPT-User`, `Claude-Web`) while protecting private directories (`/admin`, `/api`).
  - **Impact:** Ensures AI search engines can cite your pages in answer overviews.

---

## Phase 2: High-Impact On-Page & Schema Enhancements (Weeks 2–3)
*Goal: Fix heading hierarchy and tighten metadata across programmatic pages.*

- [ ] **4. Fix Heading Hierarchy in Written Article Pages**
  - **File:** [src/app/(frontend)/written/[slug]/page.tsx](file:///c:/code/zeroenglish/src/app/(frontend)/written/[slug]/page.tsx)
  - **Action:** Introduce proper `<h2>` section headings (`Model Paragraph`, `Bengali Meaning`, `Vocabulary Notes`) before `<h3>` subsections.
  - **Impact:** Resolves HTML outline warnings and improves featured snippet eligibility.

- [ ] **5. Cap Vocabulary Meta Descriptions at 155 Characters**
  - **File:** Vocabulary page metadata generator
  - **Action:** Shorten programmatic descriptions from ~214 characters down to ~150 characters to prevent ellipsis truncation in Google search results.
  - **Impact:** Boosts search click-through rate (CTR) by presenting clean, readable summaries.

- [ ] **6. Link Article Schema Author to Person Entity (`@id`)**
  - **File:** Article JSON-LD generator
  - **Action:** Link `author` to `https://zeroenglish.org/about#mahir-asef` instead of an anonymous text string.
  - **Impact:** Strengthens E-E-A-T signals by connecting content directly to known author profile.

---

## Phase 3: Security & Vocabulary Schema Breadth (Month 2)
*Goal: Harden technical posture and unlock dictionary rich results.*

- [ ] **7. Add Security Headers in `next.config.ts`**
  - **File:** [next.config.ts](file:///c:/code/zeroenglish/next.config.ts)
  - **Action:** Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: origin-when-cross-origin`.
  - **Impact:** Enhances security grading and trust signals for search engines.

- [ ] **8. Add `DefinedTermSet` Schema to Vocabulary Pages**
  - **File:** [src/app/(frontend)/vocabulary/](file:///c:/code/zeroenglish/src/app/(frontend)/vocabulary/)
  - **Action:** Tag each word on vocabulary list pages with `DefinedTerm` and `DefinedTermSet` JSON-LD schema.
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
