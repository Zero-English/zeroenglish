"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Image as ImageIcon, Loader2, Upload, Plus, Check } from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  id: number;
  name: string;
  url: string;
  mimeType?: string;
  width?: number | null;
  height?: number | null;
  size?: number;
}

interface MediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: { id: number; url: string; name: string; width?: number; height?: number }) => void;
  title?: string;
}

function thumbnailUrl(item: MediaItem): string {
  if (!item.url) return "";
  if (item.mimeType === "image/svg+xml") return item.url;
  // High-DPI crisp thumbnail
  return item.url.includes("ik.imagekit.io")
    ? `${item.url}?tr=w-600,h-600,c-at_max`
    : item.url;
}

export function MediaModal({
  open,
  onOpenChange,
  onSelect,
  title = "Select Base Image from Media",
}: MediaModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/media?limit=60");
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.media)
          ? json.media
          : [];
        setMediaList(items);
      }
    } catch (err) {
      console.error("Failed to load media list", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name);

      const res = await fetch("/api/v1/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.data) {
        toast.success("Image uploaded successfully!");
        onSelect({
          id: json.data.id,
          url: json.data.url,
          name: json.data.name,
          width: json.data.width ?? undefined,
          height: json.data.height ?? undefined,
        });
        onOpenChange(false);
      } else {
        toast.error(json.message || "Failed to upload image");
      }
    } catch (err) {
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filtered = mediaList.filter((m) =>
    (m.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl sm:max-w-5xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border flex flex-row items-center justify-between gap-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ImageIcon className="size-5 text-primary" />
            {title}
          </DialogTitle>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadNew}
              accept="image/*"
              className="hidden"
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-1.5 text-xs h-8"
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              Upload Image
            </Button>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search media files by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto mt-4 min-h-[380px] pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="text-xs">Loading media assets...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground border rounded-2xl border-dashed p-8 text-center">
              <ImageIcon className="size-14 opacity-30 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">No images found in Media library</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image from your computer to use as your reusable template base.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                Upload New Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect({
                      id: item.id,
                      url: item.url,
                      name: item.name,
                      width: item.width ?? undefined,
                      height: item.height ?? undefined,
                    });
                    onOpenChange(false);
                  }}
                  className="group relative rounded-sm border border-border overflow-hidden bg-zinc-950 aspect-3/4 sm:aspect-4/5 flex flex-col justify-between transition-all hover:ring-2 hover:ring-primary hover:shadow-xl focus:outline-none text-left"
                >
                  {/* Image container */}
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrl(item)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  </div>

                  {/* Overlay Meta */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 z-10 flex flex-col justify-end">
                    <p className="text-xs font-semibold text-white truncate drop-shadow-sm">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-300 font-mono">
                      <span>{item.width && item.height ? `${item.width}×${item.height}` : "Original"}</span>
                      <span className="text-primary font-medium group-hover:underline flex items-center gap-1">
                        Use Image →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
