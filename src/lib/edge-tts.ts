"use client";

export type TTSStatus = "idle" | "loading" | "generating" | "playing" | "error";

export interface SpeakOptions {
  speed?: number;
  rate?: number;
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export interface TTSProgress {
  percent: number;
  loadedMB?: string;
  totalMB?: string;
  file?: string;
}

export interface TTSState {
  status: TTSStatus;
  activeText: string | null;
  device: "server" | "local" | null;
  isReady: boolean;
  isDownloading: boolean;
  progress: TTSProgress | null;
  error: string | null;
}

type Subscriber = (state: TTSState) => void;

class EdgeTTSController {
  private currentAudio: HTMLAudioElement | null = null;
  private currentRequestId: string | null = null;
  private subscribers = new Set<Subscriber>();

  private state: TTSState = {
    status: "idle",
    activeText: null,
    device: "server",
    isReady: true,
    isDownloading: false,
    progress: null,
    error: null,
  };

  private setState(updates: Partial<TTSState>) {
    this.state = { ...this.state, ...updates };
    this.subscribers.forEach((cb) => {
      try {
        cb(this.state);
      } catch (err) {
        console.error("Error in TTS subscriber callback:", err);
      }
    });
  }

  public subscribe(cb: Subscriber): () => void {
    this.subscribers.add(cb);
    cb(this.state);
    return () => this.subscribers.delete(cb);
  }

  public getState(): TTSState {
    return this.state;
  }

  public getAudioUrl(text: string, rate?: number | string, voice?: string): string {
    const cleanText = text.trim();
    const params = new URLSearchParams({ text: cleanText });
    if (rate !== undefined) params.set("rate", String(rate));
    if (voice) params.set("voice", voice);
    return `/api/tts?${params.toString()}`;
  }

  /**
   * Pre-fetches an audio file into browser HTTP cache in background idle time
   */
  public prefetch(text: string, rateOrOptions?: number | SpeakOptions) {
    if (typeof window === "undefined" || !text) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    let rate = 1.0;
    let voice: string | undefined;

    if (typeof rateOrOptions === "number") {
      rate = rateOrOptions;
    } else if (rateOrOptions && typeof rateOrOptions === "object") {
      if (typeof rateOrOptions.speed === "number") rate = rateOrOptions.speed;
      else if (typeof rateOrOptions.rate === "number") rate = rateOrOptions.rate;
      if (rateOrOptions.voice) voice = rateOrOptions.voice;
    }

    const url = this.getAudioUrl(cleanText, rate, voice);
    try {
      const preloadAudio = new Audio();
      preloadAudio.preload = "auto";
      preloadAudio.src = url;
    } catch {
      // Ignore background prefetch errors
    }
  }

  public preload() {
    // Edge TTS server endpoint is always ready without cold start
  }

  /**
   * Stops any currently playing audio
   */
  public stop() {
    this.currentRequestId = null;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = "";
      } catch {
        // Ignore
      }
      this.currentAudio = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.setState({ status: "idle", activeText: null });
  }

  /**
   * Graceful native fallback using browser window.speechSynthesis
   */
  private fallbackSpeak(text: string, rate = 0.9) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.setState({ status: "idle", activeText: null });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (/[\u0980-\u09FF]/.test(text)) {
        utterance.lang = "bn-BD";
      } else {
        utterance.lang = "en-US";
      }
      utterance.rate = typeof rate === "number" ? rate : 0.9;

      utterance.onstart = () => {
        this.setState({ status: "playing", activeText: text });
      };
      utterance.onend = () => {
        this.setState({ status: "idle", activeText: null });
      };
      utterance.onerror = () => {
        this.setState({ status: "idle", activeText: null });
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Fallback speechSynthesis failed:", err);
      this.setState({ status: "idle", activeText: null });
    }
  }

  /**
   * Primary speak method: Streams high-quality Azure Neural voice from /api/tts
   */
  public speak(
    text: string,
    rateOrOptions?: number | SpeakOptions
  ): void {
    if (!text || typeof text !== "string") return;
    const cleanText = text.trim();
    if (!cleanText) return;

    let rate = 1.0;
    let voice: string | undefined;

    if (typeof rateOrOptions === "number") {
      rate = rateOrOptions;
    } else if (rateOrOptions && typeof rateOrOptions === "object") {
      if (typeof rateOrOptions.speed === "number") rate = rateOrOptions.speed;
      else if (typeof rateOrOptions.rate === "number") rate = rateOrOptions.rate;
      if (rateOrOptions.voice) voice = rateOrOptions.voice;
    }

    this.stop();

    const requestId = Math.random().toString(36).substring(2, 9);
    this.currentRequestId = requestId;

    this.setState({
      status: "loading",
      activeText: cleanText,
      error: null,
    });

    const url = this.getAudioUrl(cleanText, rate, voice);
    const audio = new Audio(url);
    this.currentAudio = audio;

    const cleanup = () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null;
        this.setState({ status: "idle", activeText: null });
      }
    };

    audio.onplay = () => {
      if (this.currentRequestId === requestId) {
        this.setState({ status: "playing" });
      }
    };

    audio.onended = cleanup;

    audio.onerror = (e) => {
      console.warn("Audio element error from /api/tts, falling back to Web Speech:", e);
      cleanup();
      this.fallbackSpeak(cleanText, typeof rate === "number" ? rate : 0.9);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Playback was prevented or failed:", err);
        cleanup();
        this.fallbackSpeak(cleanText, typeof rate === "number" ? rate : 0.9);
      });
    }
  }
}

// Global singleton instance on client
export const edgeTTS = new EdgeTTSController();
