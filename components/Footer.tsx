"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";
import { useT } from "@/components/language-provider";
import logo from "../public/assets/logo/main-logo.webp";
import { useQuizChrome } from "@/lib/quiz-chrome";

interface FooterLink {
  labelBn: string;
  labelEn: string;
  href: string;
}

interface FooterColumn {
  categoryBn: string;
  categoryEn: string;
  links: FooterLink[];
}

export default function FFooter() {
  const currentYear = new Date().getFullYear();
  const t = useT();
  const hidden = useQuizChrome((s) => s.hidden);

  const footerColumns: FooterColumn[] = [
    {
      categoryBn: "পণ্য",
      categoryEn: "Product",
      links: [
        { labelBn: "শব্দভান্ডার", labelEn: "Vocabulary", href: "/vocabulary" },
        { labelBn: "কুইজ", labelEn: "Quiz", href: "/quiz" },
        { labelBn: "নিউজ ও ব্লগ", labelEn: "News & Blog", href: "/news" },
      ],
    },
    {
      categoryBn: "শেখা",
      categoryEn: "Learning",
      links: [
        { labelBn: "অগ্রগতি", labelEn: "Leaderboard", href: "/leaderboard" },
        { labelBn: "অনুসন্ধান", labelEn: "Search", href: "/search" },
        { labelBn: "প্রোফাইল", labelEn: "Profile", href: "/profile" },
      ],
    },
    {
      categoryBn: "প্রতিষ্ঠান",
      categoryEn: "Company",
      links: [
        { labelBn: "আমাদের সম্পর্কে", labelEn: "About", href: "/about" },
        { labelBn: "গোপনীয়তা নীতি", labelEn: "Privacy Policy", href: "/privacy" },
        { labelBn: "যোগাযোগ", labelEn: "Contact", href: "/contact" },
      ],
    },
  ];

  function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const socialLinks = [
    { icon: Mail, href: "mailto:zeroenglishweb@gmail.com", label: "Email" },
    { icon: FacebookIcon, href: "https://facebook.com/zeroenglishorg", label: "Facebook" },
  ];

  if (hidden) return null;

  return (
    <footer className="border-t border-border bg-muted/40 text-muted-foreground mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5 max-w-sm">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Image
                src={logo}
                alt="Zero English"
                className="h-6 w-auto dark:brightness-0 dark:invert"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(
                "আপনার নিজের গতিতে আমাদের সম্পূর্ণ লার্নিং প্ল্যাটফর্ম দিয়ে ইংরেজি শব্দভাণ্ডার আয়ত্ত করুন।",
                "Master English vocabulary at your own pace with our comprehensive learning platform."
              )}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerColumns.map((column) => (
            <div key={column.categoryEn} className="lg:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-5">
                {t(column.categoryBn, column.categoryEn)}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.categoryEn}-${link.labelEn}`}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors active:text-foreground hover:text-foreground"
                    >
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                      {t(link.labelBn, link.labelEn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-12 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <p>
            {t(
              `© ${currentYear} জিরো ইংলিশ। সর্বস্বত্ব সংরক্ষিত।`,
              `© ${currentYear} Zero English. All rights reserved.`
            )}
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-foreground active:text-foreground transition-colors">
              {t("গোপনীয়তা", "Privacy")}
            </Link>
            <Link href="/contact" className="hover:text-foreground active:text-foreground transition-colors">
              {t("যোগাযোগ", "Contact")}
            </Link>
          </div>
        </div>
      </div>
      <div className="h-12 block md:hidden"></div>
    </footer>
  );
}