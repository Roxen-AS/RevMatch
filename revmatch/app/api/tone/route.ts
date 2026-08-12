import { NextRequest, NextResponse } from "next/server";
import { hfAudioInference } from "@/lib/hf";

export const runtime = "nodejs";
export const maxDuration = 60;

const LABEL_MAP: Record<string, "calm" | "stressed" | "tired"> = {
  neutral: "calm",
  calm: "calm",
  happy: "calm",
  angry: "stressed",
  fearful: "stressed",
  disgust: "stressed",
  surprised: "stressed",
  sad: "tired",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const result = await hfAudioInference(
      "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition",
      buffer,
      file.type || "audio/wav"
    );

    const top = Array.isArray(result) ? result[0] : result?.[0]?.[0];
    const rawLabel = (top?.label ?? "neutral").toLowerCase();
    const mood = LABEL_MAP[rawLabel] ?? "calm";

    return NextResponse.json({
      mood,
      rawLabel,
      confidence: top?.score ?? 0,
      allScores: Array.isArray(result) ? result : result?.[0] ?? [],
    });
  } catch (err: any) {
    console.error("tone error:", err);
    return NextResponse.json({ error: err.message ?? "Tone analysis failed" }, { status: 500 });
  }
}
