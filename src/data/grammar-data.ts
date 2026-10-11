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

export const GRAMMAR_RULES: GrammarRule[] = [
  // ----------------------------------------------------
  // NOUN RULES
  // ----------------------------------------------------
  {
    id: "noun-basics",
    slug: "common-and-proper-nouns",
    categoryId: "noun",
    categorySlug: "noun",
    titleEn: "Common and Proper Nouns",
    titleBn: "সাধারণ ও নির্দিষ্ট নামবাচক বিশেষ্য",
    shortDescriptionEn: "Differentiate between general names and specific capitalized names.",
    shortDescriptionBn: "সাধারণ নাম (Common) ও নির্দিষ্ট ব্যক্তি বা স্থানের নাম (Proper) চেনার নিয়ম।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 5,
    introduction: {
      en: "Nouns are naming words. They are fundamentally split into common nouns (general class of things) and proper nouns (specific entities with mandatory capital letters).",
      bn: "Noun হলো কোনো কিছুর নাম। সাধারণ শ্রেণি বা জাতিকে Common Noun বলে এবং কোনো নির্দিষ্ট ব্যক্তি, স্থান বা প্রতিষ্ঠানের নামকে Proper Noun বলা হয়, যা সর্বদা Capital Letter দিয়ে শুরু হয়।",
    },
    explanation: {
      summaryEn: "Proper nouns always begin with a capital letter regardless of where they appear in a sentence, whereas common nouns are capitalized only at sentence start.",
      summaryBn: "Proper Noun বাক্যের যেখানেই বসুক না কেন, প্রথম অক্ষরটি বড় হাতের (Capital) হবে। অন্যদিকে Common Noun শুধুমাত্র বাক্যের শুরুতে ক্যাপিটাল হয়।",
      formulaOrPattern: "Proper Noun = Specific [Capitalized] | Common Noun = Generic [Lower-case]",
      keyRules: [
        {
          ruleEn: "Always capitalize proper names of people, cities, countries, days, and months.",
          ruleBn: "মানুষ, শহর, দেশ, দিন এবং মাসের নামের প্রথম অক্ষর সর্বদা ক্যাপিটাল হয়।",
          exampleEn: "Dhaka, Bangladesh, Sarah, Friday, January",
          exampleBn: "ঢাকা, বাংলাদেশ, সারা, শুক্রবার, জানুয়ারি",
        },
        {
          ruleEn: "Common nouns do not use capital letters unless they begin a sentence.",
          ruleBn: "বাক্যের শুরুতে না থাকলে Common Noun-এ ক্যাপিটাল লেটার হয় না।",
          exampleEn: "The city is crowded. / She is an intelligent student.",
          exampleBn: "শহরটি জনবহুল। / সে একজন বুদ্ধিমান শিক্ষার্থী।",
        },
      ],
    },
    examples: [
      {
        id: "ex-noun-1",
        sentenceEn: "Rakib traveled to London last summer.",
        sentenceBn: "রাকিব গত গ্রীষ্মে লন্ডনে ভ্রমণ করেছিল।",
        highlights: ["Rakib", "London"],
        badge: "Proper Noun",
        noteEn: "'Rakib' is a specific person, and 'London' is a specific city.",
        noteBn: "'Rakib' নির্দিষ্ট ব্যক্তি এবং 'London' নির্দিষ্ট শহরের নাম।",
      },
      {
        id: "ex-noun-2",
        sentenceEn: "The teacher entered the quiet classroom.",
        sentenceBn: "শিক্ষক শান্ত শ্রেণিকক্ষে প্রবেশ করলেন।",
        highlights: ["teacher", "classroom"],
        badge: "Common Noun",
        noteEn: "'teacher' and 'classroom' refer to general categories.",
        noteBn: "'teacher' এবং 'classroom' সাধারণ শ্রেণির নাম।",
      },
    ],
    comparisons: [
      {
        id: "comp-noun-1",
        correct: "My brother lives in Paris.",
        incorrect: "My brother lives in paris.",
        explanationEn: "'Paris' is a proper noun (city name) and must be capitalized.",
        explanationBn: "'Paris' একটি নির্দিষ্ট শহরের নাম (Proper Noun), তাই প্রথম অক্ষর 'P' বড় হাতের হতে হবে।",
      },
      {
        id: "comp-noun-2",
        correct: "We will meet on Tuesday.",
        incorrect: "We will meet on tuesday.",
        explanationEn: "Days of the week are proper nouns and require capitalization.",
        explanationBn: "সপ্তাহের দিনের নাম Proper Noun, তাই 'Tuesday' ক্যাপিটালাইজড হবে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-noun-1",
        mistakeEn: "Capitalizing common seasons or school subjects randomly (e.g., 'I study English and Math in Spring').",
        mistakeBn: "সাধারণ ঋতু বা বিষয়ের নাম অযথা ক্যাপিটাল করা (যেমন 'Spring' লেখা)।",
        whyEn: "Seasons (spring, summer, autumn, winter) are common nouns and should remain lowercase.",
        whyBn: "ঋতুর নামগুলো Common Noun, তাই বাক্যের মাঝে এগুলো ছোট হাতের অক্ষরে লেখা উচিত (ব্যতিক্রম: ভাষার নাম যেমন English)।",
        correctionEn: "I study English and math in spring.",
        correctionBn: "I study English and math in spring.",
      },
    ],
    prerequisiteRuleIds: [],
    relatedRuleIds: ["noun-singular-plural", "noun-countable-uncountable", "pronoun-personal"],
  },
  {
    id: "noun-singular-plural",
    slug: "singular-and-plural-nouns",
    categoryId: "noun",
    categorySlug: "noun",
    titleEn: "Singular and Plural Nouns",
    titleBn: "একবচন ও বহুবচন বিশেষ্য",
    shortDescriptionEn: "Rules for converting nouns from one (singular) to more than one (plural).",
    shortDescriptionBn: "একবচন থেকে বহুবচনে রূপান্তরের নিয়মিত ও অনিয়মিত নিয়মাবলি।",
    difficulty: "Beginner",
    order: 2,
    estimatedMinutes: 6,
    introduction: {
      en: "Number indicates whether a noun refers to one item (singular) or multiple items (plural). While most nouns add -s or -es, irregular nouns follow special patterns.",
      bn: "একটি মাত্র ব্যক্তি বা বস্তুকে Singular (একবচন) এবং একের অধিককে Plural (বহুবচন) বলে। সাধারণত -s বা -es যুক্ত হলেও কিছু ব্যতিক্রমী Irregular রূপ রয়েছে।",
    },
    explanation: {
      summaryEn: "Add -s for standard nouns, -es for nouns ending in -s, -ss, -sh, -ch, -x, -z, and transform -y to -ies when preceded by a consonant.",
      summaryBn: "সাধারণ শব্দে -s, শেষ ধ্বনি s, sh, ch, x থাকলে -es এবং কনসোনেন্ট + y থাকলে y পরিবর্তিত হয়ে -ies হয়।",
      formulaOrPattern: "Singular + (-s / -es / -ies) = Regular Plural",
      keyRules: [
        {
          ruleEn: "Regular plural adds -s to base noun.",
          ruleBn: "সাধারণত একবচন শব্দের শেষে -s যোগ করে বহুবচন করা হয়।",
          exampleEn: "book → books, car → cars",
          exampleBn: "বই → বইগুলো, গাড়ি → গাড়িগুলো",
        },
        {
          ruleEn: "Nouns ending in -s, -ss, -sh, -ch, -x, -z take -es.",
          ruleBn: "শব্দের শেষে s, ss, sh, ch, x, z থাকলে -es যুক্ত হয়।",
          exampleEn: "box → boxes, bus → buses, match → matches",
          exampleBn: "বাক্স → বাক্সগুলো, বাস → বাসগুলো",
        },
        {
          ruleEn: "Irregular plurals change internal vowels or mutate completely.",
          ruleBn: "অনিয়মিত বিশেষ্য অভ্যন্তরীণ স্বরধ্বনি পরিবর্তনের মাধ্যমে বহুবচন হয়।",
          exampleEn: "child → children, man → men, tooth → teeth, mouse → mice",
          exampleBn: "শিশু → শিশুরা, পুরুষ → পুরুষরা, দাঁত → দাঁতগুলো",
        },
      ],
    },
    examples: [
      {
        id: "ex-pl-1",
        sentenceEn: "Three children were playing with colorful balloons.",
        sentenceBn: "তিনজন শিশু রঙিন বেলুন নিয়ে খেলা করছিল।",
        highlights: ["children", "balloons"],
        badge: "Plural Noun",
        noteEn: "'children' is an irregular plural of 'child'; 'balloons' is regular.",
        noteBn: "'children' হলো child-এর অনিয়মিত বহুবচন এবং 'balloons' নিয়মিত বহুবচন।",
      },
      {
        id: "ex-pl-2",
        sentenceEn: "The city has two major airports.",
        sentenceBn: "শহরটিতে দুটি প্রধান বিমানবন্দর রয়েছে।",
        highlights: ["airports"],
        badge: "Regular Plural",
        noteEn: "'airports' takes standard -s plural suffix.",
        noteBn: "'airports' শব্দে -s যোগ করে বহুবচন করা হয়েছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-pl-1",
        correct: "The women discussed their ideas.",
        incorrect: "The womans discussed their ideas.",
        explanationEn: "'Woman' is irregular; its plural is 'women', never 'womans'.",
        explanationBn: "'Woman'-এর বহুবচন হলো 'women', 'womans' ব্যাকরণগতভাবে ভুল।",
      },
      {
        id: "comp-pl-2",
        correct: "He brushed his teeth before sleeping.",
        incorrect: "He brushed his tooths before sleeping.",
        explanationEn: "Plural of 'tooth' is 'teeth'.",
        explanationBn: "'Tooth'-এর সঠিক বহুবচন 'teeth'।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-pl-1",
        mistakeEn: "Adding 's' to already plural irregular forms (e.g., 'childrens', 'peoples').",
        mistakeBn: "ইতিমধ্যে বহুবচন হওয়া অনিয়মিত শব্দে আবার 's' যোগ করা (যেমন 'childrens')।",
        whyEn: "'Children' is already plural. Adding an 's' creates an ungrammatical double plural.",
        whyBn: "'Children' নিজেই বহুবচন, তাই এর সাথে আর 's' যোগ করা যাবে না।",
        correctionEn: "The children enjoyed the museum tour.",
        correctionBn: "The children enjoyed the museum tour.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics"],
    relatedRuleIds: ["noun-countable-uncountable", "verb-subject-verb-agreement"],
  },
  {
    id: "noun-countable-uncountable",
    slug: "countable-and-uncountable-nouns",
    categoryId: "noun",
    categorySlug: "noun",
    titleEn: "Countable and Uncountable Nouns",
    titleBn: "গণনাযোগ্য ও অগণনাযোগ্য বিশেষ্য",
    shortDescriptionEn: "Learn how to use quantifiers with items you can count vs. substances/concepts you cannot.",
    shortDescriptionBn: "যেগুলো গোনা যায় (Countable) এবং গোনা যায় না (Uncountable) তাদের নিয়ম ও কোয়ান্টিফায়ার।",
    difficulty: "Intermediate",
    order: 3,
    estimatedMinutes: 7,
    introduction: {
      en: "Countable nouns are individual items that can be counted directly (one apple, two apples). Uncountable nouns are materials, concepts, or masses that cannot be counted directly (water, information, advice).",
      bn: "Countable Noun হলো যা সংখ্যা দিয়ে গণনা করা যায়। Uncountable Noun হলো তরল পদার্থ, ধাতু, মানসিক অনুভূতি বা অবস্তুগত বিষয় যা সরাসরি সংখ্যা দিয়ে গোনা যায় না।",
    },
    explanation: {
      summaryEn: "Countable nouns have singular and plural forms and can take 'a/an/many/few'. Uncountable nouns have no plural form and use 'much/little/some'.",
      summaryBn: "Countable Noun-এ 'a/an', 'many', 'few' বসে এবং বহুবচন হয়। Uncountable Noun-এ 'much', 'little' বসে এবং কখনোই বহুবচন (-s/-es) হয় না।",
      formulaOrPattern: "Countable: a/an, many, few + [Plural Noun] | Uncountable: much, little, some + [Singular Noun]",
      keyRules: [
        {
          ruleEn: "Uncountable nouns do NOT take 'a' or 'an' directly and never take plural -s.",
          ruleBn: "Uncountable Noun-এর পূর্বে সরাসরি 'a/an' বসে না এবং এর সাথে 's/es' যোগ করা যায় না।",
          exampleEn: "water (NOT a water), advice (NOT advices)",
          exampleBn: "পানি (a water নয়), উপদেশ (advices নয়)",
        },
        {
          ruleEn: "Use partitive expressions to measure uncountables.",
          ruleBn: "Uncountable Noun পরিমাপ করতে 'a piece of', 'a bottle of' ইত্যাদি ব্যবহৃত হয়।",
          exampleEn: "a piece of advice, two cups of tea, three slices of bread",
          exampleBn: "একটি উপদেশ, দুই কাপ চা, তিন টুকরো রুটি",
        },
      ],
    },
    examples: [
      {
        id: "ex-count-1",
        sentenceEn: "She gave me valuable advice during the meeting.",
        sentenceBn: "তিনি মিটিং চলাকালীন আমাকে মূল্যবান উপদেশ দিয়েছিলেন।",
        highlights: ["valuable advice"],
        badge: "Uncountable Noun",
        noteEn: "'advice' cannot be made plural as 'advices'.",
        noteBn: "'advice' একটি Uncountable noun, তাই এর বহুবচন হয় না।",
      },
      {
        id: "ex-count-2",
        sentenceEn: "We bought five fresh oranges from the market.",
        sentenceBn: "আমরা বাজার থেকে পাঁচটি তাজা কমলা কিনেছিলাম।",
        highlights: ["five fresh oranges"],
        badge: "Countable Noun",
        noteEn: "'oranges' are distinct countable units.",
        noteBn: "'oranges' সরাসরি গণনাযোগ্য।",
      },
    ],
    comparisons: [
      {
        id: "comp-count-1",
        correct: "I need some information about the exam.",
        incorrect: "I need some informations about the exam.",
        explanationEn: "'Information' is strictly uncountable in English.",
        explanationBn: "ইংরেজিতে 'Information' সর্বদা Uncountable, তাই 'informations' লেখা ভুল।",
      },
      {
        id: "comp-count-2",
        correct: "How much luggage do you have?",
        incorrect: "How many luggages do you have?",
        explanationEn: "'Luggage' is uncountable; use 'much' instead of 'many'.",
        explanationBn: "'Luggage' হলো Uncountable Noun; তাই 'many' ও 'luggages' ভুল।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-count-1",
        mistakeEn: "Saying 'a good furniture' or 'furnitures'.",
        mistakeBn: "'a good furniture' বা 'furnitures' বলা।",
        whyEn: "'Furniture' is uncountable. Use 'a piece of furniture' or 'some furniture'.",
        whyBn: "'Furniture' একটি সমষ্টিগত বস্তুবাচক শব্দ যা Uncountable।",
        correctionEn: "We ordered three pieces of furniture for the new office.",
        correctionBn: "We ordered three pieces of furniture for the new office.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics", "noun-singular-plural"],
    relatedRuleIds: ["adjective-types", "noun-concrete-abstract"],
  },
  {
    id: "noun-concrete-abstract",
    slug: "concrete-and-abstract-nouns",
    categoryId: "noun",
    categorySlug: "noun",
    titleEn: "Concrete and Abstract Nouns",
    titleBn: "মূর্ত ও ভাববাচক বিশেষ্য",
    shortDescriptionEn: "Distinguish between tangible physical objects and intangible thoughts or feelings.",
    shortDescriptionBn: "ইন্দ্রিয়গ্রাহ্য বস্তু (Concrete) এবং অদৃশ্য অনুভূতি বা ধারণার (Abstract) পার্থক্য।",
    difficulty: "Beginner",
    order: 4,
    estimatedMinutes: 5,
    introduction: {
      en: "Concrete nouns refer to things perceived by your five senses (sight, sound, smell, taste, touch). Abstract nouns refer to intangible concepts, feelings, qualities, or ideas.",
      bn: "পঞ্চইন্দ্রিয় দিয়ে যা অনুভব বা স্পর্শ করা যায় তাকে Concrete Noun বলে। আর যা শুধু উপলব্ধি করা যায় কিন্তু স্পর্শ করা যায় না তাকে Abstract Noun বলে।",
    },
    explanation: {
      summaryEn: "Concrete = physical matter (table, music, perfume). Abstract = qualities & ideas (courage, freedom, honesty).",
      summaryBn: "Concrete হলো বাস্তব দৃশ্যমান বস্তু (যেমন টেবিল, ফুল)। Abstract হলো মানবিক গুণ ও অবস্থা (যেমন সততা, সাহস, স্বাধীনতা)।",
      keyRules: [
        {
          ruleEn: "Abstract nouns are usually formed by adding suffixes like -tion, -ness, -ment, -ity, -ship.",
          ruleBn: "শব্দের শেষে -tion, -ness, -ment, -ity, -ship ইত্যাদি প্রত্যয় যুক্ত হয়ে Abstract Noun গঠিত হয়।",
          exampleEn: "kind → kindness, happy → happiness, judge → judgment",
          exampleBn: "দয়ালু → দয়া, সুখী → সুখ, বিচার করা → বিচার",
        },
      ],
    },
    examples: [
      {
        id: "ex-abs-1",
        sentenceEn: "Honesty is respected by everyone.",
        sentenceBn: "সততা সকলের দ্বারা সম্মানিত হয়।",
        highlights: ["Honesty"],
        badge: "Abstract Noun",
        noteEn: "'Honesty' is a moral quality that cannot be physically touched.",
        noteBn: "'Honesty' একটি চারিত্রিক গুণ যা ধরা বা ছোঁয়া যায় না।",
      },
    ],
    comparisons: [
      {
        id: "comp-abs-1",
        correct: "Her bravery inspired the team.",
        incorrect: "Her brave inspired the team.",
        explanationEn: "'Brave' is an adjective, whereas 'bravery' is the required abstract noun.",
        explanationBn: "'Brave' হলো বিশেষণ (Adjective), এখানে সাবজেক্ট হিসেবে Abstract Noun 'bravery' প্রয়োজন।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-abs-1",
        mistakeEn: "Confusing adjectives and abstract nouns (e.g. using 'wise' instead of 'wisdom').",
        mistakeBn: "Adjective ও Abstract Noun গুলিয়ে ফেলা।",
        whyEn: "Adjectives describe nouns; abstract nouns act as subjects/objects on their own.",
        whyBn: "Adjective বর্ণনা করে, আর Abstract Noun নিজেই একটি পদের নাম হিসেবে ব্যবহৃত হয়।",
        correctionEn: "His wisdom guided our decisions.",
        correctionBn: "His wisdom guided our decisions.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics"],
    relatedRuleIds: ["adjective-types"],
  },
  {
    id: "noun-collective",
    slug: "collective-nouns",
    categoryId: "noun",
    categorySlug: "noun",
    titleEn: "Collective Nouns",
    titleBn: "সমষ্টিবাচক বিশেষ্য",
    shortDescriptionEn: "Words referring to groups treated as a single unit or individuals.",
    shortDescriptionBn: "ব্যক্তি বা বস্তুর দলকে একত্রে বোঝায় এমন বিশেষ্য (যেমন team, flock, family)।",
    difficulty: "Intermediate",
    order: 5,
    estimatedMinutes: 6,
    introduction: {
      en: "A collective noun denotes a group of people, animals, or items functioning as a single collective entity.",
      bn: "যে Noun দিয়ে একজাতীয় কোনো ব্যক্তি বা বস্তুকে পৃথকভাবে না বুঝিয়ে তাদের অবিভক্ত সমষ্টিকে বোঝায়, তাকে Collective Noun বলে।",
    },
    explanation: {
      summaryEn: "In standard American/International English, collective nouns take singular verbs when acting as a unified whole.",
      summaryBn: "সমষ্টিবাচক বিশেষ্য যখন একক দল হিসেবে কাজ করে তখন Singular Verb গ্রহণ করে।",
      formulaOrPattern: "Collective Group (Single Unit) + Singular Verb",
      keyRules: [
        {
          ruleEn: "Common collective groups: army, audience, committee, family, flock, herd, team.",
          ruleBn: "বহুল ব্যবহৃত সমষ্টিবাচক শব্দ: team, audience, committee, flock, herd, jury।",
          exampleEn: "A flock of birds, a team of doctors, a bouquet of flowers",
          exampleBn: "একঝাঁক পাখি, চিকিৎসকদের একটি দল, এক তোড়া ফুল",
        },
      ],
    },
    examples: [
      {
        id: "ex-col-1",
        sentenceEn: "The committee has reached an unanimous decision.",
        sentenceBn: "কমিটি সর্বসম্মত সিদ্ধান্তে পৌঁছেছে।",
        highlights: ["committee", "has reached"],
        badge: "Collective Noun",
        noteEn: "'Committee' acts as one unified body, so it takes the singular verb 'has'.",
        noteBn: "'Committee' একক দল হিসেবে কাজ করায় 'has' বসেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-col-1",
        correct: "The audience is clapping enthusiastically.",
        incorrect: "The audience are clapping enthusiastically.",
        explanationEn: "'Audience' is treated as a single unit with the singular verb 'is'.",
        explanationBn: "'Audience' একক সত্তা হিসেবে বিবেচিত হওয়ায় 'is' ব্যবহৃত হবে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-col-1",
        mistakeEn: "Automatically using plural verbs after collective terms.",
        mistakeBn: "Collective Noun দেখলেই বহুবচনের verb বসিয়ে ফেলা।",
        whyEn: "Unless the group members are acting in division, collective nouns take singular agreement.",
        whyBn: "দলের সদস্যরা ভিন্ন ভিন্ন মত প্রকাশ না করলে সাধারণত Singular verb বসে।",
        correctionEn: "Our football team is ready for the tournament.",
        correctionBn: "Our football team is ready for the tournament.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics"],
    relatedRuleIds: ["verb-subject-verb-agreement"],
  },
  {
    id: "noun-possessive",
    slug: "possessive-nouns",
    categoryId: "noun",
    categorySlug: "noun",
    titleEn: "Possessive Nouns",
    titleBn: "অধিকারবোধক বিশেষ্য",
    shortDescriptionEn: "Use apostrophes to show ownership, relationship, or origin.",
    shortDescriptionBn: "মালিকানা বা সম্পর্ক বোঝাতে অ্যাপোস্ট্রফি ('s) ব্যবহারের সঠিক নিয়ম।",
    difficulty: "Intermediate",
    order: 6,
    estimatedMinutes: 5,
    introduction: {
      en: "Possessive nouns demonstrate ownership or close relationship using an apostrophe and the letter 's' ('s or s').",
      bn: "কোনো ব্যক্তি বা প্রাণীর মালিকানা বা কারো অধিকার বোঝাতে Noun-এর সাথে অ্যাপোস্ট্রফি 's' যুক্ত করা হয়।",
    },
    explanation: {
      summaryEn: "Singular nouns add 's. Plural nouns ending in -s add only an apostrophe ('). Plural nouns not ending in -s add 's.",
      summaryBn: "Singular Noun-এ 's যোগ হয়। -s দিয়ে শেষ হওয়া Plural Noun-এ শুধুমাত্র অ্যাপোস্ট্রফি (') বসে।",
      formulaOrPattern: "Singular: Name + 's | Plural in -s: Names + ' | Irregular Plural: Plural + 's",
      keyRules: [
        {
          ruleEn: "Singular owner: add 's (The cat's tail).",
          ruleBn: "একবচন মালিক: 's যুক্ত হবে।",
          exampleEn: "Sarah's computer, the boy's toy",
          exampleBn: "সারার কম্পিউটার, ছেলেটির খেলনা",
        },
        {
          ruleEn: "Plural owner ending in -s: add only apostrophe (The students' books).",
          ruleBn: "বহুবচন মালিক (শেষে s থাকলে): শুধু ' বসবে।",
          exampleEn: "The teachers' lounge, the dogs' collars",
          exampleBn: "শিক্ষকদের লাউঞ্জ, কুকুরদের কলার",
        },
      ],
    },
    examples: [
      {
        id: "ex-pos-1",
        sentenceEn: "We celebrated the children's victory.",
        sentenceBn: "আমরা শিশুদের বিজয় উদযাপন করেছিলাম।",
        highlights: ["children's victory"],
        badge: "Irregular Possessive",
        noteEn: "'children' does not end in 's', so it takes 's for possession.",
        noteBn: "'children' বহুবচন হলেও শেষে 's' না থাকায় 's যুক্ত হয়েছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-pos-1",
        correct: "The girls' school is near the park.",
        incorrect: "The girl's school is near the park. (when referring to multiple girls)",
        explanationEn: "Place the apostrophe after 's' when referring to multiple girls.",
        explanationBn: "বহু মেয়ের স্কুল বোঝাতে 'girls' ' হবে, 'girl's' নয়।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-pos-1",
        mistakeEn: "Confusing possessive 'its' with contraction 'it's'.",
        mistakeBn: "'its' এবং 'it's' গুলিয়ে ফেলা।",
        whyEn: "'Its' is possessive (no apostrophe). 'It's' is short for 'it is'.",
        whyBn: "'Its' হলো মালিকানাসূচক। 'It's' মানে হলো 'It is'।",
        correctionEn: "The dog wagged its tail happily.",
        correctionBn: "The dog wagged its tail happily.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics", "noun-singular-plural"],
    relatedRuleIds: ["pronoun-possessive"],
  },

  // ----------------------------------------------------
  // PRONOUN RULES
  // ----------------------------------------------------
  {
    id: "pronoun-personal",
    slug: "personal-pronouns",
    categoryId: "pronoun",
    categorySlug: "pronoun",
    titleEn: "Personal Pronouns: Subject & Object",
    titleBn: "ব্যক্তিবাচক সর্বনাম: Subject ও Object রূপ",
    shortDescriptionEn: "Master subject pronouns (I, he, she) vs. object pronouns (me, him, her).",
    shortDescriptionBn: "কর্তা হিসেবে Subject Pronoun এবং কর্ম হিসেবে Object Pronoun-এর সঠিক প্রয়োগ।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 6,
    introduction: {
      en: "Personal pronouns replace specific people or things. Their form changes depending on whether they act as the subject (doing the action) or object (receiving the action).",
      bn: "ব্যক্তিবাচক সর্বনাম কোনো নির্দিষ্ট ব্যক্তি বা বস্তুর পরিবর্তে বসে। বাক্যে এরা কর্তা (Subject) নাকি কর্ম (Object) হিসেবে কাজ করছে তার ওপর ভিত্তি করে এদের রূপ পরিবর্তিত হয়।",
    },
    explanation: {
      summaryEn: "Subject pronouns: I, you, he, she, it, we, they. Object pronouns: me, you, him, her, it, us, them.",
      summaryBn: "Subject রূপ: I, you, he, she, it, we, they। Object রূপ: me, you, him, her, it, us, them।",
      formulaOrPattern: "[Subject Pronoun] + Verb + [Object Pronoun]",
      keyRules: [
        {
          ruleEn: "Use subject pronouns before verbs as the performer of the action.",
          ruleBn: "ক্রিয়ার পূর্বে কর্তা হিসেবে Subject pronoun বসে।",
          exampleEn: "She called me yesterday.",
          exampleBn: "সে গতকাল আমাকে ফোন করেছিল।",
        },
        {
          ruleEn: "Use object pronouns after verbs or prepositions.",
          ruleBn: "ক্রিয়ার পরে বা Preposition-এর পরে Object pronoun বসে।",
          exampleEn: "Listen to him. / Give the book to us.",
          exampleBn: "তার কথা শোনো। / বইটি আমাদের দাও।",
        },
      ],
    },
    examples: [
      {
        id: "ex-pro-1",
        sentenceEn: "Hasan and I prepared the presentation for them.",
        sentenceBn: "হাসান এবং আমি তাদের জন্য প্রেজেন্টেশন প্রস্তুত করেছিলাম।",
        highlights: ["Hasan and I", "them"],
        badge: "Subject & Object",
        noteEn: "'I' is part of the subject; 'them' is the object of preposition 'for'.",
        noteBn: "'I' কর্তার অংশ এবং 'them' হলো 'for' প্রেপজিশনের অবজেক্ট।",
      },
    ],
    comparisons: [
      {
        id: "comp-pro-1",
        correct: "Between you and me, this project is exciting.",
        incorrect: "Between you and I, this project is exciting.",
        explanationEn: "'Between' is a preposition, so it requires object pronoun 'me'.",
        explanationBn: "'Between' একটি Preposition, তাই এরপরে Object Pronoun 'me' বসবে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-pro-1",
        mistakeEn: "Saying 'Me and my friend went to the market.'",
        mistakeBn: "'Me and my friend went...' এভাবে বাক্য শুরু করা।",
        whyEn: "'Me' cannot serve as the grammatical subject of a sentence.",
        whyBn: "'Me' অবজেক্ট রূপ, তাই এটি বাক্যের সাবজেক্ট হতে পারে না। 'My friend and I' বলা শিষ্টাচার ও ব্যাকরণসম্মত।",
        correctionEn: "My friend and I went to the market.",
        correctionBn: "My friend and I went to the market.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics"],
    relatedRuleIds: ["pronoun-possessive", "verb-subject-verb-agreement"],
  },
  {
    id: "pronoun-possessive",
    slug: "possessive-pronouns-and-adjectives",
    categoryId: "pronoun",
    categorySlug: "pronoun",
    titleEn: "Possessive Pronouns & Adjectives",
    titleBn: "অধিকারসূচক সর্বনাম ও বিশেষণ",
    shortDescriptionEn: "Differentiate between possessive adjectives (my, your) and possessive pronouns (mine, yours).",
    shortDescriptionBn: "My/Your (Adjective) বনাম Mine/Yours (Pronoun)-এর ব্যবহারের পার্থক্য।",
    difficulty: "Beginner",
    order: 2,
    estimatedMinutes: 5,
    introduction: {
      en: "Possessive adjectives modify a noun that follows (my pen), while possessive pronouns stand completely alone to replace the noun (mine).",
      bn: "Possessive Adjective সর্বদা Noun-এর পূর্বে বসে (যেমন my book)। আর Possessive Pronoun একা বসে এবং পূর্বে উল্লিখিত Noun-কে পুরোপুরি প্রতিস্থাপন করে (যেমন mine)।",
    },
    explanation: {
      summaryEn: "Adjectives: my, your, his, her, its, our, their + [Noun]. Pronouns: mine, yours, his, hers, ours, theirs (No following noun).",
      summaryBn: "Adjective রূপ: my, your, our, their ইত্যাদি + Noun। Pronoun রূপ: mine, yours, ours, theirs (পরে কোনো Noun বসে না)।",
      keyRules: [
        {
          ruleEn: "Possessive pronouns NEVER use apostrophes (yours, hers, theirs).",
          ruleBn: "Possessive pronoun-এ কখনোই অ্যাপোস্ট্রফি (') বসে না।",
          exampleEn: "This car is yours. (NOT your's)",
          exampleBn: "এই গাড়িটি তোমার।",
        },
      ],
    },
    examples: [
      {
        id: "ex-pospro-1",
        sentenceEn: "This laptop is mine, but that tablet is hers.",
        sentenceBn: "এই ল্যাপটপটি আমার, কিন্তু ওই ট্যাবলেটটি তার।",
        highlights: ["mine", "hers"],
        badge: "Possessive Pronoun",
        noteEn: "'mine' and 'hers' stand independently without repeating 'laptop' or 'tablet'.",
        noteBn: "'mine' ও 'hers' একা বসে মালিকানা নির্দেশ করছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-pospro-1",
        correct: "The responsibility is yours.",
        incorrect: "The responsibility is your's.",
        explanationEn: "Possessive pronouns do not contain apostrophes.",
        explanationBn: "Possessive pronoun-এ অ্যাপোস্ট্রফি হয় না।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-pospro-1",
        mistakeEn: "Writing 'your's' or 'their's' with an apostrophe.",
        mistakeBn: "'your's' বা 'their's' লিখে অ্যাপোস্ট্রফি দেওয়া।",
        whyEn: "These are already inherently possessive pronouns and do not follow noun possessive rules.",
        whyBn: "এগুলো স্বয়ংসম্পূর্ণ সর্বনাম, তাই এতে 's যুক্ত করার প্রয়োজন নেই।",
        correctionEn: "The prize is ours.",
        correctionBn: "The prize is ours.",
      },
    ],
    prerequisiteRuleIds: ["pronoun-personal", "noun-possessive"],
    relatedRuleIds: ["adjective-types"],
  },
  {
    id: "pronoun-relative",
    slug: "relative-pronouns",
    categoryId: "pronoun",
    categorySlug: "pronoun",
    titleEn: "Relative Pronouns: Who, Which, That",
    titleBn: "সম্বন্ধসূচক সর্বনাম: Who, Which, That",
    shortDescriptionEn: "Connect clauses using who (for people), which (for things), and that (for restrictive clauses).",
    shortDescriptionBn: "ব্যক্তি ও বস্তুর সাথে ক্লজ যুক্ত করার সম্বন্ধসূচক সর্বনামের নিয়ম।",
    difficulty: "Intermediate",
    order: 3,
    estimatedMinutes: 7,
    introduction: {
      en: "Relative pronouns connect a clause or phrase to a noun or pronoun. They provide essential or additional information about the antecedent.",
      bn: "Relative Pronoun পূর্ববর্তী কোনো Noun বা Pronoun (Antecedent)-এর ঠিক পরে বসে দুটি বাক্য বা ক্লজকে পরস্পরের সাথে যুক্ত করে।",
    },
    explanation: {
      summaryEn: "Use 'who/whom' for people, 'which' for animals and objects, and 'that' for essential restrictive clauses for both people and things.",
      summaryBn: "ব্যক্তির ক্ষেত্রে 'who/whom', বস্তু ও প্রাণীর ক্ষেত্রে 'which' এবং অপরিহার্য ক্লজে 'that' বসে।",
      keyRules: [
        {
          ruleEn: "'Who' refers to people as subject; 'whom' refers to people as object.",
          ruleBn: "কর্তা হিসেবে ব্যক্তির জন্য 'who' এবং কর্ম হিসেবে 'whom' ব্যবহৃত হয়।",
          exampleEn: "The doctor who treated me was very kind.",
          exampleBn: "যে ডাক্তার আমার চিকিৎসা করেছিলেন তিনি খুব দয়ালু ছিলেন।",
        },
      ],
    },
    examples: [
      {
        id: "ex-rel-1",
        sentenceEn: "The smartphone that I purchased yesterday has an incredible camera.",
        sentenceBn: "আমি গতকাল যে স্মার্টফোনটি কিনেছিলাম তার ক্যামেরা অসাধারণ।",
        highlights: ["that I purchased yesterday"],
        badge: "Relative Clause",
        noteEn: "'that' defines which smartphone is being discussed.",
        noteBn: "'that' নির্দেশ করছে কোন স্মার্টফোনের কথা বলা হচ্ছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-rel-1",
        correct: "The man who helped us is an engineer.",
        incorrect: "The man which helped us is an engineer.",
        explanationEn: "Use 'who' for people, not 'which'.",
        explanationBn: "মানুষের ক্ষেত্রে 'who' বসে, 'which' বসে না।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-rel-1",
        mistakeEn: "Using 'which' to refer to human beings.",
        mistakeBn: "মানুষ বোঝাতে 'which' ব্যবহার করা।",
        whyEn: "'Which' is reserved for inanimate items, ideas, and animals.",
        whyBn: "'Which' জড়বস্তু বা ইতর প্রাণীর ক্ষেত্রে প্রযোজ্য।",
        correctionEn: "The student who won the award received a scholarship.",
        correctionBn: "The student who won the award received a scholarship.",
      },
    ],
    prerequisiteRuleIds: ["pronoun-personal"],
    relatedRuleIds: ["conjunction-subordinating"],
  },
  {
    id: "pronoun-reflexive",
    slug: "reflexive-and-emphatic-pronouns",
    categoryId: "pronoun",
    categorySlug: "pronoun",
    titleEn: "Reflexive and Emphatic Pronouns",
    titleBn: "আত্মবাচক ও জোরপ্রকাশক সর্বনাম",
    shortDescriptionEn: "Correct usage of myself, himself, herself, and themselves.",
    shortDescriptionBn: "Myself, himself ইত্যাদি আত্মবাচক এবং জোরপ্রদানকারী সর্বনামের সঠিক ব্যবহার।",
    difficulty: "Intermediate",
    order: 4,
    estimatedMinutes: 5,
    introduction: {
      en: "Reflexive pronouns (ending in -self or -selves) are used when the subject and object of the sentence are the exact same person or entity.",
      bn: "যখন বাক্যের কর্তা (Subject) এবং কর্ম (Object) একই ব্যক্তি বা বস্তু হয়, তখন -self বা -selves যুক্ত Reflexive pronoun ব্যবহৃত হয়।",
    },
    explanation: {
      summaryEn: "Singular: myself, yourself, himself, herself, itself. Plural: ourselves, yourselves, themselves.",
      summaryBn: "একবচনে -self এবং বহুবচনে -selves যুক্ত হয়।",
      keyRules: [
        {
          ruleEn: "Do not use reflexive pronouns where a standard personal pronoun is required.",
          ruleBn: "সাধারণ Personal pronoun-এর জায়গায় জোর করে Reflexive pronoun ব্যবহার করবেন না।",
          exampleEn: "Please contact Sarah or me (NOT myself).",
          exampleBn: "দয়া করে সারা বা আমার সাথে যোগাযোগ করুন।",
        },
      ],
    },
    examples: [
      {
        id: "ex-ref-1",
        sentenceEn: "He taught himself how to write code.",
        sentenceBn: "তিনি নিজে নিজেই কোডিং শিখেছিলেন।",
        highlights: ["taught himself"],
        badge: "Reflexive Action",
        noteEn: "The subject 'He' and the recipient of teaching 'himself' are the same person.",
        noteBn: "কর্তা 'He' এবং শিক্ষার গ্রহীতা 'himself' একই ব্যক্তি।",
      },
    ],
    comparisons: [
      {
        id: "comp-ref-1",
        correct: "Please send the files to John and me.",
        incorrect: "Please send the files to John and myself.",
        explanationEn: "'Me' is the proper object of the preposition 'to'.",
        explanationBn: "'to' প্রেপজিশনের পরে স্বাভাবিক অবজেক্ট 'me' বসবে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-ref-1",
        mistakeEn: "Saying 'Myself is Rahat' as an introduction.",
        mistakeBn: "পরিচয় দিতে গিয়ে 'Myself is...' বলা।",
        whyEn: "'Myself' cannot function as the subject of a sentence.",
        whyBn: "'Myself' কখনোই সাবজেক্ট হতে পারে না। 'I am Rahat' বা 'My name is Rahat' বলা উচিত।",
        correctionEn: "I am Rahat, and I will be your instructor.",
        correctionBn: "I am Rahat, and I will be your instructor.",
      },
    ],
    prerequisiteRuleIds: ["pronoun-personal"],
    relatedRuleIds: ["verb-transitive-intransitive"],
  },

  // ----------------------------------------------------
  // ADJECTIVE RULES
  // ----------------------------------------------------
  {
    id: "adjective-types",
    slug: "descriptive-and-quantitative-adjectives",
    categoryId: "adjective",
    categorySlug: "adjective",
    titleEn: "Descriptive & Quantitative Adjectives",
    titleBn: "বর্ণনামূলক ও পরিমাণবাচক বিশেষণ",
    shortDescriptionEn: "Learn how adjectives modify nouns by describing qualities, colors, sizes, and quantities.",
    shortDescriptionBn: "বিশেষ্যের গুণ, অবস্থা, আকার ও পরিমাণ প্রকাশকারী বিশেষণের ব্যবহার।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 5,
    introduction: {
      en: "Adjectives describe, identify, or quantify nouns and pronouns to make meaning specific and vivid.",
      bn: "Adjective বিশেষ্য বা সর্বনামের বৈশিষ্ট্য, দোষ, গুণ, রং বা পরিমাণ সুস্পষ্টভাবে তুলে ধরে।",
    },
    explanation: {
      summaryEn: "Descriptive adjectives explain characteristics (beautiful, fast). Quantitative adjectives express amount (some, twenty, few).",
      summaryBn: "Descriptive Adjective রূপ ও গুণ বর্ণনা করে। Quantitative Adjective সংখ্যা বা পরিমাণ নির্দেশ করে।",
      keyRules: [
        {
          ruleEn: "Adjectives typically appear directly before the noun they modify.",
          ruleBn: "Adjective সাধারণত যে Noun-কে বর্ণনা করে তার ঠিক পূর্বে বসে।",
          exampleEn: "A bright morning, powerful engine",
          exampleBn: "উজ্জ্বল সকাল, শক্তিশালী ইঞ্জিন",
        },
      ],
    },
    examples: [
      {
        id: "ex-adj-1",
        sentenceEn: "We saw three enormous elephants in the safari.",
        sentenceBn: "আমরা সাফারিতে তিনটি বিশাল হাতি দেখেছিলাম।",
        highlights: ["three", "enormous"],
        badge: "Quantitative & Descriptive",
        noteEn: "'three' is quantitative; 'enormous' is descriptive.",
        noteBn: "'three' সংখ্যাবাচক এবং 'enormous' বর্ণনামূলক বিশেষণ।",
      },
    ],
    comparisons: [
      {
        id: "comp-adj-1",
        correct: "She wore a red dress.",
        incorrect: "She wore a dress red.",
        explanationEn: "In English, single-word adjectives precede the noun.",
        explanationBn: "ইংরেজিতে একক শব্দ বিশেষণ Noun-এর পূর্বে বসে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-adj-1",
        mistakeEn: "Pluralizing adjectives when modifying plural nouns (e.g., 'differents books').",
        mistakeBn: "Plural noun-এর সাথে Adjective-কেও Plural করে ফেলা।",
        whyEn: "English adjectives NEVER have plural forms.",
        whyBn: "ইংরেজিতে Adjective-এর কোনো বহুবচন (-s/-es) রূপ হয় না।",
        correctionEn: "They explored different ideas.",
        correctionBn: "They explored different ideas.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics"],
    relatedRuleIds: ["adjective-degrees", "adjective-order"],
  },
  {
    id: "adjective-degrees",
    slug: "degrees-of-comparison",
    categoryId: "adjective",
    categorySlug: "adjective",
    titleEn: "Degrees of Comparison",
    titleBn: "তুলনামূলক মাত্রা (Degrees of Comparison)",
    shortDescriptionEn: "Positive, Comparative (-er / more), and Superlative (-est / most) rules.",
    shortDescriptionBn: "Positive, Comparative এবং Superlative ডিগ্রির গঠন ও তুলনার নিয়মাবলি।",
    difficulty: "Intermediate",
    order: 2,
    estimatedMinutes: 6,
    introduction: {
      en: "Degrees of comparison are used to compare one or more persons or things. There are three degrees: Positive (base form), Comparative (comparing two), and Superlative (comparing three or more).",
      bn: "দুই বা ততোধিক ব্যক্তি বা বস্তুর মধ্যে তুলনা করতে Degree of Comparison ব্যবহৃত হয়। এর তিনটি রূপ: Positive, Comparative এবং Superlative।",
    },
    explanation: {
      summaryEn: "1-syllable words add -er/-est. Multi-syllable words use 'more' and 'most'. Irregular adjectives change completely (good → better → best).",
      summaryBn: "এক সিলেবল বিশিষ্ট শব্দে -er/-est যুক্ত হয়। একাধিক সিলেবলে 'more'/'most' বসে। কিছু অনিয়মিত রূপ পুরোপুরি পরিবর্তিত হয় (good → better → best)।",
      formulaOrPattern: "Comparative: Adj + -er / more + than | Superlative: the + Adj + -est / most + in/of",
      keyRules: [
        {
          ruleEn: "Always use 'than' after a comparative adjective.",
          ruleBn: "Comparative ডিগ্রির পরে সাধারণত 'than' বসে।",
          exampleEn: "This building is taller than that one.",
          exampleBn: "এই ভবনটি ওইটির চেয়ে উঁচু।",
        },
        {
          ruleEn: "Always use the definite article 'the' before a superlative adjective.",
          ruleBn: "Superlative ডিগ্রির পূর্বে সর্বদা 'the' বসে।",
          exampleEn: "Mount Everest is the highest peak in the world.",
          exampleBn: "মাউন্ট এভারেস্ট বিশ্বের সর্বোচ্চ শৃঙ্গ।",
        },
      ],
    },
    examples: [
      {
        id: "ex-deg-1",
        sentenceEn: "Tanvir is more energetic than his brother.",
        sentenceBn: "তানভীর তার ভাইয়ের চেয়ে বেশি কর্মচঞ্চল।",
        highlights: ["more energetic than"],
        badge: "Comparative Degree",
        noteEn: "Multi-syllable adjective 'energetic' takes 'more ... than'.",
        noteBn: "'energetic' বহু-সিলেবল শব্দ হওয়ায় 'more ... than' বসেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-deg-1",
        correct: "She is the smartest student in the class.",
        incorrect: "She is the most smartest student in the class.",
        explanationEn: "Do not use double superlatives ('most' + '-est').",
        explanationBn: "একসাথে 'most' এবং '-est' ব্যবহার করা মারাত্মক ভুল (Double Superlative)।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-deg-1",
        mistakeEn: "Using 'more better' or 'more easier'.",
        mistakeBn: "'more better' বা 'more easier' বলা।",
        whyEn: "'Better' is already comparative. Adding 'more' is redundant.",
        whyBn: "'Better' নিজেই Comparative রূপ, এর আগে আবার 'more' বসানো অর্থহীন।",
        correctionEn: "His health is much better today.",
        correctionBn: "His health is much better today.",
      },
    ],
    prerequisiteRuleIds: ["adjective-types"],
    relatedRuleIds: ["adverb-manner-place-time"],
  },
  {
    id: "adjective-order",
    slug: "order-of-adjectives",
    categoryId: "adjective",
    categorySlug: "adjective",
    titleEn: "Order of Adjectives in a Sentence",
    titleBn: "বাক্যে বিশেষণের সঠিক ক্রম (Royal Order)",
    shortDescriptionEn: "How to arrange multiple adjectives: Opinion, Size, Age, Shape, Color, Origin, Material, Purpose.",
    shortDescriptionBn: "একাধিক বিশেষণ একসাথে বসলে তাদের সঠিক ধারাবাহিকতা বা ক্রম (OSASCOMP)।",
    difficulty: "Advanced",
    order: 3,
    estimatedMinutes: 7,
    introduction: {
      en: "When two or more adjectives describe a single noun, they must follow a natural standard sequence known as the Royal Order of Adjectives.",
      bn: "একটি বিশেষ্যকে বর্ণনা করতে একাধিক বিশেষণ পাশাপাশি বসলে তাদের একটি নির্দিষ্ট নিয়ম মেনে সাজাতে হয়।",
    },
    explanation: {
      summaryEn: "OSASCOMP mnemonic: Opinion → Size → Age → Shape → Color → Origin → Material → Purpose + Noun.",
      summaryBn: "ক্রম: মতামত (Opinion) → আকার (Size) → বয়স (Age) → আকৃতি (Shape) → রং (Color) → উৎস (Origin) → উপাদান (Material) → উদ্দেশ্য (Purpose)।",
      formulaOrPattern: "Opinion > Size > Age > Shape > Color > Origin > Material > Purpose + [Noun]",
      keyRules: [
        {
          ruleEn: "Opinion always precedes factual physical attributes.",
          ruleBn: "ব্যক্তিগত মতামত (যেমন beautiful, lovely) বস্তুগত বৈশিষ্ট্যের পূর্বে বসে।",
          exampleEn: "A lovely antique wooden clock",
          exampleBn: "একটি চমৎকার প্রাচীন কাঠের ঘড়ি",
        },
      ],
    },
    examples: [
      {
        id: "ex-ord-1",
        sentenceEn: "She bought a beautiful small black Italian leather jacket.",
        sentenceBn: "তিনি একটি সুন্দর ছোট কালো ইতালীয় চামড়ার জ্যাকেট কিনেছিলেন।",
        highlights: ["beautiful small black Italian leather jacket"],
        badge: "Adjective Order",
        noteEn: "Order: Opinion (beautiful) → Size (small) → Color (black) → Origin (Italian) → Material (leather).",
        noteBn: "মতামত (beautiful) → আকার (small) → রং (black) → উৎস (Italian) → উপাদান (leather)।",
      },
    ],
    comparisons: [
      {
        id: "comp-ord-1",
        correct: "A comfortable large wooden chair.",
        incorrect: "A wooden comfortable large chair.",
        explanationEn: "Opinion and size come before material.",
        explanationBn: "উপাদান (wooden) সবার শেষে Noun-এর সাথে বসে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-ord-1",
        mistakeEn: "Putting origin or material before size and color.",
        mistakeBn: "উপাদান বা দেশের নাম আকার ও রঙের আগে বসানো।",
        whyEn: "Material is closest to the noun because it defines what the noun is made of.",
        whyBn: "উপাদান Noun-এর সবচেয়ে মৌলিক অংশ হওয়ায় তা Noun-এর ঠিক পূর্বে বসে।",
        correctionEn: "A sleek modern Japanese car.",
        correctionBn: "A sleek modern Japanese car.",
      },
    ],
    prerequisiteRuleIds: ["adjective-types"],
    relatedRuleIds: ["noun-basics"],
  },

  // ----------------------------------------------------
  // VERB RULES
  // ----------------------------------------------------
  {
    id: "verb-action-linking",
    slug: "action-verbs-vs-linking-verbs",
    categoryId: "verb",
    categorySlug: "verb",
    titleEn: "Action Verbs vs. Linking Verbs",
    titleBn: "কর্মক্রিয়া ও সংযোগকারী ক্রিয়া",
    shortDescriptionEn: "Differentiate between verbs that express physical action and verbs that connect subjects to descriptions.",
    shortDescriptionBn: "শারীরিক কাজ প্রকাশকারী Action Verb এবং অবস্থা সংযোগকারী Linking Verb-এর পার্থক্য।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 6,
    introduction: {
      en: "Verbs are the heart of every English sentence. Action verbs show what the subject does, while linking verbs connect the subject to a subject complement (state of being).",
      bn: "ক্রিয়া বাক্যের প্রধান স্তম্ভ। Action verb দ্বারা কোনো কাজ সম্পন্ন হওয়া বোঝায় এবং Linking verb সাবজেক্টের সাথে তার অবস্থা বা পরিচয় যুক্ত করে।",
    },
    explanation: {
      summaryEn: "Action verbs: run, write, build. Linking verbs: be (is/am/are/was/were), seem, become, feel, appear, taste, smell.",
      summaryBn: "Linking Verb-এর পর Adjective বা Noun Complement বসে (Adverb নয়)।",
      keyRules: [
        {
          ruleEn: "Linking verbs take adjectives as complements, not adverbs.",
          ruleBn: "Linking verb-এর পরে Adverb নয়, বরং Adjective বসে।",
          exampleEn: "The soup smells delicious (NOT deliciously).",
          exampleBn: "স্যুপটির ঘ্রাণ সুস্বাদু লাগছে।",
        },
      ],
    },
    examples: [
      {
        id: "ex-act-1",
        sentenceEn: "The chef cooked a spicy dinner.",
        sentenceBn: "শেফ ঝাল রাতের খাবার রান্না করেছিলেন।",
        highlights: ["cooked"],
        badge: "Action Verb",
        noteEn: "'cooked' is an action performed by the subject.",
        noteBn: "'cooked' একটি শারীরিক কর্মক্রিয়া।",
      },
      {
        id: "ex-act-2",
        sentenceEn: "The weather became cold overnight.",
        sentenceBn: "রাতারাতি আবহাওয়া ঠান্ডা হয়ে গেল।",
        highlights: ["became cold"],
        badge: "Linking Verb",
        noteEn: "'became' links 'weather' to the adjective complement 'cold'.",
        noteBn: "'became' সাবজেক্ট 'weather'-কে 'cold' বিশেষণের সাথে সংযুক্ত করেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-act-1",
        correct: "I feel bad about the delay.",
        incorrect: "I feel badly about the delay.",
        explanationEn: "'Feel' is a linking verb of sensation, so it takes the adjective 'bad'.",
        explanationBn: "'Feel' একটি Linking verb, তাই এরপরে Adjective 'bad' বসবে ('badly' নয়)।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-act-1",
        mistakeEn: "Using an adverb after sensory verbs like smell, taste, look, sound.",
        mistakeBn: "Smell, taste, sound ইত্যাদির পর Adverb বসানো।",
        whyEn: "These verbs function as linking verbs describing the subject's condition.",
        whyBn: "এসব ক্রিয়া সাবজেক্টের অবস্থা নির্দেশক Linking Verb হিসেবে কাজ করে।",
        correctionEn: "The music sounds great.",
        correctionBn: "The music sounds great.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics"],
    relatedRuleIds: ["adverb-manner-place-time", "adjective-types"],
  },
  {
    id: "verb-subject-verb-agreement",
    slug: "subject-verb-agreement",
    categoryId: "verb",
    categorySlug: "verb",
    titleEn: "Subject-Verb Agreement Fundamentals",
    titleBn: "কর্তা ও ক্রিয়ার সঙ্গতি (Subject-Verb Agreement)",
    shortDescriptionEn: "Singular subjects take singular verbs; plural subjects take plural verbs.",
    shortDescriptionBn: "একবচন কর্তায় একবচন ক্রিয়া এবং বহুবচন কর্তায় বহুবচন ক্রিয়ার আবশ্যিক নিয়ম।",
    difficulty: "Intermediate",
    order: 2,
    estimatedMinutes: 8,
    introduction: {
      en: "Subject-verb agreement is the foundational rule of English syntax: a verb must agree in number (singular or plural) and person with its grammatical subject.",
      bn: "Subject-Verb Agreement ইংরেজি ব্যাকরণের অন্যতম প্রধান নিয়ম: বাক্যের Subject একবচন হলে Verb-ও একবচন হবে, এবং Subject বহুবচন হলে Verb-ও বহুবচন হবে।",
    },
    explanation: {
      summaryEn: "In present simple tense, third-person singular subjects (he, she, it, single noun) add -s/-es to the verb.",
      summaryBn: "Present Simple Tense-এ 3rd Person Singular Subject-এর ক্ষেত্রে Verb-এর সাথে -s বা -es যোগ হয়।",
      formulaOrPattern: "Singular Subject + Verb(-s/-es) | Plural Subject + Base Verb",
      keyRules: [
        {
          ruleEn: "Ignore prepositional phrases between the subject and the verb.",
          ruleBn: "Subject এবং Verb-এর মাঝে কোনো Prepositional phrase থাকলে তা বাদ দিয়ে মূল সাবজেক্ট দেখে verb নির্ধারণ করতে হবে।",
          exampleEn: "The bouquet of flowers smells sweet. (Subject is 'bouquet', not 'flowers')",
          exampleBn: "ফুলের তোড়াটি মিষ্টি সুবাস ছড়ায়। (মূল Subject হলো 'bouquet')",
        },
        {
          ruleEn: "Subjects joined by 'and' generally take a plural verb.",
          ruleBn: "'and' দ্বারা যুক্ত একাধিক Subject সাধারণত Plural verb গ্রহণ করে।",
          exampleEn: "Nabil and Shanto are working on the project.",
          exampleBn: "নাবিল ও শান্ত প্রজেক্টটিতে কাজ করছে।",
        },
      ],
    },
    examples: [
      {
        id: "ex-sva-1",
        sentenceEn: "The quality of these mangoes is exceptional.",
        sentenceBn: "এই আমগুলোর গুণগত মান অসাধারণ।",
        highlights: ["quality", "is"],
        badge: "Agreement Rule",
        noteEn: "The singular subject 'quality' requires singular verb 'is', not 'are'.",
        noteBn: "সাবজেক্ট হলো 'quality' (একবচন), তাই 'is' বসেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-sva-1",
        correct: "Everyone has submitted their assignment.",
        incorrect: "Everyone have submitted their assignment.",
        explanationEn: "Indefinite pronouns like 'everyone', 'each', 'somebody' take singular verbs.",
        explanationBn: "'Everyone', 'each' ইত্যাদি সর্বদা Singular Verb গ্রহণ করে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-sva-1",
        mistakeEn: "Matching the verb with the nearest noun instead of the true subject.",
        mistakeBn: "নিকটবর্তী Noun দেখে ভুল করে Verb নির্বাচন করা।",
        whyEn: "The verb must match the head subject, not intervening modifying nouns.",
        whyBn: "Preposition-এর ভেতরের Noun নয়, মূল Head Noun অনুসারেই verb নির্ধারিত হয়।",
        correctionEn: "One of my friends lives in Toronto.",
        correctionBn: "One of my friends lives in Toronto.",
      },
    ],
    prerequisiteRuleIds: ["noun-singular-plural", "pronoun-personal"],
    relatedRuleIds: ["verb-action-linking", "noun-collective"],
  },
  {
    id: "verb-transitive-intransitive",
    slug: "transitive-and-intransitive-verbs",
    categoryId: "verb",
    categorySlug: "verb",
    titleEn: "Transitive and Intransitive Verbs",
    titleBn: "সকর্মক ও অকর্মক ক্রিয়া",
    shortDescriptionEn: "Verbs that require a direct object vs. verbs that make complete sense on their own.",
    shortDescriptionBn: "যে ক্রিয়ায় কর্ম (Direct Object) প্রয়োজন হয় এবং যা অবজেক্ট ছাড়াই সম্পূর্ণ অর্থ প্রকাশ করে।",
    difficulty: "Intermediate",
    order: 3,
    estimatedMinutes: 6,
    introduction: {
      en: "A transitive verb demands a direct object to receive the action. An intransitive verb makes complete sense without any direct object.",
      bn: "যে Verb-এর অর্থ সম্পূর্ণ করতে Direct Object-এর দরকার হয় তাকে Transitive Verb (সকর্মক) বলে। আর যার কোনো অবজেক্ট লাগে না তাকে Intransitive Verb (অকর্মক) বলে।",
    },
    explanation: {
      summaryEn: "Ask 'what?' or 'whom?' after the verb. If there is an answer, the verb is transitive. If not, it is intransitive.",
      summaryBn: "Verb-কে 'কাকে' বা 'কী' দিয়ে প্রশ্ন করলে উত্তর পাওয়া গেলে তা Transitive, না পাওয়া গেলে Intransitive।",
      keyRules: [
        {
          ruleEn: "Intransitive verbs cannot be transformed into passive voice.",
          ruleBn: "Intransitive Verb-এর কোনো প্যাসিভ ভয়েস (Passive Voice) রূপান্তর সম্ভব নয়।",
          exampleEn: "She arrived early. / The baby slept peacefully.",
          exampleBn: "সে সময়মতো পৌঁছেছিল। / শিশুটি শান্তভাবে ঘুমিয়েছিল।",
        },
      ],
    },
    examples: [
      {
        id: "ex-trans-1",
        sentenceEn: "The engineer built a modern bridge.",
        sentenceBn: "প্রকৌশলী একটি আধুনিক সেতু নির্মাণ করেছিলেন।",
        highlights: ["built", "a modern bridge"],
        badge: "Transitive Verb",
        noteEn: "'built' what? Answer: 'a modern bridge' (direct object).",
        noteBn: "'built' কী তৈরি করেছিলেন? উত্তর: 'a modern bridge' (কর্ম)।",
      },
    ],
    comparisons: [
      {
        id: "comp-trans-1",
        correct: "Please raise your hand. / The sun rises in the east.",
        incorrect: "Please rise your hand. / The sun raises in the east.",
        explanationEn: "'Raise' is transitive (needs object); 'rise' is intransitive.",
        explanationBn: "'Raise' সকর্মক (object লাগে); 'Rise' অকর্মক (object লাগে না)।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-trans-1",
        mistakeEn: "Confusing lay (transitive) and lie (intransitive).",
        mistakeBn: "Lay এবং Lie-এর ব্যবহার গুলিয়ে ফেলা।",
        whyEn: "'Lay' means to place something down (needs object). 'Lie' means to recline (no object).",
        whyBn: "'Lay' মানে কোনো কিছু রাখা (object দরকার), 'Lie' মানে শুয়ে থাকা (object নেই)।",
        correctionEn: "I will lie down for twenty minutes.",
        correctionBn: "I will lie down for twenty minutes.",
      },
    ],
    prerequisiteRuleIds: ["verb-action-linking"],
    relatedRuleIds: ["pronoun-personal"],
  },
  {
    id: "verb-modals",
    slug: "modal-auxiliary-verbs",
    categoryId: "verb",
    categorySlug: "verb",
    titleEn: "Modal Auxiliary Verbs",
    titleBn: "ভাববাচক সহায়ক ক্রিয়া (Modal Auxiliaries)",
    shortDescriptionEn: "Express possibility, obligation, permission, and ability using can, may, must, should, would.",
    shortDescriptionBn: "সম্ভাবনা, বাধ্যবাধকতা, অনুমতি ও সামর্থ্য প্রকাশে Can, Could, May, Might, Must, Should-এর ব্যবহার।",
    difficulty: "Advanced",
    order: 4,
    estimatedMinutes: 7,
    introduction: {
      en: "Modals are helper verbs that indicate modality: likelihood, permission, ability, obligation, or advice. They never change their form with subjects.",
      bn: "Modal হলো বিশেষ ধরনের সাহায্যকারী ক্রিয়া যা কোনো কাজের সম্ভাবনা, অনুমতি, বাধ্যবাধকতা বা সামর্থ্য প্রকাশ করে। এরা Subject ভেদে রূপ পরিবর্তন করে না।",
    },
    explanation: {
      summaryEn: "Modals are always followed by the bare base infinitive form of the main verb without 'to' (except ought to).",
      summaryBn: "Modal verb-এর পরে মূল Verb-এর Base Form (V1) বসে এবং কোনো -s/-es/-ing যুক্ত হয় না।",
      formulaOrPattern: "Subject + Modal Verb + Base Verb (V1)",
      keyRules: [
        {
          ruleEn: "Never add -s to a modal or to the verb following it.",
          ruleBn: "Modal-এর সাথে বা পরবর্তী মূল Verb-এর সাথে কখনোই -s/-es যোগ করবেন না।",
          exampleEn: "He can swim (NOT He cans swim or He can swims).",
          exampleBn: "সে সাঁতার কাটতে পারে।",
        },
      ],
    },
    examples: [
      {
        id: "ex-mod-1",
        sentenceEn: "You should review your code before deployment.",
        sentenceBn: "ডিপ্লয় করার আগে তোমার কোডটি পর্যালোচনা করা উচিত।",
        highlights: ["should review"],
        badge: "Advice / Recommendation",
        noteEn: "'should' expresses strong recommendation followed by base verb 'review'.",
        noteBn: "'should' পরামর্শ প্রকাশ করছে এবং মূল verb 'review' বসেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-mod-1",
        correct: "She must finish the report today.",
        incorrect: "She must to finish the report today.",
        explanationEn: "Do not use 'to' after modal verbs (must, can, should, etc.).",
        explanationBn: "Modal auxiliary-এর পরে 'to' যুক্ত করা ব্যাকরণগত ভুল।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-mod-1",
        mistakeEn: "Writing 'He could able to do it'.",
        mistakeBn: "'could' এবং 'able to' একসাথে ব্যবহার করা।",
        whyEn: "'Could' already means 'was able to'. Using both is redundant.",
        whyBn: "'Could' নিজেই সামর্থ্য প্রকাশ করে, তাই এর সাথে 'able to' অপ্রয়োজনীয়।",
        correctionEn: "He was able to solve the problem. / He could solve the problem.",
        correctionBn: "He was able to solve the problem. / He could solve the problem.",
      },
    ],
    prerequisiteRuleIds: ["verb-action-linking"],
    relatedRuleIds: ["verb-subject-verb-agreement"],
  },

  // ----------------------------------------------------
  // ADVERB RULES
  // ----------------------------------------------------
  {
    id: "adverb-manner-place-time",
    slug: "adverbs-of-manner-place-and-time",
    categoryId: "adverb",
    categorySlug: "adverb",
    titleEn: "Adverbs of Manner, Place, and Time",
    titleBn: "ধরণ, স্থান ও কালবাচক ক্রিয়া বিশেষণ",
    shortDescriptionEn: "Explain how (manner), where (place), and when (time) an action happens.",
    shortDescriptionBn: "কীভাবে (Manner), কোথায় (Place) এবং কখন (Time) কাজ সংঘটিত হয় তা প্রকাশের নিয়ম।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 5,
    introduction: {
      en: "Adverbs modify verbs, adjectives, or other adverbs by describing circumstances of manner (how), place (where), and time (when).",
      bn: "Adverb ক্রিয়া কখন, কোথায় এবং কীভাবে সম্পন্ন হচ্ছে তা বিশদভাবে তুলে ধরে।",
    },
    explanation: {
      summaryEn: "Manner adverbs often end in -ly (quickly, softly). Place adverbs tell location (here, outside). Time adverbs tell timing (today, soon).",
      summaryBn: "ধরণ বোঝাতে বেশিরভাগ ক্ষেত্রে -ly যোগ হয়। স্থান ও সময় নির্দেশক শব্দ ক্রিয়ার প্রেক্ষাপট স্পষ্ট করে।",
      formulaOrPattern: "Sentence End: Manner > Place > Time (MPT Order)",
      keyRules: [
        {
          ruleEn: "When multiple adverbs appear at the end of a sentence, follow Manner-Place-Time order.",
          ruleBn: "বাক্যের শেষে একাধিক Adverb বসলে Manner → Place → Time ক্রম মেনে চলতে হয়।",
          exampleEn: "He spoke enthusiastically (M) at the conference (P) yesterday (T).",
          exampleBn: "তিনি গতকাল কনফারেন্সে উৎসাহের সাথে বক্তব্য দিয়েছিলেন।",
        },
      ],
    },
    examples: [
      {
        id: "ex-adv-1",
        sentenceEn: "The pianist played skillfully on the stage last night.",
        sentenceBn: "পিয়ানোবাদক গত রাতে মঞ্চে দক্ষতার সাথে বাজিয়েছিলেন।",
        highlights: ["skillfully", "on the stage", "last night"],
        badge: "MPT Order",
        noteEn: "Manner (skillfully) → Place (on the stage) → Time (last night).",
        noteBn: "ধরণ (skillfully) → স্থান (on the stage) → সময় (last night)।",
      },
    ],
    comparisons: [
      {
        id: "comp-adv-1",
        correct: "He drives carefully.",
        incorrect: "He drives careful.",
        explanationEn: "'Careful' is an adjective; modifying the verb 'drives' requires the adverb 'carefully'.",
        explanationBn: "Verb 'drives'-কে মডিফাই করতে Adverb 'carefully' দরকার।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-adv-1",
        mistakeEn: "Using 'good' instead of 'well' to modify actions.",
        mistakeBn: "কাজের বর্ণনায় 'well'-এর বদলে 'good' ব্যবহার করা।",
        whyEn: "'Good' is an adjective; 'well' is the adverb of manner.",
        whyBn: "'Good' বিশেষণ; ক্রিয়ার ধরণ বোঝাতে Adverb হিসেবে 'well' বসবে।",
        correctionEn: "She speaks English very well.",
        correctionBn: "She speaks English very well.",
      },
    ],
    prerequisiteRuleIds: ["adjective-types", "verb-action-linking"],
    relatedRuleIds: ["adverb-frequency"],
  },
  {
    id: "adverb-frequency",
    slug: "adverbs-of-frequency",
    categoryId: "adverb",
    categorySlug: "adverb",
    titleEn: "Adverbs of Frequency & Placement",
    titleBn: "পৌনঃপুনিক ক্রিয়া বিশেষণ ও তাদের সঠিক স্থান",
    shortDescriptionEn: "Positioning always, usually, often, sometimes, rarely, and never within sentences.",
    shortDescriptionBn: "Always, usually, never ইত্যাদি শব্দ বাক্যের ঠিক কোথায় বসে তার নির্ভুল অবস্থান।",
    difficulty: "Intermediate",
    order: 2,
    estimatedMinutes: 5,
    introduction: {
      en: "Adverbs of frequency explain how often an event occurs. Their placement follows strict positions relative to main verbs and helping verbs.",
      bn: "কোনো কাজ কত ঘন ঘন বা কতবার ঘটে তা নির্দেশ করে Adverb of Frequency। বাক্যে এর অবস্থান সুনির্দিষ্ট।",
    },
    explanation: {
      summaryEn: "Place frequency adverbs BEFORE main verbs, but AFTER the verb 'to be' and auxiliary verbs.",
      summaryBn: "মূল ক্রিয়ার পূর্বে কিন্তু 'Be' verb (is, am, are) বা সাহায্যকারী ক্রিয়ার পরে বসে।",
      formulaOrPattern: "Subject + [Frequency Adverb] + Main Verb | Subject + [Be Verb] + [Frequency Adverb]",
      keyRules: [
        {
          ruleEn: "Before main verb: He always wakes up at 6 AM.",
          ruleBn: "মূল Verb-এর পূর্বে বসে।",
          exampleEn: "She often visits the library.",
          exampleBn: "তিনি প্রায়ই লাইব্রেরিতে যান।",
        },
        {
          ruleEn: "After 'to be': He is always on time.",
          ruleBn: "'Be' verb-এর পরে বসে।",
          exampleEn: "They are rarely late.",
          exampleBn: "তারা কদাচিৎ দেরি করে।",
        },
      ],
    },
    examples: [
      {
        id: "ex-frq-1",
        sentenceEn: "We have never experienced such hospitality.",
        sentenceBn: "আমরা কখনো এমন আতিথেয়তা অনুভব করিনি।",
        highlights: ["have never experienced"],
        badge: "Auxiliary Placement",
        noteEn: "'never' sits neatly between the auxiliary 'have' and the participle 'experienced'.",
        noteBn: "'never' শব্দটি সাহায্যকারী verb 'have' এবং মূল verb-এর মাঝে বসেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-frq-1",
        correct: "He is always polite to guests.",
        incorrect: "He always is polite to guests.",
        explanationEn: "Adverbs of frequency follow forms of 'to be'.",
        explanationBn: "'Be' verb-এর পরে Adverb of frequency বসে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-frq-1",
        mistakeEn: "Using double negatives with 'rarely', 'seldom', or 'never'.",
        mistakeBn: "'rarely', 'seldom', 'never'-এর সাথে আবার 'not' ব্যবহার করা।",
        whyEn: "These words already carry a negative meaning.",
        whyBn: "এসব শব্দ নিজেই নেতিবাচক অর্থ বহন করে, তাই অতিরিক্ত 'not' বাহুল্য ও ভুল।",
        correctionEn: "I rarely eat junk food.",
        correctionBn: "I rarely eat junk food.",
      },
    ],
    prerequisiteRuleIds: ["adverb-manner-place-time"],
    relatedRuleIds: ["verb-subject-verb-agreement"],
  },

  // ----------------------------------------------------
  // PREPOSITION RULES
  // ----------------------------------------------------
  {
    id: "preposition-time-place",
    slug: "prepositions-of-time-and-place",
    categoryId: "preposition",
    categorySlug: "preposition",
    titleEn: "Prepositions of Time and Place: In, On, At",
    titleBn: "সময় ও স্থানের প্রেপজিশন: In, On, At",
    shortDescriptionEn: "The pyramid rule: At (specific/narrow) → On (medium/days) → In (broad/general).",
    shortDescriptionBn: "পিরামিড পদ্ধতি: At (নির্দিষ্ট বিন্দু) → On (দিন/পৃষ্ঠতল) → In (বৃহৎ সময়/স্থান)।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 6,
    introduction: {
      en: "Prepositions show spatial and temporal relationships. 'At', 'On', and 'In' form a pyramid of specificity from precise points to broad spans.",
      bn: "'In', 'On' এবং 'At' সময় এবং স্থান উভয় ক্ষেত্রে সুনির্দিষ্ট পরিধি বোঝাতে ব্যবহৃত হয়।",
    },
    explanation: {
      summaryEn: "TIME: At = exact time (at 5 PM). On = days/dates (on Monday). In = months/years/centuries (in 2026). PLACE: At = specific address/point. On = surface/street. In = enclosed space/city/country.",
      summaryBn: "সময়: At (নির্দিষ্ট সময়), On (দিন ও তারিখ), In (মাস, বছর, ঋতু)। স্থান: At (নির্দিষ্ট ঠিকানা), On (রাস্তা, তল), In (শহর, দেশ, আবদ্ধ স্থান)।",
      formulaOrPattern: "Specificity Pyramid: At (Narrow) > On (Medium) > In (Broad)",
      keyRules: [
        {
          ruleEn: "Use 'at' for holidays without 'day' (at Eid, at Christmas) and 'on' when 'day' is included (on Christmas Day).",
          ruleBn: "'Day' শব্দ উল্লেখ না থাকলে 'at' বসে (at Eid), আর 'Day' থাকলে 'on' বসে (on Eid day)।",
          exampleEn: "We met at Eid. / We met on Eid day.",
          exampleBn: "আমরা ঈদে দেখা করেছিলাম। / আমরা ঈদের দিনে দেখা করেছিলাম।",
        },
      ],
    },
    examples: [
      {
        id: "ex-prep-1",
        sentenceEn: "The flight departs at 9:30 AM on Friday in November.",
        sentenceBn: "ফ্লাইটটি নভেম্বরের এক শুক্রবারে সকাল ৯:৩০ মিনিটে ছেড়ে যাবে।",
        highlights: ["at 9:30 AM", "on Friday", "in November"],
        badge: "Time Hierarchy",
        noteEn: "Precise time (at) → Day (on) → Month (in).",
        noteBn: "নির্দিষ্ট সময় (at) → দিন (on) → মাস (in)।",
      },
    ],
    comparisons: [
      {
        id: "comp-prep-1",
        correct: "She lives in Dhaka at Dhanmondi.",
        incorrect: "She lives at Dhaka in Dhanmondi.",
        explanationEn: "Use 'in' for the larger metropolitan area and 'at' for the smaller specific locality.",
        explanationBn: "বৃহৎ শহরের ক্ষেত্রে 'in' এবং তুলনামূলক ছোট এলাকার পূর্বে 'at' বসে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-prep-1",
        mistakeEn: "Saying 'in Monday' or 'at July'.",
        mistakeBn: "দিনের আগে 'in' বা মাসের আগে 'at' বসানো।",
        whyEn: "Days take 'on'; months take 'in'.",
        whyBn: "দিনের ক্ষেত্রে সর্বদা 'on' এবং মাসের ক্ষেত্রে সর্বদা 'in' বসে।",
        correctionEn: "The conference starts on Monday in July.",
        correctionBn: "The conference starts on Monday in July.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics"],
    relatedRuleIds: ["preposition-direction", "preposition-common-collocations"],
  },
  {
    id: "preposition-direction",
    slug: "prepositions-of-movement-and-direction",
    categoryId: "preposition",
    categorySlug: "preposition",
    titleEn: "Prepositions of Movement and Direction",
    titleBn: "গতি ও দিকের প্রেপজিশন",
    shortDescriptionEn: "Into, onto, through, across, towards, along, and past.",
    shortDescriptionBn: "Into, onto, through, across ইত্যাদি গতিশীল অবস্থার প্রেপজিশনের সঠিক ব্যবহার।",
    difficulty: "Intermediate",
    order: 2,
    estimatedMinutes: 5,
    introduction: {
      en: "Prepositions of movement describe dynamic motion from one point to another.",
      bn: "কোনো ব্যক্তি বা বস্তুর এক স্থান থেকে অন্য স্থানে গতিশীল চলাচল প্রকাশ করতে গতিবাচক Preposition ব্যবহৃত হয়।",
    },
    explanation: {
      summaryEn: "'Into' shows motion toward an interior; 'in' shows stationary presence inside. 'Onto' shows motion toward a surface; 'on' shows resting position.",
      summaryBn: "'In' স্থির অবস্থান নির্দেশ করে, কিন্তু 'into' বাইরে থেকে ভেতরে প্রবেশের গতি প্রকাশ করে।",
      keyRules: [
        {
          ruleEn: "Use 'into' for dynamic entry.",
          ruleBn: "বাইরে থেকে ভেতরে প্রবেশের সময় 'into' ব্যবহৃত হয়।",
          exampleEn: "She walked into the room.",
          exampleBn: "সে হেঁটে ঘরের ভেতরে প্রবেশ করল।",
        },
      ],
    },
    examples: [
      {
        id: "ex-mov-1",
        sentenceEn: "The swimmer dived into the deep pool.",
        sentenceBn: "সাঁতারু গভীর পুলে ডুব দিলেন।",
        highlights: ["dived into"],
        badge: "Dynamic Movement",
        noteEn: "'into' captures the movement entering the water.",
        noteBn: "'into' পানিতে প্রবেশের গতি নির্দেশ করছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-mov-1",
        correct: "He jumped into the car.",
        incorrect: "He jumped in the car. (when meaning entering)",
        explanationEn: "'Into' indicates movement from outside to inside.",
        explanationBn: "ভেতরে প্রবেশের ক্ষেত্রে 'into' অধিকতর নির্ভুল।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-mov-1",
        mistakeEn: "Confusing 'across' (surface crossing) with 'through' (3D volume passage).",
        mistakeBn: "'across' এবং 'through' উল্টোপাল্টা করা।",
        whyEn: "You walk across a street (flat), but you walk through a tunnel (enclosed).",
        whyBn: "রাস্তা পার হতে 'across' এবং সুড়ঙ্গ বা বনের মধ্য দিয়ে যেতে 'through' বসে।",
        correctionEn: "We walked through the dense forest.",
        correctionBn: "We walked through the dense forest.",
      },
    ],
    prerequisiteRuleIds: ["preposition-time-place"],
    relatedRuleIds: ["verb-action-linking"],
  },
  {
    id: "preposition-common-collocations",
    slug: "appropriate-prepositions-and-collocations",
    categoryId: "preposition",
    categorySlug: "preposition",
    titleEn: "Appropriate Prepositions & Collocations",
    titleBn: "উপযুক্ত প্রেপজিশন (Appropriate Prepositions)",
    shortDescriptionEn: "Fixed preposition combinations: depend on, good at, interested in, proud of.",
    shortDescriptionBn: "ইংরেজি ভাষার প্রচলিত ও নির্ধারিত প্রেপজিশনের সঠিক জুটিসমূহ।",
    difficulty: "Advanced",
    order: 3,
    estimatedMinutes: 7,
    introduction: {
      en: "Certain verbs, nouns, and adjectives naturally pair with specific prepositions. These fixed pairings must be memorized through usage.",
      bn: "ইংরেজিতে কিছু নির্দিষ্ট Adjective ও Verb-এর পরে নির্ধারিত কিছু Preposition বসে, যাদের Appropriate Preposition বলে।",
    },
    explanation: {
      summaryEn: "Good at (skill), interested in (hobby/topic), proud of (achievement), afraid of (fear), rely on / depend on (trust).",
      summaryBn: "দক্ষতা বোঝাতে 'good at', আগ্রহে 'interested in', গর্বে 'proud of', নির্ভরতায় 'depend on' বসে।",
      keyRules: [
        {
          ruleEn: "'Good at' indicates proficiency (NOT good in).",
          ruleBn: "কোনো বিষয়ে দক্ষ বোঝাতে 'good at' বসে ('good in' নয়)।",
          exampleEn: "He is exceptionally good at mathematics.",
          exampleBn: "সে গণিতে অত্যন্ত দক্ষ।",
        },
      ],
    },
    examples: [
      {
        id: "ex-colloc-1",
        sentenceEn: "We are proud of your remarkable progress.",
        sentenceBn: "তোমার অভূতপূর্ব উন্নতিতে আমরা গর্বিত।",
        highlights: ["proud of"],
        badge: "Fixed Collocation",
        noteEn: "'proud' universally collocate with 'of'.",
        noteBn: "'proud'-এর সাথে সর্বদা 'of' বসে।",
      },
    ],
    comparisons: [
      {
        id: "comp-colloc-1",
        correct: "She is interested in learning data science.",
        incorrect: "She is interested to learn data science.",
        explanationEn: "'Interested in' is followed by a gerund (-ing).",
        explanationBn: "'Interested in'-এর পর সাধারণত Gerund (-ing) বসে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-colloc-1",
        mistakeEn: "Saying 'He is good in English.'",
        mistakeBn: "'He is good in English' বলা।",
        whyEn: "The standard English collocation for subject ability is 'good at'.",
        whyBn: "দক্ষতা প্রকাশে 'good at' শুদ্ধ রূপ।",
        correctionEn: "He is good at English.",
        correctionBn: "He is good at English.",
      },
    ],
    prerequisiteRuleIds: ["preposition-time-place"],
    relatedRuleIds: ["adjective-types"],
  },

  // ----------------------------------------------------
  // CONJUNCTION RULES
  // ----------------------------------------------------
  {
    id: "conjunction-coordinating",
    slug: "coordinating-conjunctions-fanboys",
    categoryId: "conjunction",
    categorySlug: "conjunction",
    titleEn: "Coordinating Conjunctions: FANBOYS",
    titleBn: "সমজাতীয় সংযোগকারী অব্যয় (FANBOYS)",
    shortDescriptionEn: "Join words, phrases, and independent clauses using For, And, Nor, But, Or, Yet, So.",
    shortDescriptionBn: "দুটি স্বাধীন বাক্য বা সমজাতীয় পদকে যুক্ত করতে ৭টি মূল কনজাংশনের ব্যবহার।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 6,
    introduction: {
      en: "Coordinating conjunctions connect words, phrases, or independent clauses of equal grammatical rank.",
      bn: "সমান গুরুত্ব বা সমজাতীয় দুটি শব্দ, বাক্যাংশ বা স্বাধীন বাক্যকে সংযুক্ত করে Coordinating Conjunction।",
    },
    explanation: {
      summaryEn: "FANBOYS acronym: For (reason), And (addition), Nor (negative addition), But (contrast), Or (choice), Yet (unexpected contrast), So (result).",
      summaryBn: "FANBOYS সূত্র: For, And, Nor, But, Or, Yet, So। দুটি পূর্ণ বাক্য যুক্ত করার সময় কনজাংশনের আগে কমা বসে।",
      formulaOrPattern: "Independent Clause + comma (,) + FANBOYS + Independent Clause",
      keyRules: [
        {
          ruleEn: "Use a comma before the coordinating conjunction when linking two independent clauses.",
          ruleBn: "দুটি পূর্ণ বাক্য যুক্ত করার সময় কনজাংশনের পূর্বে কমা বসাতে হয়।",
          exampleEn: "I wanted to attend the seminar, but I was feeling unwell.",
          exampleBn: "আমি সেমিনারে অংশ নিতে চেয়েছিলাম, কিন্তু আমি অসুস্থ বোধ করছিলাম।",
        },
      ],
    },
    examples: [
      {
        id: "ex-fan-1",
        sentenceEn: "The forecast predicted heavy rain, so we postponed the trip.",
        sentenceBn: "পূর্বাভাসে ভারী বৃষ্টির কথা বলা হয়েছিল, তাই আমরা ভ্রমণ স্থগিত করেছি।",
        highlights: [", so"],
        badge: "FANBOYS Result",
        noteEn: "'so' introduces the consequence with preceding comma.",
        noteBn: "'so' ফলাফল নির্দেশ করছে এবং এর পূর্বে কমা বসেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-fan-1",
        correct: "She likes coffee, but he prefers tea.",
        incorrect: "She likes coffee but he prefers tea. (missing comma in compound sentence)",
        explanationEn: "Separate independent clauses with a comma before 'but'.",
        explanationBn: "দুটি সম্পূর্ণ বাক্য 'but' দিয়ে যুক্ত হলে কমা বসানো উচিত।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-fan-1",
        mistakeEn: "Inserting a comma when connecting just two words or compound verbs.",
        mistakeBn: "শুধুমাত্র দুটি শব্দ বা দুটি ক্রিয়ার মাঝে অযথা কমা দেওয়া।",
        whyEn: "No comma is needed when joining simple elements without two separate subjects.",
        whyBn: "যদি পরের অংশে নতুন সাবজেক্ট না থাকে তবে কমা দেওয়া যাবে না।",
        correctionEn: "She cooked dinner and washed the dishes.",
        correctionBn: "She cooked dinner and washed the dishes.",
      },
    ],
    prerequisiteRuleIds: ["noun-basics", "verb-action-linking"],
    relatedRuleIds: ["conjunction-subordinating", "conjunction-correlative"],
  },
  {
    id: "conjunction-subordinating",
    slug: "subordinating-conjunctions",
    categoryId: "conjunction",
    categorySlug: "conjunction",
    titleEn: "Subordinating Conjunctions",
    titleBn: "অধীনস্থ সংযোগকারী অব্যয় (Subordinating)",
    shortDescriptionEn: "Connect dependent clauses to main clauses: because, although, since, unless, while.",
    shortDescriptionBn: "প্রধান বাক্যাংশের সাথে অপ্রধান বাক্যাংশ যুক্ত করার নিয়ম (কারণ, শর্ত ও বৈপরীত্য)।",
    difficulty: "Intermediate",
    order: 2,
    estimatedMinutes: 6,
    introduction: {
      en: "Subordinating conjunctions connect a dependent (subordinate) clause to an independent clause, showing relationships of cause, condition, contrast, or time.",
      bn: "যে Conjunction একটি নির্ভরশীল খণ্ডবাক্যকে (Dependent Clause) মূল খণ্ডবাক্যের (Independent Clause) সাথে সংযুক্ত করে।",
    },
    explanation: {
      summaryEn: "Common subordinators: because, although, even though, since, unless, while, whereas, if.",
      summaryBn: "যদি Subordinate clause বাক্যের শুরুতে আসে, তবে তার শেষে একটি কমা (,) দিতে হয়। কিন্তু শেষে বসলে কমা লাগে না।",
      formulaOrPattern: "Subordinate Clause + comma (,) + Main Clause | Main Clause + Subordinate Clause (No comma)",
      keyRules: [
        {
          ruleEn: "Comma required when subordinate clause starts the sentence.",
          ruleBn: "বাক্যের শুরুতে Subordinating conjunction থাকলে মাঝখানে কমা বসবে।",
          exampleEn: "Although it was raining, they played soccer.",
          exampleBn: "যদিও বৃষ্টি হচ্ছিল, তবুও তারা ফুটবল খেলেছিল।",
        },
      ],
    },
    examples: [
      {
        id: "ex-sub-1",
        sentenceEn: "Because she prepared thoroughly, she scored top marks.",
        sentenceBn: "যেহেতু সে ভালোভাবে প্রস্তুতি নিয়েছিল, সে সর্বোচ্চ নম্বর পেয়েছিল।",
        highlights: ["Because she prepared thoroughly,"],
        badge: "Cause & Effect",
        noteEn: "Introductory dependent clause marked with a comma.",
        noteBn: "শুরুর Dependent Clause-এর পরে কমা বসেছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-sub-1",
        correct: "Although he was tired, he finished the project.",
        incorrect: "Although he was tired, but he finished the project.",
        explanationEn: "Do not use 'although' and 'but' together in the same sentence.",
        explanationBn: "'Although' এবং 'but' একই সাথে একই বাক্যে ব্যবহার করা মারাত্মক ভুল।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-sub-1",
        mistakeEn: "Using 'Although ... but' or 'Because ... so' pairs simultaneously.",
        mistakeBn: "'Although' এর সাথে 'but' বা 'Because'-এর সাথে 'so' জোড়া দেওয়া।",
        whyEn: "A single subordinator already establishes the relationship. Adding a coordinating conjunction creates a double connector error.",
        whyBn: "একটি কনজাংশনই সম্পর্ক স্পষ্ট করে, দ্বিতীয়টি দিলে বাক্য দ্বৈত সংযোগ দোষে দুষ্ট হয়।",
        correctionEn: "Because it was late, we returned home.",
        correctionBn: "Because it was late, we returned home.",
      },
    ],
    prerequisiteRuleIds: ["conjunction-coordinating"],
    relatedRuleIds: ["pronoun-relative"],
  },
  {
    id: "conjunction-correlative",
    slug: "correlative-conjunctions",
    categoryId: "conjunction",
    categorySlug: "conjunction",
    titleEn: "Correlative Conjunctions",
    titleBn: "জোড়াবদ্ধ সংযোগকারী অব্যয় (Correlative)",
    shortDescriptionEn: "Paired connectors: Either/Or, Neither/Nor, Both/And, Not only/But also.",
    shortDescriptionBn: "জোড়ায় জোড়ায় বসা কনজাংশন এবং এদের প্যারালাল স্ট্রাকচারের নিয়ম।",
    difficulty: "Intermediate",
    order: 3,
    estimatedMinutes: 6,
    introduction: {
      en: "Correlative conjunctions are pairs of conjunctions that work together to join equal grammatical sentence elements.",
      bn: "যেসব Conjunction সর্বদা জোড়ায় জোড়ায় ব্যবহৃত হয় তাদের Correlative Conjunction বলে।",
    },
    explanation: {
      summaryEn: "Standard pairs: Either...or, Neither...nor, Not only...but also, Both...and, Whether...or. Both sides of the pair must match grammatically (parallel structure).",
      summaryBn: "উভয় পাশের ব্যাকরণগত রূপ সমান হতে হবে (Parallelism)। 'Neither...nor'-এ দ্বিতীয় সাবজেক্ট অনুসারে Verb বসে।",
      formulaOrPattern: "Not only + [Form A] + but also + [Form A]",
      keyRules: [
        {
          ruleEn: "With 'neither...nor' or 'either...or', the verb agrees with the subject closest to it.",
          ruleBn: "'Either...or' বা 'Neither...nor' দিয়ে যুক্ত হলে Verb-এর নিকটবর্তী Subject অনুযায়ী Verb নির্ধারিত হয়।",
          exampleEn: "Neither the teacher nor the students were present.",
          exampleBn: "শিক্ষক কিংবা শিক্ষার্থীরা কেউই উপস্থিত ছিল না।",
        },
      ],
    },
    examples: [
      {
        id: "ex-corr-1",
        sentenceEn: "She is not only a talented writer but also a skilled designer.",
        sentenceBn: "তিনি কেবল একজন প্রতিভাবান লেখিকাই নন, বরং একজন দক্ষ ডিজাইনারও।",
        highlights: ["not only a talented writer", "but also a skilled designer"],
        badge: "Parallel Construction",
        noteEn: "Both elements after the pair are parallel noun phrases.",
        noteBn: "উভয় অংশেই সমান্তরাল Noun Phrase ব্যবহৃত হয়েছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-corr-1",
        correct: "Neither Jamal nor his brothers are coming.",
        incorrect: "Neither Jamal nor his brothers is coming.",
        explanationEn: "The plural subject 'brothers' is closest to the verb, so use 'are'.",
        explanationBn: "Verb-এর সবচেয়ে কাছে 'brothers' (Plural) থাকায় 'are' হবে।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-corr-1",
        mistakeEn: "Mismatched pairs like 'neither...or' or 'either...nor'.",
        mistakeBn: "'neither' এর সাথে 'or' বা 'either' এর সাথে 'nor' মেলানো।",
        whyEn: "Neither strictly pairs with nor; Either strictly pairs with or.",
        whyBn: "Neither-এর সঙ্গী সর্বদা Nor, এবং Either-এর সঙ্গী সর্বদা Or।",
        correctionEn: "You can choose either tea or coffee.",
        correctionBn: "You can choose either tea or coffee.",
      },
    ],
    prerequisiteRuleIds: ["conjunction-coordinating"],
    relatedRuleIds: ["verb-subject-verb-agreement"],
  },

  // ----------------------------------------------------
  // INTERJECTION RULES
  // ----------------------------------------------------
  {
    id: "interjection-emotions",
    slug: "interjections-for-emotions",
    categoryId: "interjection",
    categorySlug: "interjection",
    titleEn: "Interjections for Emotion and Reaction",
    titleBn: "আবেগ ও অনুভূতি প্রকাশক অব্যয়",
    shortDescriptionEn: "Express joy (Hurrah!), surprise (Wow!), sorrow (Alas!), and hesitation (Um, Well).",
    shortDescriptionBn: "আনন্দ, দুঃখ, বিস্ময় ও ইতস্তত ভাব প্রকাশে ব্যবহৃত বিভিন্ন ইন্টারজেকশন।",
    difficulty: "Beginner",
    order: 1,
    estimatedMinutes: 4,
    introduction: {
      en: "Interjections are words or short exclamations used to express sudden emotions, feelings, or reactions. They are grammatically independent of the main sentence.",
      bn: "হঠাৎ জেগে ওঠা আবেগ, আনন্দ, বিস্ময়, ভয় বা দুঃখ প্রকাশে Interjection ব্যবহৃত হয়। ব্যাকরণগতভাবে এরা বাক্যের মূল কাঠামোর ওপর নির্ভরশীল নয়।",
    },
    explanation: {
      summaryEn: "Joy: Hurrah!, Yay! Grief: Alas!, Oh no! Surprise: Wow!, Oh! Agreement: Aha!, Bravo!",
      summaryBn: "আনন্দে Hurrah/Yay, দুঃখে Alas/Oh no, বিস্ময়ে Wow/Gosh ইত্যাদি ব্যবহৃত হয়।",
      keyRules: [
        {
          ruleEn: "Strong emotions use an exclamation mark (!); mild interjections use a comma (,).",
          ruleBn: "তীব্র আবেগে আশ্চর্যবোধক চিহ্ন (!) এবং মৃদু অনুভূতিতে কমা (,) বসে।",
          exampleEn: "Wow! That was amazing. / Well, I think we should go.",
          exampleBn: "বাহ! এটি অসাধারণ ছিল। / বেশ, আমার মনে হয় আমাদের যাওয়া উচিত।",
        },
      ],
    },
    examples: [
      {
        id: "ex-int-1",
        sentenceEn: "Hurrah! Our team won the championship match.",
        sentenceBn: "কী আনন্দ! আমাদের দল চ্যাম্পিয়নশিপ ম্যাচ জিতেছে।",
        highlights: ["Hurrah!"],
        badge: "Exclamation of Joy",
        noteEn: "'Hurrah!' conveys pure celebration.",
        noteBn: "'Hurrah!' উচ্ছ্বসিত আনন্দের বহিঃপ্রকাশ।",
      },
    ],
    comparisons: [
      {
        id: "comp-int-1",
        correct: "Alas! He could not pass the exam.",
        incorrect: "Alas he could not pass the exam.",
        explanationEn: "Punctuate the interjection with an exclamation mark or comma.",
        explanationBn: "Interjection-এর পরে সঠিক যতিচিহ্ন আবশ্যক।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-int-1",
        mistakeEn: "Overusing interjections in formal and academic writing.",
        mistakeBn: "অ্যাকাডেমিক বা ফর্মাল লেখায় অতিরিক্ত ইন্টারজেকশন ব্যবহার করা।",
        whyEn: "Interjections belong primarily to spoken, creative, and conversational contexts.",
        whyBn: "ইন্টারজেকশন মূলত কথ্য ভাষা ও সংলাপে মানানসই, প্রাতিষ্ঠানিক লেখায় নয়।",
        correctionEn: "We were pleased to hear the positive outcome.",
        correctionBn: "We were pleased to hear the positive outcome.",
      },
    ],
    prerequisiteRuleIds: [],
    relatedRuleIds: ["interjection-punctuation"],
  },
  {
    id: "interjection-punctuation",
    slug: "punctuation-rules-for-interjections",
    categoryId: "interjection",
    categorySlug: "interjection",
    titleEn: "Punctuation Rules for Interjections",
    titleBn: "ইন্টারজেকশনের যতিচিহ্ন ও ক্যাপিটালাইজেশন",
    shortDescriptionEn: "When to use exclamation points vs. commas, and capital letter rules following them.",
    shortDescriptionBn: "আশ্চর্যবোধক চিহ্ন বনাম কমা ব্যবহারের পার্থক্য এবং পরবর্তী বাক্যের ক্যাপিটালাইজেশন।",
    difficulty: "Beginner",
    order: 2,
    estimatedMinutes: 4,
    introduction: {
      en: "How you punctuate an interjection signals to the reader the intensity of the speaker's emotional state.",
      bn: "ইন্টারজেকশনের সাথে ব্যবহৃত যতিচিহ্ন বক্তার অনুভূতির তীব্রতা কতখানি তা পাঠককে স্পষ্টভাবে জানিয়ে দেয়।",
    },
    explanation: {
      summaryEn: "If followed by an exclamation mark (!), the next word begins with a capital letter. If separated by a comma (,), continue with lowercase.",
      summaryBn: "আশ্চর্যবোধক চিহ্নের (!) পর পরবর্তী বাক্য বড় হাতের (Capital) হবে। কমার (,) পর ছোট হাতের অক্ষরে চলবে।",
      keyRules: [
        {
          ruleEn: "Ouch! That hurt. (Capital 'That' follows the exclamation point).",
          ruleBn: "বিস্ময়সূচক চিহ্নের পর নতুন বাক্য হিসেবে ক্যাপিটাল লেটার হবে।",
          exampleEn: "Oh, I see what you mean.",
          exampleBn: "ওহ, আমি বুঝতে পারছি তুমি কী বলছ।",
        },
      ],
    },
    examples: [
      {
        id: "ex-punc-1",
        sentenceEn: "Bravo! You executed the plan flawlessly.",
        sentenceBn: "সাবাশ! তুমি পরিকল্পনাটি নিখুঁতভাবে বাস্তবায়ন করেছ।",
        highlights: ["Bravo! You"],
        badge: "Punctuation Rule",
        noteEn: "'You' is capitalized because it begins a fresh sentence following '!'.",
        noteBn: "'!' এর পরে 'You' ক্যাপিটাল লেটার দিয়ে শুরু হয়েছে।",
      },
    ],
    comparisons: [
      {
        id: "comp-punc-1",
        correct: "Oops! I dropped my phone.",
        incorrect: "Oops! i dropped my phone.",
        explanationEn: "Always capitalize after an exclamation point.",
        explanationBn: "আশ্চর্যবোধক চিহ্নের পর ছোট হাতের অক্ষর লেখা ব্যাকরণগত ভুল।",
      },
    ],
    commonMistakes: [
      {
        id: "mis-punc-1",
        mistakeEn: "Stacking multiple exclamation marks (e.g., 'Wow!!!!').",
        mistakeBn: "একাধিক আশ্চর্যবোধক চিহ্ন একসাথে জুড়ে দেওয়া (যেমন !!!!)।",
        whyEn: "A single exclamation mark is standard and sufficient in proper grammar.",
        whyBn: "একটি আশ্চর্যবোধক চিহ্নই ব্যাকরণগতভাবে যথেষ্ট ও মার্জিত।",
        correctionEn: "Wow! That was fast.",
        correctionBn: "Wow! That was fast.",
      },
    ],
    prerequisiteRuleIds: ["interjection-emotions"],
    relatedRuleIds: ["noun-basics"],
  },
];
