"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ExamEmailAction({
  examId,
  examTitle,
  totalResults,
}: {
  examId: number;
  examTitle: string;
  totalResults: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSendLeaderboardEmails() {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/v1/email/trigger-leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      const json = await res.json();

      if (json.success) {
        setStatusMessage({
          type: "success",
          text: json.message || "Leaderboard wishing emails successfully sent!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: json.message || "Failed to dispatch emails. Please check SMTP settings.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "An unexpected error occurred while sending emails.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
          <Mail className="size-3.5 text-primary" />
          Send Leaderboard Emails
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4 text-primary" />
            Send Leaderboard Results & Wishes
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Dispatch personalized result cards & wishing emails to all participants of{" "}
            <strong className="text-foreground font-semibold">"{examTitle}"</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3 text-xs">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Total completed submissions:</span>
              <span className="font-semibold text-foreground">{totalResults}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Top 3 Participants:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Podium Winner Template</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Other Participants:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">Standing Summary Template</span>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={handleSendLeaderboardEmails}
            disabled={loading || totalResults === 0}
            className="gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Send Emails Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
