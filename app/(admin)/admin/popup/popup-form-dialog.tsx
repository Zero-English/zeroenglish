"use client";

import { useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaPickerDialog } from "@/components/blog/media-picker-dialog";
import { thumbnailUrl } from "@/components/blog/use-media-library";
import {
  popupAnimationOptions,
  popupAudienceOptions,
  popupPageRuleOptions,
  type PopupAnimationValue,
  type PopupAudienceValue,
  type PopupDetail,
  type PopupPageRuleValue,
} from "../_data/popups";

export type PopupPayload = {
  name: string;
  active: boolean;
  link: string;
  landscapeMediaId: number | null;
  portraitMediaId: number | null;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  audience: PopupAudienceValue;
  pageRule: PopupPageRuleValue;
  includePaths: string[];
  animation: PopupAnimationValue;
};

type SelectedMedia = {
  id: number;
  url: string;
  name: string;
  mimeType: string;
};

type PopupFormState = {
  name: string;
  active: boolean;
  link: string;
  landscape: SelectedMedia | null;
  portrait: SelectedMedia | null;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string;
  scheduledClosingTime: string;
  audience: PopupAudienceValue;
  pageRule: PopupPageRuleValue;
  includePaths: string[];
  animation: PopupAnimationValue;
};

function emptyForm(): PopupFormState {
  return {
    name: "",
    active: true,
    link: "",
    landscape: null,
    portrait: null,
    scheduleEnabled: false,
    scheduledOpeningTime: "",
    scheduledClosingTime: "",
    audience: "ALL",
    pageRule: "ALL",
    includePaths: [],
    animation: "FADE",
  };
}

function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toSelectedMedia(media: PopupDetail["landscapeMedia"]): SelectedMedia | null {
  if (!media) return null;
  return {
    id: media.id,
    url: media.url,
    name: media.name,
    mimeType: media.mimeType,
  };
}

export function PopupFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PopupDetail | null;
  onSave: (payload: PopupPayload) => void;
}) {
  const [form, setForm] = useState<PopupFormState>(() => emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [pickerKey, setPickerKey] = useState<"landscape" | "portrait" | null>(null);
  const [newPath, setNewPath] = useState("");
  const [lastKey, setLastKey] = useState("");

  function resetForm() {
    setForm(
      editing
        ? {
            name: editing.name,
            active: editing.active,
            link: editing.link,
            landscape: toSelectedMedia(editing.landscapeMedia),
            portrait: toSelectedMedia(editing.portraitMedia),
            scheduleEnabled: editing.scheduleEnabled,
            scheduledOpeningTime: toDatetimeLocal(
              editing.scheduledOpeningTime
            ),
            scheduledClosingTime: toDatetimeLocal(
              editing.scheduledClosingTime
            ),
            audience: editing.audience,
            pageRule: editing.pageRule,
            includePaths: editing.includePaths,
            animation: editing.animation,
          }
        : emptyForm()
    );
    setError(null);
    setNewPath("");
  }

  const key = `${open ? "open" : "closed"}:${editing ? editing.id : "new"}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (open) resetForm();
  }

  function addPath() {
    const path = newPath.trim();
    if (!path) return;
    if (!path.startsWith("/")) {
      setError("Path must start with /");
      return;
    }
    setForm((prev) => ({
      ...prev,
      includePaths: prev.includePaths.includes(path)
        ? prev.includePaths
        : [...prev.includePaths, path],
    }));
    setNewPath("");
    setError(null);
  }

  function removePath(path: string) {
    setForm((prev) => ({
      ...prev,
      includePaths: prev.includePaths.filter((p) => p !== path),
    }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.landscape && !form.portrait) {
      setError("Select at least one image (landscape or portrait).");
      return;
    }
    if (form.scheduleEnabled) {
      if (!form.scheduledOpeningTime || !form.scheduledClosingTime) {
        setError(
          "Opening and closing times are required when scheduling is on."
        );
        return;
      }
      if (
        new Date(form.scheduledOpeningTime) >=
        new Date(form.scheduledClosingTime)
      ) {
        setError("Opening time must be before the closing time.");
        return;
      }
    }

    const payload: PopupPayload = {
      name: form.name.trim(),
      active: form.active,
      link: form.link.trim(),
      landscapeMediaId: form.landscape?.id ?? null,
      portraitMediaId: form.portrait?.id ?? null,
      scheduleEnabled: form.scheduleEnabled,
      scheduledOpeningTime:
        form.scheduleEnabled && form.scheduledOpeningTime
          ? new Date(form.scheduledOpeningTime).toISOString()
          : null,
      scheduledClosingTime:
        form.scheduleEnabled && form.scheduledClosingTime
          ? new Date(form.scheduledClosingTime).toISOString()
          : null,
      audience: form.audience,
      pageRule: form.pageRule,
      includePaths:
        form.pageRule === "SPECIFIC_PATHS" ? form.includePaths : [],
      animation: form.animation,
    };
    onSave(payload);
  }

  const inputClass =
    "h-7 rounded-md border border-input bg-input/20 px-2 py-1 text-xs text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit popup" : "Create popup"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the popup banner and its targeting."
              : "Add a new banner popup to your site."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="flex items-center gap-0.5">
                Name
                <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Summer sale promo"
              />
            </Field>
            <Field>
              <FieldLabel>Link</FieldLabel>
              <Input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://example.com/offer"
              />
            </Field>
          </div>

          {/* Images */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Images
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Landscape image (desktop)</FieldLabel>
                {form.landscape ? (
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrl(form.landscape.url, form.landscape.mimeType)}
                      alt={form.landscape.name}
                      className="aspect-video w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-2 py-1.5 dark:border-gray-800">
                      <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                        {form.landscape.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, landscape: null })}
                        aria-label="Remove landscape image"
                        className="shrink-0 text-rose-600 hover:text-rose-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerKey("landscape")}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-primary/50 hover:text-primary dark:border-gray-700 transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-xs">Choose image</span>
                  </button>
                )}
              </div>
              <div>
                <FieldLabel>Portrait image (mobile)</FieldLabel>
                {form.portrait ? (
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrl(form.portrait.url, form.portrait.mimeType)}
                      alt={form.portrait.name}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-2 py-1.5 dark:border-gray-800">
                      <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                        {form.portrait.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, portrait: null })}
                        aria-label="Remove portrait image"
                        className="shrink-0 text-rose-600 hover:text-rose-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerKey("portrait")}
                    className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-primary/50 hover:text-primary dark:border-gray-700 transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-xs">Choose image</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Targeting
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>Audience</FieldLabel>
                <Select
                  value={form.audience}
                  onValueChange={(v) =>
                    setForm({ ...form, audience: v as PopupAudienceValue })
                  }
                >
                  <SelectTrigger className="w-full" aria-label="Audience">
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {popupAudienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Page rule</FieldLabel>
                <Select
                  value={form.pageRule}
                  onValueChange={(v) =>
                    setForm({ ...form, pageRule: v as PopupPageRuleValue })
                  }
                >
                  <SelectTrigger className="w-full" aria-label="Page rule">
                    <SelectValue placeholder="Page rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {popupPageRuleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {popupPageRuleOptions.find((o) => o.value === form.pageRule)?.hint}
            </p>

            {form.pageRule === "SPECIFIC_PATHS" && (
              <div className="mt-3 space-y-2">
                <Field>
                  <FieldLabel>Paths (prefix match)</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={newPath}
                      onChange={(e) => setNewPath(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPath();
                        }
                      }}
                      placeholder="/quiz"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPath}
                      aria-label="Add path"
                    >
                      <Plus />
                    </Button>
                  </div>
                </Field>
                {form.includePaths.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.includePaths.map((path) => (
                      <span
                        key={path}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {path}
                        <button
                          type="button"
                          onClick={() => removePath(path)}
                          aria-label={`Remove ${path}`}
                          className="text-primary/70 hover:text-primary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.scheduleEnabled}
                onCheckedChange={(checked) =>
                  setForm({ ...form, scheduleEnabled: checked === true })
                }
              />
              Schedule this popup (restrict availability window)
            </label>
            {form.scheduleEnabled && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Opening time</FieldLabel>
                  <input
                    type="datetime-local"
                    value={form.scheduledOpeningTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledOpeningTime: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field>
                  <FieldLabel>Closing time</FieldLabel>
                  <input
                    type="datetime-local"
                    value={form.scheduledClosingTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledClosingTime: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>

          <Field>
            <FieldLabel>Animation</FieldLabel>
            <Select
              value={form.animation}
              onValueChange={(v) =>
                setForm({ ...form, animation: v as PopupAnimationValue })
              }
            >
              <SelectTrigger className="w-full" aria-label="Animation">
                <SelectValue placeholder="Animation" />
              </SelectTrigger>
              <SelectContent>
                {popupAnimationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={form.active}
              onCheckedChange={(checked) =>
                setForm({ ...form, active: checked === true })
              }
            />
            Popup is active
          </label>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            <Plus />
            {editing ? "Save changes" : "Create popup"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <MediaPickerDialog
        open={pickerKey === "landscape"}
        onOpenChange={(o) => {
          if (!o) setPickerKey(null);
        }}
        onSelect={(m) => {
          setForm((prev) => ({
            ...prev,
            landscape: {
              id: m.id,
              url: m.url,
              name: m.name,
              mimeType: m.mimeType,
            },
          }));
          setPickerKey(null);
        }}
      />
      <MediaPickerDialog
        open={pickerKey === "portrait"}
        onOpenChange={(o) => {
          if (!o) setPickerKey(null);
        }}
        onSelect={(m) => {
          setForm((prev) => ({
            ...prev,
            portrait: {
              id: m.id,
              url: m.url,
              name: m.name,
              mimeType: m.mimeType,
            },
          }));
          setPickerKey(null);
        }}
      />
    </Dialog>
  );
}