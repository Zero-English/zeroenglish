"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  label?: string;
}

export function BackButton({ className, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        "mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors select-none",
        className,
      )}
    >
      <ArrowLeft className="size-3.5" />
      <span>{label}</span>
    </button>
  );
}
