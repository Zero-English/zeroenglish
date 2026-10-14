export interface SectionGoldenRuleExample {
  word: string;
  badgeEn: string;
  badgeBn: string;
  sentence: string;
  explanationEn: string;
  explanationBn: string;
}

export interface SectionGoldenRule {
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  examples: SectionGoldenRuleExample[];
  proTipEn?: string;
  proTipBn?: string;
}

export interface SectionCoreRole {
  number: number;
  titleEn: string;
  titleBn: string;
  badges: string[];
  descriptionEn: string;
  descriptionBn: string;
  examples: string;
}

export interface SectionAnatomyToken {
  word: string;
  tag: string;
  color?: string;
}

export interface SectionSentenceAnatomy {
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  tokens: SectionAnatomyToken[];
  translationEn: string;
  translationBn: string;
}

export interface SectionLearningGuide {
  goldenRule?: SectionGoldenRule;
  coreRoles?: SectionCoreRole[];
  sentenceAnatomy?: SectionSentenceAnatomy;
}

export interface GrammarSection {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: string;
  status: "available" | "coming-soon";
  categoryCount?: number;
  ruleCount?: number;
  badgeText?: string;
  hasLearningGuide?: boolean;
  learningGuide?: SectionLearningGuide;
}

export interface GrammarCategory {
  id: string;
  slug: string;
  sectionId: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: string;
  order: number;
  ruleCount: number;
  levels: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  accentColor: string;
}

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface GrammarKeyRule {
  ruleEn: string;
  ruleBn: string;
  detailsEn?: string;
  detailsBn?: string;
  exampleEn?: string;
  exampleBn?: string;
}

export interface GrammarExample {
  id: string;
  sentenceEn: string;
  sentenceBn: string;
  highlights: string[];
  badge?: string;
  noteEn?: string;
  noteBn?: string;
}

export interface GrammarComparison {
  id: string;
  correct: string;
  incorrect: string;
  explanationEn: string;
  explanationBn: string;
}

export interface GrammarMistake {
  id: string;
  mistakeEn: string;
  mistakeBn: string;
  whyEn: string;
  whyBn: string;
  correctionEn: string;
  correctionBn: string;
}

export interface GrammarRule {
  id: string;
  slug: string;
  sectionSlug?: string;
  categoryId: string;
  categorySlug: string;
  titleEn: string;
  titleBn: string;
  shortDescriptionEn: string;
  shortDescriptionBn: string;
  difficulty: DifficultyLevel;
  order: number;
  estimatedMinutes: number;
  introduction: {
    en: string;
    bn: string;
  };
  explanation: {
    summaryEn: string;
    summaryBn: string;
    formulaOrPattern?: string;
    keyRules: GrammarKeyRule[];
  };
  examples: GrammarExample[];
  comparisons: GrammarComparison[];
  commonMistakes: GrammarMistake[];
  prerequisiteRuleIds: string[];
  relatedRuleIds: string[];
}

export const GRAMMAR_SECTIONS: GrammarSection[] = [
  {
    id: "parts-of-speech",
    slug: "parts-of-speech",
    titleEn: "Parts of Speech",
    titleBn: "পদ প্রকরণ (Parts of Speech)",
    descriptionEn: "The fundamental building blocks of English grammar. Learn the 8 core word classes that form every English sentence.",
    descriptionBn: "ইংরেজি ব্যাকরণের মূল ভিত্তি। বাক্যে ব্যবহৃত ৮ প্রকার পদ বা শব্দের শ্রেণিবিভাগ বিস্তারিত শিখুন।",
    icon: "Layers",
    status: "available",
    categoryCount: 8,
    ruleCount: 26,
    badgeText: "Core Foundation",
  },
  {
    id: "tenses",
    slug: "tenses",
    titleEn: "Tenses & Time",
    titleBn: "কাল ও সময় (Tenses)",
    descriptionEn: "Master all 12 tenses with real-life timeline visuals, formula patterns, and usage guidelines.",
    descriptionBn: "১২টি টেন্সের গঠন, সময়রেখা এবং বাস্তব জীবনে সঠিক প্রয়োগের নিয়মাবলি।",
    icon: "Clock",
    status: "coming-soon",
    categoryCount: 3,
    ruleCount: 12,
    badgeText: "Coming Soon",
  },
  {
    id: "articles-determiners",
    slug: "articles-determiners",
    titleEn: "Articles & Determiners",
    titleBn: "আর্টিকেল ও ডিটারমাইনার",
    descriptionEn: "Understand exact rules for A, An, The, along with quantifiers and demonstratives.",
    descriptionBn: "A, An, The এর সঠিক ব্যবহার এবং বিভিন্ন নির্দেশক শব্দের কার্যকর নিয়ম।",
    icon: "BookOpenCheck",
    status: "coming-soon",
    categoryCount: 4,
    ruleCount: 14,
    badgeText: "Coming Soon",
  },
  {
    id: "sentence-structure",
    slug: "sentence-structure",
    titleEn: "Sentence Structure",
    titleBn: "বাক্যের গঠন ও রূপান্তর",
    descriptionEn: "Simple, compound, complex sentences, clauses, phrases, and word order mechanics.",
    descriptionBn: "সরল, যৌগিক ও জটিল বাক্য তৈরি, ক্লজ এবং ফ্রেজের নির্ভুল প্রয়োগ।",
    icon: "Split",
    status: "coming-soon",
    categoryCount: 5,
    ruleCount: 18,
    badgeText: "Coming Soon",
  },
  {
    id: "punctuation",
    slug: "punctuation",
    titleEn: "Punctuation & Mechanics",
    titleBn: "যতিচিহ্ন ও ক্যাপিটালাইজেশন",
    descriptionEn: "Commas, semicolons, apostrophes, quotation marks, and stylistic capitalization rules.",
    descriptionBn: "কমা, সেমিকোলন, উদ্ধৃতি চিহ্ন ও ক্যাপিটাল অক্ষরের নির্ভুল ব্যবহার নির্দেশিকা।",
    icon: "FileText",
    status: "coming-soon",
    categoryCount: 4,
    ruleCount: 10,
    badgeText: "Coming Soon",
  },
];

export const GRAMMAR_CATEGORIES: GrammarCategory[] = [
  {
    id: "noun",
    slug: "noun",
    sectionId: "parts-of-speech",
    titleEn: "Noun",
    titleBn: "Noun (বিশেষ্য)",
    descriptionEn: "Words identifying people, places, things, concepts, and ideas.",
    descriptionBn: "যে শব্দ দ্বারা কোনো ব্যক্তি, স্থান, বস্তু, গুণ বা ধারণার নাম বোঝায়।",
    icon: "User",
    order: 1,
    ruleCount: 6,
    levels: { beginner: 3, intermediate: 2, advanced: 1 },
    accentColor: "blue",
  },
  {
    id: "pronoun",
    slug: "pronoun",
    sectionId: "parts-of-speech",
    titleEn: "Pronoun",
    titleBn: "Pronoun (সর্বনাম)",
    descriptionEn: "Words used in place of nouns to avoid repetition and add clarity.",
    descriptionBn: "বিশেষ্যের পুনরাবৃত্তি এড়াতে তার পরিবর্তে ব্যবহৃত শব্দ।",
    icon: "Users",
    order: 2,
    ruleCount: 4,
    levels: { beginner: 2, intermediate: 2, advanced: 0 },
    accentColor: "emerald",
  },
  {
    id: "adjective",
    slug: "adjective",
    sectionId: "parts-of-speech",
    titleEn: "Adjective",
    titleBn: "Adjective (বিশেষণ)",
    descriptionEn: "Words that describe, quantify, or qualify nouns and pronouns.",
    descriptionBn: "যে শব্দ বিশেষ্য বা সর্বনামের দোষ, গুণ, অবস্থা বা পরিমাণ প্রকাশ করে।",
    icon: "Sparkles",
    order: 3,
    ruleCount: 3,
    levels: { beginner: 1, intermediate: 1, advanced: 1 },
    accentColor: "amber",
  },
  {
    id: "verb",
    slug: "verb",
    sectionId: "parts-of-speech",
    titleEn: "Verb",
    titleBn: "Verb (ক্রিয়া)",
    descriptionEn: "Words expressing action, occurrence, existence, or state of being.",
    descriptionBn: "যে শব্দ দ্বারা কোনো কাজ করা, হওয়া, থাকা বা ঘটা বোঝায়।",
    icon: "Zap",
    order: 4,
    ruleCount: 4,
    levels: { beginner: 2, intermediate: 1, advanced: 1 },
    accentColor: "rose",
  },
  {
    id: "adverb",
    slug: "adverb",
    sectionId: "parts-of-speech",
    titleEn: "Adverb",
    titleBn: "Adverb (ক্রিয়া বিশেষণ)",
    descriptionEn: "Words modifying verbs, adjectives, or other adverbs.",
    descriptionBn: "যে শব্দ ক্রিয়া, বিশেষণ বা অন্য কোনো ক্রিয়া বিশেষণের মাত্রা বা বৈশিষ্ট্য নির্দেশ করে।",
    icon: "Sliders",
    order: 5,
    ruleCount: 2,
    levels: { beginner: 1, intermediate: 1, advanced: 0 },
    accentColor: "violet",
  },
  {
    id: "preposition",
    slug: "preposition",
    sectionId: "parts-of-speech",
    titleEn: "Preposition",
    titleBn: "Preposition (পদান্বয়ী অব্যয়)",
    descriptionEn: "Words showing relationships between nouns and other words.",
    descriptionBn: "যে শব্দ বিশেষ্যের পূর্বে বসে বাক্যের অন্যান্য শব্দের সাথে সম্পর্ক স্থাপন করে।",
    icon: "Compass",
    order: 6,
    ruleCount: 3,
    levels: { beginner: 1, intermediate: 1, advanced: 1 },
    accentColor: "cyan",
  },
  {
    id: "conjunction",
    slug: "conjunction",
    sectionId: "parts-of-speech",
    titleEn: "Conjunction",
    titleBn: "Conjunction (সংযোজক অব্যয়)",
    descriptionEn: "Words connecting words, phrases, clauses, or sentences together.",
    descriptionBn: "শব্দ, বাক্যাংশ বা বাক্যকে পরস্পর যুক্ত করার শব্দ।",
    icon: "Link2",
    order: 7,
    ruleCount: 3,
    levels: { beginner: 1, intermediate: 2, advanced: 0 },
    accentColor: "orange",
  },
  {
    id: "interjection",
    slug: "interjection",
    sectionId: "parts-of-speech",
    titleEn: "Interjection",
    titleBn: "Interjection (আবেগসূচক অব্যয়)",
    descriptionEn: "Words or short exclamations expressing sudden emotion or feeling.",
    descriptionBn: "আকস্মিক অনুভূতি, আনন্দ, দুঃখ বা বিস্ময় প্রকাশে ব্যবহৃত শব্দ।",
    icon: "MessageCircleHeart",
    order: 8,
    ruleCount: 2,
    levels: { beginner: 2, intermediate: 0, advanced: 0 },
    accentColor: "pink",
  },
];
