"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  FileCode,
  PenTool,
  Sparkles,
} from "lucide-react";
import { BlockNoteEditorDynamic } from "@/components/blog/blog-editor-dynamic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type EditorMode = "visual" | "markdown" | "preview";

interface WrittenMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function WrittenMarkdownEditor({
  value,
  onChange,
  placeholder = "Write your markdown content here...",
  minHeight = "min-h-[320px]",
}: WrittenMarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>("markdown");

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.getElementById(
      "raw-markdown-textarea"
    ) as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(`${value}\n${before}${after}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = `${before}${selected || "text"}${after}`;
    const newValue =
      value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selected ? selected.length : 4)
      );
    }, 50);
  };

  return (
    <div className="rounded-xl border border-border/80 bg-background overflow-hidden shadow-xs">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/40 px-3 py-2">
        {/* Mode Toggles */}
        <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("markdown")}
            className={cn(
              "h-7 px-2.5 text-xs font-medium rounded-md gap-1.5 transition-colors cursor-pointer",
              mode === "markdown"
                ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileCode className="size-3.5" />
            Markdown
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("visual")}
            className={cn(
              "h-7 px-2.5 text-xs font-medium rounded-md gap-1.5 transition-colors cursor-pointer",
              mode === "visual"
                ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PenTool className="size-3.5" />
            Rich Editor
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("preview")}
            className={cn(
              "h-7 px-2.5 text-xs font-medium rounded-md gap-1.5 transition-colors cursor-pointer",
              mode === "preview"
                ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
        </div>

        {/* Markdown Toolbar formatting buttons when in markdown mode */}
        {mode === "markdown" && (
          <div className="flex items-center gap-0.5 overflow-x-auto text-muted-foreground">
            <button
              type="button"
              title="Bold"
              onClick={() => insertMarkdown("**", "**")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <Bold className="size-3.5" />
            </button>
            <button
              type="button"
              title="Italic"
              onClick={() => insertMarkdown("*", "*")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <Italic className="size-3.5" />
            </button>
            <span className="w-px h-4 bg-border/80 mx-1" />
            <button
              type="button"
              title="Heading 1"
              onClick={() => insertMarkdown("# ")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <Heading1 className="size-3.5" />
            </button>
            <button
              type="button"
              title="Heading 2"
              onClick={() => insertMarkdown("## ")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <Heading2 className="size-3.5" />
            </button>
            <button
              type="button"
              title="Heading 3"
              onClick={() => insertMarkdown("### ")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <Heading3 className="size-3.5" />
            </button>
            <span className="w-px h-4 bg-border/80 mx-1" />
            <button
              type="button"
              title="Bullet List"
              onClick={() => insertMarkdown("- ")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              title="Numbered List"
              onClick={() => insertMarkdown("1. ")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <ListOrdered className="size-3.5" />
            </button>
            <button
              type="button"
              title="Quote"
              onClick={() => insertMarkdown("> ")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <Quote className="size-3.5" />
            </button>
            <button
              type="button"
              title="Code Block"
              onClick={() => insertMarkdown("```\n", "\n```")}
              className="p-1.5 rounded hover:bg-muted hover:text-foreground transition-colors"
            >
              <Code className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className={cn("p-3", minHeight)}>
        {mode === "markdown" && (
          <Textarea
            id="raw-markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={12}
            className="w-full font-mono text-sm leading-relaxed resize-y border-0 focus-visible:ring-0 focus-visible:outline-none bg-transparent shadow-none p-0"
          />
        )}

        {mode === "visual" && (
          <div className="prose dark:prose-invert max-w-none min-h-[280px]">
            <BlockNoteEditorDynamic
              initialMarkdown={value}
              onChange={onChange}
            />
          </div>
        )}

        {mode === "preview" && (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed p-2">
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic text-xs">
                Nothing to preview yet. Switch to Markdown or Rich Editor to add content.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

