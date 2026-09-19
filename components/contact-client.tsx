"use client";

import Link from "next/link";
import { Mail, MessageCircle, Globe, ArrowRight, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";

const WHATSAPP_NUMBERS = [
  { phoneBn: "01909333407", phoneEn: "01909333407", waLink: "https://wa.me/8801909333407" },
  { phoneBn: "01832055053", phoneEn: "01832055053", waLink: "https://wa.me/8801832055053" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

export function ContactClient() {
  const t = useT();

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

      <div className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <section className="text-center mb-14 animate-fade-up">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              {t("আমরা আপনার সাথে কথা বলতে চাই", "We'd love to hear from you")}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {t("আমাদের সাথে", "Get in")}
              </span>{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
                {t("যোগাযোগ করুন", "touch")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              {t(
                "প্রশ্ন, মতামত, পার্টনারশিপ কিংবা প্রযুক্তিগত সহায়তা — আমরা শুনতে প্রস্তুত। আপনার সুবিধামতো যেকোনো মাধ্যমে আমাদের জানান।",
                "Questions, feedback, partnership or technical support — we're ready to listen. Reach out through whichever channel suits you best."
              )}
            </p>
          </section>

          <section className="mb-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="mailto:zeroenglishweb@gmail.com"
                className="group rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-500 mb-4">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-wide">
                  {t("ইমেইল", "Email")}
                </h3>
                <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 break-all">
                  zeroenglishweb@gmail.com
                </p>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1.5 group-hover:text-rose-500 transition-colors">
                  {t("মেইল পাঠান", "Send an email")}
                  <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </p>
              </a>

              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 mb-4">
                  <WhatsAppIcon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-wide">
                  {t("হোয়াটসঅ্যাপ", "WhatsApp")}
                </h3>
                <ul className="space-y-2">
                  {WHATSAPP_NUMBERS.map(({ phoneBn, phoneEn, waLink }) => (
                    <li key={waLink}>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 text-base font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:text-emerald-500"
                      >
                        {t(phoneBn, phoneEn)}
                        <ArrowRight className="size-3.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {t("মেসেজ করুন", "Chat on WhatsApp")}
                </p>
              </div>

              <a
                href="https://facebook.com/zeroenglishorg"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 sm:col-span-2"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-500 mb-4">
                  <FacebookIcon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-wide">
                  {t("ফেসবুক", "Facebook")}
                </h3>
                <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
                  facebook.com/zeroenglishorg
                </p>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1.5 group-hover:text-sky-500 transition-colors">
                  {t("ফেসবুক পেজে যান", "Visit our page")}
                  <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </p>
              </a>
            </div>
          </section>

          <section className="mb-14">
            <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t("কত দ্রুত আমরা উত্তর দিই?", "How fast do we respond?")}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t(
                    "আমরা সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আপনার মেসেজের উত্তর দিই। ছুটির দিনগুলোতে একটু বেশি সময় লাগতে পারে।",
                    "We typically respond within 24 to 48 hours. Weekend messages may take a little longer."
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
              {t("আগে শেখা শুরু করুন", "Start learning first")}
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mb-6">
              {t(
                "কিছু প্রশ্নের উত্তর ইতোমধ্যে আমাদের প্ল্যাটফর্মেই পেতে পারেন — শব্দভান্ডার, কুইজ আর নিউজ ঘুরে দেখুন।",
                "Some answers are already on our platform — explore vocabulary, quizzes and news before reaching out."
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
              >
                <Link href="/vocabulary">
                  {t("শেখা শুরু করুন", "Start Learning")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 gap-2.5 rounded-xl px-6 text-sm font-medium">
                <a href="https://facebook.com/zeroenglishorg" target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4" />
                  {t("ফেসবুকে ফলো করুন", "Follow on Facebook")}
                </a>
              </Button>
            </div>
          </section>

          <p className="mt-10 text-center text-xs text-zinc-400 dark:text-zinc-500 inline-flex items-center justify-center gap-1 w-full">
            <Heart className="size-3.5 text-rose-400" />
            {t("জিরো ইংলিশে প্রতিটি বার্তাই আসে ভালোবাসা দিয়ে।", "Every message at Zero English comes from the heart.")}
          </p>
        </div>
      </div>
    </div>
  );
}