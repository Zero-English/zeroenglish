"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Language = "bn" | "en";

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

export const ARABIC_TO_BANGLA_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BANGLA_DIGITS[Number(d)]);
}

interface LanguageContextValue {
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (bangla: string, english: string) => string;
  num: (value: string | number) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "zeroenglish-language";

let currentLang: Language = "bn";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function getSnapshot(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "bn") {
      currentLang = stored;
    }
  } catch {
    // Ignore storage access errors.
  }
  return currentLang;
}

function getServerSnapshot(): Language {
  return "bn";
}

function setLanguage(next: Language) {
  currentLang = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage access errors.
  }
  emit();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleLanguage = useCallback(() => {
    setLanguage(lang === "bn" ? "en" : "bn");
  }, [lang]);

  const t = useCallback(
    (bangla: string, english: string) => (lang === "en" ? english : bangla),
    [lang]
  );

  const num = useCallback(
    (value: string | number) => (lang === "en" ? String(value) : toBanglaDigits(value)),
    [lang]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.lang = lang;
    root.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t, num }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}

export function useNum() {
  return useLanguage().num;
}