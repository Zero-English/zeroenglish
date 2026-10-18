export type WrittenTypeItem = {
  id: number;
  name: string;
};

export type WrittenAuthor = {
  id: number;
  name: string | null;
  user_name: string;
  email: string;
  image: string | null;
  role: string;
};

export type WrittenItem = {
  id: number;
  titleEn: string;
  titleBn: string;
  contentEnEasy: string;
  contentEnMedium: string;
  contentEnHard: string;
  contentBnEasy: string;
  contentBnMedium: string;
  contentBnHard: string;
  writtenTypeId: number;
  writtenType: WrittenTypeItem;
  writtenByUserId: number;
  writtenBy: WrittenAuthor;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  keywords: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WrittenStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
};

export type WrittenListResponse = {
  success: boolean;
  message?: string;
  data: WrittenItem[] | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats?: WrittenStats;
};

export type WrittenDetailResponse = {
  success: boolean;
  message?: string;
  data: WrittenItem | null;
};

