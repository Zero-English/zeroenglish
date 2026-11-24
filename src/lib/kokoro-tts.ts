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
  device: "webgpu" | "wasm" | null;
  isReady: boolean;
  isDownloading: boolean;
  progress: TTSProgress | null;
  error: string | null;
}

type Subscriber = (state: TTSState) => void;

class KokoroTTSController {
  private worker: Worker | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private currentRequestId: string | null = null;
  private subscribers = new Set<Subscriber>();

  private state: TTSState = {
    status: "idle",
    activeText: null,
    device: null,
    isReady: false,
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

  /**
   * Lazily initializes the client-side Web Worker singleton.
   */
  private getWorker(): Worker {
    if (typeof window === "undefined") {
      throw new Error("KokoroTTS cannot be initialized in SSR context.");
    }

    if (!this.worker) {
      try {
        this.worker = new Worker(
          new URL("./kokoro.worker.ts", import.meta.url),
          { type: "module" }
        );

        this.worker.addEventListener("message", (e: MessageEvent) => {
          this.handleWorkerMessage(e.data);
        });

        this.worker.addEventListener("error", (e: ErrorEvent) => {
          console.error("Kokoro TTS Worker error:", e);
          this.setState({
            status: "error",
            isDownloading: false,
            error: e.message || "TTS Worker encountered an error",
          });
        });
      } catch (err) {
        console.error("Failed to create Kokoro Web Worker:", err);
        throw err;
      }
    }

    return this.worker;
  }

  private handleWorkerMessage(data: {
    type: string;
    id?: string;
    status?: string;
    device?: "webgpu" | "wasm";
    percent?: number;
    loadedMB?: string;
    totalMB?: string;
    file?: string;
    blob?: Blob;
    error?: string;
  }) {
    switch (data.type) {
      case "INIT_START":
        this.setState({
          status: "loading",
          isDownloading: true,
          error: null,
          progress: { percent: 0 },
        });
        break;

      case "INIT_PROGRESS":
        this.setState({
          status: "loading",
          isDownloading: true,
          progress: {
            percent: data.percent ?? 0,
            loadedMB: data.loadedMB,
            totalMB: data.totalMB,
            file: data.file,
          },
        });
        break;

      case "INIT_READY":
        this.setState({
          isReady: true,
          isDownloading: false,
          device: data.device || "wasm",
          status: this.state.status === "loading" ? "idle" : this.state.status,
          progress: { percent: 100 },
        });
        // Clear progress after short transition
        setTimeout(() => {
          if (this.state.isReady) {
            this.setState({ progress: null });
          }
        }, 1800);
        break;

      case "INIT_ERROR":
        this.setState({
          status: "error",
          isDownloading: false,
          progress: null,
          error: data.error || "Failed to initialize Kokoro model",
        });
        break;

      case "GENERATING":
        if (data.id === this.currentRequestId) {
          this.setState({ status: "generating", isDownloading: false, error: null });
        }
        break;

      case "SUCCESS":
        if (data.id === this.currentRequestId && data.blob) {
          this.playAudioBlob(data.blob, data.id);
        }
        break;

      case "ERROR":
        if (data.id === this.currentRequestId) {
          console.warn("Kokoro speech generation failed:", data.error);
          this.setState({
            status: "error",
            isDownloading: false,
            error: data.error || "Audio generation failed",
          });
          // Graceful fallback to browser speech synthesis
          if (this.state.activeText) {
            this.fallbackSpeak(this.state.activeText);
          }
        }
        break;
    }
  }

  /**
   * Prewarms the model lazily if desired
   */
  public preload() {
    if (typeof window === "undefined") return;
    try {
      const worker = this.getWorker();
      worker.postMessage({ type: "PRELOAD" });
    } catch {
      // Ignore
    }
  }

  /**
   * Cleanly stops any currently playing audio and revokes object URL
   */
  public stop() {
    this.currentRequestId = null;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.currentAudio = null;
    }

    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch {
        // Ignore
      }
      this.currentAudioUrl = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    this.setState({ status: "idle", activeText: null });
  }

  /**
   * Plays the generated audio blob and automatically revokes the object URL on termination
   */
  private playAudioBlob(blob: Blob, requestId: string) {
    if (requestId !== this.currentRequestId) {
      return;
    }

    // Stop prior audio cleanly
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {
        // Ignore
      }
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch {
        // Ignore
      }
      this.currentAudioUrl = null;
    }

    try {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      this.currentAudioUrl = audioUrl;

      const cleanup = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.currentAudioUrl = null;
          this.setState({ status: "idle", activeText: null });
        }
        try {
          URL.revokeObjectURL(audioUrl);
        } catch {
          // Ignore
        }
      };

      audio.onplay = () => {
        if (this.currentRequestId === requestId) {
          this.setState({ status: "playing" });
        }
      };

      audio.onended = cleanup;
      audio.onerror = (e) => {
        console.warn("HTMLAudioElement playback error:", e);
        cleanup();
        if (this.state.activeText) {
          this.fallbackSpeak(this.state.activeText);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio playback was blocked or failed:", err);
          cleanup();
          if (this.state.activeText) {
            this.fallbackSpeak(this.state.activeText);
          }
        });
      }
    } catch (err) {
      console.error("Error creating audio from blob:", err);
      if (this.state.activeText) {
        this.fallbackSpeak(this.state.activeText);
      }
      this.setState({ status: "error", error: "Audio playback creation failed" });
    }
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
      utterance.lang = "en-US";
      utterance.rate = rate;

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
   * Primary entry point: Speaks text with neural voice Kokoro, falling back gracefully if needed.
   */
  public speak(
    text: string,
    rateOrOptions?: number | SpeakOptions
  ): void {
    if (!text || typeof text !== "string") return;
    const cleanText = text.trim();
    if (!cleanText) return;

    let speed = 1.0;
    let voice = "af_heart";

    if (typeof rateOrOptions === "number") {
      speed = rateOrOptions;
    } else if (rateOrOptions && typeof rateOrOptions === "object") {
      if (typeof rateOrOptions.speed === "number") speed = rateOrOptions.speed;
      else if (typeof rateOrOptions.rate === "number") speed = rateOrOptions.rate;
      if (rateOrOptions.voice) voice = rateOrOptions.voice;
    }

    // Stop current playback
    this.stop();

    const requestId = Math.random().toString(36).substring(2, 9);
    this.currentRequestId = requestId;
    this.setState({
      status: this.state.isReady ? "generating" : "loading",
      activeText: cleanText,
      error: null,
    });

    try {
      const worker = this.getWorker();
      worker.postMessage({
        type: "GENERATE",
        id: requestId,
        text: cleanText,
        speed,
        voice,
      });
    } catch (workerErr) {
      console.warn("Worker unavailable, falling back directly to speechSynthesis:", workerErr);
      this.fallbackSpeak(cleanText, speed);
    }
  }
}

// Global singleton instance on client
export const kokoroTTS = new KokoroTTSController();
