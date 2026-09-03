export type ApiUser = {
  id: number;
  name: string | null;
  user_name: string;
  email: string;
  emailVerified: string | null;
  image: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
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
