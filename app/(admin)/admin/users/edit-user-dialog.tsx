"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiUser } from "./types";

interface EditUserDialogProps {
  user: ApiUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: ApiUser) => void;
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSaved,
}: EditUserDialogProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [userName, setUserName] = useState(user?.user_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<"user" | "admin">(user?.role ?? "user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (loading) return;
    setError(null);
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          user_name: userName.trim(),
          email: email.trim(),
          role,
        }),
      });

      const body = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: ApiUser | null;
      };

      if (!res.ok || !body.success || !body.data) {
        setError(body.message || "Failed to update user");
        return;
      }

      onSaved({ ...user, ...body.data, name: body.data.name ?? null });
      onOpenChange(false);
    } catch {
      setError("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the profile details for {user ? `@${user.user_name}` : "this user"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="edit-user-name" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Display Name
            </label>
            <Input
              id="edit-user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Display Name"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="edit-user-username" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <Input
              id="edit-user-username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="username"
              required
              aria-label="Username"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="edit-user-email" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              id="edit-user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              aria-label="Email"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as "user" | "admin")}
            >
              <SelectTrigger className="w-full" aria-label="Role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}