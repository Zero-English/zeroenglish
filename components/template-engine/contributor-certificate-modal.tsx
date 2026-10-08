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
import { Award, Download, Share2, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ContributorCertificateModalProps {
  userId: number;
  userName?: string | null;
  trigger?: React.ReactNode;
}

export function ContributorCertificateModal({
  userId,
  userName,
  trigger,
}: ContributorCertificateModalProps) {
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
      const res = await fetch("/api/v1/templates?type=CONTRIBUTOR_CERTIFICATE&isActive=true");
      if (res.ok) {
        const data = await res.json();
        const list = data.templates || [];
        setTemplates(list);
        if (list.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(String(list[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to load certificate templates", err);
    }
  };

  const certUrl = selectedTemplateId
    ? `/api/v1/contributor/${userId}/certificate?templateId=${selectedTemplateId}`
    : `/api/v1/contributor/${userId}/certificate`;

  const downloadUrl = `${certUrl}${certUrl.includes("?") ? "&" : "?"}download=true`;

  const handleCopyLink = async () => {
    const fullUrl = `${window.location.origin}${certUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Certificate URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${certUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Zero English Certificate — ${userName || "Contributor"}`,
          text: `Verified Certificate of Contribution on Zero English.`,
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
            className="gap-1.5 text-xs rounded-full border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors shadow-xs"
          >
            <Award className="size-3.5 text-amber-500" />
            Generate Certificate
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-5xl sm:max-w-5xl max-h-[95vh] h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Award className="size-5 text-amber-500" />
            Verified Contributor Certificate
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
                <SelectTrigger className="h-8 text-xs w-60">
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

            <a href={downloadUrl} download={`contributor-${userId}-certificate.png`}>
              <Button size="sm" className="gap-1.5 text-xs h-8 bg-amber-600 hover:bg-amber-500 text-white shadow-sm">
                <Download className="size-3.5" />
                Download PNG
              </Button>
            </a>
          </div>
        </div>

        {/* Big Responsive Certificate Viewport */}
        <div className="flex-1 w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 p-4 sm:p-6 flex items-center justify-center overflow-auto mt-3 relative shadow-2xl">
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 text-amber-400">
              <Loader2 className="size-10 animate-spin" />
              <span className="text-xs font-medium text-white">Rendering certificate...</span>
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certUrl}
            alt={`Contributor #${userId} Certificate`}
            className="max-h-[68vh] max-w-full rounded-2xl shadow-2xl object-contain border border-zinc-800/80"
            onLoad={() => setLoading(false)}
            onLoadStart={() => setLoading(true)}
          />
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-2">
          High-resolution certificate with QR credential verification rendered on-demand.
        </p>
      </DialogContent>
    </Dialog>
  );
}
