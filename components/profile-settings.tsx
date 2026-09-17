"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
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
import { Classic } from "@/components/classic";
import { useAuthStore } from "@/lib/auth-store";
import { useProfileStore, type ProfileData } from "@/lib/profile-store";
import { useT } from "@/components/language-provider";

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

type ApiResponse = {
  data?: ProfileData | null;
  message?: string;
  success: boolean;
};

async function fetchProfile(): Promise<ApiResponse> {
  try {
    const res = await fetch("/api/v1/profile", { cache: "no-store" });
    const body = (await res.json()) as ApiResponse;
    return body;
  } catch {
    return { data: null, message: "Failed to load profile", success: false };
  }
}

export function ProfileSettings() {
  const status = useAuthStore((s) => s.status);
  const { update } = useSession();
  const t = useT();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [bio, setBio] = useState("");
  const [classValue, setClassValue] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [loadedProfile, setLoadedProfile] = useState(false);

  useEffect(() => {
    if (status !== "google") return;
    let cancelled = false;
    void (async () => {
      const body = await fetchProfile();
      if (cancelled) return;
      setLoading(false);
      if (!body.success || !body.data) {
        setError(body.message || "Failed to load profile");
        return;
      }
      const p = body.data;
      setName(p.name ?? "");
      setUserName(p.user_name);
      setInstitutionName(p.institutionName ?? "");
      setBio(p.bio ?? "");
      setClassValue(p.class ?? "");
      setGender(p.gender ?? "");
      setSocialLinks(p.socialLinks.length > 0 ? p.socialLinks : [""]);
      setLoadedProfile(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status !== "google") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <Classic className="size-6" />
      </div>
    );
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
    if (saving) return;

    if (!userName.trim()) {
      setError(t("ইউজারনেম প্রয়োজন।", "Username is required."));
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim() || null,
      user_name: userName.trim(),
      institutionName: institutionName.trim() || null,
      bio: bio.trim() || null,
      class: classValue || null,
      gender: gender || null,
      socialLinks: socialLinks
        .map((link) => link.trim())
        .filter((link) => link.length > 0),
    };

    try {
      const res = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json()) as ApiResponse;

      if (!res.ok || !body.success) {
        setError(body.message || "Failed to save profile");
        return;
      }

      // Refresh the session token so the updated name/image propagate
      // across the app (header, profile card, etc.).
      void update();
      useAuthStore.setState({ userName: payload.user_name });
      useProfileStore.setState((s) => ({
        profile: {
          ...(s.profile ?? { id: 0, user_name: payload.user_name, email: "", image: null, name: payload.name }),
          ...payload,
          gender: payload.gender === null ? "NOT_SET" : payload.gender,
        } as ProfileData,
        loaded: true,
      }));
      setLoadedProfile(true);
      toast.success(t("প্রোফাইল সংরক্ষণ করা হয়েছে।", "Profile saved."));
    } catch {
      setError(t("সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Failed to save profile. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-sm p-5 sm:p-6">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {t("প্রোফাইল সেটিংস", "Profile Settings")}
      </h2>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6">
        {t("তোমার প্রোফাইল তথ্য সম্পাদনা করো।", "Edit your profile information.")}
      </p>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="profile-name" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("নাম", "Name")}
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("আপনার নাম", "Your name")}
              aria-label={t("নাম", "Name")}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="profile-username" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("ইউজারনেম", "Username")}
              <span className="text-rose-500"> *</span>
            </label>
            <Input
              id="profile-username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="username"
              required
              aria-label={t("ইউজারনেম", "Username")}
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <label htmlFor="profile-institution" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("প্রতিষ্ঠানের নাম", "Institution Name")}
            </label>
            <Input
              id="profile-institution"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder={t("বিদ্যালয় / কলেজ / বিশ্ববিদ্যালয়", "School / College / University")}
              aria-label={t("প্রতিষ্ঠানের নাম", "Institution Name")}
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <label htmlFor="profile-bio" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("বায়ো", "Bio")}
            </label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("নিজের সম্পর্কে লিখুন", "Write something about yourself")}
              aria-label={t("বায়ো", "Bio")}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="profile-class" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("শ্রেণি", "Class")}
            </label>
            <Select value={classValue} onValueChange={setClassValue}>
              <SelectTrigger className="w-full" id="profile-class" aria-label={t("শ্রেণি", "Class")}>
                <SelectValue placeholder={t("নির্বাচন করো", "Select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("নেই", "Not set")}</SelectItem>
                {CLASS_OPTIONS.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="profile-gender" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("লিঙ্গ", "Gender")}
            </label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-full" id="profile-gender" aria-label={t("লিঙ্গ", "Gender")}>
                <SelectValue placeholder={t("নির্বাচন করো", "Select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("নির্ধারিত নয়", "Not set")}</SelectItem>
                <SelectItem value="MALE">{t("পুরুষ", "Male")}</SelectItem>
                <SelectItem value="FEMALE">{t("মহিলা", "Female")}</SelectItem>
                <SelectItem value="NOT_SET">{t("উল্লেখ নেই", "Prefer not to say")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("সোশ্যাল লিংক", "Social Links")}
            </span>
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    placeholder="https://facebook.com/..."
                    aria-label={`${t("সোশ্যাল লিংক", "Social Link")} ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-zinc-400 hover:text-rose-500"
                    onClick={() => removeLink(index)}
                    disabled={socialLinks.length <= 1}
                    aria-label={t("লিংক সরান", "Remove link")}
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
                {t("লিংক যোগ করুন", "Add link")}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !loadedProfile}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  );
}