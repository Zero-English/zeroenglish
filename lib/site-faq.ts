export interface FaqEntry {
  qBn: string;
  qEn: string;
  aBn: string;
  aEn: string;
}

/**
 * Rendered as the visible accordion on /about and serialised into that page's
 * `FAQPage` JSON-LD from the same array, so the two can never disagree.
 *
 * Answers are written to be checkable against the site. Anything the product
 * does not actually do (a fixed "50 words a day" plan, a completed C2 list,
 * licensed Oxford content) is stated as a limitation rather than a promise.
 */
export const FAQS: FaqEntry[] = [
  {
    qBn: "জিরো ইংলিশ কী?",
    qEn: "What is Zero English?",
    aBn:
      "জিরো ইংলিশ একটি দ্বিভাষিক ইংরেজি শেখার প্ল্যাটফর্ম। অক্সফোর্ড ৩০০০ ও ৫০০০ তালিকা থেকে বাছাই করা ইংরেজি শব্দগুলো CEFR লেভেল অনুযায়ী সাজানো, আর প্রতিটি শব্দের বাংলা অর্থ, ইংরেজি সংজ্ঞা, উদাহরণ বাক্য, প্রতিশব্দ ও বিপরীত শব্দ দেওয়া আছে। শব্দগুলো দেখা যায় A1 থেকে C1 লেভেল পর্যন্ত।",
    aEn:
      "Zero English is a bilingual English-learning platform. English headwords taken from the Oxford 3000 and 5000 lists are sorted by CEFR level, and each one carries a Bangla meaning, an English definition, example sentences, synonyms and antonyms. The word lists are open from A1 to C1.",
  },
  {
    qBn: "এটি কি সত্যিই বিনামূল্যে?",
    qEn: "Is it really free?",
    aBn:
      "হ্যাঁ। সব শব্দ, কুইজ ও পরীক্ষা বিনামূল্যে। অ্যাকাউন্ট খোলা বা লগইন করা ঐচ্ছিক, আর অ্যাকাউন্ট ছাড়াই শেখার অগ্রগতি আপনার নিজের ডিভাইসে সংরক্ষিত হয়। কোনো পেমেন্ট, কোনো বিজ্ঞাপন নেই।",
    aEn:
      "Yes. Every word, quiz and exam is free. An account is optional, and without one your progress is stored on your own device. There is no payment and no advertising.",
  },
  {
    qBn: "কোন লেভেলগুলোতে শব্দ আছে?",
    qEn: "Which levels have words?",
    aBn:
      "A1, A2, B1, B2 ও C1 — এই পাঁচটি লেভেলে শব্দ আছে এবং শেখার জন্য খোলা। C2 লেভেলের তালিকা এখনো লেখা হচ্ছে; যথেষ্ট শব্দ জমা না হওয়া পর্যন্ত সেটি বন্ধ রাখা হয়েছে এবং সার্চ ইঞ্জিন থেকে বাদ দেওয়া হয়েছে।",
    aEn:
      "A1, A2, B1, B2 and C1 are open for study. The C2 list is still being written; it stays closed and out of search results until it holds enough words to be worth your time.",
  },
  {
    qBn: "শব্দগুলো কোথা থেকে এসেছে? অক্সফোর্ডের সঙ্গে কি সম্পর্ক আছে?",
    qEn: "Where do the words come from? Are you affiliated with Oxford?",
    aBn:
      "শব্দগুলো অক্সফোর্ড ইউনিভার্সিটি প্রেসের প্রকাশিত অক্সফোর্ড ৩০০০ ও অক্সফোর্ড ৫০০০ শব্দতালিকার শিরোনাম (headword) থেকে নেওয়া। বাংলা অর্থ, ইংরেজি সংজ্ঞা ও উদাহরণ বাক্যগুলো আমাদের নিজস্বভাবে লেখা। জিরো ইংলিশ অক্সফোর্ড ইউনিভার্সিটি প্রেসের সঙ্গে যুক্ত, অনুমোদিত বা পৃষ্ঠপোষক প্রতিষ্ঠান নয়, এবং আমরা ওই তালিকার মালিক নই।",
    aEn:
      "The headwords come from the published Oxford 3000 and Oxford 5000 word lists from Oxford University Press. The Bangla meanings, English definitions and example sentences are written by us. Zero English is not affiliated with, endorsed by or sponsored by Oxford University Press, and we do not own those lists.",
  },
  {
    qBn: "একটি শব্দের এন্ট্রি কীভাবে তৈরি হয়?",
    qEn: "How is a word entry put together?",
    aBn:
      "প্রতিটি এন্ট্রিতে ছয়টি অংশ থাকে: ইংরেজি শব্দ, বাংলা অর্থ, এক বাক্যে ইংরেজি সংজ্ঞা, দুটি উদাহরণ বাক্য (ইংরেজি ও বাংলা), প্রতিশব্দ এবং বিপরীত শব্দ। লেভেল অনুযায়ী ভাগ করার সময় CEFR-এর সাধারণ বর্ণনা অনুসরণ করা হয়, অর্থাৎ সেই স্তরে একজন শিক্ষার্থী কোন শব্দটির সঙ্গে পরিচিত হওয়ার কথা।",
    aEn:
      "Each entry has six parts: the English word, its Bangla meaning, a one-line English definition, two example sentences in English and Bangla, synonyms, and antonyms. Words are assigned to a level using the Council of Europe CEFR can-do statements, meaning what a learner at that stage is expected to recognise.",
  },
  {
    qBn: "কোনো ভুল পেলে জানাব কীভাবে?",
    qEn: "How do I report a mistake?",
    aBn:
      "যেকোনো ভুল অর্থ, ভুল লেভেল বা ভুল উদাহরণ দেখলে ইমেইল করুন। ইমেইলে শব্দটির নাম, পাতার ঠিকানা এবং কী কী ভুল বলে মনে হচ্ছে তা লিখে দিলে দ্রুত ঠিক করা সহজ হয়। সংশোধিত এন্ট্রির সঙ্গে পরিবর্তনের তারিখও যোগ করা হয়।",
    aEn:
      "Email us if you find a wrong meaning, a wrongly assigned level or a bad example. Include the word, the page URL and what looks wrong, and it is much faster to fix. Corrected entries carry the date of the change.",
  },
  {
    qBn: "কীভাবে শেখা শুরু করব?",
    qEn: "How do I start learning?",
    aBn:
      "শব্দভাণ্ডার পাতা থেকে আপনার লেভেল বেছে নিন, তারপর প্রতিটি শব্দে শেখা বা এখনো শিখছি চিহ্নিত করুন। অ্যাকাউন্ট খোলা ঐচ্ছিক, তবে খুললে অগ্রগতি সব ডিভাইসে একসঙ্গে থাকে। শব্দ মুখস্থ হয়ে গেলে কুইজ দিয়ে যাচাই করুন।",
    aEn:
      "Pick a level from the vocabulary page, then mark each word as learned or still learning. An account is optional, though having one keeps your progress in sync across devices. Once the words look familiar, check yourself with a quiz.",
  },
  {
    qBn: "আমার অগ্রগতি কি ট্র্যাক হবে?",
    qEn: "Will my progress be tracked?",
    aBn:
      "হ্যাঁ। শেখা শব্দ, বুকমার্ক ও কুইজের ফলাফল সংরক্ষিত হয় এবং প্রোফাইল থেকে সারাংশ ও অগ্রগতি চার্ট দেখা যায়। অ্যাকাউন্ট ছাড়া থাকলে এই তথ্য আপনার ব্রাউজারেই থাকে এবং অ্যাকাউন্টে ঢুকলে সেখান থেকে চালিয়ে নেওয়া যায়।",
    aEn:
      "Yes. Learned words, bookmarks and quiz results are saved, with a summary and progress chart in your profile. Without an account this stays in your browser, and signing in picks up from there.",
  },
  {
    qBn: "অফলাইনে শেখা যাবে?",
    qEn: "Can I learn offline?",
    aBn:
      "জিরো ইংলিশ একটি PWA, মানে ওয়েব অ্যাপ। ইন্সটল করলে অফলাইনেও শেখা চালিয়ে যেতে পারেন। অগ্রগতি আপনার ডিভাইসে সংরক্ষিত হয়, এবং অ্যাকাউন্ট থাকলে পরে সেখানে মিলিয়ে নেওয়া হয়।",
    aEn:
      "Zero English is a PWA, which is a web app. Install it and you can keep learning without a connection. Progress is stored on your device, and is merged into your account later if you have one.",
  },
];
