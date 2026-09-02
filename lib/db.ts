"use client";

export interface WordEntry {
  id: string;
  type: "bookmarked" | "learned" | "still-learning";
  timestamp?: number;
}

export interface ActivityEntry {
  date: string;
  quizzesDone: number;
  correctAnswers: number;
}

const LS_PREFIX = "voc_";
const ACTIVITY_KEY = "voc_activity";

function readWordsByType(type: string): WordEntry[] {
  const entries: WordEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LS_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const entry = JSON.parse(raw) as WordEntry;
          if (entry.type === type) entries.push(entry);
        }
      } catch {
        // skip corrupt entry
      }
    }
  }
  return entries;
}

function readAllActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAllActivity(entries: ActivityEntry[]): void {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries));
}

export async function putWord(entry: WordEntry): Promise<void> {
  const enriched = { ...entry, timestamp: entry.timestamp ?? Date.now() };
  localStorage.setItem(LS_PREFIX + entry.id, JSON.stringify(enriched));
}

export async function deleteWord(id: string): Promise<void> {
  localStorage.removeItem(LS_PREFIX + id);
}

export async function bulkPutWords(entries: WordEntry[]): Promise<void> {
  const enriched = entries.map((e) => ({ ...e, timestamp: e.timestamp ?? Date.now() }));
  for (const entry of enriched) {
    localStorage.setItem(LS_PREFIX + entry.id, JSON.stringify(entry));
  }
}

export async function getWordsByType(type: string): Promise<WordEntry[]> {
  return readWordsByType(type);
}

export async function getActivity(date: string): Promise<ActivityEntry | undefined> {
  return readAllActivity().find((e) => e.date === date);
}

export async function getAllActivity(): Promise<ActivityEntry[]> {
  return readAllActivity();
}

export async function incrementQuizzesDone(date: string): Promise<void> {
  const entries = readAllActivity();
  const existing = entries.find((e) => e.date === date);
  const updated = {
    date,
    quizzesDone: (existing?.quizzesDone ?? 0) + 1,
    correctAnswers: existing?.correctAnswers ?? 0,
  };
  writeAllActivity(existing ? entries.map((e) => (e.date === date ? updated : e)) : [...entries, updated]);
}

export async function addCorrectAnswers(date: string, correctCount: number): Promise<void> {
  const entries = readAllActivity();
  const existing = entries.find((e) => e.date === date);
  const updated = {
    date,
    quizzesDone: existing?.quizzesDone ?? 0,
    correctAnswers: (existing?.correctAnswers ?? 0) + correctCount,
  };
  writeAllActivity(existing ? entries.map((e) => (e.date === date ? updated : e)) : [...entries, updated]);
}