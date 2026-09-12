"use client";

import { useEffect, useRef } from "react";
import { useCreateBlockNote, FilePanelController } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { MediaLibraryFilePanel } from "./file-panel-media-tab";

export const BlockNoteEditor = ({
  initialMarkdown,
  onChange,
}: {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
}) => {
  const editor = useCreateBlockNote();
  const loadedRef = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    let cancelled = false;
    try {
      const blocks = editor.tryParseMarkdownToBlocks(initialMarkdown || "");
      if (!cancelled && blocks.length > 0) editor.replaceBlocks(editor.document, blocks);
    } catch {
      if (!cancelled) editor.replaceBlocks(editor.document, []);
    }
    return () => {
      cancelled = true;
    };
  }, [editor, initialMarkdown]);

  useEffect(() => {
    const unsub = editor.onChange(async (e) => {
      let markdown = "";
      try {
        markdown = await e.blocksToMarkdownLossy();
      } catch {
        markdown = "";
      }
      onChangeRef.current(markdown);
    });
    return () => unsub();
  }, [editor]);

  return (
    <BlockNoteView editor={editor} filePanel={false}>
      <FilePanelController filePanel={MediaLibraryFilePanel} />
    </BlockNoteView>
  );
};