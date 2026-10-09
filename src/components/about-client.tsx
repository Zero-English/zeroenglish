"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  Target,
  Users,
  ArrowRight,
  Mail,
  Globe,
  Share2,
  Sparkles,
  ShieldCheck,
  Compass,
  ListChecks,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";
import { FAQS } from "@/lib/site-faq";
import {
  buildAboutCards,
  buildAboutSources,
  ABOUT_METHOD_STEPS,
  ATTRIBUTION_BN,
  ATTRIBUTION_EN,
  buildAboutStats,
  LAST_REVIEWED,
  type AboutFacts,
} from "@/lib/about-content";
import { SITE_CONTACT_EMAIL } from "@/lib/site-config";

const CARD_ICON = {
  target: Target,
  compass: Compass,
  shield: ShieldCheck,
} as const;

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

export function AboutClient({ facts }: { facts: AboutFacts }) {
  const t = useT();

  // Derived here from the same object the page's `Dataset` schema reads, so a
  // number on screen and a number in structured data can never disagree.
  const stats = buildAboutStats(facts);

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

      <div className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              <Rocket className="h-3.5 w-3.5 text-orange-500" />
              {t("একটি স্বতন্ত্র প্রকল্প", "An independent project")}
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {t("জিরো ইংলিশ", "Zero English")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                {t("কীভাবে কাজ করে।", "and how it works.")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              {t(
                "এই পাতায় আমরা কী তৈরি করেছি, একটি শব্দের এন্ট্রি কীভাবে তৈরি হয়, কোন তালিকা থেকে শব্দ নেওয়া হয়, এবং কী কী এখনো হয়নি — সব লিখে দেওয়া আছে।",
                "This page states what exists, how a word entry is put together, which lists the words come from, and what is not finished yet."
              )}
            </p>
          </section>

          <section className="mb-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.labelEn}
                  className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 text-center"
                >
                  <div className="text-2xl sm:text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    {t(stat.labelBn, stat.labelEn)}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              {t(
                `সংখ্যাগুলো এই মুহূর্তে ডাটাবেস থেকে গোনা। শেষ দেখা: ${LAST_REVIEWED}।`,
                `Counted from the database at request time. Last reviewed: ${LAST_REVIEWED}.`
              )}
            </p>
          </section>

          <section className="mb-14">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                <ListChecks className="h-3.5 w-3.5 text-orange-500" />
                {t("আমাদের পদ্ধতি", "Our method")}
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
                {t("একটি শব্দের এন্ট্রি কীভাবে তৈরি হয়", "How a word entry is made")}
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                {t(
                  "প্রতিটি এন্ট্রির জন্য ছয়টি ধাপ। শুধু এই ছয় ধাপই আমাদের প্রক্রিয়া, এর বেশি কিছু নয়।",
                  "Six steps per entry. That is the whole process, not a summary of a longer one."
                )}
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {ABOUT_METHOD_STEPS.map((step, i) => (
                <li
                  key={step.titleEn}
                  className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/60 text-xs font-bold tabular-nums text-orange-600 dark:text-orange-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {t(step.titleBn, step.titleEn)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {t(step.descBn, step.descEn)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-14">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                <Target className="h-3.5 w-3.5 text-orange-500" />
                {t("পরিষ্কার উত্তর", "Plain answers")}
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
                {t("যা আছে, যা নেই", "What is there, what is not")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {buildAboutCards(facts).map(
                ({ icon, eyebrowBn, eyebrowEn, titleBn, titleEn, descBn, descEn }) => {
                  const Icon = CARD_ICON[icon];
                  return (
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
                  );
                }
              )}
            </div>
          </section>

          <section className="mb-14">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t("তথ্যকোথা ও উৎস", "Sources and attribution")}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {t(
                  "কোন তালিকা থেকে কতটি নেওয়া হয়েছে।",
                  "Which lists the words came from, and how many from each."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {buildAboutSources(facts).map((source) => (
                <div
                  key={source.titleEn}
                  className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5"
                >
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
                    {t(source.titleBn, source.titleEn)}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {t(source.descBn, source.descEn)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40 p-5">
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t(ATTRIBUTION_BN, ATTRIBUTION_EN)}
              </p>
            </div>
          </section>

          <section className="mb-14">
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {t("ভুল খুঁজে পেলে জানান", "Found a mistake? Tell us")}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {t(
                      "ভুল বাংলা অর্থ, ভুল লেভেল বা ভুল উদাহরণ — ইমেইলে শব্দটির নাম, পাতার ঠিকানা এবং কী ভুল বলে মনে হচ্ছে তা লিখে দিন। ঠিক করার পর সংশোধিত এন্ট্রিতে পরিবর্তনের তারিখ যোগ করা হয়।",
                      "A wrong Bangla meaning, a wrongly assigned level or a bad example: email us the word, the page URL and what looks wrong. Once fixed, the entry carries the date of the change."
                    )}
                  </p>
                  <a
                    href={`mailto:${SITE_CONTACT_EMAIL}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                  >
                    <Mail className="h-4 w-4" />
                    {SITE_CONTACT_EMAIL}
                  </a>
                  <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                    {t("সর্বশেষ পর্যালোচনা", "Last reviewed")}: {LAST_REVIEWED}
                  </p>
                </div>
              </div>
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
              {t("এখন পড়া শুরু করুন", "Start reading now")}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-6">
              {t(
                "A1 থেকে C1 পর্যন্ত পাঁচটি লেভেল খোলা। অ্যাকাউন্ট ছাড়াই শুরু করা যায়।",
                "Five levels are open, from A1 to C1. No account is needed to start."
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
