"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpenCheck,
  ClipboardList,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Languages,
  Layers,
  LibraryBig,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const SEC_EASE = [0.22, 1, 0.36, 1] as const;

const SEC_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 26,
  mass: 0.9,
} as const;

interface HomeSectionHeaderProps {
  id: string;
  icon: LucideIcon;
  kickerBn: string;
  kickerEn: string;
  titleBn: string;
  titleEn: string;
  leadBn: string;
  leadEn: string;
  ctaHref?: string;
  ctaLabelBn?: string;
  ctaLabelEn?: string;
  ringSide?: "left" | "right";
  reducedMotion: boolean;
}

export function HomeSectionHeader({
  id,
  icon: Icon,
  kickerBn,
  kickerEn,
  titleBn,
  titleEn,
  leadBn,
  leadEn,
  ctaHref,
  ctaLabelBn,
  ctaLabelEn,
  ringSide = "right",
  reducedMotion,
}: HomeSectionHeaderProps) {
  const t = useT();

  return (
    <>
      <motion.div
        aria-hidden="true"
        className={cn(
          "sec-orbital-ring",
          ringSide === "left"
            ? "sec-orbital-ring--left"
            : "sec-orbital-ring--right"
        )}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: SEC_EASE }}
      />

      <motion.div
        className="sec-header"
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.48, ease: SEC_EASE }}
      >
        <div className="sec-header-copy">
          <div className="sec-kicker-row">
            <div aria-hidden="true" className="sec-geo-mark">
              <motion.span
                className="sec-geo-pill origin-left"
                initial={reducedMotion ? false : { scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, ease: SEC_EASE }}
              />
              <motion.span
                className="sec-geo-dot"
                initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ ...SEC_SPRING, delay: 0.08 }}
              />
            </div>

            <span className="sec-kicker-pill">
              <Icon className="sec-kicker-icon size-3.5 shrink-0" aria-hidden="true" />
              <span>{t(kickerBn, kickerEn)}</span>
            </span>
          </div>

          <h2 id={id} className="sec-heading">
            {t(titleBn, titleEn)}
          </h2>

          <div className="sec-lead-wrap">
            <p className="sec-lead">{t(leadBn, leadEn)}</p>
          </div>
        </div>

        {ctaHref && ctaLabelBn && ctaLabelEn && (
          <Link href={ctaHref} className="sec-pill-btn group">
            <span>{t(ctaLabelBn, ctaLabelEn)}</span>
            <ArrowUpRight className="sec-pill-arrow size-3.5 shrink-0" aria-hidden="true" />
          </Link>
        )}
      </motion.div>
    </>
  );
}

const GRAMMAR_MODULES = [
  {
    href: "/grammar/parts-of-speech",
    icon: Layers,
    index: "01",
    badgeBn: "৮টি ক্যাটাগরি",
    badgeEn: "8 classes",
    titleBn: "পদ প্রকরণ (৮ প্রকার পদ)",
    titleEn: "Parts of Speech",
    descriptionBn:
      "বাক্যের মূল উপাদান Noun, Pronoun, Verb, Adjective ইত্যাদির বিস্তারিত নিয়ম ও বাস্তব উদাহরণ।",
    descriptionEn:
      "Master all 8 word classes with concise rules, usage distinctions, and practical sentences.",
    topics: ["Noun", "Verb", "Adjective"],
  },
  {
    href: "/grammar",
    icon: Clock,
    index: "02",
    badgeBn: "১২টি টেন্স",
    badgeEn: "12 tenses",
    titleBn: "টেন্স ও সময়রেখা (১২টি টেন্স)",
    titleEn: "Tenses & Timeline",
    descriptionBn:
      "১২টি টেন্সের সহজ ফর্মুলা, টাইমলাইন ও বাস্তব জীবনে নিখুঁত বাক্য তৈরির সহজ গাইড।",
    descriptionEn:
      "Complete formula breakdown across past, present, and future forms with time markers.",
    topics: ["Present Simple", "Past Continuous", "Present Perfect"],
  },
  {
    href: "/grammar",
    icon: BookOpenCheck,
    index: "03",
    badgeBn: "A / An / The",
    badgeEn: "A / An / The",
    titleBn: "আর্টিকেল ও ডিটারমাইনার",
    titleEn: "Articles & Determiners",
    descriptionBn:
      "A, An, The ব্যবহারের অকাট্য নিয়ম, ব্যতিক্রম ও পরীক্ষায় আসা ট্রিকি প্রশ্ন সমাধান।",
    descriptionEn:
      "Clear rules for definite, indefinite, and zero articles plus countable noun qualifiers.",
    topics: ["Definite", "Indefinite", "Quantifiers"],
  },
  {
    href: "/grammar",
    icon: FileText,
    index: "04",
    badgeBn: "কমন মিসটেকস",
    badgeEn: "Common traps",
    titleBn: "বাক্যের গঠন ও সাধারণ ভুল",
    titleEn: "Sentence Mechanics & Traps",
    descriptionBn:
      "Subject-Verb Agreement, ক্লজ ও ফ্রেজ গঠন এবং বাঙালি শিক্ষার্থীদের সচরাচর হওয়া ভুলের সমাধান।",
    descriptionEn:
      "Simple, compound, and complex structures plus 50+ high-frequency error corrections.",
    topics: ["Subject-Verb", "Clauses", "Common Errors"],
  },
] as const;

export function GrammarWorkbookSection() {
  const t = useT();
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="grammar-workbook-heading"
        className="sec-section"
      >
        <HomeSectionHeader
          id="grammar-workbook-heading"
          icon={BookMarked}
          kickerBn="গ্রামার ওয়ার্কবুক"
          kickerEn="Grammar workbook"
          titleBn="সহজ বাংলা ব্যাখ্যায় ইংরেজি ব্যাকরণ"
          titleEn="Structured English Grammar Rules"
          leadBn="পার্টস অব স্পিচ, ১২টি টেন্স, আর্টিকেল ও বাক্যের গঠন—প্রতিটি নিয়মের বাংলা অর্থ, ফর্মুলা ও সাধারণ ভুলের সমাধান।"
          leadEn="Master grammar foundations with concise formula breakdowns, real examples, and trap explanations."
          ctaHref="/grammar"
          ctaLabelBn="সব গ্রামার লেসন"
          ctaLabelEn="Explore all grammar"
          ringSide="left"
          reducedMotion={shouldReduceMotion}
        />

        <div className="sec-grid-4">
          {GRAMMAR_MODULES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.titleEn}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.055,
                  ease: SEC_EASE,
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                className="h-full"
              >
                <Link href={item.href} className="sec-card-link">
                  <div className="sec-card group">
                    <div>
                      <div className="sec-card-top">
                        <span className="sec-icon-box">
                          <Icon className="size-4.5" aria-hidden="true" />
                        </span>
                        <span className="sec-badge-pill">
                          {t(item.badgeBn, item.badgeEn)}
                        </span>
                      </div>

                      <span className="sec-index-label tabular-nums">
                        {t(`পাঠ ${item.index}`, `Core ${item.index}`)}
                      </span>

                      <h3 className="sec-card-title">
                        {t(item.titleBn, item.titleEn)}
                      </h3>

                      <p className="sec-card-desc">
                        {t(item.descriptionBn, item.descriptionEn)}
                      </p>
                    </div>

                    <div className="sec-card-bottom">
                      <div className="sec-well">
                        <div className="sec-topic-list">
                          {item.topics.map((topic) => (
                            <span key={topic} className="sec-topic-pill">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="sec-footer-row">
                        <span className="sec-footer-cue">
                          <span>{t("রুলস পড়ুন", "Read rules")}</span>
                          <ArrowRight
                            className="sec-footer-arrow size-3.5"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="sec-action-dot" aria-hidden="true">
                          <ArrowUpRight className="sec-action-dot-arrow size-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MotionConfig>
  );
}

const TOOLKIT_PILLARS = [
  {
    href: "/vocabulary",
    icon: LibraryBig,
    index: "01",
    tagBn: "ভোকাবুলারি",
    tagEn: "Vocabulary",
    titleBn: "শব্দতালিকা ও ফ্ল্যাশ-নোট",
    titleEn: "Word Lists & Flashnotes",
    descriptionBn:
      "সব শব্দ CEFR লেভেল ও বিষয় অনুযায়ী সাজানো। যা জানেন আর যা শিখছেন তা আলাদা চিহ্নিত করুন।",
    descriptionEn:
      "Oxford words grouped by CEFR level and topic with pronunciation and saved status.",
  },
  {
    href: "/grammar",
    icon: BookMarked,
    index: "02",
    tagBn: "গ্রামার",
    tagEn: "Grammar",
    titleBn: "গ্রামার রুলস ও নির্দেশিকা",
    titleEn: "Rules & Formula Guides",
    descriptionBn:
      "পার্টস অব স্পিচ, টেন্স, আর্টিকেল ও বাক্যের নিখুঁত গঠন। বাস্তব উদাহরণ ও ভুলের সহজ ব্যাখ্যা।",
    descriptionEn:
      "Structured guides covering Parts of Speech, Tenses, Articles, and sentence structure.",
  },
  {
    href: "/quiz",
    icon: BookOpenCheck,
    index: "03",
    tagBn: "কুইজ ল্যাব",
    tagEn: "Test lab",
    titleBn: "প্রশ্নোত্তর ও কুইজ",
    titleEn: "Interactive Quizzes",
    descriptionBn:
      "শব্দভাণ্ডার ও ব্যাকরণের প্রশ্ন, সঙ্গে সঙ্গে ফলাফল ও প্রতিটি উত্তরের বিস্তারিত ব্যাখ্যা।",
    descriptionEn:
      "Vocabulary and grammar questions with instant checking, explanations, and scores.",
  },
  {
    href: "/search",
    icon: Search,
    index: "04",
    tagBn: "সার্চ",
    tagEn: "Dictionary",
    titleBn: "স্মার্ট ডিকশনারি সার্চ",
    titleEn: "Smart Dictionary",
    descriptionBn:
      "যেকোনো ইংরেজি শব্দ খুঁজে বাংলা অর্থ, সংজ্ঞা, উদাহরণ ও সমার্থক শব্দ একসঙ্গে দেখুন।",
    descriptionEn:
      "Look up any word for its Bangla meaning, English definition, sentences, and synonyms.",
  },
] as const;

export function StudyToolkitSection() {
  const t = useT();
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="study-toolkit-heading"
        className="sec-section"
      >
        <HomeSectionHeader
          id="study-toolkit-heading"
          icon={Compass}
          kickerBn="স্টাডি টুলকিট"
          kickerEn="Study toolkit"
          titleBn="খুঁজুন, শিখুন ও পরীক্ষা দিন"
          titleEn="Four Core Learning Pillars"
          leadBn="ভোকাবুলারি ও গ্রামার শেখার প্রয়োজনীয় সব টুল এক প্ল্যাটফর্মে।"
          leadEn="Everything required to look up, practice, and retain English words and grammar."
          ringSide="right"
          reducedMotion={shouldReduceMotion}
        />

        <div className="sec-grid-4">
          {TOOLKIT_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.055,
                  ease: SEC_EASE,
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                className="h-full"
              >
                <Link href={item.href} className="sec-card-link">
                  <div className="sec-card group">
                    <div>
                      <div className="sec-card-top">
                        <span className="sec-icon-box">
                          <Icon className="size-4.5" aria-hidden="true" />
                        </span>
                        <span className="sec-index-pill tabular-nums">
                          {item.index}
                        </span>
                      </div>

                      <h3 className="sec-card-title mt-3">
                        {t(item.titleBn, item.titleEn)}
                      </h3>

                      <p className="sec-card-desc">
                        {t(item.descriptionBn, item.descriptionEn)}
                      </p>
                    </div>

                    <div className="sec-card-bottom">
                      <div className="sec-well sec-well--row">
                        <span className="sec-well-tag">
                          {t(item.tagBn, item.tagEn)}
                        </span>
                        <span className="sec-action-dot" aria-hidden="true">
                          <ArrowUpRight className="sec-action-dot-arrow size-3.5" />
                        </span>
                      </div>

                      <div className="sec-footer-row">
                        <span className="sec-footer-cue">
                          <span>{t("ব্রাউজ করুন", "Open tool")}</span>
                          <ArrowRight
                            className="sec-footer-arrow size-3.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MotionConfig>
  );
}

const QUIZ_MODES_LIST = [
  {
    href: "/quiz/vocabulary",
    icon: Languages,
    index: "01",
    badgeBn: "শব্দ অনুশীলন",
    badgeEn: "Vocab drill",
    metaBn: "তাৎক্ষণিক ব্যাখ্যা",
    metaEn: "Instant feedback",
    titleBn: "শব্দভাণ্ডার অনুশীলন",
    titleEn: "Vocabulary Practice",
    descriptionBn: "সব লেভেলের শব্দ জ্ঞান যাচাই করুন।",
    descriptionEn:
      "Test your word recall across CEFR levels with rapid multiple choice.",
  },
  {
    href: "/quiz/grammar",
    icon: BookMarked,
    index: "02",
    badgeBn: "গ্রামার অনুশীলন",
    badgeEn: "Grammar drill",
    metaBn: "টেন্স ও প্রিপজিশন",
    metaEn: "Rule challenges",
    titleBn: "গ্রামার কুইজ",
    titleEn: "Grammar Quizzes",
    descriptionBn: "টেন্স, প্রিপজিশন, আর্টিকেল ও বাক্য গঠন।",
    descriptionEn:
      "Targeted challenges on tenses, prepositions, articles, and syntax.",
  },
  {
    href: "/quiz/class",
    icon: GraduationCap,
    index: "03",
    badgeBn: "পরীক্ষার প্রস্তুতি",
    badgeEn: "Academic & job",
    metaBn: "SSC · HSC · BCS",
    metaEn: "SSC · HSC · IELTS",
    titleBn: "শ্রেণি ভিত্তিক কুইজ",
    titleEn: "Class Based Quizzes",
    descriptionBn: "SSC, HSC, IELTS, BCS ও বিশ্ববিদ্যালয় ভর্তি।",
    descriptionEn:
      "Curated practice sets aligned with board, admission, and IELTS tests.",
  },
  {
    href: "/quiz/exam",
    icon: ClipboardList,
    index: "04",
    badgeBn: "টাইমড পরীক্ষা",
    badgeEn: "Timed challenge",
    metaBn: "সাপ্তাহিক র‍্যাংকিং",
    metaEn: "Ranked sessions",
    titleBn: "নির্ধারিত পরীক্ষা",
    titleEn: "Scheduled Exams",
    descriptionBn: "সাপ্তাহিক ও দ্বি-সাপ্তাহিক সময়ভিত্তিক পরীক্ষা।",
    descriptionEn:
      "Weekly and biweekly timed sessions with saved ranking results.",
  },
] as const;

export function QuizModesSection() {
  const t = useT();
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="quiz-modes-heading" className="sec-section">
        <HomeSectionHeader
          id="quiz-modes-heading"
          icon={BookOpenCheck}
          kickerBn="অনুশীলনী ও পরীক্ষা"
          kickerEn="Test your memory"
          titleBn="কুইজে নিজেকে যাচাই করুন"
          titleEn="Four Interactive Quiz Modes"
          leadBn="ভোকাবুলারি, ব্যাকরণ, অ্যাকাডেমিক ও নির্ধারিত টাইমড পরীক্ষা।"
          leadEn="Practice vocabulary and grammar with instant scoring and clear explanations."
          ctaHref="/quiz"
          ctaLabelBn="সব কুইজ দেখুন"
          ctaLabelEn="View all quizzes"
          ringSide="left"
          reducedMotion={shouldReduceMotion}
        />

        <div className="sec-grid-4">
          {QUIZ_MODES_LIST.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.055,
                  ease: SEC_EASE,
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                className="h-full"
              >
                <Link href={item.href} className="sec-card-link">
                  <div className="sec-card group">
                    <div>
                      <div className="sec-card-top">
                        <span className="sec-icon-box">
                          <Icon className="size-4.5" aria-hidden="true" />
                        </span>
                        <span className="sec-badge-pill">
                          {t(item.badgeBn, item.badgeEn)}
                        </span>
                      </div>

                      <span className="sec-index-label tabular-nums">
                        {t(`মোড ${item.index}`, `Mode ${item.index}`)}
                      </span>

                      <h3 className="sec-card-title">
                        {t(item.titleBn, item.titleEn)}
                      </h3>

                      <p className="sec-card-desc">
                        {t(item.descriptionBn, item.descriptionEn)}
                      </p>
                    </div>

                    <div className="sec-card-bottom">
                      <div className="sec-well sec-well--row">
                        <span className="sec-well-tag">
                          {t(item.metaBn, item.metaEn)}
                        </span>
                        <span className="sec-action-dot" aria-hidden="true">
                          <ArrowUpRight className="sec-action-dot-arrow size-3.5" />
                        </span>
                      </div>

                      <div className="sec-footer-row">
                        <span className="sec-footer-cue">
                          <span>{t("শুরু করুন", "Start drill")}</span>
                          <ArrowRight
                            className="sec-footer-arrow size-3.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MotionConfig>
  );
}
