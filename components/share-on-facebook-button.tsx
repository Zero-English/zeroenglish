"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/components/language-provider";
import { SITE_URL } from "@/lib/site-config";

const LABEL_BN = "ফেসবুকে শেয়ার করুন";
const LABEL_EN = "Share on Facebook";

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

export function ShareOnFacebookButton({
  resultId,
  iconOnly = false,
  className,
}: {
  resultId: number;
  iconOnly?: boolean;
  className?: string;
}) {
  const t = useT();

  const handleClick = () => {
    const resultUrl = `${SITE_URL}/quiz-results/${resultId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      resultUrl
    )}`;

    window.open(facebookUrl, "_blank", "width=600,height=700");
  };

  const label = t(LABEL_BN, LABEL_EN);

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] font-semibold text-white transition-colors hover:bg-[#1667d6]",
        iconOnly ? "h-9 w-9" : "px-4 py-2.5 text-sm",
        className
      )}
    >
      <FacebookIcon className="h-4 w-4" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
