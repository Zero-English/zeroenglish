import {
  Compass,
  Flame,
  Filter,
  MousePointerClick,
  Bookmark,
  Layers,
  Volume2,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { TourConfig } from "./types";

/**
 * 1. Tour for Main Vocabulary Hub (/vocabulary)
 */
export const VOCABULARY_HUB_TOUR: TourConfig = {
  id: "vocabulary-hub",
  steps: [
    {
      target: '[data-tour="level-cards"]',
      title: {
        en: "CEFR Proficiency Levels",
        bn: "CEFR দক্ষতার স্তরসমূহ",
      },
      description: {
        en: "Select a level from A1 (Beginner) to C1 (Advanced) to explore curated vocabulary tailored to your exact fluency stage.",
        bn: "আপনার বর্তমান ইংরেজি দক্ষতার সাথে মানানসই শব্দ শিখতে A1 (প্রারম্ভিক) থেকে C1 (উন্নত) যেকোনো স্তর বেছে নিন।",
      },
      badge: {
        en: "Levels A1–C1",
        bn: "A1–C1 লেভেল",
      },
      icon: Compass,
      placement: "bottom",
    },
    {
      target: '[data-tour="daily-goal"]',
      title: {
        en: "Daily Goal & Streaks",
        bn: "দৈনিক লক্ষ্য ও স্ট্রিক",
      },
      description: {
        en: "Track your daily study target and build an unbroken learning streak by mastering words every single day.",
        bn: "প্রতিদিন নিয়মিত নতুন শব্দ শিখে আপনার দৈনিক লক্ষ্য পূরণ করুন এবং স্ট্রিক বজায় রাখুন।",
      },
      badge: {
        en: "Habit Tracker",
        bn: "অনুশীলন ট্র্যাকার",
      },
      icon: Flame,
      placement: "bottom",
    },
    {
      target: '[data-tour="tier-filter"]',
      title: {
        en: "Quick Tier Filtering",
        bn: "সহজ টায়ার ফিল্টার",
      },
      description: {
        en: "Switch between Beginner, Intermediate, and Advanced tiers with one tap to focus your study session.",
        bn: "আপনার সুবিধামতো এক ক্লিকে প্রারম্ভিক, মাঝারি বা উন্নত লেভেল ফিল্টার করে পড়াশোনায় মনোযোগ দিন।",
      },
      badge: {
        en: "Filter",
        bn: "ফিল্টারিং",
      },
      icon: Filter,
      placement: "bottom",
    },
  ],
};

/**
 * 2. Tour for Vocabulary Level Page & Sub-Pages (/vocabulary/[level], /vocabulary/[level]/[pageNum])
 */
export const LEVEL_WORDS_TOUR: TourConfig = {
  id: "level-words",
  steps: [
    {
      target: '[data-tour="word-card"]',
      title: {
        en: "Secret Shortcut: Double-Click to Master",
        bn: "গোপন শর্টকাট: ডাবল-ক্লিকে আয়ত্ত করুন",
      },
      description: {
        en: "Double-click (or double-tap on mobile) anywhere on a word card to instantly mark it as Learned/Mastered without opening it!",
        bn: "যেকোনো শব্দ কার্ডের ওপর পরপর দুইবার ক্লিক (বা মোবাইলে ডাবল-ট্যাপ) করলেই শব্দটি তৎক্ষণাৎ আপনার 'আয়ত্ত' তালিকায় যোগ হবে!",
      },
      badge: {
        en: "Double Click / Tap",
        bn: "ডাবল ক্লিক বা ট্যাপ",
      },
      icon: MousePointerClick,
      placement: "bottom",
      highlightPadding: 10,
    },
    {
      target: '[data-tour="card-actions"]',
      title: {
        en: "Audio & Quick Actions",
        bn: "অডিও উচ্চারণ ও বুকমার্ক",
      },
      description: {
        en: "Tap the speaker icon to listen to natural pronunciation. Use the bookmark icon to save tricky words for quick revision.",
        bn: "শব্দের সঠিক উচ্চারণ শুনতে স্পিকার বাটনে চাপুন এবং কঠিন শব্দগুলো দ্রুত রিভিশন দিতে বুকমার্কে সংরক্ষণ করুন।",
      },
      badge: {
        en: "Audio & Bookmark",
        bn: "অডিও ও বুকমার্ক",
      },
      icon: Bookmark,
      placement: "bottom",
      highlightPadding: 6,
    },
    {
      target: '[data-tour="filter-bar"]',
      title: {
        en: "Smart Study Filters",
        bn: "স্মার্ট স্টাডি ফিল্টার",
      },
      description: {
        en: "Open the filter dialog to view only 'Unlearned' words, filter by parts of speech, or sort alphabetically and by frequency.",
        bn: "শুধুমাত্র অজানা শব্দ ('না শেখা') দেখতে, ব্যাকরণগত পদ বা ক্যাটাগরি অনুযায়ী ফিল্টার করতে এই বাটনটি ব্যবহার করুন।",
      },
      badge: {
        en: "Study Status Filter",
        bn: "শেখার স্ট্যাটাস ফিল্টার",
      },
      icon: Filter,
      placement: "bottom",
      highlightPadding: 6,
    },
    {
      target: '[data-tour="pagination"]',
      title: {
        en: "Full-Width Page Navigator",
        bn: "সম্পূর্ণ পেজ নেভিগেশন",
      },
      description: {
        en: "Scroll smoothly through all page numbers. The active page automatically stays centered as you advance through the level.",
        bn: "সবগুলো পেজ নম্বরের মধ্য দিয়ে সহজে স্ক্রল করুন। আপনার বর্তমান পেজটি স্বয়ংক্রিয়ভাবে স্ক্রিনের কেন্দ্রে থাকবে।",
      },
      badge: {
        en: "Auto-Centering Track",
        bn: "অটো-সেন্টারিং ট্র্যাক",
      },
      icon: Layers,
      placement: "top",
      highlightPadding: 8,
    },
  ],
};

/**
 * 3. Tour for Single Word Detail Page (/vocabulary/[word])
 */
export const WORD_DETAIL_TOUR: TourConfig = {
  id: "word-detail",
  steps: [
    {
      target: '[data-tour="word-audio"]',
      title: {
        en: "Audio Pronunciation & Pitch",
        bn: "অডিও উচ্চারণ ও পিচ",
      },
      description: {
        en: "Listen to natural speech pronunciation. Tap again to hear at a slower, comfortable learning speed.",
        bn: "স্বাভাবিক ইংরেজি উচ্চারণ শুনুন। ধীরগতিতে স্পষ্ট উচ্চারণ শুনতে একাধিকবার চাপুন।",
      },
      badge: {
        en: "Natural Speech",
        bn: "স্বাভাবিক উচ্চারণ",
      },
      icon: Volume2,
      placement: "bottom",
      highlightPadding: 6,
    },
    {
      target: '[data-tour="active-recall"]',
      title: {
        en: "Active Recall Flashcard Mode",
        bn: "অ্যাক্টিভ রিকল মেমোরি মোড",
      },
      description: {
        en: "Tap to blur the Bengali meaning! Try to remember the definition yourself first before revealing it to strengthen neural memory.",
        bn: "বাংলা অর্থ লুকিয়ে রেখে নিজে নিজে মনে করার চেষ্টা করুন! এরপর ট্যাপ করে মিলিয়ে নিন—এতে শব্দ দীর্ঘমেয়াদে মনে থাকে।",
      },
      badge: {
        en: "Active Recall",
        bn: "স্মৃতিশক্তি বৃদ্ধি",
      },
      icon: EyeOff,
      placement: "bottom",
      highlightPadding: 6,
    },
    {
      target: '[data-tour="quick-quiz"]',
      title: {
        en: "Instant Self-Check Quiz",
        bn: "তাৎক্ষণিক প্রস্তুতি যাচাই কুইজ",
      },
      description: {
        en: "Select the correct Bengali meaning in the 4-option mini-quiz to verify your comprehension on the spot.",
        bn: "শব্দটি পড়া শেষ হলে সাথে সাথেই এই ছোট কুইজে সঠিক উত্তর নির্বাচন করে আপনার প্রস্তুতি যাচাই করে নিন।",
      },
      badge: {
        en: "Interactive Quiz",
        bn: "ইন্টারেক্টিভ কুইজ",
      },
      icon: CheckCircle2,
      placement: "top",
      highlightPadding: 8,
    },
    {
      target: '[data-tour="word-actions"]',
      title: {
        en: "Track in Your Personal Database",
        bn: "ব্যক্তিগত ডাটাবেসে সেভ করুন",
      },
      description: {
        en: "Mark the word as Learned or Bookmark it. Once you master 10 words and bookmarks, you become an advanced learner!",
        bn: "শব্দটি 'শেখা শেষ' মার্ক করুন অথবা বুকমার্ক করে রাখুন। ১০টি শব্দ আয়ত্ত করলেই আপনি নিয়মিত লার্নারে পরিণত হবেন!",
      },
      badge: {
        en: "Progress Saved",
        bn: "অগ্রগতি সংরক্ষিত",
      },
      icon: Sparkles,
      placement: "top",
      highlightPadding: 6,
    },
  ],
};
