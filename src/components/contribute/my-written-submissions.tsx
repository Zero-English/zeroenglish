"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginationNav } from "@/components/pagination-nav";
import { useT } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { type WrittenItem, type WrittenListResponse } from "@/app/(admin)/admin/_data/written";

const CARD =
  "rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xs";

export function MyWrittenSubmissions() {
  const t = useT();
  const [items, setItems] = useState<WrittenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail Modal
  const [inspectItem, setInspectItem] = useState<WrittenItem | null>(null);
  const [activeLang, setActiveLang] = useState<"en" | "bn">("en");
  const [activeTier, setActiveTier] = useState<"easy" | "medium" | "hard">("easy");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/written/my-submissions?page=${page}&limit=10`);
      const json: WrittenListResponse = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
        setTotal(json.pagination?.total ?? 0);
        setTotalPages(json.pagination?.totalPages ?? 1);
      }
    } catch (e) {
      console.error("Failed to load submissions", e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const getContent = (item: WrittenItem, lang: "en" | "bn", tier: "easy" | "medium" | "hard") => {
    if (lang === "en") {
      if (tier === "easy") return item.contentEnEasy;
      if (tier === "medium") return item.contentEnMedium;
      return item.contentEnHard;
    } else {
      if (tier === "easy") return item.contentBnEasy;
      if (tier === "medium") return item.contentBnMedium;
      return item.contentBnHard;
    }
  };

  return (
    <div className="space-y-4">
      <div className={cn(CARD, "p-4 sm:p-5")}>
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              {t("আমার লিখিত কনটেন্ট সাবমিশন", "My Written Content Submissions")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                "আপনার জমা দেওয়া রচনা, অনুচ্ছেদ ও অন্যান্য লেখার অনুমোদন ট্র্যাক করুন।",
                "Track approval status of your submitted writing materials."
              )}
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {total} {t("মোট", "Total")}
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-xl">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <FileText className="size-10 mx-auto text-muted-foreground/40" />
            <h4 className="text-sm font-semibold">
              {t("এখনও কোনো লেখা জমা দেওয়া হয়নি", "No written submissions yet")}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t(
                "উপরে 'লিখিত বিষয়' ট্যাবে ক্লিক করে আপনার প্রথম কনটেন্ট জমা দিন।",
                "Switch to the 'Written Content' tab to create your first submission."
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-xl border border-border/70 hover:border-primary/40 bg-background/50 hover:bg-background transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                      {item.titleEn}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({item.titleBn})
                    </span>
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {item.writtenType?.name || "Writing"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">/{item.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  {/* Status Badge */}
                  {item.status === "APPROVED" && (
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                      <CheckCircle2 className="size-3" />
                      Approved
                    </Badge>
                  )}
                  {item.status === "PENDING" && (
                    <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs gap-1">
                      <Clock className="size-3" />
                      Pending Review
                    </Badge>
                  )}
                  {item.status === "REJECTED" && (
                    <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 text-xs gap-1">
                      <XCircle className="size-3" />
                      Rejected
                    </Badge>
                  )}

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInspectItem(item);
                      setActiveLang("en");
                      setActiveTier("easy");
                    }}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    {t("দেখুন", "View")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("পৃষ্ঠা", "Page")} {page} / {totalPages}
            </span>
            <PaginationNav
              page={page}
              totalPages={totalPages}
              onPageChange={(p: number) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      <Dialog
        open={!!inspectItem}
        onOpenChange={(open) => !open && setInspectItem(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {inspectItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{inspectItem.writtenType?.name}</Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      inspectItem.status === "APPROVED" && "bg-emerald-500/10 text-emerald-600",
                      inspectItem.status === "PENDING" && "bg-amber-500/10 text-amber-600",
                      inspectItem.status === "REJECTED" && "bg-rose-500/10 text-rose-600"
                    )}
                  >
                    {inspectItem.status}
                  </Badge>
                </div>
                <DialogTitle className="text-lg font-bold mt-1">
                  {inspectItem.titleEn}
                </DialogTitle>
                <DialogDescription>
                  {inspectItem.titleBn} • /{inspectItem.slug}
                </DialogDescription>
              </DialogHeader>

              {/* Language & Tier Switchers */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-y border-border py-2.5 my-2">
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveLang("en")}
                    className={cn(
                      "h-7 px-2.5 text-xs font-semibold rounded-md",
                      activeLang === "en" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveLang("bn")}
                    className={cn(
                      "h-7 px-2.5 text-xs font-semibold rounded-md",
                      activeLang === "bn" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    বাংলা
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTier("easy")}
                    className={cn(
                      "h-7 px-2.5 text-xs rounded-md",
                      activeTier === "easy" ? "bg-emerald-500/10 text-emerald-600 font-semibold" : "text-muted-foreground"
                    )}
                  >
                    Easy
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTier("medium")}
                    className={cn(
                      "h-7 px-2.5 text-xs rounded-md",
                      activeTier === "medium" ? "bg-amber-500/10 text-amber-600 font-semibold" : "text-muted-foreground"
                    )}
                  >
                    Medium
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTier("hard")}
                    className={cn(
                      "h-7 px-2.5 text-xs rounded-md",
                      activeTier === "hard" ? "bg-rose-500/10 text-rose-600 font-semibold" : "text-muted-foreground"
                    )}
                  >
                    Hard
                  </Button>
                </div>
              </div>

              {/* Rendered Markdown Content */}
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed p-3 bg-muted/20 rounded-xl min-h-[160px]">
                {getContent(inspectItem, activeLang, activeTier)?.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {getContent(inspectItem, activeLang, activeTier)}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic text-xs">
                    {t(
                      "এই লেভেলের জন্য কোনো কনটেন্ট লেখা হয়নি।",
                      "No content provided for this difficulty tier."
                    )}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

