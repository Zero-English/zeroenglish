import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// In-memory cache for ultra-fast <1ms responses for frequently repeated words
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 1000;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function resolveVoice(voiceParam?: string | null, text?: string): string {
  if (voiceParam) {
    const lower = voiceParam.toLowerCase();
    if (lower === "bn" || lower === "bangla" || lower === "bengali") {
      return "bn-BD-NabanitaNeural";
    }
    if (lower === "male" || lower === "guy") {
      return "en-US-GuyNeural";
    }
    if (lower === "aria") {
      return "en-US-AriaNeural";
    }
    if (lower === "female" || lower === "jenny" || lower === "default") {
      return "en-US-JennyNeural";
    }
    // If full voice name passed e.g. "bn-BD-PradeepNeural"
    return voiceParam;
  }

  // Auto-detect Bengali text by Unicode range (U+0980 - U+09FF)
  if (text && /[\u0980-\u09FF]/.test(text)) {
    return "bn-BD-NabanitaNeural";
  }

  return "en-US-JennyNeural";
}

function resolveRate(rateParam?: string | null): string {
  if (!rateParam) return "+0%";

  // If passed as number e.g. "0.9" or "0.7"
  const num = parseFloat(rateParam);
  if (!isNaN(num)) {
    if (rateParam.endsWith("%")) return rateParam;
    const pct = Math.round((num - 1) * 100);
    return `${pct >= 0 ? "+" : ""}${pct}%`;
  }

  if (rateParam.startsWith("+") || rateParam.startsWith("-")) {
    return rateParam.endsWith("%") ? rateParam : `${rateParam}%`;
  }

  return "+0%";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawText = searchParams.get("text")?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "Query parameter 'text' is required." },
        { status: 400 }
      );
    }

    // Limit length to reasonable size
    const text = rawText.slice(0, 1000);
    const voice = resolveVoice(searchParams.get("voice"), text);
    const rate = resolveRate(searchParams.get("rate") || searchParams.get("speed"));

    const cacheKey = `${voice}:${rate}:${text.toLowerCase()}`;

    // 1. Serve from in-memory cache if available (0ms response)
    const cachedBuffer = audioCache.get(cacheKey);
    if (cachedBuffer) {
      return new Response(new Uint8Array(cachedBuffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(cachedBuffer.byteLength),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Accept-Ranges": "bytes",
          "X-TTS-Source": "cache",
        },
      });
    }

    // 2. Synthesize using msedge-tts
    const tts = new MsEdgeTTS({ enableLogger: false });
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const safeXmlText = escapeXml(text);
    const { audioStream } = tts.toStream(safeXmlText, { rate });

    // Collect chunks from readable stream
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk as Buffer);
    }

    const audioBuffer = Buffer.concat(chunks);

    if (audioBuffer.length === 0) {
      throw new Error("No audio bytes received from Edge TTS service.");
    }

    // Cache in memory (evict oldest if full)
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audioBuffer);

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
        "X-TTS-Source": "msedge-tts",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("MsEdgeTTS synthesis error:", message);
    return NextResponse.json(
      { error: "TTS audio synthesis failed", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawText = (body.text || "").trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "Body field 'text' is required." },
        { status: 400 }
      );
    }

    const text = rawText.slice(0, 1000);
    const voice = resolveVoice(body.voice, text);
    const rate = resolveRate(body.rate || body.speed);

    const cacheKey = `${voice}:${rate}:${text.toLowerCase()}`;
    const cachedBuffer = audioCache.get(cacheKey);

    if (cachedBuffer) {
      return new Response(new Uint8Array(cachedBuffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(cachedBuffer.byteLength),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Accept-Ranges": "bytes",
        },
      });
    }

    const tts = new MsEdgeTTS({ enableLogger: false });
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const safeXmlText = escapeXml(text);
    const { audioStream } = tts.toStream(safeXmlText, { rate });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk as Buffer);
    }

    const audioBuffer = Buffer.concat(chunks);

    if (audioBuffer.length === 0) {
      throw new Error("No audio bytes received from Edge TTS service.");
    }

    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audioBuffer);

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("MsEdgeTTS POST error:", message);
    return NextResponse.json(
      { error: "TTS audio synthesis failed", details: message },
      { status: 500 }
    );
  }
}
