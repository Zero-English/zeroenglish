"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CanvasEditor } from "../../editor/canvas-editor";
import { Loader2 } from "lucide-react";

export default function EditTemplatePage() {
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/templates/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Template not found");
        return res.json();
      })
      .then((data) => {
        const t = data.template;
        setTemplate({
          id: t.id,
          name: t.name,
          description: t.description,
          type: t.type,
          width: t.width,
          height: t.height,
          backgroundColor: t.backgroundColor,
          backgroundMediaId: t.backgroundMediaId,
          backgroundMediaUrl: t.backgroundMedia?.url,
          elements: Array.isArray(t.elements) ? t.elements : [],
          isDefault: t.isDefault,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (templateData: any) => {
    const res = await fetch(`/api/v1/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update template");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-destructive">
        {error || "Failed to load template"}
      </div>
    );
  }

  return <CanvasEditor initialTemplate={template} onSave={handleSave} />;
}
