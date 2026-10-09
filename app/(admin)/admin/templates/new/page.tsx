"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CanvasEditor } from "../editor/canvas-editor";
import { TemplateType } from "@/lib/template-engine/types";
import { Classic } from "@/components/classic";

export default function NewTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const typeParam = (searchParams.get("type") as TemplateType) || "QUIZ_POSTER";
    const mediaIdParam = searchParams.get("mediaId");

    const defaultWidth = typeParam === "CONTRIBUTOR_CERTIFICATE" ? 1920 : 1080;
    const defaultHeight = typeParam === "CONTRIBUTOR_CERTIFICATE" ? 1080 : 1350;

    const data: any = {
      name: `Custom ${typeParam === "CONTRIBUTOR_CERTIFICATE" ? "Certificate" : "Quiz Poster"} Template`,
      type: typeParam,
      width: defaultWidth,
      height: defaultHeight,
      backgroundColor: "#09090b",
      elements: [], // Clean canvas for custom Media template
      isDefault: false,
    };

    if (mediaIdParam) {
      // Fetch media info to set as background
      fetch(`/api/v1/media/${mediaIdParam}`)
        .then((res) => res.json())
        .then((mediaRes) => {
          if (mediaRes.media) {
            data.name = `${mediaRes.media.name || "Media"} Template`;
            data.backgroundMediaId = mediaRes.media.id;
            data.backgroundMediaUrl = mediaRes.media.url;
            if (mediaRes.media.width && mediaRes.media.height) {
              data.width = mediaRes.media.width;
              data.height = mediaRes.media.height;
            }
          }
          setInitialData(data);
          setLoading(false);
        })
        .catch(() => {
          setInitialData(data);
          setLoading(false);
        });
    } else {
      setInitialData(data);
      setLoading(false);
    }
  }, [searchParams]);

  const handleSave = async (templateData: any) => {
    const res = await fetch("/api/v1/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create template");
    }

    const json = await res.json();
    router.push(`/admin/templates/${json.template.id}/edit`);
  };

  if (loading || !initialData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Classic className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <CanvasEditor
      initialTemplate={initialData}
      onSave={handleSave}
      autoOpenMediaPicker={!searchParams.get("mediaId")}
    />
  );
}
