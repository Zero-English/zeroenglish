"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Mail } from "lucide-react";
import type { ApiUser } from "../types";
import EditUserDialog from "../edit-user-dialog";
import { Button } from "@/components/ui/button";

export default function UserActions({
  user,
}: {
  user: ApiUser;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  function notify(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {message && (
        <span className="inline-flex rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-foreground">
          {message}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit User
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => notify(`Email draft opened for ${user.user_name} (${user.email})`)}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </Button>
      </div>

      <EditUserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => {
          router.refresh();
        }}
      />
    </div>
  );
}