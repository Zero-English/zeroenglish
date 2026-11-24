import { KokoroTTS } from "kokoro-js";

// Dedicated worker global scope context
const workerCtx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

let ttsInstance: KokoroTTS | null = null;
let initPromise: Promise<KokoroTTS> | null = null;

// Track multi-file downloads (model weights, tokenizer, configs)
const fileProgressMap = new Map<string, { loaded: number; total: number }>();

function handleProgress(data: {
  status?: string;
  name?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}) {
  if (!data) return;

  const fileName = data.file || data.name || "model_q8.onnx";

  if (typeof data.loaded === "number" && typeof data.total === "number" && data.total > 0) {
    fileProgressMap.set(fileName, { loaded: data.loaded, total: data.total });
  }

  let totalLoaded = 0;
  let totalSize = 0;
  for (const item of fileProgressMap.values()) {
    totalLoaded += item.loaded;
    totalSize += item.total;
  }

  let percent = 0;
  if (totalSize > 0) {
    percent = Math.min(100, Math.round((totalLoaded / totalSize) * 100));
  } else if (typeof data.progress === "number") {
    percent = Math.min(100, Math.round(data.progress));
  }

  const loadedMB = totalLoaded > 0 ? (totalLoaded / (1024 * 1024)).toFixed(1) : undefined;
  const totalMB = totalSize > 0 ? (totalSize / (1024 * 1024)).toFixed(1) : undefined;

  workerCtx.postMessage({
    type: "INIT_PROGRESS",
    percent,
    loadedMB,
    totalMB,
    file: fileName,
  });
}

async function getTTS(): Promise<KokoroTTS> {
  if (ttsInstance) return ttsInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    workerCtx.postMessage({ type: "INIT_START" });

    // 1. Auto-detect WebGPU with WASM fallback
    let hasWebGPU = false;
    try {
      if (typeof navigator !== "undefined" && "gpu" in navigator) {
        const gpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
        if (gpu) {
          const adapter = await gpu.requestAdapter();
          if (adapter) hasWebGPU = true;
        }
      }
    } catch {
      hasWebGPU = false;
    }

    if (hasWebGPU) {
      try {
        const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
          dtype: "fp32",
          device: "webgpu",
          progress_callback: handleProgress,
        });
        ttsInstance = tts;
        workerCtx.postMessage({ type: "INIT_READY", device: "webgpu" });
        return tts;
      } catch (e) {
        console.warn("WebGPU initialization failed for Kokoro, falling back to WASM q8:", e);
      }
    }

    // 2. Quantized q8 ONNX with WASM runtime
    const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
      dtype: "q8",
      device: "wasm",
      progress_callback: handleProgress,
    });

    ttsInstance = tts;
    workerCtx.postMessage({ type: "INIT_READY", device: "wasm" });
    return tts;
  })();

  return initPromise;
}

workerCtx.addEventListener("message", async (e: MessageEvent) => {
  const { id, type, text, speed, voice } = e.data || {};

  if (type === "PRELOAD") {
    try {
      await getTTS();
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      workerCtx.postMessage({ type: "INIT_ERROR", error });
    }
    return;
  }

  if (type === "GENERATE") {
    try {
      workerCtx.postMessage({ id, type: "GENERATING" });
      const tts = await getTTS();
      const selectedVoice = voice || "af_heart";
      const selectedSpeed = typeof speed === "number" ? speed : 1.0;

      const audio = await tts.generate(text, {
        voice: selectedVoice,
        speed: selectedSpeed,
      });

      const blob = audio.toBlob();
      workerCtx.postMessage({ id, type: "SUCCESS", blob });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      workerCtx.postMessage({ id, type: "ERROR", error });
    }
  }
});

export {};
