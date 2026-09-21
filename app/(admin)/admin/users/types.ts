export type ApiUser = {
  id: number;
  name: string | null;
  user_name: string;
  email: string;
  emailVerified: string | null;
  image: string | null;
  role: "user" | "admin" | "contributor";
  userStatus: "Active" | "Inactive";
  lastActivityAt: string | null;
  created_at: string;
  updated_at: string;
  bookmarkedCount: number;
  learnedWordCount: number;
  stillLearningCount: number;
  avgQuizScore: number | null;
  institutionName: string | null;
  bio: string | null;
  class: string | null;
  gender: string | null;
  socialLinks: string[];
};

export type UserListResponse = {
  data: ApiUser[] | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
};

export type UserDetailResponse = {
  data: ApiUser | null;
  message: string;
  success: boolean;
};
