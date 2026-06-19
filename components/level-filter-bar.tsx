"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  ArrowUpDown,
  BookmarkCheck,
  Bookmark,
  CheckCircle2,
  Circle,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterType =
  | "all"
  | "learned"
  | "not-learned"
  | "bookmarked"
  | "not-bookmarked"
  | "duplicates";

export type SortType = "default" | "az" | "za";

const filters: { value: FilterType; label: string; icon: typeof Filter }[] = [
  { value: "all", label: "All", icon: Filter },
  { value: "learned", label: "Learned", icon: CheckCircle2 },
  { value: "not-learned", label: "Not Learned", icon: Circle },
  { value: "bookmarked", label: "Bookmarked", icon: BookmarkCheck },
  { value: "not-bookmarked", label: "Not Bookmarked", icon: Bookmark },
  { value: "duplicates", label: "Duplicates", icon: Copy },
];

interface LevelFilterBarProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

export function LevelFilterBar({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: LevelFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3">
      <div className="overflow-x-auto w-full ">
        <div className="flex items-center gap-1 pb-1 sm:pb-0 flex-1">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all border",
                  isActive
                    ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60"
                )}
              >
                <Icon className="size-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ArrowUpDown className="size-3.5 text-zinc-400" />
        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as SortType)}
        >
          <SelectTrigger className="w-28" size="sm">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
            <SelectItem value="za">Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
