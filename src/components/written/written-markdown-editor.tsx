"use client";

import React, { useRef, useState, useId, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  FileCode,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Eye,
  Columns,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Highlighter,
  HelpCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  Lightbulb,
  ChevronDown,
  Undo2,
  Redo2,
  Sparkles,
  BookOpen,
  MessageSquare,
  Mail,
  Eraser,
  Wand2,
  FileSpreadsheet,
  FoldVertical,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Scale,
  Search,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useMediaLibrary,
  thumbnailUrl,
  MEDIA_PAGE_LIMIT,
  type PickerMedia,
} from "@/components/blog/use-media-library";
import { PaginationNav } from "@/components/pagination-nav";
import { cn } from "@/lib/utils";

export type EditorViewMode = "write" | "split" | "preview";

export interface WrittenMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  editorKey?: string;
}

// Custom Sanitize Schema preserving semantic markup, images & callouts
const customSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "mark",
    "u",
    "sub",
    "sup",
    "details",
    "summary",
    "kbd",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "img",
    "figure",
    "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    mark: ["className", "class"],
    u: ["className", "class"],
    sub: ["className", "class"],
    sup: ["className", "class"],
    span: ["className", "class"],
    div: ["className", "class"],
    code: ["className", "class"],
    th: ["align", "className", "style"],
    td: ["align", "className", "style"],
    details: ["open", "className"],
    summary: ["className"],
    img: ["src", "alt", "title", "className", "class", "loading", "width", "height"],
    figure: ["className", "class"],
    figcaption: ["className", "class"],
  },
};

export function WrittenMarkdownEditor({
  value,
  onChange,
  placeholder = "Write your markdown content here...",
  minHeight = "min-h-[420px]",
  className,
}: WrittenMarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<EditorViewMode>("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorId = useId();

  // Selection Tracking
  const [selectionInfo, setSelectionInfo] = useState<{
    words: number;
    chars: number;
  } | null>(null);

  // Undo / Redo history stack
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isInternalChangeRef = useRef(false);

  // Modals state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Image Modal state (Media Model & URL)
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageTab, setImageTab] = useState<"media" | "url">("media");
  const [selectedMedia, setSelectedMedia] = useState<PickerMedia | null>(null);
  const [imageAlt, setImageAlt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Media Library Hook (Connected to Media Model via /api/v1/media)
  const {
    media: libraryMedia,
    loading: mediaLoading,
    page: mediaPage,
    setPage: setMediaPage,
    totalPages: mediaTotalPages,
    total: mediaTotal,
    search: mediaSearch,
    setSearch: setMediaSearch,
  } = useMediaLibrary(imageDialogOpen && imageTab === "media");

  // Table Modal state
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Cheat Sheet Modal state
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

  // Record history
  const recordHistory = useCallback(
    (newVal: string) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        if (sliced[sliced.length - 1] === newVal) return prev;
        const updated = [...sliced, newVal];
        // limit history to 50 entries
        if (updated.length > 50) updated.shift();
        return updated;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  const handleValueChange = (newVal: string, record: boolean = true) => {
    isInternalChangeRef.current = true;
    onChange(newVal);
    if (record) {
      recordHistory(newVal);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevVal = history[historyIndex - 1];
      setHistoryIndex((idx) => idx - 1);
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextVal = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      onChange(nextVal);
    }
  };

  // Synchronize history if external value changes (and not from typing)
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (value !== history[historyIndex]) {
      setHistory([value]);
      setHistoryIndex(0);
    }
  }, [value, history, historyIndex]);

  // Statistics
  const words = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = value.length;
  const charsNoSpaces = value.replace(/\s/g, "").length;
  const lines = value ? value.split("\n").length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 150));

  /**
   * Helper to wrap or insert text at current cursor position
   */
  const insertFormatting = (
    prefix: string,
    suffix: string = "",
    defaultText: string = "text",
    blockMode: boolean = false
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleValueChange(`${value}\n${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.substring(start, end);

    let replacement = "";
    let cursorStart = 0;
    let cursorEnd = 0;

    if (blockMode) {
      const needsPrefixNewline = start > 0 && value[start - 1] !== "\n";
      const beforeNewline = needsPrefixNewline ? "\n" : "";
      const textToWrap = selected || defaultText;
      replacement = `${beforeNewline}${prefix}${textToWrap}${suffix}`;
      cursorStart = start + beforeNewline.length + prefix.length;
      cursorEnd = cursorStart + (selected ? selected.length : defaultText.length);
    } else {
      const textToWrap = selected || defaultText;
      replacement = `${prefix}${textToWrap}${suffix}`;
      cursorStart = start + prefix.length;
      cursorEnd = cursorStart + (selected ? selected.length : defaultText.length);
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    handleValueChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 20);
  };

  /**
   * Prefix each selected line (for lists, blockquotes, tasks)
   */
  const prefixLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      insertFormatting(prefix, "", "Item", true);
      return;
    }

    const before = value.substring(0, start);
    const selected = value.substring(start, end);
    const after = value.substring(end);

    const transformed = selected
      .split("\n")
      .map((line, idx) => {
        if (prefix === "1. ") {
          return `${idx + 1}. ${line.replace(/^(\d+\.|\-|\*|\- \[[ x]\])\s*/, "")}`;
        }
        return `${prefix}${line.replace(/^(\d+\.|\-|\*|\- \[[ x]\])\s*/, "")}`;
      })
      .join("\n");

    const newValue = before + transformed + after;
    handleValueChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
    }, 20);
  };

  /**
   * Strip formatting from selected text
   */
  const handleClearFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) {
      toast.info("Select formatted text to remove markdown styling");
      return;
    }

    const selected = value.substring(start, end);
    const cleaned = selected
      .replace(/(\*\*|__|\*|_|~~|<mark>|<\/mark>|<u>|<\/u>|`|<sub>|<\/sub>|<sup>|<\/sup>)/g, "")
      .replace(/^(\s*[-*+]|\d+\.|\>|- \[[ x]\]|#{1,6})\s+/gm, "");

    const newValue = value.substring(0, start) + cleaned + value.substring(end);
    handleValueChange(newValue);
    toast.success("Formatting removed from selection");

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + cleaned.length);
    }, 20);
  };

  /**
   * Clean trailing spaces & excessive empty lines
   */
  const handleCleanWhitespace = () => {
    if (!value.trim()) return;
    const cleaned = value
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    handleValueChange(cleaned);
    toast.success("Whitespace and empty lines cleaned");
  };

  /**
   * Keyboard shortcuts & Tab handling
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = "  ";

      const newValue = value.substring(0, start) + indent + value.substring(end);
      handleValueChange(newValue, false);

      setTimeout(() => {
        textarea.setSelectionRange(start + indent.length, start + indent.length);
      }, 0);
      return;
    }

    if (ctrlKey && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    if ((ctrlKey && e.key === "y") || (ctrlKey && e.shiftKey && e.key === "z")) {
      e.preventDefault();
      handleRedo();
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insertFormatting("**", "**", "bold text");
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      insertFormatting("*", "*", "italic text");
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
      insertFormatting("<u>", "</u>", "underlined text");
      return;
    }

    if (ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openLinkModal();
      return;
    }

    if (e.key === "Escape" && isFullscreen) {
      setIsFullscreen(false);
      return;
    }
  };

  /**
   * Track selection for status bar
   */
  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const selText = value.substring(start, end).trim();
      const selWords = selText ? selText.split(/\s+/).filter(Boolean).length : 0;
      setSelectionInfo({ words: selWords, chars: end - start });
    } else {
      setSelectionInfo(null);
    }
  };

  const handleCopyMarkdown = () => {
    if (!value.trim()) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success("Markdown copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Open Link Dialog with prefilled text
  const openLinkModal = () => {
    const textarea = textareaRef.current;
    const selected = textarea
      ? value.substring(textarea.selectionStart, textarea.selectionEnd)
      : "";
    if (selected.startsWith("http://") || selected.startsWith("https://")) {
      setLinkUrl(selected);
      setLinkText("Link Title");
    } else {
      setLinkText(selected || "");
      setLinkUrl("");
    }
    setLinkDialogOpen(true);
  };

  const confirmInsertLink = () => {
    const title = linkText.trim() || "link title";
    const url = linkUrl.trim() || "https://";
    insertFormatting(`[${title}](`, ")", url);
    setLinkDialogOpen(false);
    setLinkText("");
    setLinkUrl("");
  };

  // Open Image Modal
  const openImageModal = (tab: "media" | "url" = "media") => {
    const textarea = textareaRef.current;
    const selected = textarea
      ? value.substring(textarea.selectionStart, textarea.selectionEnd).trim()
      : "";

    setImageTab(tab);
    setSelectedMedia(null);
    setImageAlt(selected || "");
    setImageUrl("");
    setImageDialogOpen(true);
  };

  // Confirm image from Media Library
  const confirmInsertMedia = (mediaItem: PickerMedia) => {
    const alt = imageAlt.trim() || mediaItem.altText || mediaItem.name || "Image";
    const url = mediaItem.url;
    insertFormatting(`![${alt}](`, ")\n", url, true);
    setImageDialogOpen(false);
    setSelectedMedia(null);
    setImageAlt("");
    setImageUrl("");
    toast.success(`Inserted "${mediaItem.name}" from Media Library`);
  };

  // Confirm image from Web URL
  const confirmInsertCustomImage = () => {
    const alt = imageAlt.trim() || "Image description";
    const url = imageUrl.trim();
    if (!url) {
      toast.error("Please enter a valid Image URL");
      return;
    }
    insertFormatting(`![${alt}](`, ")\n", url, true);
    setImageDialogOpen(false);
    setImageAlt("");
    setImageUrl("");
    toast.success("Image inserted into Markdown");
  };

  const confirmInsertTable = () => {
    const rows = Math.max(1, Math.min(tableRows, 20));
    const cols = Math.max(1, Math.min(tableCols, 10));

    let headerRow = "| " + Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(" | ") + " |\n";
    let dividerRow = "| " + Array.from({ length: cols }, () => "---").join(" | ") + " |\n";
    let bodyRows = "";

    for (let r = 0; r < rows; r++) {
      bodyRows += "| " + Array.from({ length: cols }, (_, c) => `Row ${r + 1} Col ${c + 1}`).join(" | ") + " |\n";
    }

    const tableMd = `\n${headerRow}${dividerRow}${bodyRows}\n`;
    insertFormatting(tableMd, "", "", true);
    setTableDialogOpen(false);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col transition-all",
        isFullscreen && "fixed inset-2 sm:inset-4 z-50 rounded-2xl shadow-2xl border-2 border-primary/50 bg-background",
        className
      )}
    >
      {/* Top Header Bar: View Modes & View Tools */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/40 px-3 py-2">
        {/* Left: View Mode Toggles */}
        <div className="flex items-center gap-1 bg-background/90 p-0.5 rounded-xl border border-border/60 shadow-2xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("write")}
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-lg gap-1.5 transition-colors cursor-pointer",
              viewMode === "write"
                ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Write Raw Markdown"
          >
            <FileCode className="size-3.5" />
            Write
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("split")}
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-lg gap-1.5 transition-colors cursor-pointer",
              viewMode === "split"
                ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Side-by-side editing and live preview"
          >
            <Columns className="size-3.5" />
            Split View
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("preview")}
            className={cn(
              "h-7 px-3 text-xs font-semibold rounded-lg gap-1.5 transition-colors cursor-pointer",
              viewMode === "preview"
                ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Preview formatted markdown"
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
        </div>

        {/* Right Tools: Quick Actions, Guide & Fullscreen */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCheatSheetOpen(true)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            title="Markdown syntax cheat sheet"
          >
            <HelpCircle className="size-3.5 text-primary/70" />
            <span className="hidden sm:inline">Guide</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyMarkdown}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            title="Copy Markdown source to clipboard"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Editor"}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        </div>
      </div>

      {/* Expanded Rich Markdown Action Toolbar (Visible in 'write' and 'split' modes) */}
      {(viewMode === "write" || viewMode === "split") && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-muted/20 px-2.5 py-1.5 text-muted-foreground overflow-x-auto scrollbar-none">
          {/* History: Undo / Redo */}
          <div className="flex items-center gap-0.5 mr-0.5">
            <button
              type="button"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              type="button"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Redo2 className="size-3.5" />
            </button>
          </div>

          <span className="w-px h-4 bg-border/80 mx-0.5" />

          {/* Headings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Headings"
              >
                <span className="font-bold">H</span>
                <ChevronDown className="size-3 text-muted-foreground/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-xs">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Headings
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => insertFormatting("# ", "", "Main Title", true)}
                className="gap-2 cursor-pointer font-bold text-sm"
              >
                <Heading1 className="size-4 text-primary" /> Heading 1 (Title)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertFormatting("## ", "", "Section Heading", true)}
                className="gap-2 cursor-pointer font-semibold"
              >
                <Heading2 className="size-4" /> Heading 2 (Section)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertFormatting("### ", "", "Subsection Heading", true)}
                className="gap-2 cursor-pointer font-medium"
              >
                <Heading3 className="size-4" /> Heading 3 (Subsection)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertFormatting("#### ", "", "Minor Heading", true)}
                className="gap-2 cursor-pointer"
              >
                <Heading4 className="size-4" /> Heading 4 (Minor)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => insertFormatting("##### ", "", "Small Heading", true)}
                className="gap-2 cursor-pointer"
              >
                <Heading5 className="size-4" /> Heading 5 (Small)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => insertFormatting("", "", "Normal paragraph text", true)}
                className="gap-2 cursor-pointer text-muted-foreground"
              >
                Paragraph (Normal)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="w-px h-4 bg-border/80 mx-0.5" />

          {/* Inline Text Formatting */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Bold (**text**) — Ctrl+B"
              onClick={() => insertFormatting("**", "**", "bold text")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Bold className="size-3.5" />
            </button>
            <button
              type="button"
              title="Italic (*text*) — Ctrl+I"
              onClick={() => insertFormatting("*", "*", "italic text")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Italic className="size-3.5" />
            </button>
            <button
              type="button"
              title="Underline (<u>text</u>) — Ctrl+U"
              onClick={() => insertFormatting("<u>", "</u>", "underlined text")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <UnderlineIcon className="size-3.5" />
            </button>
            <button
              type="button"
              title="Strikethrough (~~text~~)"
              onClick={() => insertFormatting("~~", "~~", "strikethrough text")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Strikethrough className="size-3.5" />
            </button>
            <button
              type="button"
              title="Highlight (<mark>text</mark>)"
              onClick={() => insertFormatting("<mark>", "</mark>", "highlighted text")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-amber-500"
            >
              <Highlighter className="size-3.5" />
            </button>
            <button
              type="button"
              title="Inline Code (`code`)"
              onClick={() => insertFormatting("`", "`", "code")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Code className="size-3.5" />
            </button>
            <button
              type="button"
              title="Subscript (<sub>text</sub>)"
              onClick={() => insertFormatting("<sub>", "</sub>", "sub")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <SubscriptIcon className="size-3.5" />
            </button>
            <button
              type="button"
              title="Superscript (<sup>text</sup>)"
              onClick={() => insertFormatting("<sup>", "</sup>", "sup")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <SuperscriptIcon className="size-3.5" />
            </button>
          </div>

          <span className="w-px h-4 bg-border/80 mx-0.5" />

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Bullet List (- item)"
              onClick={() => prefixLines("- ")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              title="Numbered List (1. item)"
              onClick={() => prefixLines("1. ")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <ListOrdered className="size-3.5" />
            </button>
            <button
              type="button"
              title="Task Checklist (- [ ] task)"
              onClick={() => prefixLines("- [ ] ")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <ListTodo className="size-3.5" />
            </button>
            <button
              type="button"
              title="Blockquote (> quote)"
              onClick={() => prefixLines("> ")}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Quote className="size-3.5" />
            </button>
          </div>

          <span className="w-px h-4 bg-border/80 mx-0.5" />

          {/* Inserts: Link, Image (with Media Model Picker), Table, Code Block, Divider, Accordion */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Insert Link (Ctrl+K)"
              onClick={openLinkModal}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <LinkIcon className="size-3.5" />
            </button>

            {/* Image Dropdown / Button (Media Model Picker or URL) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-primary"
                  title="Insert Markdown Image (Media Library or URL)"
                >
                  <ImageIcon className="size-3.5" />
                  <ChevronDown className="size-2.5 text-muted-foreground/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 text-xs">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Insert Markdown Image
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => openImageModal("media")}
                  className="gap-2 cursor-pointer font-medium py-1.5"
                >
                  <ImageIcon className="size-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">From Media Library</span>
                    <span className="text-[10px] text-muted-foreground">Browse Prisma Media model</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openImageModal("url")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  <Globe className="size-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">From Web URL</span>
                    <span className="text-[10px] text-muted-foreground">External image address</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              title="Insert Table Grid"
              onClick={() => setTableDialogOpen(true)}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <TableIcon className="size-3.5" />
            </button>
            <button
              type="button"
              title="Code / Passage Block (```)"
              onClick={() =>
                insertFormatting(
                  "```english\n",
                  "\n```\n",
                  "Write sample passage, sentence structure, or script here",
                  true
                )
              }
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <FileCode className="size-3.5" />
            </button>
            <button
              type="button"
              title="Horizontal Divider (---)"
              onClick={() => insertFormatting("\n---\n", "", "", true)}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              type="button"
              title="Collapsible Details (<details>)"
              onClick={() =>
                insertFormatting(
                  "<details>\n<summary>Click to view detailed explanation</summary>\n\n",
                  "\n\n</details>\n",
                  "Enter the hidden or extra explanation here.",
                  true
                )
              }
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <FoldVertical className="size-3.5" />
            </button>
          </div>

          <span className="w-px h-4 bg-border/80 mx-0.5" />

          {/* English Learning Templates Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer bg-primary/5 text-primary border border-primary/20"
                title="English Learning Templates"
              >
                <Sparkles className="size-3.5" />
                <span>Templates</span>
                <ChevronDown className="size-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 text-xs">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                English Writing Templates
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "| English Word | বাংলা অর্থ | Part of Speech | Example Sentence |\n|---|---|---|---|\n| Diligent | পরিশ্রমী | Adjective | She is a diligent and attentive student. |\n| Serene | শান্ত ও মনোরম | Adjective | A serene winter morning in rural Bangladesh. |\n| Perseverance | অধ্যবসায় | Noun | Success requires continuous perseverance. |\n",
                    "",
                    "",
                    true
                  )
                }
                className="gap-2 cursor-pointer py-1.5"
              >
                <FileSpreadsheet className="size-4 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="font-semibold">Vocabulary Builder Table</span>
                  <span className="text-[10px] text-muted-foreground">Word, Bangla, POS & Example</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "**Person A:** Hello! How have you been lately?\n**Person B:** Hi! I am doing well, thank you. What about you?\n**Person A:** Pretty good. Did you complete the English essay assignment?\n**Person B:** Yes, I finished it yesterday evening!\n",
                    "",
                    "",
                    true
                  )
                }
                className="gap-2 cursor-pointer py-1.5"
              >
                <MessageSquare className="size-4 text-blue-500" />
                <div className="flex flex-col">
                  <span className="font-semibold">Dialogue / Conversation Script</span>
                  <span className="text-[10px] text-muted-foreground">Two-speaker conversational layout</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "Date: October 22, 2026\n\nTo  \nThe Principal  \nDhaka College, Dhaka.  \n\n**Subject: Application for leave of absence.**\n\nSir,  \nWith due respect and humble submission, I beg to state that I could not attend college from ... to ... due to a sudden fever.\n\nI, therefore, pray and hope that your honor would be kind enough to grant me a leave of absence for those days.\n\nYours obediently,  \n**[Student Name]**  \nClass: XI, Group: Science, Roll: 105  \n",
                    "",
                    "",
                    true
                  )
                }
                className="gap-2 cursor-pointer py-1.5"
              >
                <Mail className="size-4 text-purple-500" />
                <div className="flex flex-col">
                  <span className="font-semibold">Formal Application / Letter</span>
                  <span className="text-[10px] text-muted-foreground">Standard academic format</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "## 1. Introduction\n- Background & opening hook\n- Core definition or context\n\n## 2. Main Characteristics & Causes\n- Detailed supporting point 1\n- Detailed supporting point 2\n\n## 3. Impact & Significance\n- Social, economic, or personal effects\n\n## 4. Conclusion & Reflection\n- Summary of key arguments\n- Concluding thought & future outlook\n",
                    "",
                    "",
                    true
                  )
                }
                className="gap-2 cursor-pointer py-1.5"
              >
                <BookOpen className="size-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="font-semibold">Essay / Paragraph Outline</span>
                  <span className="text-[10px] text-muted-foreground">Structured 4-part writing blueprint</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "| Advantages / সুফল | Disadvantages / কুফল |\n|---|---|\n| Saves valuable time and energy | Can lead to high dependency |\n| Provides instant access to learning materials | Screen fatigue and reduced physical exercise |\n| Connects learners across the world | Risk of digital distraction |\n",
                    "",
                    "",
                    true
                  )
                }
                className="gap-2 cursor-pointer py-1.5"
              >
                <Scale className="size-4 text-teal-500" />
                <div className="flex flex-col">
                  <span className="font-semibold">Pros & Cons Comparison</span>
                  <span className="text-[10px] text-muted-foreground">Bilingual advantages vs disadvantages</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "> ### 📌 Grammar Rule: Present Perfect Tense\n> **Formula:** Subject + `have / has` + Past Participle (V3) + Extension\n> \n> **Example:** *She has completed her English assignment successfully.*\n",
                    "",
                    "",
                    true
                  )
                }
                className="gap-2 cursor-pointer py-1.5"
              >
                <Wand2 className="size-4 text-rose-500" />
                <div className="flex flex-col">
                  <span className="font-semibold">Grammar Rule & Formula Box</span>
                  <span className="text-[10px] text-muted-foreground">Rule box with formula and example</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Callouts Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Callout Alerts"
              >
                <Lightbulb className="size-3.5 text-amber-500" />
                <span>Callout</span>
                <ChevronDown className="size-2.5 text-muted-foreground/70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-xs">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Callout Alerts
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "> [!NOTE]\n> ",
                    "",
                    "Helpful background information or contextual note.",
                    true
                  )
                }
                className="gap-2 cursor-pointer"
              >
                <Info className="size-4 text-blue-500" /> Note Callout
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "> [!TIP]\n> ",
                    "",
                    "Helpful vocabulary or exam tip for students.",
                    true
                  )
                }
                className="gap-2 cursor-pointer"
              >
                <Lightbulb className="size-4 text-emerald-500" /> Tip Callout
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "> [!IMPORTANT]\n> ",
                    "",
                    "Crucial grammatical or spelling rule to keep in mind.",
                    true
                  )
                }
                className="gap-2 cursor-pointer"
              >
                <AlertTriangle className="size-4 text-amber-500" /> Important Callout
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "> [!WARNING]\n> ",
                    "",
                    "Common grammatical pitfall or common mistake.",
                    true
                  )
                }
                className="gap-2 cursor-pointer"
              >
                <AlertCircle className="size-4 text-orange-500" /> Warning Callout
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  insertFormatting(
                    "> [!CAUTION]\n> ",
                    "",
                    "Strict guideline to follow.",
                    true
                  )
                }
                className="gap-2 cursor-pointer"
              >
                <ShieldAlert className="size-4 text-rose-500" /> Caution Callout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="w-px h-4 bg-border/80 mx-0.5" />

          {/* Formatting Utilities: Clear format & Clean whitespace */}
          <div className="flex items-center gap-0.5 ml-auto">
            <button
              type="button"
              title="Remove Markdown Formatting from selection"
              onClick={handleClearFormatting}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
            >
              <Eraser className="size-3.5" />
            </button>
            <button
              type="button"
              title="Clean excessive empty lines and trailing spaces"
              onClick={handleCleanWhitespace}
              className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
            >
              <Wand2 className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <div
        className={cn(
          "flex-1 p-3 sm:p-4 flex flex-col overflow-hidden",
          isFullscreen ? "h-full" : minHeight
        )}
      >
        {/* Mode 1: Write Only */}
        {viewMode === "write" && (
          <Textarea
            ref={textareaRef}
            id={`markdown-editor-${editorId}`}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onKeyUp={handleSelect}
            onMouseUp={handleSelect}
            placeholder={placeholder}
            rows={18}
            className="w-full font-mono text-sm leading-relaxed resize-y border-0 focus-visible:ring-0 focus-visible:outline-none bg-transparent shadow-none p-1 flex-1 min-h-[340px]"
          />
        )}

        {/* Mode 2: Split View (Side-by-Side: Raw Editor on Left, Live Rendered Markdown on Right) */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full flex-1 min-h-[380px] overflow-hidden">
            {/* Raw Source Column */}
            <div className="border-r border-border/70 pr-3 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border/40 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileCode className="size-3 text-primary" />
                  Markdown Source
                </span>
                <span className="text-[10px] text-muted-foreground/60">Tab = 2 spaces</span>
              </div>
              <Textarea
                ref={textareaRef}
                id={`markdown-editor-${editorId}`}
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                onKeyUp={handleSelect}
                onMouseUp={handleSelect}
                placeholder={placeholder}
                rows={18}
                className="w-full font-mono text-sm leading-relaxed resize-none border-0 focus-visible:ring-0 focus-visible:outline-none bg-transparent shadow-none p-1 flex-1 h-full overflow-y-auto"
              />
            </div>

            {/* Live Preview Column */}
            <div className="pl-1 overflow-y-auto flex flex-col h-full max-h-[650px]">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-border/40 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Eye className="size-3" />
                  Live Preview
                </span>
                <span className="text-[10px] text-muted-foreground/60">Auto-synced</span>
              </div>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed p-2 overflow-y-auto flex-1">
                {value.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeSanitize, customSanitizeSchema]]}
                    components={{
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/60 bg-muted/30 pl-4 py-1 italic my-3 text-muted-foreground rounded-r-md">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-3 border border-border/80 rounded-xl shadow-2xs">
                          <table className="w-full border-collapse text-left text-xs sm:text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border-b border-border bg-muted/60 px-3 py-2 font-semibold text-foreground">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border-b border-border/50 px-3 py-2 text-muted-foreground">
                          {children}
                        </td>
                      ),
                      mark: ({ children }) => (
                        <mark className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-1 py-0.5 rounded font-medium">
                          {children}
                        </mark>
                      ),
                      u: ({ children }) => <u className="underline decoration-primary/70">{children}</u>,
                      img: ({ src, alt }) => (
                        <figure className="my-3 overflow-hidden rounded-xl border border-border/70 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={alt || ""}
                            loading="lazy"
                            className="w-full max-h-[380px] object-cover rounded-t-xl"
                          />
                          {alt && (
                            <figcaption className="p-1.5 text-center text-xs text-muted-foreground bg-muted/30 border-t border-border/40 italic">
                              {alt}
                            </figcaption>
                          )}
                        </figure>
                      ),
                    }}
                  >
                    {value}
                  </ReactMarkdown>
                ) : (
                  <div className="py-16 text-center text-muted-foreground italic text-xs">
                    Start typing on the left to see live markdown preview...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 3: Full Preview Mode */}
        {viewMode === "preview" && (
          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed p-4 overflow-y-auto flex-1">
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeSanitize, customSanitizeSchema]]}
                components={{
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/60 bg-muted/30 pl-4 py-1.5 italic my-4 text-muted-foreground rounded-r-md">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-border/80 rounded-xl shadow-2xs">
                      <table className="w-full border-collapse text-left text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-border bg-muted/60 px-3.5 py-2.5 font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-border/50 px-3.5 py-2.5 text-muted-foreground">
                      {children}
                    </td>
                  ),
                  mark: ({ children }) => (
                    <mark className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-1.5 py-0.5 rounded font-medium">
                      {children}
                    </mark>
                  ),
                  u: ({ children }) => <u className="underline decoration-primary/70">{children}</u>,
                  img: ({ src, alt }) => (
                    <figure className="my-4 overflow-hidden rounded-xl border border-border/80 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={alt || ""}
                        loading="lazy"
                        className="w-full max-h-[460px] object-cover rounded-t-xl"
                      />
                      {alt && (
                        <figcaption className="p-2 text-center text-xs text-muted-foreground bg-muted/30 border-t border-border/50 italic">
                          {alt}
                        </figcaption>
                      )}
                    </figure>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <div className="py-20 text-center text-muted-foreground italic text-sm">
                Nothing to preview yet. Switch to <strong>Write</strong> to compose markdown content.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Status Footer Bar */}
      <div className="border-t border-border/60 bg-muted/20 px-3.5 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
        <div className="flex items-center gap-3">
          <span>
            Words: <strong className="text-foreground font-semibold">{words}</strong>
          </span>
          <span>
            Characters: <strong className="text-foreground font-semibold">{chars}</strong>
          </span>
          <span className="hidden sm:inline">
            No spaces: <strong className="text-foreground font-semibold">{charsNoSpaces}</strong>
          </span>
          <span>
            Lines: <strong className="text-foreground font-semibold">{lines}</strong>
          </span>
          {selectionInfo && (
            <span className="text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
              Selected: {selectionInfo.words}w, {selectionInfo.chars}c
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>
            Est. read: <strong className="text-foreground font-semibold">~{readingTime} min</strong>
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/60">
            GFM Markdown
          </span>
        </div>
      </div>

      {/* Dialog 1: Insert Link */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="size-4 text-primary" />
              Insert Markdown Link
            </DialogTitle>
            <DialogDescription>
              Add a hyperlink with display text and a destination URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Link Text / Anchor</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Cambridge Dictionary"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Destination URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://dictionary.cambridge.org"
                className="h-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={confirmInsertLink}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Insert Markdown Image (From Media Library / Media Model or Web URL) */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="size-4 text-primary" />
              Insert Markdown Image
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select an image from the Media Library (Media Model) or provide an external Web URL.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switch Tabs: Media Library vs Web URL */}
          <Tabs
            value={imageTab}
            onValueChange={(v) => setImageTab(v as "media" | "url")}
            className="flex-1 flex flex-col overflow-hidden pt-1"
          >
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="media" className="gap-2 text-xs">
                <ImageIcon className="size-3.5" />
                Media Library (Database)
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2 text-xs">
                <Globe className="size-3.5" />
                External Web URL
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Media Library (Prisma Media Model) */}
            <TabsContent value="media" className="flex-1 flex flex-col overflow-hidden space-y-3 pt-3">
              {/* Search input */}
              <div className="relative shrink-0">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Search media by name, caption or alt text..."
                  className="pl-8 h-8 text-xs"
                />
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto max-h-[300px] border border-border/60 rounded-xl p-2.5 bg-muted/10">
                {mediaLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {Array.from({ length: MEDIA_PAGE_LIMIT }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                    ))}
                  </div>
                ) : libraryMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                    <ImageIcon className="mb-2 size-8 text-muted-foreground/50" />
                    <p className="text-xs font-medium text-muted-foreground">
                      No media found in the library
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      Upload images in the Media Manager or try another search term.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {libraryMedia.map((item) => {
                      const isSelected = selectedMedia?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedMedia(item);
                            if (!imageAlt || imageAlt === "Image description") {
                              setImageAlt(item.altText || item.name);
                            }
                          }}
                          onDoubleClick={() => confirmInsertMedia(item)}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border text-left transition-all bg-card flex flex-col cursor-pointer",
                            isSelected
                              ? "border-primary ring-2 ring-primary/40 shadow-xs"
                              : "border-border/80 hover:border-primary/50"
                          )}
                          title={`${item.name} (Double-click to insert)`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnailUrl(item.url, item.mimeType)}
                              alt={item.altText || item.name}
                              loading="lazy"
                              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5 shadow-xs">
                                <Check className="size-3" />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5 bg-card shrink-0">
                            <p className="truncate text-[11px] font-medium text-foreground">
                              {item.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {item.mimeType.split("/")[1] || "image"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination if more than limit */}
              {!mediaLoading && mediaTotal > MEDIA_PAGE_LIMIT && (
                <div className="flex items-center justify-between border-t border-border/50 pt-2 shrink-0 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    Total {mediaTotal} images
                  </span>
                  <PaginationNav
                    page={mediaPage}
                    totalPages={mediaTotalPages}
                    onPageChange={setMediaPage}
                  />
                </div>
              )}

              {/* Selected Image Details & Markdown Alt Field */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5 flex items-center gap-3 shrink-0">
                {selectedMedia ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrl(selectedMedia.url, selectedMedia.mimeType)}
                      alt={selectedMedia.altText || selectedMedia.name}
                      className="size-11 rounded-lg object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold truncate text-foreground">
                          {selectedMedia.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Double-click to insert</span>
                      </div>
                      <Input
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Alt text / description for this image..."
                        className="h-7 text-xs bg-background"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => confirmInsertMedia(selectedMedia)}
                      className="h-8 text-xs shrink-0 cursor-pointer"
                    >
                      Insert Image
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic w-full text-center py-1">
                    Click an image above to select it, or double-click to insert immediately.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Custom External Web URL */}
            <TabsContent value="url" className="space-y-3 pt-3 flex-1 flex flex-col justify-center">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Alt Text (Image Description)</label>
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. A serene winter morning in rural Bangladesh"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Direct Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-9 text-xs"
                />
              </div>

              {imageUrl.trim() && (
                <div className="rounded-xl border border-border/80 bg-muted/20 p-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="size-12 rounded-lg object-cover border border-border shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="text-xs text-muted-foreground truncate">
                    <span className="font-semibold block text-foreground">Live Web URL Preview</span>
                    <span className="truncate block text-[11px]">{imageUrl}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={confirmInsertCustomImage}
                  disabled={!imageUrl.trim()}
                >
                  Insert Web Image
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-2 border-t border-border/40 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImageDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Insert Custom Table */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TableIcon className="size-4 text-primary" />
              Insert Markdown Table
            </DialogTitle>
            <DialogDescription>
              Configure the dimensions of your custom markdown table.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Columns</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Number(e.target.value))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Rows</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Number(e.target.value))}
                className="h-9 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={confirmInsertTable}>
              Generate Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 4: Markdown Guide & Cheat Sheet */}
      <Dialog open={cheatSheetOpen} onOpenChange={setCheatSheetOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5 text-primary" />
              Markdown Quick Reference & Cheat Sheet
            </DialogTitle>
            <DialogDescription>
              Quick guide for formatting written English articles, essays, and notes using GitHub Flavored Markdown (GFM).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Keyboard Shortcuts */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
              <span className="font-bold text-foreground block uppercase tracking-wider text-[11px]">
                ⚡ Keyboard Shortcuts
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex items-center justify-between bg-card p-1.5 rounded-lg border border-border/60">
                  <span>Bold</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border">Ctrl+B</kbd>
                </div>
                <div className="flex items-center justify-between bg-card p-1.5 rounded-lg border border-border/60">
                  <span>Italic</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border">Ctrl+I</kbd>
                </div>
                <div className="flex items-center justify-between bg-card p-1.5 rounded-lg border border-border/60">
                  <span>Underline</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border">Ctrl+U</kbd>
                </div>
                <div className="flex items-center justify-between bg-card p-1.5 rounded-lg border border-border/60">
                  <span>Insert Link</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border">Ctrl+K</kbd>
                </div>
                <div className="flex items-center justify-between bg-card p-1.5 rounded-lg border border-border/60">
                  <span>Indent (2 sp)</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border">Tab</kbd>
                </div>
                <div className="flex items-center justify-between bg-card p-1.5 rounded-lg border border-border/60">
                  <span>Undo / Redo</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border">Ctrl+Z / Y</kbd>
                </div>
              </div>
            </div>

            {/* Typography & Headers */}
            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2">
              <span className="font-bold text-foreground block uppercase tracking-wider text-[11px]">
                Headers & Typography
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                <p><code># Title (H1)</code> &nbsp;→&nbsp; Main Document Heading</p>
                <p><code>## Section (H2)</code> &nbsp;→&nbsp; Major Paragraph/Section</p>
                <p><code>### Subsection (H3)</code> &nbsp;→&nbsp; Sub-topic</p>
                <p><code>**bold text**</code> &nbsp;→&nbsp; <strong>bold text</strong></p>
                <p><code>*italic text*</code> &nbsp;→&nbsp; <em>italic text</em></p>
                <p><code>&lt;u&gt;underline&lt;/u&gt;</code> &nbsp;→&nbsp; <u>underlined text</u></p>
                <p><code>~~strikethrough~~</code> &nbsp;→&nbsp; <del>strikethrough</del></p>
                <p><code>&lt;mark&gt;highlight&lt;/mark&gt;</code> &nbsp;→&nbsp; Highlighted key vocabulary</p>
                <p><code>`code or word`</code> &nbsp;→&nbsp; Inline monospace highlight</p>
              </div>
            </div>

            {/* Lists & Quotes */}
            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2">
              <span className="font-bold text-foreground block uppercase tracking-wider text-[11px]">
                Lists & Callouts
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                <p><code>- Item</code> &nbsp;→&nbsp; Bullet point list</p>
                <p><code>1. Item</code> &nbsp;→&nbsp; Numbered chronological list</p>
                <p><code>- [ ] Task</code> &nbsp;→&nbsp; Interactive checklist item</p>
                <p><code>&gt; Quote</code> &nbsp;→&nbsp; Blockquote / Quotation</p>
                <p><code>&gt; [!NOTE]</code> &nbsp;→&nbsp; Informational callout box</p>
                <p><code>&gt; [!TIP]</code> &nbsp;→&nbsp; Exam and vocabulary tip box</p>
                <p><code>&gt; [!IMPORTANT]</code> &nbsp;→&nbsp; Key grammar rule alert</p>
              </div>
            </div>

            {/* Tables & Media */}
            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2">
              <span className="font-bold text-foreground block uppercase tracking-wider text-[11px]">
                Tables & Media
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                <p><code>![Alt text](image-url)</code> &nbsp;→&nbsp; Embedded image (from Media Library or Web URL)</p>
                <p><code>[Anchor Text](https://url)</code> &nbsp;→&nbsp; Clickable web link</p>
                <p><code>| Col 1 | Col 2 |</code> &nbsp;→&nbsp; Markdown Table syntax</p>
                <p><code>&lt;details&gt;&lt;summary&gt;Title&lt;/summary&gt;...&lt;/details&gt;</code> &nbsp;→&nbsp; Accordion</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => setCheatSheetOpen(false)}
            >
              Close Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
