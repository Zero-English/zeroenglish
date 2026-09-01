"use client";

import { useState } from "react";
import { Pencil, Ban, Mail, Trash2 } from "lucide-react";
import type { AdminUser } from "../../_data/users";

export default function UserActions({ user }: { user: AdminUser }) {
  const [message, setMessage] = useState<string | null>(null);

  function notify(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  }

  const isActive = user.status === "Active";

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
          onClick={() => notify(`Edit user opened for ${user.name} (id: ${user.id})`)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() =>
            notify(`${user.name} (id: ${user.id}) is now ${isActive ? "suspended" : "reactivated"}`)
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Ban className="h-3.5 w-3.5" />
          {isActive ? "Suspend" : "Reactivate"}
        </button>
        <button
          type="button"
          onClick={() => notify(`Email draft opened for ${user.name} (${user.email})`)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </button>
        <button
          type="button"
          onClick={() => notify(`Deleted user ${user.name} (id: ${user.id})`)}
          className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
