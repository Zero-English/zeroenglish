"use client";

import "@blocknote/mantine/style.css";

import { useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";

interface NoteBlockEditorProps {
  initialMarkdown: string;
  editable?: boolean;
  onChange: (markdown: string) => void;
}

/**
 * BlockNote editor for a single note. The parent remounts this component with
 * `key={note.id}` so switching notes starts a fresh document.
 */
export function NoteBlockEditor({
  initialMarkdown,
  editable = true,
  onChange,
}: NoteBlockEditorProps) {
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote();
  const loadedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const emittedRef = useRef(initialMarkdown);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- BlockNote exposes editability as a mutable property
    editor.isEditable = editable;
  }, [editor, editable]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    try {
      const blocks = editor.tryParseMarkdownToBlocks(initialMarkdown || "");
      if (blocks.length > 0) {
        editor.replaceBlocks(editor.document, blocks);
      }
    } catch {
      editor.replaceBlocks(editor.document, []);
    }
  }, [editor, initialMarkdown]);

  useEffect(() => {
    const unsubscribe = editor.onChange(async (event) => {
      let markdown = "";
      try {
        markdown = await event.blocksToMarkdownLossy();
      } catch {
        markdown = "";
      }

      if (markdown === emittedRef.current) return;
      emittedRef.current = markdown;
      onChangeRef.current(markdown);
    });

    return () => unsubscribe();
  }, [editor]);

  return (
    <BlockNoteView
      editor={editor}
      filePanel={false}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
