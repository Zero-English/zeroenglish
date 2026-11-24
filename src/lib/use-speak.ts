"use client";

import { useCallback, useSyncExternalStore } from "react";
import { edgeTTS, type SpeakOptions, type TTSState, type TTSProgress } from "./edge-tts";

export { edgeTTS, edgeTTS as kokoroTTS };
export type { SpeakOptions, TTSState, TTSStatus, TTSProgress } from "./edge-tts";

/**
 * Hook providing reactive state and control for Neural Edge TTS
 */
export function useTTS() {
  const state = useSyncExternalStore(
    edgeTTS.subscribe.bind(edgeTTS),
    edgeTTS.getState.bind(edgeTTS),
    // Safe Server Snapshot for Next.js SSR
    (): TTSState => ({
      status: "idle",
      activeText: null,
      device: "server",
      isReady: true,
      isDownloading: false,
      progress: null,
      error: null,
    })
  );

  const speak = useCallback(
    (text: string, rateOrOptions?: number | SpeakOptions) => {
      return edgeTTS.speak(text, rateOrOptions);
    },
    []
  );

  const prefetch = useCallback(
    (text: string, rateOrOptions?: number | SpeakOptions) => {
      return edgeTTS.prefetch(text, rateOrOptions);
    },
    []
  );

  const preload = useCallback(() => {
    edgeTTS.preload();
  }, []);

  const stop = useCallback(() => {
    edgeTTS.stop();
  }, []);

  return {
    ...state,
    isLoading: state.status === "loading" || state.status === "generating",
    isGenerating: state.status === "generating",
    isPlaying: state.status === "playing",
    isDownloading: state.isDownloading,
    progress: state.progress,
    speak,
    prefetch,
    preload,
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
