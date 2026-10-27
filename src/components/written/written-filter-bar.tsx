"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  FileText,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  ScrollText,
  Layers,
  Sparkles,
  Dices,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";

interface WrittenFilterBarProps {
  types: Array<{ id: number; name: string }>;
  currentType?: string;
  currentSearch?: string;
  randomSlug?: string | null;
}

const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  paragraph: { icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  essay: { icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  letter: { icon: Mail, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  application: { icon: FileSpreadsheet, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  dialogue: { icon: MessageSquare, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
  story: { icon: ScrollText, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30" },
};

export function WrittenFilterBar({
  types,
  currentType = "ALL",
  currentSearch = "",
  randomSlug,
}: WrittenFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(currentSearch);
  const t = useT();

  const handleTypeSelect = (typeName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (typeName === "ALL") {
      params.delete("type");
    } else {
      params.set("type", typeName);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/written?${qs}` : "/written");
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const trimmed = searchInput.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/written?${qs}` : "/written");
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("q");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/written?${qs}` : "/written");
    });
  };

  const handleSurpriseMe = () => {
    if (randomSlug) {
      router.push(`/written/${randomSlug}`);
    } else {
      // Fallback
      router.push("/written");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Surprise Note Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative w-full flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t(
              "নোটবুকের বিষয় বা কীওয়ার্ড দিয়ে খুঁজুন (যেমন: Winter, Tree, Leave)...",
              "Search notebook topics or vocabulary (e.g. Winter, Tree, Leave)..."
            )}
            className="pl-9.5 pr-10 h-10 rounded-xl bg-card/80 border-border/80 backdrop-blur-md text-xs sm:text-sm shadow-xs focus-visible:ring-primary/20"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        {randomSlug && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSurpriseMe}
            className="h-10 px-3.5 rounded-xl text-xs gap-1.5 shrink-0 bg-card/70 border-border/80 hover:border-primary/50 text-foreground cursor-pointer shadow-xs transition-all hover:scale-[1.02]"
            title={t("যেকোনো একটি অনির্ধারিত নোট পড়ুন", "Turn to a random note in the notebook")}
          >
            <Dices className="size-4 text-primary animate-pulse" />
            <span className="font-semibold">{t("র‍্যান্ডম নোট", "Surprise Note")}</span>
          </Button>
        )}
      </div>

      {/* Notebook Subject Divider Tabs */}
      <div className="relative border-b border-border/70 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-px scrollbar-none">
          {/* Tab: All Notes */}
          <button
            type="button"
            onClick={() => handleTypeSelect("ALL")}
            className={cn(
              "group relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-t border-x",
              currentType === "ALL" || !currentType
                ? "bg-card text-foreground border-border shadow-xs -mb-px z-10 font-bold"
                : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <Layers className="size-3.5 text-primary" />
            <span>{t("সকল বিষয়", "All Sections")}</span>
            <span className="size-1 rounded-full bg-primary ml-0.5 opacity-60" />
          </button>

          {/* Dynamic Category Subject Tabs */}
          {types.map((type) => {
            const key = type.name.toLowerCase();
            const config = TYPE_ICONS[key] || {
              icon: BookOpen,
              color: "text-primary",
              bg: "bg-primary/10 border-primary/20",
            };
            const Icon = config.icon;
            const isActive = currentType.toLowerCase() === key;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeSelect(type.name)}
                className={cn(
                  "group relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-t border-x",
                  isActive
                    ? "bg-card text-foreground border-border shadow-xs -mb-px z-10 font-bold"
                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5", config.color)} />
                <span>{type.name}</span>
                {isActive && (
                  <span className={cn("size-1.5 rounded-full ml-0.5", config.color.replace("text-", "bg-"))} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
