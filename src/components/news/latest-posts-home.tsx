"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Calendar, Newspaper } from "lucide-react";
import { useT } from "@/components/language-provider";
import type { LatestPost } from "@/components/news/latest-posts";
import { HomeSectionHeader } from "@/components/home-sections";

export type { LatestPost };

const NEWS_EASE = [0.22, 1, 0.36, 1] as const;

export function LatestPostsHome({ posts }: { posts: LatestPost[] }) {
  const t = useT();
  const shouldReduceMotion = Boolean(useReducedMotion());

  if (!posts || posts.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="latest-articles-heading" className="sec-section">
        <HomeSectionHeader
          id="latest-articles-heading"
          icon={Newspaper}
          kickerBn="খবরের খাতা ও স্টাডি টিপস"
          kickerEn="News & study guides"
          titleBn="সাম্প্রতিক লেখা ও স্টাডি টিপস"
          titleEn="Recent Articles & Study Tips"
          leadBn="ইংরেজি শেখার কার্যকর কৌশল, ব্যাকরণ টিপস ও সাম্প্রতিক সব আপডেট এক নজরে।"
          leadEn="Practical vocabulary guides, exam preparation tips, and platform updates."
          ctaHref="/news"
          ctaLabelBn="সব আর্টিকেল দেখুন"
          ctaLabelEn="View all articles"
          ringSide="right"
          reducedMotion={shouldReduceMotion}
        />

        <div className="sec-grid-3">
          {posts.slice(0, 3).map((post, idx) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

            return (
              <motion.div
                key={post.slug}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.06,
                  ease: NEWS_EASE,
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                className="h-full"
              >
                <Link href={`/news/${post.slug}`} className="sec-card-link">
                  <article className="sec-news-card group">
                    <div>
                      <div className="sec-news-media">
                        {post.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={post.imageUrl}
                            alt={
                              post.imageAlt || t(post.titleBn, post.titleEn)
                            }
                            loading="lazy"
                            className="sec-news-img"
                          />
                        ) : (
                          <div className="sec-news-fallback">
                            <Newspaper className="size-7" aria-hidden="true" />
                            <span>{t("নিবন্ধ", "Article")}</span>
                          </div>
                        )}
                      </div>

                      <div className="sec-news-body">
                        <div className="sec-news-meta tabular-nums">
                          <Calendar className="size-3 shrink-0" aria-hidden="true" />
                          <span>{formattedDate}</span>
                          <span aria-hidden="true">·</span>
                          <span>{t("৩ মিনিট পাঠ", "3 min read")}</span>
                        </div>

                        <h3 className="sec-card-title line-clamp-2">
                          {t(post.titleBn, post.titleEn)}
                        </h3>

                        <p className="sec-card-desc line-clamp-2">
                          {t(post.descriptionBn, post.descriptionEn)}
                        </p>
                      </div>
                    </div>

                    <div className="sec-news-footer">
                      <span className="sec-footer-cue">
                        {t("সম্পূর্ণ পড়ুন", "Read article")}
                      </span>
                      <span className="sec-action-dot" aria-hidden="true">
                        <ArrowUpRight className="sec-action-dot-arrow size-3.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MotionConfig>
  );
}
