export type PopupAudienceValue =
  | "ALL"
  | "LOGGED_OUT_ONLY"
  | "LOGGED_IN_ONLY"
  | "GUEST_ONLY";

export type PopupPageRuleValue = "ALL" | "HOME" | "SPECIFIC_PATHS";

export type PopupAnimationValue =
  | "FADE"
  | "ZOOM"
  | "SLIDE_UP"
  | "SLIDE_DOWN"
  | "NONE";

export const popupAudienceOptions: {
  value: PopupAudienceValue;
  label: string;
}[] = [
  { value: "ALL", label: "Everyone" },
  { value: "LOGGED_OUT_ONLY", label: "Logged out only" },
  { value: "LOGGED_IN_ONLY", label: "Logged in only" },
  { value: "GUEST_ONLY", label: "Guest logged in only" },
];

export const popupAudienceLabelMap: Record<PopupAudienceValue, string> =
  Object.fromEntries(
    popupAudienceOptions.map((o) => [o.value, o.label])
  ) as Record<PopupAudienceValue, string>;

export const popupPageRuleOptions: {
  value: PopupPageRuleValue;
  label: string;
  hint: string;
}[] = [
  { value: "ALL", label: "All pages", hint: "Shows on every page" },
  { value: "HOME", label: "Home page only", hint: "Only on /" },
  {
    value: "SPECIFIC_PATHS",
    label: "Specific pages",
    hint: "Prefix match — /quiz also matches /quiz/exam",
  },
];

export const popupPageRuleLabelMap: Record<PopupPageRuleValue, string> =
  Object.fromEntries(
    popupPageRuleOptions.map((o) => [o.value, o.label])
  ) as Record<PopupPageRuleValue, string>;

export const popupAnimationOptions: {
  value: PopupAnimationValue;
  label: string;
}[] = [
  { value: "FADE", label: "Fade" },
  { value: "ZOOM", label: "Zoom" },
  { value: "SLIDE_UP", label: "Slide up" },
  { value: "SLIDE_DOWN", label: "Slide down" },
  { value: "NONE", label: "None" },
];

export const popupAnimationLabelMap: Record<
  PopupAnimationValue,
  string
> = Object.fromEntries(
  popupAnimationOptions.map((o) => [o.value, o.label])
) as Record<PopupAnimationValue, string>;

export type PopupMedia = {
  id: number;
  url: string;
  name: string;
  mimeType: string;
  width: number | null;
  height: number | null;
};

export type PopupItem = {
  id: number;
  name: string;
  active: boolean;
  link: string;
  landscapeMediaId: number | null;
  portraitMediaId: number | null;
  landscapeMedia: PopupMedia | null;
  portraitMedia: PopupMedia | null;
  scheduleEnabled: boolean;
  scheduledOpeningTime: string | null;
  scheduledClosingTime: string | null;
  audience: PopupAudienceValue;
  pageRule: PopupPageRuleValue;
  includePaths: string[];
  animation: PopupAnimationValue;
  createdAt: string;
  updatedAt: string;
};

export type PopupDetail = PopupItem;

export type PopupListResponse = {
  data: PopupItem[] | null;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  message?: string;
  success: boolean;
};

export type PopupDetailResponse = {
  data: PopupDetail | null;
  message?: string;
  success: boolean;
};