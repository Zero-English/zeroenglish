export type BlogMedia = {
  id: number;
  url: string;
  altText: string;
  name: string;
} | null;

export type BlogItem = {
  id: number;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  contentEn: string;
  contentBn: string;
  featuredMedia: BlogMedia;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BlogListResponse = {
  success: boolean;
  message?: string;
  data: BlogItem[] | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type BlogUpsertResponse = {
  success: boolean;
  message?: string;
  data?: BlogItem | null;
};

export type BlogPublishResponse = {
  success: boolean;
  message?: string;
  data?: { id: number; slug: string; published: boolean; updatedAt: string } | null;
};

export type BlogPayload = {
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  contentEn: string;
  contentBn: string;
  featuredMediaId: number | null;
  published: boolean;
};

export function thumbnailUrl(url: string): string {
  return `${url}?tr=w-320,h-320`;
}