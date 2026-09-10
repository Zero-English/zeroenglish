"use client";

import Link from "next/link";
import Image from "next/image";
import { Rocket, Target, Users, Sparkles, ArrowRight, Mail, Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";

const VALUES = [
  {
    icon: Target,
    titleBn: "আমাদের লক্ষ্য",
    titleEn: "Our Mission",
    descBn:
      "প্রতিটি শিক্ষার্থী যেন নিজের গতিতে ইংরেজি আয়ত্ত করতে পারে — শব্দে শব্দে, ধাপে ধাপে।",
    descEn:
      "To help every learner master English at their own pace — word by word, step by step.",
  },
  {
    icon: Users,
    titleBn: "আমাদের দৃষ্টিভঙ্গি",
    titleEn: "Our Vision",
    descBn:
      "একটি জগৎ যেখানে ভাষা আর বাধা নয় — প্রযুক্তির মাধ্যমে সবার জন্য শেখা সহজলভ্য।",
    descEn:
      "A world where language is never a barrier — making learning accessible to everyone through technology.",
  },
  {
    icon: Sparkles,
    titleBn: "আমাদের পদ্ধতি",
    titleEn: "Our Approach",
    descBn:
      "বাংলা ও ইংরেজি দুই ভাষায় সম্পূর্ণ সাপোর্ট দিয়ে সহজ, মজার ও কার্যকরী শেখার অভিজ্ঞতা।",
    descEn:
      "A simple, fun and effective learning experience with full support in both Bangla and English.",
  },
];

export default function AboutPage() {
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
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-5">
              {t("আমরা কেন এখানে", "Why we're here")}
            </h2>
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
