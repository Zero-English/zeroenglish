"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TemplateDefinition, TemplateType } from "@/lib/template-engine/types";
import { Eye, Download, RefreshCw, Sparkles } from "lucide-react";
import { Classic } from "@/components/classic";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateDefinition;
  type: TemplateType;
}

export function PreviewModal({
  open,
  onOpenChange,
  template,
  type,
}: PreviewModalProps) {
  const [useSample, setUseSample] = useState(true);
  const [dataId, setDataId] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/templates/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          type,
          dataId: useSample ? undefined : dataId,
          isSample: useSample,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
      }
    } catch (err) {
      console.error("Preview render failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      generatePreview();
    } else {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[96vw] h-[95vh] max-h-[95vh] flex flex-col p-4 sm:p-6 overflow-hidden gap-0 rounded-2xl">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-border flex flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <DialogTitle className="text-sm sm:text-lg font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 truncate">
              <Eye className="size-4 sm:size-5 text-primary shrink-0" />
              <span>Preview</span>
            </DialogTitle>
            <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 shrink-0">
              {template.width}×{template.height}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={generatePreview}
              disabled={loading}
              className="gap-1.5 text-xs h-8 px-2.5 sm:px-3"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Re-render</span>
            </Button>

            {previewBlobUrl && (
              <a
                href={previewBlobUrl}
                download={`${type.toLowerCase()}-preview.png`}
              >
                <Button size="sm" variant="default" className="gap-1.5 text-xs h-8 px-2.5 sm:px-3 shadow-xs">
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Download Full Image</span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </a>
            )}
          </div>
        </DialogHeader>

        {/* Controls Toolbar */}
        <div className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-border/60 bg-muted/20 -mx-4 sm:-mx-6 px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Button
              variant={useSample ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setUseSample(true);
                generatePreview();
              }}
              className="h-7 text-xs gap-1.5 px-2 sm:px-3"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Sample Data</span>
            </Button>
            <Button
              variant={!useSample ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setUseSample(false)}
              className="h-7 text-xs px-2 sm:px-3"
            >
              <span>Live Entity</span>
            </Button>

            {!useSample && (
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder={type === "QUIZ_POSTER" ? "Quiz ID" : "User ID"}
                  value={dataId}
                  onChange={(e) => setDataId(e.target.value)}
                  className="h-7 w-24 sm:w-36 text-xs px-2"
                />
                <Button size="sm" onClick={generatePreview} className="h-7 text-xs px-2 sm:px-3">
                  Apply
                </Button>
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground hidden sm:inline font-mono">
            Zero-storage serverless rendering
          </span>
        </div>

        {/* Large Expanded Image Viewport */}
        <div className="flex-1 w-full bg-zinc-950/95 rounded-2xl border border-zinc-800/90 p-4 sm:p-6 flex items-center justify-center overflow-auto mt-3 relative shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Classic className="size-10 text-primary" />
              <span className="text-sm font-medium text-zinc-300">Rendering high-res preview...</span>
            </div>
          ) : previewBlobUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewBlobUrl}
              alt="Template Preview"
              className="max-h-[76vh] max-w-full rounded-xl shadow-2xl object-contain border border-zinc-800"
            />
          ) : (
            <div className="text-sm text-zinc-500">
              Click Re-render to generate a preview.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
