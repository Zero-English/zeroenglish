"use client";

import { useCallback, useEffect, useState } from "react";

export interface QuizTypeItem {
  id: number;
  name: string;
  questionCount: number;
  resultCount: number;
}

export interface QuizMetaData {
  quizTypes: QuizTypeItem[];
  classes: string[];
  classCounts: Record<string, number>;
}

export interface UseQuizMetaResult {
  data: QuizMetaData | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
}

export function useQuizMeta(): UseQuizMetaResult {
  const [data, setData] = useState<QuizMetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/quiz-meta")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => {
    setError(false);
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { data, loading, error, reload };
}