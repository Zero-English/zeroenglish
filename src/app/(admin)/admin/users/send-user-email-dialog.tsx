"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  RefreshCw,
  User,
  Eye,
  Edit3,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SendUserEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: Array<{ id?: number; name?: string | null; email: string }>;
  onSent?: () => void;
}

interface TemplateOption {
  key: string;
  name: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
}

export function SendUserEmailDialog({
  open,
  onOpenChange,
  recipients,
  onSent,
}: SendUserEmailDialogProps) {
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("custom");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Fetch available templates on open
  useEffect(() => {
    if (open) {
      setLoadingTemplates(true);
      fetch("/api/v1/email/templates")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setTemplates(json.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingTemplates(false));

      // Reset fields if custom
      if (selectedTemplateKey === "custom" && !subject && !bodyHtml) {
        setSubject("");
        setBodyHtml("");
      }
    }
  }, [open]);

  // Handle template selection
  function handleTemplateChange(key: string) {
    setSelectedTemplateKey(key);
    if (key === "custom") {
      setSubject("");
      setBodyHtml("");
      return;
    }

    const tpl = templates.find((t) => t.key === key);
    if (tpl) {
      setSubject(tpl.subject);
      setBodyHtml(tpl.bodyHtml);
    }
  }

  // Render mock data for live preview
  function getPreviewHtml() {
    const firstRecipient = recipients[0] || { name: "Learner", email: "learner@example.com" };
    const mockData: Record<string, any> = {
      userName: firstRecipient.name || "Learner",
      userEmail: firstRecipient.email,
      logoUrl: "/assets/logo/main-logo.png",
      currentYear: new Date().getFullYear(),
      exploreUrl: "#",
      leaderboardUrl: "#",
      examTitle: "Master IELTS General Exam 2026",
      rank: 1,
      rankSuffix: "st",
      totalScore: 98,
      totalParticipants: 42,
      scoreInPercent: 98,
      message: bodyHtml || "Write your message to preview it here.",
    };

    let rendered = bodyHtml;
    // Conditionals
    rendered = rendered.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition, content) => {
        return mockData[condition] ? content : "";
      }
    );
    // Variables
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return mockData[key] !== undefined ? String(mockData[key]) : match;
    });

    return rendered;
  }

  async function handleSendEmail() {
    if (!subject.trim()) {
      toast.error("Please provide an email subject.");
      return;
    }
    if (!bodyHtml.trim()) {
      toast.error("Please provide an email body.");
      return;
    }

    const validEmails = recipients
      .map((r) => r.email.trim())
      .filter((e) => e && e.includes("@"));

    if (validEmails.length === 0) {
      toast.error("No valid recipient email addresses found.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/v1/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: "SPECIFIC",
          specificEmails: validEmails,
          subject,
          bodyHtml,
          templateKey: selectedTemplateKey === "custom" ? undefined : selectedTemplateKey,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(
          recipients.length === 1
            ? `Email successfully sent to ${recipients[0].email}!`
            : `Dispatched email to ${json.data?.sentCount || validEmails.length} recipient(s)!`
        );
        onOpenChange(false);
        if (onSent) onSent();
      } else {
        toast.error(json.message || "Failed to dispatch email.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setSending(false);
    }
  }

  const isSingle = recipients.length === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Dialog Header */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Mail className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  {isSingle ? "Send Email to User" : `Send Email to ${recipients.length} Users`}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isSingle
                    ? `Direct message to ${recipients[0].name || recipients[0].email}.`
                    : `Broadcasting message to ${recipients.length} selected recipients.`}
                </DialogDescription>
              </div>
            </div>

            {/* Segmented View Mode Toggle */}
            <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all",
                  viewMode === "edit"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Edit3 className="size-3" />
                Compose
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all",
                  viewMode === "preview"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="size-3" />
                Preview
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Dialog Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Recipients Summary Pills */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center justify-between">
              <span>{isSingle ? "Recipient:" : "Selected Recipients:"}</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {recipients.length} user{recipients.length > 1 ? "s" : ""}
              </span>
            </Label>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-2 rounded-lg bg-muted/40 border">
              {recipients.map((r, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[11px] py-0.5 px-2 gap-1 font-normal font-mono"
                >
                  <User className="size-3 text-muted-foreground" />
                  {r.email}
                </Badge>
              ))}
            </div>
          </div>

          {viewMode === "edit" ? (
            /* Compose Mode */
            <div className="space-y-4">
              {/* Template Preset Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Choose Email Template</Label>
                <Select
                  value={selectedTemplateKey}
                  onValueChange={handleTemplateChange}
                  disabled={loadingTemplates}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select a template or Custom message..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom" className="text-xs">
                      Custom Freeform Message
                    </SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.key} value={t.key} className="text-xs">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email-subject" className="text-xs">
                  Subject Line
                </Label>
                <Input
                  id="email-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Important update from Zero English..."
                  className="text-xs"
                />
              </div>

              {/* Body Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-body" className="text-xs">
                    Email Message (HTML / Text)
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    &#123;&#123;userName&#125;&#125;, &#123;&#123;userEmail&#125;&#125;
                  </span>
                </div>
                <Textarea
                  id="email-body"
                  rows={8}
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  placeholder="Hello {{userName}},\n\nWrite your message here..."
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          ) : (
            /* Live Preview Mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  Subject: <span className="font-normal text-muted-foreground">{subject || "No Subject"}</span>
                </span>

                <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-md">
                  <Button
                    type="button"
                    variant={previewDevice === "desktop" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 text-[10px] px-2 gap-1"
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor className="size-3" />
                    Desktop
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === "mobile" ? "default" : "ghost"}
                    size="sm"
                    className="h-6 text-[10px] px-2 gap-1"
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone className="size-3" />
                    Mobile
                  </Button>
                </div>
              </div>

              <div className="flex justify-center bg-muted/30 p-2 sm:p-4 rounded-xl border overflow-x-auto">
                <div
                  style={{ width: previewDevice === "desktop" ? "100%" : "375px" }}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden transition-all max-w-full"
                >
                  <iframe
                    title="Dialog Template Preview"
                    srcDoc={getPreviewHtml()}
                    className="w-full min-h-[360px] border-0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="p-4 sm:p-6 pt-3 border-t bg-muted/20 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={sending}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSendEmail}
            disabled={sending || !subject.trim() || !bodyHtml.trim()}
            className="gap-1.5 text-xs font-medium"
          >
            {sending ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                {isSingle ? "Send Email" : `Send to ${recipients.length} Users`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
