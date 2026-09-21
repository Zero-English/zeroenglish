"use client";

import { Loader2, Pencil, Upload } from "lucide-react";
import { useT } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ManualMode = "manual" | "bulk";

export function ModeSwitch({
  mode,
  onChange,
}: {
  mode: ManualMode;
  onChange: (next: ManualMode) => void;
}) {
  const t = useT();
  const tabs: { key: ManualMode; labelBn: string; labelEn: string }[] = [
    { key: "manual", labelBn: "হাতে যোগ করুন", labelEn: "Add manually" },
    { key: "bulk", labelBn: "বাল্ক আপলোড", labelEn: "Bulk upload" },
  ];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-[10px] bg-black/[0.04] p-1 dark:bg-white/[0.06]">
      {tabs.map((tab) => {
        const active = mode === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            {tab.key === "bulk" ? (
              <Upload className="size-3.5" />
            ) : (
              <Pencil className="size-3.5" />
            )}
            {t(tab.labelBn, tab.labelEn)}
          </button>
        );
      })}
    </div>
  );
}

export function SubmitButton({
  count,
  nounBn,
  nounEn,
  note,
  submitting,
  onClick,
  className,
}: {
  count: number;
  nounBn: string;
  nounEn: string;
  note: string;
  submitting: boolean;
  onClick: () => void;
  className?: string;
}) {
  const t = useT();
  const nounPluralEn = count === 1 ? nounEn : `${nounEn}s`;
  return (
    <div className={className}>
      <Button
        className={cn(
          "w-full gap-2 rounded-xl bg-orange-500 px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(234,88,12,0.3),0_4px_12px_-4px_rgba(234,88,12,0.35)] transition-colors hover:bg-orange-600 active:bg-orange-700",
          "h-10"
        )}
        disabled={count === 0 || submitting}
        onClick={onClick}
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {submitting
          ? t("জমা দেওয়া হচ্ছে…", "Submitting…")
          : t(
              `পর্যালোচনার জন্য ${count}টি ${nounBn} জমা দিন`,
              `Submit ${count} ${nounPluralEn} for review`
            )}
      </Button>
      <p className="mt-2.5 text-center text-xs text-zinc-400">{note}</p>
    </div>
  );
}