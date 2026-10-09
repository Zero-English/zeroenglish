"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Mail } from "lucide-react";
import type { ApiUser } from "../types";
import EditUserDialog from "../edit-user-dialog";
import { SendUserEmailDialog } from "../send-user-email-dialog";
import { Button } from "@/components/ui/button";

export default function UserActions({
  user,
}: {
  user: ApiUser;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-2">
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
          onClick={() => setEmailOpen(true)}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Mail className="h-3.5 w-3.5" />
          Email User
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

      <SendUserEmailDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        recipients={[{ id: user.id, name: user.name || user.user_name, email: user.email }]}
      />
    </div>
  );
}