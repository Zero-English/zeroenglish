export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://zeroenglish.org";

export const SITE_NAME = "Zero English";

/**
 * Every page title is suffixed automatically with this brand string, so a page
 * only ever has to supply the part that differs. See the `title.template` in
 * `app/(frontend)/layout.tsx`.
 */
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/**
 * The single source of truth for what this site actually is.
 *
 * Rules for anything in here:
 *  - Only claim features that exist and are reachable today.
 *  - Never attribute the word lists to Oxford (we are not affiliated with
 *    Oxford University Press). The words are headwords drawn from the public
 *    Oxford 3000 / Oxford 5000 lists; the meanings, definitions and examples
 *    are written for Zero English.
 *  - Keep the English description under ~160 characters so it is not truncated
 *    in SERPs.
 */
// 158 characters, so it survives a SERP without truncation. Says A1-C1
// deliberately: C2 is still being written, is `noindex`, and is not linkable
// from the level grid, so advertising it here would be a claim the site itself
// contradicts two clicks away.
export const SITE_BRAND_DESCRIPTION_EN =
  "Free bilingual vocabulary for Bangla-speaking English learners. 5,000+ CEFR words from A1 to C1 with Bangla meanings, examples, synonyms, antonyms and quizzes.";

export const SITE_BRAND_DESCRIPTION_BN =
  "বাংলাভাষীদের জন্য বিনামূল্যে দ্বিভাষিক ইংরেজি শব্দভাণ্ডার। A1 থেকে C1 লেভেলের ৫,০০০টির বেশি শব্দ, প্রতিটির বাংলা অর্থ, উদাহরণ বাক্য, প্রতিশব্দ ও বিপরীত শব্দ, সঙ্গে কুইজ।";

/** Fallback `<meta name="description">` for pages that do not define their own. */
export const SITE_DEFAULT_DESCRIPTION = SITE_BRAND_DESCRIPTION_EN;

export const SITE_DEFAULT_TITLE =
  "Learn English Vocabulary in Bangla | Zero English";

/** Shared Open Graph / Twitter card asset. */
export const SITE_OG_IMAGE = {
  url: "/assets/logo/open-graph.png",
  width: 1254,
  height: 1254,
  alt: "Zero English — English vocabulary with Bangla meanings, A1 to C1",
};

/**
 * zeroenglish.org has no MX record, so any `@zeroenglish.org` address would
 * silently bounce. Corrections and support mail goes to Gmail, which is the
 * address already used by the structured data and the About page.
 */
export const SITE_CONTACT_EMAIL = "zeroenglishweb@gmail.com";

/**
 * Public headword lists used as the source for the vocabulary database.
 * Attribution only: Zero English is an independent project and is not
 * affiliated with, endorsed by, or sponsored by Oxford University Press.
 */
export const WORD_LIST_ATTRIBUTION = {
  en: "Oxford 3000 and Oxford 5000",
  bn: "অক্সফোর্ড ৩০০০ ও অক্সফোর্ড ৫০০০",
};
