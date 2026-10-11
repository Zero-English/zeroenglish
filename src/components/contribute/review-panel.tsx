"use client";

import type { ComponentType, ReactNode } from "react";
import { CircleDashed, ListChecks } from "lucide-react";
import { useT } from "@/components/language-provider";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

const ICON_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground";

const CHIP_PENDING =
  "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";

const DIVIDER = "border-b border-border/60";
const DIVIDER_T = "border-t border-border/60";

export function ReviewPanelCard({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  count,
  emptyTitle,
  emptyBody,
  children,
  footer,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  subtitle: string;
  count: number;
  emptyTitle: string;
  emptyBody: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const t = useT();

  return (
    <section
      className={cn(CARD, "flex h-full flex-col overflow-hidden", className)}
    >
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6 sm:py-5",
          DIVIDER
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(ICON_CHIP, iconClassName)}>
            <Icon className="size-4.5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {count > 0 ? (
            <span
              className={cn(CHIP_PENDING, "px-2 py-0.5 text-[11px] font-semibold")}
            >
              {t(`${count}টি অপেক্ষমাণ`, `${count} queued`)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <CircleDashed className="h-3 w-3" />
            {t("অপেক্ষমাণ হিসেবে শুরু হয়", "Starts pending")}
          </span>
        </div>
      </header>

      <div className={cn("min-h-0 flex-1 p-5 sm:p-6")}>
        {count === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 py-12 text-center">
            <span
              className={cn(ICON_CHIP, "size-12 rounded-xl text-muted-foreground")}
            >
              <ListChecks className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {emptyTitle}
              </p>
              <p className="mx-auto mt-1 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                {emptyBody}
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {footer ? (
        <div className={cn("p-5 sm:px-6 sm:py-5", DIVIDER_T)}>{footer}</div>
      ) : null}
    </section>
  );
}

export function MobileQueueBar({
  label,
  count,
  open,
  onOpenChange,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+3.5rem)] z-40 px-4 lg:hidden",
          count === 0 && "hidden"
        )}
      >
        <DrawerTrigger asChild>
          <Button
            type="button"
            disabled={count === 0}
            className="pointer-events-auto h-12 w-full gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            <ListChecks className="size-5" />
            {label}
          </Button>
        </DrawerTrigger>
      </div>
      <DrawerContent className="px-4 pb-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}