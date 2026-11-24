"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TourConfig } from "./types";

const STORAGE_PREFIX = "zeroenglish:guided-tour:";

export function useGuidedTour(config: TourConfig) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const storageKey = `${STORAGE_PREFIX}${config.id}:completed`;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check localStorage on mount: appear every time unless completion/dismissal is saved in localStorage
  useEffect(() => {
    try {
      const alreadyCompleted = localStorage.getItem(storageKey) === "true";

      // If not completed or dismissed yet, show the guide after DOM layout settles
      if (!alreadyCompleted) {
        timerRef.current = setTimeout(() => {
          setIsOpen(true);
          setCurrentStepIndex(0);
        }, 700);
      }
    } catch {
      // Ignore localStorage read failures
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [storageKey]);

  const markTourCompleted = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Ignore localStorage write failures
    }
  }, [storageKey]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    markTourCompleted();
  }, [markTourCompleted]);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev + 1 >= config.steps.length) {
        closeTour();
        return prev;
      }
      return prev + 1;
    });
  }, [config.steps.length, closeTour]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    closeTour();
  }, [closeTour]);

  return {
    isOpen,
    currentStepIndex,
    currentStep: config.steps[currentStepIndex] ?? null,
    totalSteps: config.steps.length,
    startTour,
    closeTour,
    nextStep,
    prevStep,
    skipTour,
  };
}
