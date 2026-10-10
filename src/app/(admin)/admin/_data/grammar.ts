export type GrammarRuleStatusValue = "PENDING" | "APPROVED" | "REJECTED";

export type GrammarLevelValue = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const grammarRuleStatusOptions: {
  value: GrammarRuleStatusValue;
  label: string;
}[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const grammarRuleStatusLabelMap: Record<
  GrammarRuleStatusValue,
  string
> = Object.fromEntries(
  grammarRuleStatusOptions.map((o) => [o.value, o.label])
) as Record<GrammarRuleStatusValue, string>;

export const grammarLevelOptions: {
  value: GrammarLevelValue;
  label: string;
}[] = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

export type GrammarCategory = {
  id: number;
  name: string;
};

export type GrammarPrerequisite = {
  id: number;
  title: string;
  level: GrammarLevelValue;
};

export type GrammarRuleItem = {
  id: number;
  title: string;
  description: string;
  grammarCategoryId: number;
  grammarCategory: GrammarCategory | null;
  level: GrammarLevelValue;
  examples: string[];
  status: GrammarRuleStatusValue;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  createdBy: {
    id: number;
    name: string | null;
    user_name: string;
  } | null;
  commonMistakes: string[];
  prerequisites: GrammarPrerequisite[];
  prerequisiteIds: number[];
};

export type GrammarRuleDetail = GrammarRuleItem;

export type GrammarRuleListResponse = {
  data: GrammarRuleItem[] | null;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  message?: string;
  success: boolean;
};

export type GrammarRuleDetailResponse = {
  data: GrammarRuleDetail | null;
  message?: string;
  success: boolean;
};

export type GrammarRuleOption = {
  id: number;
  title: string;
  level: GrammarLevelValue;
};

export type GrammarRuleOptionsResponse = {
  data: GrammarRuleOption[] | null;
  message?: string;
  success: boolean;
};
