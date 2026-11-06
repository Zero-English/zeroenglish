"use client";

import { useState, type KeyboardEvent } from "react";
import { Tag, X } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { MAX_TAGS, MAX_TAG_LENGTH, normalizeTags } from "@/lib/notes-text";
import { cn } from "@/lib/utils";

interface NoteTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  editable?: boolean;
  className?: string;
}

export function NoteTags({
  tags,
  onChange,
  editable = true,
  className,
}: NoteTagsProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");

  const commit = (raw: string) => {
    const next = normalizeTags([...tags, raw]);
    setInput("");
    if (next.length === tags.length) return;
    onChange(next);
  };

  const remove = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(input);
      return;
    }
    if (event.key === "Backspace" && input === "" && tags.length > 0) {
      event.preventDefault();
      remove(tags[tags.length - 1]);
    }
  };

  if (!editable && tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Tag className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-border/70 bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          <span className="truncate">#{tag}</span>
          {editable && (
            <button
              type="button"
              onClick={() => remove(tag)}
              className="rounded-full text-muted-foreground/70 transition-colors hover:text-foreground"
              aria-label={t(`#${tag} ট্যাগ সরান`, `Remove tag #${tag}`)}
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}

      {editable && tags.length < MAX_TAGS && (
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(input)}
          maxLength={MAX_TAG_LENGTH}
          placeholder={t("ট্যাগ যোগ করুন…", "Add a tag…")}
          aria-label={t("নোটে ট্যাগ যোগ করুন", "Add a tag to this note")}
          className="h-6 min-w-24 flex-1 rounded-full border border-dashed border-border bg-transparent px-2.5 text-[11px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60"
        />
      )}
    </div>
  );
}
