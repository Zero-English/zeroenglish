/**
 * Mapping from the current URL to the title shown in the header.
 *
 * The header shows the site logo on `/` and `/about`. Everywhere else it shows
 * a back arrow and the name of the current page, so the logo area doubles as a
 * lightweight location indicator on deep pages.
 *
 * The arrow walks up the URL hierarchy: a rule page goes to its category, a
 * category to its section, a section to the grammar hub. Top-level pages have
 * no parent, so the header falls back to the reader's main page
 * (`/dashboard` when signed in, `/` otherwise).
 *
 * This module is intentionally pure and client-safe: no database, no network.
 * Detail pages resolve to their section label (a news article says "News"),
 * because their real title is not available in a global client component.
 */

import { QUIZ_CRUMBS, QUIZ_HUB } from "@/lib/breadcrumb-trail";
import { getLevelMeta } from "@/lib/level-copy";

export interface HeaderPage {
  titleBn: string;
  titleEn: string;
  /** Parent route in the URL hierarchy; `null` for top-level pages. */
  parentHref: string | null;
}

/** Pages with a fixed label. `/` and `/about` are absent on purpose. */
const STATIC_PAGES: Record<string, HeaderPage> = {
  "/dashboard": {
    titleBn: "ড্যাশবোর্ড",
    titleEn: "Dashboard",
    parentHref: null,
  },
  "/vocabulary": {
    titleBn: "শব্দভাণ্ডার",
    titleEn: "Vocabulary",
    parentHref: null,
  },
  "/grammar": {
    titleBn: "গ্রামার",
    titleEn: "Grammar",
    parentHref: null,
  },
  "/news": {
    titleBn: "নিউজ",
    titleEn: "News",
    parentHref: null,
  },
  "/written": {
    titleBn: "লিখিত",
    titleEn: "Written",
    parentHref: null,
  },
  "/profile": {
    titleBn: "আমার প্রোফাইল",
    titleEn: "My Profile",
    parentHref: null,
  },
  "/leaderboard": {
    titleBn: "লিডারবোর্ড",
    titleEn: "Leaderboard",
    parentHref: null,
  },
  "/search": {
    titleBn: "অনুসন্ধান",
    titleEn: "Search",
    parentHref: null,
  },
  "/contact": {
    titleBn: "যোগাযোগ",
    titleEn: "Contact",
    parentHref: null,
  },
  "/contribute": {
    titleBn: "কন্ট্রিবিউট",
    titleEn: "Contribute",
    parentHref: null,
  },
  "/join": {
    titleBn: "যোগ দিন",
    titleEn: "Join",
    parentHref: null,
  },
  "/privacy": {
    titleBn: "গোপনীয়তা",
    titleEn: "Privacy",
    parentHref: null,
  },
};

/**
 * Quiz labels live in `breadcrumb-trail.ts` so the header and the visible
 * breadcrumb never disagree.
 */
const QUIZ_PAGES: Record<string, { nameBn: string; nameEn: string }> = {
  "/quiz": QUIZ_HUB,
  "/quiz/daily": QUIZ_CRUMBS.daily,
  "/quiz/exam": QUIZ_CRUMBS.exam,
  "/quiz/quick": QUIZ_CRUMBS.quick,
  "/quiz/vocabulary": QUIZ_CRUMBS.vocabulary,
  "/quiz/grammar": QUIZ_CRUMBS.grammar,
  "/quiz/class": QUIZ_CRUMBS.class,
  "/quiz/results": QUIZ_CRUMBS.results,
  "/quiz/mistakes": QUIZ_CRUMBS.mistakes,
};

function normalizePathname(pathname: string): string {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const stripped = withLeadingSlash.replace(/\/+$/, "");
  return stripped || "/";
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** "how-to-learn" → "How To Learn" for routes without a known label. */
function labelFromSegment(segment: string): string {
  return decodeSegment(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

/** `/grammar/verb/tense/present` → `/grammar/verb/tense`. */
function parentOf(segments: string[]): string | null {
  if (segments.length <= 1) return null;
  return `/${segments.slice(0, -1).join("/")}`;
}

/**
 * Returns `null` when the header should keep the logo (home and about).
 */
export function getHeaderPage(pathname: string): HeaderPage | null {
  const path = normalizePathname(pathname);

  // Logo pages.
  if (path === "/" || path === "/about") return null;

  const staticPage = STATIC_PAGES[path];
  if (staticPage) return staticPage;

  const quizPage = QUIZ_PAGES[path];
  if (quizPage) {
    return {
      titleBn: quizPage.nameBn,
      titleEn: quizPage.nameEn,
      parentHref: path === "/quiz" ? null : "/quiz",
    };
  }

  const segments = path.split("/").filter(Boolean);

  // /vocabulary/[level] → "A1 | Beginner"
  // /vocabulary/[level]/[page] → same label, parent is the level page.
  if (segments[0] === "vocabulary" && segments.length >= 2) {
    const level = decodeSegment(segments[1]).toUpperCase();
    const meta = getLevelMeta(level);
    if (meta) {
      return {
        titleBn: `${level} | ${meta.labelBn}`,
        titleEn: `${level} | ${meta.label}`,
        parentHref:
          segments.length === 2 ? "/vocabulary" : `/${segments[0]}/${segments[1]}`,
      };
    }
    return { ...STATIC_PAGES["/vocabulary"], parentHref: "/vocabulary" };
  }

  // Grammar: section → category → rule, each step up one segment.
  if (segments[0] === "grammar" && segments.length >= 2) {
    return {
      ...STATIC_PAGES["/grammar"],
      parentHref: parentOf(segments),
    };
  }

  if (segments[0] === "news" && segments.length >= 2) {
    return {
      ...STATIC_PAGES["/news"],
      parentHref: "/news",
    };
  }

  if (segments[0] === "written" && segments.length >= 2) {
    return {
      ...STATIC_PAGES["/written"],
      parentHref: "/written",
    };
  }

  if (segments[0] === "profile") {
    if (segments[1] === "quiz-results" && segments.length >= 3) {
      return {
        titleBn: "কুইজ ফলাফল",
        titleEn: "Quiz Results",
        parentHref: "/profile",
      };
    }
    if (segments[1] === "vocabulary-exam-results" && segments.length >= 3) {
      return {
        titleBn: "পরীক্ষার ফলাফল",
        titleEn: "Exam Results",
        parentHref: "/profile",
      };
    }
    if (segments.length >= 2) {
      return {
        titleBn: "প্রোফাইল",
        titleEn: "Profile",
        parentHref: "/profile",
      };
    }
  }

  // Deeper quiz routes (e.g. an in-progress question) fall back to the hub.
  if (segments[0] === "quiz" && segments.length >= 2) {
    return {
      titleBn: QUIZ_HUB.nameBn,
      titleEn: QUIZ_HUB.nameEn,
      parentHref: "/quiz",
    };
  }

  // Unknown route: prettify the last segment and go up one level.
  const last = segments[segments.length - 1];
  if (!last) return null;

  const label = labelFromSegment(last);
  return {
    titleBn: label,
    titleEn: label,
    parentHref: parentOf(segments),
  };
}
