export type LearningEvent = {
  id: number;
  userId: number;
  wordId: number;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    user_name: string;
    email: string;
    image: string | null;
  };
  word: {
    id: number;
    word: string;
    meaningBn: string[];
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  };
};

export type LearningEventListResponse = {
  data: LearningEvent[] | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
};