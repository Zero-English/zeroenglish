"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Mail, Trash2 } from "lucide-react";
import type { ApiUser } from "../types";
import EditUserDialog from "../edit-user-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function UserActions({
  user,
}: {
  user: ApiUser;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function notify(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  }

  async function confirmDelete() {
    try {
      const res = await fetch(`/api/v1/user/${user.id}`, { method: "DELETE" });
      const body = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !body.success) {
        notify(body.message || "Failed to delete user");
        return;
      }
      notify(`Deleted user ${user.user_name}`);
      router.replace("/admin/users");
      router.refresh();
    } catch {
      notify("Failed to delete user");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {message && (
        <span className="inline-flex rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => notify(`Email draft opened for ${user.user_name} (${user.email})`)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      <EditUserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => {
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${user.user_name}? This action cannot be undone.`}
        confirmText="Delete User"
        onConfirm={confirmDelete}
      />
    </div>
  );
}