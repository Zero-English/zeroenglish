"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  Target,
  Users,
  Sparkles,
  ArrowRight,
  Mail,
  Globe,
  Share2,
  Eye,
  Compass,
  Accessibility,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";

const STATS = [
  { value: "5,000+", labelBn: "অক্সফোর্ড শব্দ", labelEn: "Oxford words" },
  { value: "6", labelBn: "CEFR লেভেল", labelEn: "CEFR levels" },
  { value: "2", labelBn: "ভাষা", labelEn: "Languages" },
  { value: "100%", labelBn: "বিনামূল্যে", labelEn: "Free to learn" },
];

const MISSION_VISION = [
  {
    icon: Target,
    eyebrowBn: "আমাদের লক্ষ্য",
    eyebrowEn: "Our Mission",
    titleBn: "শূন্য থেকে আত্মবিশ্বাস",
    titleEn: "From zero to confidence",
    descBn:
      "প্রতিটি বাংলাভাষী শিক্ষার্থী যেন নিজের গতিতে, নিজের ভাষায় ইংরেজি আয়ত্ত করতে পারে — শব্দে শব্দে, ধাপে ধাপে, কোনো ভয় ছাড়াই।",
    descEn:
      "To help every Bangla-speaking learner master English at their own pace and in their own language — word by word, step by step, without fear.",
  },
  {
    icon: Eye,
    eyebrowBn: "আমাদের স্বপ্ন",
    eyebrowEn: "Our Vision",
    titleBn: "ভাষা আর বাধা নয়",
    titleEn: "Language without barriers",
    descBn:
      "এমন একটি জগৎ যেখানে ইংরেজি শেখা সবার নাগালে — প্রযুক্তির সাহায্যে শিক্ষা হোক সবার জন্য সহজলভ্য ও আনন্দময়।",
    descEn:
      "A world where English is within everyone's reach — using technology to make education accessible and joyful for all.",
  },
  {
    icon: Compass,
    eyebrowBn: "আমাদের পদ্ধতি",
    eyebrowEn: "Our Approach",
    titleBn: "ধাপে ধাপে, মজায় মজায়",
    titleEn: "Step by step, with joy",
    descBn:
      "অক্সফোর্ড ৫০০০ তালিকা, CEFR লেভেল, বাংলা অর্থ ও কুইজ — সব মিলিয়ে একটি সহজ, কার্যকরী ও মজার শেখার পদ্ধতি।",
    descEn:
      "Oxford 5000, CEFR levels, Bangla meanings and quizzes — a simple, effective and fun learning method all in one place.",
  },
];

const VALUES = [
  {
    icon: Accessibility,
    titleBn: "সবার জন্য উন্মুক্ত",
    titleEn: "Open to everyone",
    descBn:
      "১০০% বিনামূল্যে — যেকোনো ডিভাইসে, যেকোনো জায়গায় শেখা শুরু করুন।",
    descEn: "100% free — start learning on any device, anywhere.",
  },
  {
    icon: Layers,
    titleBn: "গোছানো ও নির্ভরযোগ্য",
    titleEn: "Structured & reliable",
    descBn:
      "A1 থেকে C2 — ধাপে ধাপে গোছানো পথচলা, যেন কেউ হারিয়ে না যায়।",
    descEn: "A1 to C2 — a clearly structured path so nobody gets lost.",
  },
  {
    icon: Sparkles,
    titleBn: "আনন্দময় অভিজ্ঞতা",
    titleEn: "Joyful experience",
    descBn:
      "কুইজ, পরীক্ষা ও অগ্রগতির আয়না — শেখা যেন বাধ্যবাধকতা না হয়ে হয় আনন্দ।",
    descEn: "Quizzes, exams and progress tracking make learning a joy, not a chore.",
  },
];

const FAQS = [
  {
    qBn: "জিরো ইংলিশ কী?",
    qEn: "What is Zero English?",
    aBn:
      "জিরো ইংলিশ একটি দ্বিভাষিক ইংরেজি শেখার প্ল্যাটফর্ম — বাংলা অর্থসহ অক্সফোর্ড ৫০০০ শব্দের তালিকা থেকে A1 থেকে C2 লেভেল পর্যন্ত শেখানো হয়।",
    aEn:
      "Zero English is a bilingual English learning platform that teaches the Oxford 5000 word list with Bangla meanings, from A1 to C2 levels.",
  },
  {
    qBn: "এটি কি সত্যিই বিনামূল্যে?",
    qEn: "Is it really free?",
    aBn:
      "হ্যাঁ। সব শব্দ, কুইজ ও পরীক্ষা — সবকিছুই বিনামূল্যে। আমরা এখনো শুরুতে আছি, তাই প্রথম থেকেই সবকিছু সবার জন্য উন্মুক্ত রেখেছি।",
    aEn:
      "Yes. All words, quizzes and exams are completely free. We're still early, so we've kept everything open from day one.",
  },
  {
    qBn: "কোন লেভেলগুলো কভার করা হয়?",
    qEn: "Which levels are covered?",
    aBn:
      "A1, A2, B1, B2, C1 ও C2 — ছয়টি CEFR লেভেলই। আপনি যেকোনো লেভেল থেকে শুরু করে ধীরে ধীরে এগিয়ে যেতে পারেন।",
    aEn:
      "All six CEFR levels: A1, A2, B1, B2, C1 and C2. Start from any level and progress step by step.",
  },
  {
    qBn: "কীভাবে শেখা শুরু করব?",
    qEn: "How do I start learning?",
    aBn:
      "শব্দভান্ডার পেজ থেকে আপনার লেভেল বেছে নিন, অ্যাকাউন্ট খুলুন (ঐচ্ছিক) এবং দৈনিক ৫০টি শব্দের লক্ষ্য রাখুন। কুইজ দিয়ে নিজেকে যাচাই করুন।",
    aEn:
      "Pick your level from the vocabulary page, create an account (optional), and aim for 50 words a day. Test yourself with quizzes.",
  },
  {
    qBn: "আমার অগ্রগতি কি ট্র্যাক হবে?",
    qEn: "Will my progress be tracked?",
    aBn:
      "হ্যাঁ — শেখা শব্দ, বুকমার্ক ও কুইজের ফলাফল সংরক্ষিত হয় এবং প্রোফাইল থেকে সারাংশ ও অগ্রগতি চার্ট দেখা যায়।",
    aEn:
      "Yes — learned words, bookmarks and quiz results are saved, with a summary and progress chart in your profile.",
  },
  {
    qBn: "অফলাইনে শেখা যাবে?",
    qEn: "Can I learn offline?",
    aBn:
      "জিরো ইংলিশ একটি PWA — ওয়েব অ্যাপ হিসেবে ইন্সটল করলে অফলাইনেও শেখা চালিয়ে যেতে পারেন, প্রগতি ডিভাইসে সংরক্ষিত হয়।",
    aEn:
      "Zero English is a PWA — install it as an app and keep learning offline, with progress saved on your device.",
  },
];

function FaqItem({
  faq,
}: {
  faq: { qBn: string; qEn: string; aBn: string; aEn: string };
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors hover:text-orange-500"
      >
        {t(faq.qBn, faq.qEn)}
        <ChevronDown
          className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t(faq.aBn, faq.aEn)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AboutClient() {
  const t = useT();

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

      <div className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <section className="text-center mb-14 animate-fade-up">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              <Rocket className="h-3.5 w-3.5 text-orange-500" />
              {t("একটি স্টার্টআপ", "A Startup")}
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {t("জিরো ইংলিশ", "Zero English")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                {t("শূন্য থেকে শুরু।", "from zero.")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              {t(
                "জিরো ইংলিশ একটি উদীয়মান স্টার্টআপ, যার লক্ষ্য বাংলাভাষী শিক্ষার্থীদের জন্য ইংরেজি শব্দভাণ্ডার শেখা সহজ, মজার ও কার্যকর করা।",
                "Zero English is a growing startup on a mission to make English vocabulary learning simple, fun and effective for Bangla-speaking learners."
              )}
            </p>
          </section>

          <section className="mb-14">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t("আমরা কেন এখানে", "Why we're here")}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t("ইংরেজি যেন আর কারও সামর্থ্যের বাইরে না থাকে।", "English should never be out of anyone's reach.")}
              </p>
            </div>
            <div className="prose prose-neutral dark:prose-invert space-y-4 text-zinc-600 dark:text-zinc-400">
              <p>
                {t(
                  "আমরা বিশ্বাস করি, ভাষা শেখা সবার হাতের নাগালে হওয়া উচিত। কিন্তু অনেক শিক্ষার্থীর জন্য ইংরেজি একটি বাধা হয়ে থাকে — জটিল পদ্ধতি, উপযোগী সরঞ্জামের অভাব এবং অনুপ্রেরণার ঘাটতির কারণে।",
                  "We believe language learning should be within everyone's reach. But for many learners English becomes a barrier — because of complicated methods, a lack of the right tools, and no motivation."
                )}
              </p>
              <p>
                {t(
                  "জিরো ইংলিশ সেই ফাঁক পূরণ করার জন্যই শুরু হওয়া একটি স্টার্টআপ। আমরা অক্সফোর্ড ৫০০০ শব্দের তালিকা বাংলা অর্থসহ বিন্যস্ত করেছি, যেন শিক্ষার্থীরা ধাপে ধাপে, নিজের গতিতে এগিয়ে যেতে পারে।",
                  "Zero English is a startup built to fill that gap. We've organized the Oxford 5000 word list with Bangla meanings, so learners can progress step by step, at their own pace."
                )}
              </p>
              <p>
                {t(
                  "আমরা এখনও শুরুতে আছি, কিন্তু আমাদের স্বপ্ন বড় — বাংলাভাষী লক্ষ লক্ষ মানুষের জন্য ইংরেজি শেখাকে আনন্দময় করে তোলা।",
                  "We're still early, but our dream is big — making English learning joyful for millions of Bangla speakers."
                )}
              </p>
            </div>
          </section>

          <section className="mb-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.labelEn}
                  className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    {t(stat.labelBn, stat.labelEn)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                <Target className="h-3.5 w-3.5 text-orange-500" />
                {t("কেন আমরা আছি", "Our Purpose")}
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
                {t("লক্ষ্য, স্বপ্ন ও পদ্ধতি", "Mission, Vision & Approach")}
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                {t(
                  "তিনটি স্তম্ভ আমাদের প্রতিটি পদক্ষেপকে পরিচালিত করে।",
                  "Three pillars guide every step we take."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {MISSION_VISION.map(
                ({ icon: Icon, eyebrowBn, eyebrowEn, titleBn, titleEn, descBn, descEn }) => (
                  <div
                    key={eyebrowEn}
                    className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-500">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {t(eyebrowBn, eyebrowEn)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      {t(titleBn, titleEn)}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {t(descBn, descEn)}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="mb-14">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t("আমাদের মূল্যবোধ", "What we stand for")}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t("তিনটি নীতি আমাদের প্রতিটি সিদ্ধান্তকে পরিচালিত করে।", "Three principles guide every decision we make.")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {VALUES.map(({ icon: Icon, titleBn, titleEn, descBn, descEn }) => (
                <div
                  key={titleEn}
                  className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-500 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    {t(titleBn, titleEn)}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {t(descBn, descEn)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t("সাধারণ জিজ্ঞাসা", "Frequently Asked Questions")}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t(
                  "আপনার মনে আসা সবচেয়ে সাধারণ প্রশ্নগুলোর উত্তর।",
                  "Quick answers to the questions we hear the most."
                )}
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq) => (
                <FaqItem key={faq.qEn} faq={faq} />
              ))}
            </div>
          </section>

          <section className="mb-14">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                <Users className="h-3.5 w-3.5 text-orange-500" />
                {t("আমাদের টিম", "Our Team")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
                {t("জিরো ইংলিশের প্রতিষ্ঠাতা", "The Founders of Zero English")}
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                {t(
                  "একটি লক্ষ্য, এক জোড়া দৃষ্টিভঙ্গি — শিক্ষাকে সহজ ও আনন্দময় করে তোলা।",
                  "One mission, one shared vision — making learning simple and joyful."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src="/assets/images/founder-tahmid.png"
                    alt="Tahmid Hasan"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 backdrop-blur">
                      {t("প্রতিষ্ঠাতা", "Founder")}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <a
                        href="https://github.com/iamtahmidhasan"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Share2 className="h-4 w-4" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/im-tahmid-hasan/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                      <a
                        href="https://www.tahmidhasan.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Portfolio"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Sparkles className="h-4 w-4" />
                      </a>
                      <a
                        href="mailto:tahmidhasanpro@gmail.com"
                        aria-label="Email"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>

                    <h3 className="text-center text-xl font-bold text-white">
                      Tahmid Hasan
                    </h3>
                    <p className="text-center text-sm font-medium text-orange-200 mt-0.5">
                      {t("ওয়েব ডেভেলপার ও UI ডিজাইনার", "Web Developer & UI Designer")}
                    </p>

                    <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-active:grid-rows-[1fr] group-active:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100">
                      <div className="overflow-hidden">
                        <p className="mt-3 text-center text-sm leading-relaxed text-zinc-100/90 max-w-sm mx-auto">
                          {t(
                            "জিরো ইংলিশের প্রতিষ্ঠাতা। ইঞ্জিনিয়ারিং শিক্ষার্থী ও ডেভেলপার — WordPress, Next.js ও UI ডিজাইনে দক্ষ, যিনি আধুনিক ও ব্যবহারকারী-কেন্দ্রিক ডিজিটাল অভিজ্ঞতা তৈরি করেন।",
                            "Founder of Zero English. An engineering student and developer specializing in WordPress, Next.js, and UI design — building modern, user-focused digital experiences."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src="/assets/images/co-founder-mahir.jpeg"
                    alt="Md. Mahir Asef"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 backdrop-blur">
                      {t("সহ-প্রতিষ্ঠাতা", "Co-Founder")}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <a
                        href="https://github.com/Md-Mahir-Asef"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Share2 className="h-4 w-4" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/md-mahir-asef-dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                      <a
                        href="https://mdmahirasef.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Portfolio"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Sparkles className="h-4 w-4" />
                      </a>
                      <a
                        href="mailto:mdmahirasef.dev@gmail.com"
                        aria-label="Email"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur ring-1 ring-white/30 transition-colors hover:bg-white hover:text-zinc-900"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>

                    <h3 className="text-center text-xl font-bold text-white">
                      {t("মো. মাহির আসেফ", "Md. Mahir Asef")}
                    </h3>
                    <p className="text-center text-sm font-medium text-sky-200 mt-0.5">
                      {t("ফুল-স্ট্যাক সফটওয়্যার ইঞ্জিনিয়ার", "Full-Stack Software Engineer")}
                    </p>

                    <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-active:grid-rows-[1fr] group-active:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100">
                      <div className="overflow-hidden">
                        <p className="mt-3 text-center text-sm leading-relaxed text-zinc-100/90 max-w-sm mx-auto">
                          {t(
                            "জিরো ইংলিশের সহ-প্রতিষ্ঠাতা। ব্যাকএন্ড-ফোকাসড ফুল-স্ট্যাক ইঞ্জিনিয়ার — TypeScript, Node.js ও PostgreSQL-এ দক্ষ, যিনি পরিষ্কার ও প্রোডাকশন-রেডি ওয়েব অ্যাপ্লিকেশন তৈরিতে নিবেদিত।",
                            "Co-founder of Zero English. A backend-focused full-stack engineer specializing in TypeScript, Node.js, and PostgreSQL — passionate about building clean, production-ready web applications."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
              {t("আপনার যাত্রা শুরু হোক", "Start your journey")}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-6">
              {t(
                "আমাদের সাথে প্রতিদিন একটু করে ইংরেজি শিখুন। শূন্য থেকে শুরু করুন, ধাপে ধাপে এগিয়ে যান।",
                "Learn a little English with us every day. Start from zero and progress step by step."
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
              >
                <Link href="/vocabulary">
                  {t("শেখা শুরু করুন", "Start Learning")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium">
                <Link href="mailto:zeroenglishweb@gmail.com">
                  <Mail className="size-4" />
                  {t("আমাদের সাথে যোগাযোগ", "Contact Us")}
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
