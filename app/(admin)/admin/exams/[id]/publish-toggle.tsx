"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, MegaphoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublishToggle({
  examId,
  published,
}: {
  examId: number;
  published: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(published);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/quiz-exam/${examId}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !value }),
      });
      const json = await res.json();
      if (json.success) {
        setValue(!value);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={value ? "outline" : "default"} onClick={toggle} disabled={loading}>
      {value ? <MegaphoneOff /> : <Megaphone />}
      {loading
        ? "Updating..."
        : value
          ? "Unpublish results"
          : "Publish results"}
    </Button>
  );
}