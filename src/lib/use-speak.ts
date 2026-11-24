"use client";

import { useCallback, useSyncExternalStore } from "react";
import { kokoroTTS, type SpeakOptions, type TTSState, type TTSProgress } from "./kokoro-tts";

export { kokoroTTS };
export type { SpeakOptions, TTSState, TTSStatus, TTSProgress } from "./kokoro-tts";

/**
 * Hook providing reactive state and control for Kokoro neural TTS
 */
export function useTTS() {
  const state = useSyncExternalStore(
    kokoroTTS.subscribe.bind(kokoroTTS),
    kokoroTTS.getState.bind(kokoroTTS),
    // Safe Server Snapshot for Next.js SSR
    (): TTSState => ({
      status: "idle",
      activeText: null,
      device: null,
      isReady: false,
      isDownloading: false,
      progress: null,
      error: null,
    })
  );

  const speak = useCallback(
    (text: string, rateOrOptions?: number | SpeakOptions) => {
      kokoroTTS.speak(text, rateOrOptions);
    },
    []
  );

  const stop = useCallback(() => {
    kokoroTTS.stop();
  }, []);

  return {
    ...state,
    isLoading: state.status === "loading" || state.status === "generating",
    isGenerating: state.status === "generating",
    isPlaying: state.status === "playing",
    isDownloading: state.isDownloading,
    progress: state.progress,
    speak,
    stop,
  };
}

/**
 * Drop-in replacement for existing callers of useSpeak()
 */
export function useSpeak() {
  const { speak } = useTTS();
  return speak;
}
