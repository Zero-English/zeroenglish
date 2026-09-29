/**
 * Editorial copy for the CEFR level pages.
 *
 * Two jobs:
 *  1. Give every level page a real, unique intro paragraph and a keyword-shaped
 *     H1, so six near-identical pages stop looking like one template.
 *  2. Supply the title/description pair used in `<head>`, so the metadata
 *     matches what the page actually says.
 *
 * The level descriptions follow the Council of Europe CEFR can-do statements
 * (what a learner at that stage is expected to handle). They describe the
 * difficulty of the words, not features of this website.
 */

export const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type LevelCode = (typeof VALID_LEVELS)[number];

/**
 * A level with fewer words than this cannot function as a study list, so the
 * page is marked `noindex` and shown as still being written instead of linking
 * out to a page holding a handful of entries.
 */
export const MIN_LIVE_LEVEL_WORDS = 50;

export interface LevelMeta {
  label: string;
  labelBn: string;
  /** Visible H1, in both interface languages. */
  h1En: string;
  h1Bn: string;
  /** One paragraph of unique on-page copy, above the word list. */
  introEn: string;
  introBn: string;
  /** Short topic labels rendered as chips under the intro. */
  topics: { en: string; bn: string }[];
}

const LEVEL_META: Record<LevelCode, LevelMeta> = {
  A1: {
    label: "Beginner",
    labelBn: "শিক্ষানবিস",
    h1En: "A1 English Vocabulary with Bangla Meanings",
    h1Bn: "A1 ইংরেজি শব্দভাণ্ডার, বাংলা অর্থসহ",
    introEn:
      "A1 is where an English learner starts. The words on this page are the ones you meet first: family, food, numbers, times of day, common verbs like eat, go and have. Almost all of them are short and concrete, so this is the level to mark words as learned without pausing. Every entry gives you a Bangla meaning, a short English definition and two example sentences.",
    introBn:
      "A1 হলো ইংরেজি শেখা শুরুর স্তর। এই পাতার শব্দগুলো প্রথমেই চোখে পড়ে: পরিবার, খাবার, সংখ্যা, দিনের সময়, আর eat, go, have-এর মতো সাধারণ ক্রিয়া। প্রায় সবগুলোই ছোট ও নির্দিষ্ট অর্থের, তাই এই লেভেলে থামাচামি না করে শব্দ শেখা যায়। প্রতিটি শব্দের সঙ্গে বাংলা অর্থ, সংক্ষিপ্ত ইংরেজি সংজ্ঞা ও দুটি করে উদাহরণ বাক্য দেওয়া আছে।",
    topics: [
      { en: "Family & people", bn: "পরিবার ও মানুষ" },
      { en: "Food & drink", bn: "খাবার ও পানীয়" },
      { en: "Numbers & time", bn: "সংখ্যা ও সময়" },
      { en: "Body & health", bn: "শরীর ও স্বাস্থ্য" },
      { en: "Home & places", bn: "বাড়ি ও জায়গা" },
    ],
  },
  A2: {
    label: "Elementary",
    labelBn: "প্রাথমিক",
    h1En: "A2 English Vocabulary with Bangla Meanings",
    h1Bn: "A2 ইংরেজি শব্দভাণ্ডার, বাংলা অর্থসহ",
    introEn:
      "A2 builds on A1 with the words you need for everyday errands and routine plans: shopping, travel, asking for directions, describing what you did last weekend. The vocabulary starts carrying more meaning per word, because phrasal verbs and fixed expressions appear here. If A1 felt comfortable, A2 is where you begin reading short real texts without stopping to look every third word up.",
    introBn:
      "A1-এর ওপরে দাঁড়িয়ে A2-তে আসে দৈনন্দিন কাজের শব্দ: বাজার করা, ভ্রমণ, পথ জিজ্ঞেস করা, গত সপ্তাহে কী করেছেন তা বলা। এখান থেকেই একটি শব্দে একাধিক অর্থ আসতে শুরু করে, কারণ ফ্রেজাল ভার্ব ও নির্দিষ্ট বাক্যাংশ এই লেভেল থেকেই আসে। A1 সহজ লাগলে A2 থেকেই ছোট সত্যিকারের লেখা পড়া শুরু করা যায়, প্রতি তৃতীয় শব্দের জন্য থেমে না দিয়েই।",
    topics: [
      { en: "Shopping & money", bn: "কেনাকাটা ও টাকা" },
      { en: "Travel & transport", bn: "ভ্রমণ ও যাতায়াত" },
      { en: "Health & appointments", bn: "স্বাস্থ্য ও অ্যাপয়েন্টমেন্ট" },
      { en: "Weather & seasons", bn: "আবহাওয়া ও ঋতু" },
      { en: "Free time", bn: "অবসরের সময়" },
    ],
  },
  B1: {
    label: "Intermediate",
    labelBn: "মাঝারি",
    h1En: "B1 English Vocabulary with Bangla Meanings",
    h1Bn: "B1 ইংরেজি শব্দভাণ্ডার, বাংলা অর্থসহ",
    introEn:
      "B1 is the level most learners plateau at, and the level where vocabulary starts to pay off directly. The words here cover work, study, opinions and explanations: you can describe a problem, give a reason, disagree politely and follow an argument. It is also the first level where a word has a clear technical or formal register, so a word like implement stops meaning only tool.",
    introBn:
      "B1 হলো সেই লেভেল যেখানে বেশিরভাগ শিক্ষার্থী আটকে যান, আর এখান থেকেই শব্দভাণ্ডার সরাসরি কাজে লাগে। এই পাতার শব্দগুলো কাজ, পড়াশোনা, মতামত ও ব্যাখ্যা নিয়ে: সমস্যা বলা, কারণ দেখানো, সহভাবে দ্বিমত করা, যুক্তি অনুসরণ করা। এটি প্রথম লেভেল যেখানে কোনো শব্দের স্পষ্ট আনুষ্ঠানিক বা পেশাদার ব্যবহার শুরু হয়, তাই implement আর শুধু tool বোঝায় না।",
    topics: [
      { en: "Work & careers", bn: "কাজ ও পেশা" },
      { en: "Education & exams", bn: "শিক্ষা ও পরীক্ষা" },
      { en: "Opinions & arguments", bn: "মতামত ও যুক্তি" },
      { en: "Media & society", bn: "মিডিয়া ও সমাজ" },
      { en: "Environment", bn: "পরিবেশ" },
    ],
  },
  B2: {
    label: "Upper Intermediate",
    labelBn: "উচ্চ-মাঝারি",
    h1En: "B2 English Vocabulary with Bangla Meanings",
    h1Bn: "B2 ইংরেজি শব্দভাণ্ডার, বাংলা অর্থসহ",
    introEn:
      "B2 is the largest level on this site, and the level where nuance starts to matter. The words cover professional and academic contexts: reporting results, weighing options, describing cause and effect in writing. This is where a learner who can already communicate starts worrying about precision, and where the difference between a competent sentence and an accurate one lives.",
    introBn:
      "B2 এই সাইটের সবচেয়ে বড় লেভেল, আর নিখুঁততা গুরুত্ব পেতে শুরু করে এখানেই। এই পাতার শব্দগুলো পেশাগত ও একাডেমিক বিষয়ে: ফলাফল জানানো, সুবিধা-অসুবিধা মাথায় রাখা, লেখায় কারণ ও ফল ব্যাখ্যা করা। যে শিক্ষার্থী আগে থেকেই কথা বলতে পারে, তার উদ্বেগ এখান থেকেই শুরু হয়, ঠিক ঠিক বলা নিয়ে, আর সেখানেই ভালো বাক্য আর সঠিক বাক্যের পার্থক্য থাকে।",
    topics: [
      { en: "Professional terms", bn: "পেশাগত পরিভাষা" },
      { en: "Research & results", bn: "গবেষণা ফলাফল" },
      { en: "Cause & effect", bn: "কারণ ও ফল" },
      { en: "Abstract discussion", bn: "সরাসরি প্রকাশযোগ্য আলোচনা" },
      { en: "Idioms in use", bn: "ব্যবহৃত বাগধারা" },
    ],
  },
  C1: {
    label: "Advanced",
    labelBn: "উন্নত",
    h1En: "C1 English Vocabulary with Bangla Meanings",
    h1Bn: "C1 ইংরেজি শব্দভাণ্ডার, বাংলা অর্থসহ",
    introEn:
      "C1 words are the ones that separate fluent from precise. They carry connotation, register and disciplinary meaning: a word can be technically right and still be the wrong choice for the audience. Expect vocabulary from academic writing, law, business and the sciences, where a single word often has a settled meaning that cannot be translated word for word. This level is best used alongside real reading rather than in isolation.",
    introBn:
      "C1-এর শব্দগুলোই সাবলীলতা আর নিখুঁততার পার্থক্য টানে। এগুলোর সঙ্গে সংকেত, স্তর ও বিষয়বিশেষ অর্থ জড়িত: একটি শব্দ প্রযুক্তিগতভাবে ঠিক হয়েও শ্রোতা বা পাঠকের জন্য ভুল পছন্দ হতে পারে। এখানে একাডেমিক লেখা, আইন, ব্যবসা ও বিজ্ঞানের পরিভাষা আসে, যেখানে একটি শব্দের নির্দিষ্ট অর্থ থাকে যা শব্দে শব্দে অনুবাদ করা যায় না। এই লেভেল সত্যিকারের পাঠের সঙ্গে ব্যবহার করলে ভালো ফল দেয়।",
    topics: [
      { en: "Academic register", bn: "একাডেমিক ভাষা" },
      { en: "Law & policy", bn: "আইন ও নীতি" },
      { en: "Business & finance", bn: "ব্যবসা ও বাণিজ্য" },
      { en: "Science & technology", bn: "বিজ্ঞান ও প্রযুক্তি" },
      { en: "Connotation & register", bn: "সংকেত ও স্তর" },
    ],
  },
  C2: {
    label: "Mastery",
    labelBn: "পারদর্শী",
    h1En: "C2 English Vocabulary with Bangla Meanings",
    h1Bn: "C2 ইংরেজি শব্দভাণ্ডার, বাংলা অর্থসহ",
    introEn:
      "C2 is the top of the CEFR scale: near-native precision, including idiom, irony, formality shifts and the vocabulary of literary and specialised texts. This list is still being written. It is not open for study yet, and we would rather say so than show a page that looks finished and is not.",
    introBn:
      "C2 হলো CEFR স্কেলের সর্বোচ্চ স্তর: মাতৃভাষীর কাছাকাছি নিখুঁততা, বাগধারা, ব্যঙ্গ, আনুষ্ঠানিকতার পরিবর্তন এবং সাহিত্যিক ও বিশেষায়িত লেখার শব্দভাণ্ডার। এই তালিকা এখনো লেখা হচ্ছে। এটি এখনো পড়ার জন্য খোলা নয়, এবং শেষ দেখানো না বলে আমরা স্পষ্ট করে বলে দিচ্ছি।",
    topics: [],
  },
};

export function isKnownLevel(value: string): value is LevelCode {
  return (VALID_LEVELS as readonly string[]).includes(value.toUpperCase());
}

export function getLevelMeta(level: string): LevelMeta | null {
  const upper = level.toUpperCase();
  return isKnownLevel(upper) ? LEVEL_META[upper] : null;
}

/** A level is study-ready once it holds a usable number of entries. */
export function isLevelLive(wordCount: number): boolean {
  return wordCount >= MIN_LIVE_LEVEL_WORDS;
}

/** `A1 ইংরেজি শব্দভাণ্ডার (924টি শব্দ)` */
export function levelH1(level: string, wordCount: number): { en: string; bn: string } {
  const meta = getLevelMeta(level);
  if (!meta) return { en: level, bn: level };
  const count = wordCount.toLocaleString("en-US");
  return {
    en: `${meta.h1En} (${count} words)`,
    bn: `${meta.h1Bn} (${count}টি শব্দ)`,
  };
}

/** Under 160 characters so the SERP does not truncate it mid-phrase. */
export function levelMetaDescription(level: string, wordCount: number): string {
  const meta = getLevelMeta(level);
  if (!meta) return "";
  const count = wordCount.toLocaleString("en-US");
  const topics = meta.topics.slice(0, 3).map((t) => t.en.toLowerCase());

  if (topics.length === 0) {
    return `The Zero English ${level} list is still being written. ${count} entries so far; it is marked noindex until it is ready to study.`;
  }

  return `${level} (${meta.label}) English vocabulary with Bangla meanings: ${count} words covering ${topics.join(", ")}. Each entry has a Bangla meaning, English definition, examples, synonyms and antonyms.`;
}
