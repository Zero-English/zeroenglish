"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutTemplate,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";
import { TemplateType } from "@/lib/template-engine/types";
import { toast } from "sonner";

interface TemplateItem {
  id: number;
  name: string;
  description: string;
  type: TemplateType;
  width: number;
  height: number;
  isDefault: boolean;
  isActive: boolean;
  backgroundColor?: string;
  backgroundMedia?: { id: number; url: string; name: string } | null;
  createdBy?: { id: number; name: string | null; user_name: string } | null;
  createdAt: string;
}

export default function TemplatesListPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const url = filterType === "ALL" ? "/api/v1/templates" : `/api/v1/templates?type=${filterType}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/v1/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Template deleted");
        fetchTemplates();
      } else {
        toast.error("Failed to delete template");
      }
    } catch (err) {
      toast.error("Error deleting template");
    }
  };

  const handleClone = async (template: TemplateItem) => {
    try {
      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          type: template.type,
          width: template.width,
          height: template.height,
          backgroundColor: template.backgroundColor,
          backgroundMediaId: template.backgroundMedia?.id,
          elements: (template as any).elements || [],
          isDefault: false,
        }),
      });

      if (res.ok) {
        toast.success("Template cloned");
        fetchTemplates();
      }
    } catch (err) {
      toast.error("Failed to clone template");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dynamic Template Engine
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Design visual templates for Quiz Posters, Contributor Certificates, and Social Cards with on-the-fly ImageResponse rendering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/templates/new">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="size-4" />
              Create Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {["ALL", "QUIZ_POSTER", "CONTRIBUTOR_CERTIFICATE", "VOCABULARY_POSTER"].map((t) => (
          <Button
            key={t}
            variant={filterType === t ? "default" : "ghost"}
            size="xs"
            onClick={() => setFilterType(t)}
            className="text-xs"
          >
            {t === "ALL" ? "All Templates" : t.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground border rounded-2xl border-dashed p-8">
          <LayoutTemplate className="size-12 opacity-30" />
          <p className="text-sm font-medium">No templates found.</p>
          <Link href="/admin/templates/new">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="size-3.5" />
              Create First Template
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              {/* Thumbnail / Live Render Preview */}
              <div className="relative aspect-4/3 sm:aspect-square md:aspect-4/3 bg-zinc-950 p-2 flex items-center justify-center overflow-hidden border-b border-border/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/v1/templates/render?templateId=${tpl.id}&sample=true`}
                  alt={tpl.name}
                  className="max-w-full max-h-full object-contain rounded-lg group-hover:scale-[1.03] transition-transform duration-300 drop-shadow-md"
                  loading="lazy"
                />

                {tpl.isDefault && (
                  <Badge className="absolute top-3 left-3 bg-amber-500/90 text-white hover:bg-amber-500 text-[10px] uppercase tracking-wider font-semibold">
                    <Sparkles className="size-3 mr-1" />
                    Default
                  </Badge>
                )}

                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-black/70 backdrop-blur text-white text-[10px] font-mono">
                    {tpl.width}×{tpl.height}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {tpl.name}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/templates/${tpl.id}/edit`} className="cursor-pointer gap-2">
                            <Edit className="size-3.5" />
                            Edit in Studio
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleClone(tpl)}
                          className="cursor-pointer gap-2"
                        >
                          <Copy className="size-3.5" />
                          Clone Template
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`/api/v1/templates/render?templateId=${tpl.id}&sample=true`}
                            target="_blank"
                            rel="noreferrer"
                            className="cursor-pointer gap-2"
                          >
                            <Eye className="size-3.5" />
                            View Full PNG
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(tpl.id)}
                          className="cursor-pointer gap-2"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {tpl.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {tpl.type.replace("_", " ")}
                  </Badge>

                  <Link href={`/admin/templates/${tpl.id}/edit`}>
                    <Button size="xs" variant="secondary" className="gap-1 text-xs">
                      <Edit className="size-3" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
