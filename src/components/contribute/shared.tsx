"use client";

import { Pencil, Upload } from "lucide-react";
import { Classic } from "@/components/classic";
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
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 border border-border/60">
      {tabs.map((tab) => {
        const active = mode === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              active
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
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
          "w-full gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90",
          "h-10 cursor-pointer"
        )}
        disabled={count === 0 || submitting}
        onClick={onClick}
      >
        {submitting ? (
          <Classic className="size-4" />
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
      <p className="mt-2 text-center text-xs text-muted-foreground">{note}</p>
    </div>
  );
}