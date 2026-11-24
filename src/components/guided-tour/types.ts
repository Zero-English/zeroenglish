import type { LucideIcon } from "lucide-react";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
  /** CSS selector or data-tour attribute (e.g. '[data-tour="word-card"]') */
  target?: string;
  title: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  /** Micro-badge chip label (e.g. "Double-Click Shortcut", "Active Recall") */
  badge?: {
    en: string;
    bn: string;
  };
  icon?: LucideIcon;
  placement?: TourPlacement;
  highlightPadding?: number;
}

export interface TourConfig {
  id: string;
  steps: TourStep[];
}
