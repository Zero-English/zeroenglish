"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Download, Share2, Copy, Check, Image as ImageIcon } from "lucide-react";
import { Classic } from "@/components/classic";
import { toast } from "sonner";

interface QuizPosterModalProps {
  quizId: number;
  trigger?: React.ReactNode;
}

export function QuizPosterModal({ quizId, trigger }: QuizPosterModalProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<{ id: number; name: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/v1/templates?type=QUIZ_POSTER&isActive=true");
      if (res.ok) {
        const data = await res.json();
        const list = data.templates || [];
        setTemplates(list);
        if (list.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(String(list[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to load quiz poster templates", err);
    }
  };

  const posterUrl = selectedTemplateId
    ? `/api/v1/quiz/${quizId}/poster?templateId=${selectedTemplateId}`
    : `/api/v1/quiz/${quizId}/poster`;

  const downloadUrl = `${posterUrl}${posterUrl.includes("?") ? "&" : "?"}download=true`;

  const handleCopyLink = async () => {
    const fullUrl = `${window.location.origin}${posterUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Image URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${posterUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Zero English Quiz #${quizId}`,
          text: `Check out this quiz on Zero English!`,
          url: fullUrl,
        });
      } catch (err) {
        // User dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs rounded-full border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors shadow-xs"
          >
            <Sparkles className="size-3.5 text-sky-500" />
            Generate Poster
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-4xl sm:max-w-4xl max-h-[95vh] h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ImageIcon className="size-5 text-sky-500" />
            Quiz Poster Generator
          </DialogTitle>
        </DialogHeader>

        {/* Template Selector & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {templates.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Template:</span>
              <Select
                value={selectedTemplateId}
                onValueChange={(val) => {
                  setSelectedTemplateId(val);
                  setLoading(true);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-56">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={String(tpl.id)} className="text-xs">
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs h-8"
            >
              {copied ? <Check className="size-3.5 text-green-500" /> : <Share2 className="size-3.5" />}
              Share
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs h-8"
            >
              <Copy className="size-3.5" />
              Copy Link
            </Button>

            <a href={downloadUrl} download={`quiz-${quizId}-poster.png`}>
              <Button size="sm" className="gap-1.5 text-xs h-8 bg-sky-600 hover:bg-sky-500 text-white shadow-sm">
                <Download className="size-3.5" />
                Download PNG
              </Button>
            </a>
          </div>
        </div>

        {/* Big Responsive Live Rendered Poster Viewport */}
        <div className="flex-1 w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 p-4 sm:p-6 flex items-center justify-center overflow-auto mt-3 relative shadow-2xl">
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 text-sky-400">
              <Classic className="size-10" />
              <span className="text-xs font-medium text-white">Rendering poster...</span>
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={`Quiz #${quizId} Poster`}
            className="max-h-[68vh] max-w-full rounded-2xl shadow-2xl object-contain border border-zinc-800/80"
            onLoad={() => setLoading(false)}
            onLoadStart={() => setLoading(true)}
          />
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-2">
          High-resolution image rendered on demand. Perfect for social sharing.
        </p>
      </DialogContent>
    </Dialog>
  );
}
