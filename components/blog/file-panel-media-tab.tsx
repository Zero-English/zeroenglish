"use client";

import { ChevronLeft, ChevronRight, ImageIcon, Search } from "lucide-react";
import {
  EmbedTab,
  FilePanel,
  useBlockNoteEditor,
  useDictionary,
  type FilePanelProps,
} from "@blocknote/react";
import { FilePanelExtension } from "@blocknote/core/extensions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MEDIA_PAGE_LIMIT,
  thumbnailUrl,
  useMediaLibrary,
} from "./use-media-library";

export function MediaLibraryFilePanel(props: FilePanelProps) {
  const dict = useDictionary();

  return (
    <FilePanel
      {...props}
      tabs={[
        {
          name: dict.file_panel.embed.title,
          tabPanel: <EmbedTab blockId={props.blockId} />,
        },
        {
          name: "Media library",
          tabPanel: <MediaLibraryTab blockId={props.blockId} />,
        },
      ]}
    />
  );
}

function MediaLibraryTab({ blockId }: { blockId: string }) {
  const editor = useBlockNoteEditor();

  const { media, loading, page, setPage, totalPages, total, search, setSearch } =
    useMediaLibrary(true);

  const pick = (m: { url: string; name: string; altText: string }) => {
    editor.updateBlock(blockId, {
      props: { url: m.url, name: m.name, caption: m.altText ?? "" },
    });
    editor.getExtension(FilePanelExtension)?.closeMenu();
  };

  return (
    <div className="w-full space-y-2 p-1">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media..."
          className="h-8 pl-7 text-sm"
        />
      </div>

      <div className="max-h-[260px] overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: MEDIA_PAGE_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-8 text-center dark:border-gray-700">
            <ImageIcon className="mb-2 h-7 w-7 text-gray-300 dark:text-gray-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No images found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {media.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(item)}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left transition-colors hover:border-primary/50 focus:border-primary focus:outline-none dark:border-gray-800 dark:bg-gray-900"
                title={item.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(item.url, item.mimeType)}
                  alt={item.altText || item.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <p className="truncate px-1.5 py-1 text-[10px] font-medium text-gray-700 dark:text-gray-300">
                  {item.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && total > MEDIA_PAGE_LIMIT && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {total} image{total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-1 text-xs text-gray-600 dark:text-gray-300">
              {page}/{totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}