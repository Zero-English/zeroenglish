/**
 * Long-form About content, kept out of the component so the same copy can be
 * turned into `AboutPage` JSON-LD and asserted against in tests.
 *
 * Tone rule: every claim here is either a number we can count in the database
 * or a statement of limitation. No "mission", no "vision", no claim to be
 * making English accessible to millions.
 */

export type AboutFacts = {
  wordTotal: number;
  approvedQuestions: number;
  users: number;
  publishedBlogs: number;
  liveLevels: number;
  oxford3000: number;
  oxford5000: number;
  unsourced: number;
};

const nf = new Intl.NumberFormat("en-US");

/**
 * Stat tiles derived from the database. Numbers are formatted here so a
 * caller cannot accidentally render a raw `5089` next to `5,089` elsewhere, and
 * so the same tile is used for the visible page and the `Dataset` schema.
 */
export function buildAboutStats(facts: AboutFacts) {
  return [
    {
      value: nf.format(facts.wordTotal),
      labelBn: "ইংরেজি শব্দ",
      labelEn: "English words",
    },
    {
      value: String(facts.liveLevels),
      labelBn: "সচল লেভেল (A1–C1)",
      labelEn: "Live levels (A1–C1)",
    },
    {
      value: nf.format(facts.approvedQuestions),
      labelBn: "অনুমোদিত কুইজ প্রশ্ন",
      labelEn: "Approved quiz questions",
    },
    {
      value: nf.format(facts.users),
      labelBn: "নিবন্ধিত শিক্ষার্থী",
      labelEn: "Registered learners",
    },
  ] as const;
}

export interface AboutCard {
  icon: "target" | "compass" | "shield";
  eyebrowBn: string;
  eyebrowEn: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
}

/** Replaces the old mission/vision/approach pillars with three checkable claims. */
export function buildAboutCards(facts: AboutFacts): AboutCard[] {
  return [
    {
      icon: "target",
      eyebrowBn: "আমরা কী তৈরি করেছি",
      eyebrowEn: "What exists today",
      titleBn: "একটি শব্দতালিকা, কুইজ আর অগ্রগতি ট্র্যাকিং",
      titleEn: "A word list, quizzes and progress tracking",
      descBn: `${nf.format(facts.wordTotal)}টি ইংরেজি শব্দ A1 থেকে C1 লেভেলে সাজানো, প্রতিটির বাংলা অর্থ, ইংরেজি সংজ্ঞা, দুটি করে উদাহরণ বাক্য, প্রতিশব্দ ও বিপরীত শব্দ সহ। ${nf.format(facts.approvedQuestions)}টি অনুমোদিত কুইজ প্রশ্ন আছে, যার মধ্যে Parts of Speech, Prepositions, Idioms ও Transformation-এর প্রশ্ন সবচেয়ে বেশি। শেখা, বুকমার্ক ও কুইজ ফলাফল সংরক্ষিত হয়।`,
      descEn: `${nf.format(facts.wordTotal)} English words sorted from A1 to C1, each with a Bangla meaning, an English definition, two example sentences, synonyms and antonyms. There are ${nf.format(facts.approvedQuestions)} approved quiz questions, the largest groups being Parts of Speech, Prepositions, Idioms and Transformation. Learned words, bookmarks and quiz results are all saved.`,
    },
    {
      icon: "compass",
      eyebrowBn: "আমরা কীভাবে কাজ করি",
      eyebrowEn: "How a word gets added",
      titleBn: "ছয় ধাপ, প্রতিটি লেখা হয় মানুষের হাতে",
      titleEn: "Six steps, each written by a person",
      descBn:
        "একটি শব্দ যোগ করার প্রক্রিয়া: তালিকা থেকে শিরোনাম বাছাই, CEFR অনুযায়ী লেভেল নির্ধারণ, বাংলা অর্থ লেখা, এক বাক্যে ইংরেজি সংজ্ঞা, ইংরেজি ও বাংলা উদাহরণ বাক্য, এবং প্রতিশব্দ ও বিপরীত শব্দ। লেভেল ঠিক করার সময় CEFR-এর সাধারণ বর্ণনা অনুসরণ করা হয়, অর্থাৎ সেই স্তরে একজন শিক্ষার্থী শব্দটির সঙ্গে পরিচিত হওয়ার কথা।",
      descEn:
        "Adding a word: pick the headword from the source list, assign a CEFR level, write the Bangla meaning, write a one-line English definition, write example sentences in both languages, then add synonyms and antonyms. Levels follow the Council of Europe CEFR can-do statements, meaning what a learner at that stage is expected to recognise.",
    },
    {
      icon: "shield",
      eyebrowBn: "যা এখনো হয়নি",
      eyebrowEn: "What is not ready",
      titleBn: "C2 লেভেল এখনো লেখা হচ্ছে",
      titleEn: "C2 is still being written",
      descBn:
        "C2 লেভেলে এখন মাত্র একটি এন্ট্রি আছে, তাই সেটি শেখার জন্য খোলা হয়নি এবং noindex করা হয়েছে। এখানে ব্যাকরণ বা রচনার কোনো পাঠ নেই, কেবল ব্যাকরণ কুইজ আছে। আমরা যা তৈরি করিনি তা লুকানোর বদলে এখানে লিখে দিচ্ছি, যাতে আপনি ভুল ধারণায় না থাকেন।",
      descEn:
        "C2 currently holds a single entry, so it is not open for study and is marked noindex. There are no grammar or composition lessons here, only grammar quizzes. Rather than hide what we have not built, we list it, so you are not working from a wrong assumption.",
    },
  ];
}

export interface AboutStep {
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
}

export const ABOUT_METHOD_STEPS: AboutStep[] = [
  {
    titleBn: "তালিকা থেকে শিরোনাম",
    titleEn: "Headword from the list",
    descBn:
      "অক্সফোর্ড ৩০০০ ও ৫০০০ তালিকার একটি শিরোনাম নেওয়া হয়। আমরা কোনো বই বা পেজ থেকে লেখা বাক্য নিজেদের করে নিই না।",
    descEn:
      "A single headword is taken from the Oxford 3000 and 5000 lists. We do not lift sentences from books or web pages.",
  },
  {
    titleBn: "CEFR লেভেল ঠিক করা",
    titleEn: "CEFR level assigned",
    descBn:
      "ইউরোপী কাউন্সিলের CEFR বর্ণনা অনুসরণ করে ঠিক হয় শব্দটি সেই স্তরে আসে কি না। A1-এর জন্য সবচেয়ে সাধারণ শব্দ, C1-এর জন্য পেশাগত ও একাডেমিক শব্দ।",
    descEn:
      "The Council of Europe CEFR can-do statements decide whether a word belongs at that stage. The most common words sit at A1; professional and academic words sit at C1.",
  },
  {
    titleBn: "বাংলা অর্থ",
    titleEn: "Bangla meaning",
    descBn:
      "সাধারণ বাংলায় অর্থ দেওয়া হয়। এক শব্দের একাধিক অর্থ থাকলে বেশি ব্যবহৃত অর্থটি আগে রাখা হয়।",
    descEn:
      "The meaning is given in everyday Bangla. Where a word has several senses, the common one comes first.",
  },
  {
    titleBn: "ইংরেজি সংজ্ঞা",
    titleEn: "English definition",
    descBn:
      "এক বাক্যের সংজ্ঞা, যাতে শব্দটি ইংরেজিতে কীভাবে বসে তা স্পষ্ট হয়।",
    descEn:
      "A one-line definition showing how the word is actually used in English.",
  },
  {
    titleBn: "উদাহরণ বাক্য",
    titleEn: "Example sentences",
    descBn:
      "দুটি করে উদাহরণ বাক্য, ইংরেজি ও বাংলা উভয় ভাষাতেই। এখানেই সাধারণত ব্যবহারের সঠিক প্রসঙ্গ বোঝা যায়।",
    descEn:
      "Two example sentences, each in English and in Bangla. This is where the usual context of use becomes clear.",
  },
  {
    titleBn: "প্রতিশব্দ ও বিপরীত শব্দ",
    titleEn: "Synonyms and antonyms",
    descBn:
      "কাছাকাছি অর্থের শব্দ এবং বিপরীত অর্থের শব্দ যোগ করা হয়, যাতে পরীক্ষায় শব্দ বদলানো সহজ হয়।",
    descEn:
      "Nearby-meaning words and the opposite are added, so the word can be swapped in an exam.",
  },
];

export interface AboutSource {
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
}

export function buildAboutSources(facts: AboutFacts): AboutSource[] {
  // The Oxford split is counted rather than written out by hand. Rounding it to
  // a tidy "5,000 from Oxford" would hide the one word that has no list source,
  // which is exactly the kind of rounding that makes a provenance page
  // worthless.
  const unsourced =
    facts.unsourced > 0
      ? facts.unsourced === 1
        ? {
            bn: "বাকি একটি শব্দ তালিকা উৎস ছাড়াই যোগ করা হয়েছে।",
            en: "The remaining single word was added without a list source.",
          }
        : {
            bn: `বাকি ${nf.format(facts.unsourced)}টি শব্দ তালিকা উৎস ছাড়াই যোগ করা হয়েছে।`,
            en: `The remaining ${nf.format(facts.unsourced)} words were added without a list source.`,
          }
      : {
          bn: "সব শব্দই এই দুটি তালিকা থেকে নেওয়া।",
          en: "Every word comes from these two lists.",
        };

  return [
    {
      titleBn: "অক্সফোর্ড ৩০০০ ও ৫০০০",
      titleEn: "Oxford 3000 and 5000",
      descBn: `আমাদের ${nf.format(facts.wordTotal)}টি শব্দের মধ্যে ${nf.format(facts.oxford3000)}টি অক্সফোর্ড ৩০০০ তালিকা থেকে এবং ${nf.format(facts.oxford5000)}টি অক্সফোর্ড ৫০০০ তালিকা থেকে এসেছে। ${unsourced.bn}`,
      descEn: `Of the ${nf.format(facts.wordTotal)} words, ${nf.format(facts.oxford3000)} come from the Oxford 3000 list and ${nf.format(facts.oxford5000)} from the Oxford 5000 list. ${unsourced.en}`,
    },
    {
      titleBn: "CEFR লেভেল বিভাজন",
      titleEn: "CEFR level split",
      descBn:
        "Council of Europe-এর Common European Framework of Reference for Languages-এর সাধারণ বর্ণনা।",
      descEn:
        "The Common European Framework of Reference for Languages, published by the Council of Europe.",
    },
    {
      titleBn: "বাংলা অর্থ ও উদাহরণ",
      titleEn: "Bangla meanings and examples",
      descBn:
        "প্রতিটি এন্ট্রির বাংলা অর্থ, ইংরেজি সংজ্ঞা ও উদাহরণ বাক্য আমাদের নিজস্বভাবে লেখা, কোনো প্রকাশিত অভিধান থেকে কপি করা নয়।",
      descEn:
        "Every Bangla meaning, English definition and example sentence is written by us, not copied from a published dictionary.",
    },
  ];
}

export const ATTRIBUTION_BN =
  "অক্সফোর্ড ৩০০০ ও অক্সফোর্ড ৫০০০ তালিকা Oxford University Press-এর সম্পত্তি। জিরো ইংলিশ একটি স্বতন্ত্র প্রকল্প; এটি Oxford University Press-এর সঙ্গে যুক্ত, অনুমোদিত বা পৃষ্ঠপোষক প্রতিষ্ঠান নয়, এবং আমরা ওই তালিকার মালিক নই।";

export const ATTRIBUTION_EN =
  "The Oxford 3000 and Oxford 5000 word lists are the property of Oxford University Press. Zero English is an independent project. It is not affiliated with, endorsed by or sponsored by Oxford University Press, and we do not own those lists.";

export const LAST_REVIEWED = "2026-09-29";
