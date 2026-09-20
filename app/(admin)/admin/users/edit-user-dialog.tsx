"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiUser } from "./types";

const CLASS_OPTIONS = [
  "PrePrimary",
  "Class1",
  "Class2",
  "Class3",
  "Class4",
  "Class5",
  "Class6",
  "Class7",
  "Class8",
  "SSC",
  "HSC",
  "IELTS",
  "TOEFL",
  "University",
  "Masters",
  "Diploma",
  "BCS",
  "JOB",
] as const;

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the profile details for
            {user ? ` @${user.user_name} ` : " this user"}.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <EditUserForm
            key={user.id}
            user={user}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditUserForm({
  user,
  onOpenChange,
  onSaved,
}: {
  user: ApiUser;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: ApiUser) => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [userName, setUserName] = useState(user.user_name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<"user" | "admin" | "contributor">(
    user.role ?? "user"
  );
  const [institutionName, setInstitutionName] = useState(user.institutionName ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [classValue, setClassValue] = useState(user.class ?? "");
  const [gender, setGender] = useState(user.gender ?? "");
  const [socialLinks, setSocialLinks] = useState<string[]>(
    user.socialLinks?.length ? user.socialLinks : [""]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (loading) return;
    setError(null);
    onOpenChange(next);
  }

  const updateLink = (index: number, value: string) => {
    setSocialLinks((prev) => prev.map((link, i) => (i === index ? value : link)));
  };

  const addLink = () => {
    setSocialLinks((prev) => [...prev, ""]);
  };

  const removeLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
          institutionName: institutionName.trim() || null,
          bio: bio.trim() || null,
          class: classValue || null,
          gender: gender || null,
          socialLinks: socialLinks
            .map((link) => link.trim())
            .filter((link) => link.length > 0),
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
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="grid gap-1.5 sm:col-span-2">
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
          <label htmlFor="edit-user-institution" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Institution Name
          </label>
          <Input
            id="edit-user-institution"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            placeholder="School / College / University"
            aria-label="Institution Name"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="edit-user-class" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Class
          </label>
          <Select value={classValue} onValueChange={setClassValue}>
            <SelectTrigger className="w-full" id="edit-user-class" aria-label="Class">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Not set</SelectItem>
              {CLASS_OPTIONS.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="edit-user-gender" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Gender
          </label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-full" id="edit-user-gender" aria-label="Gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Not set</SelectItem>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="NOT_SET">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Role
          </label>
          <Select
            value={role}
            onValueChange={(value) =>
              setRole(value as "user" | "admin" | "contributor")
            }
          >
            <SelectTrigger className="w-full" aria-label="Role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="contributor">Contributor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <label htmlFor="edit-user-bio" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <Textarea
            id="edit-user-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about this user"
            aria-label="Bio"
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Social Links
          </span>
          <div className="space-y-2">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="https://facebook.com/..."
                  aria-label={`Social Link ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-gray-400 hover:text-rose-500"
                  onClick={() => removeLink(index)}
                  disabled={socialLinks.length <= 1}
                  aria-label="Remove link"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={addLink}
            >
              <Plus className="h-3.5 w-3.5" />
              Add link
            </Button>
          </div>
        </div>
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
  );
}