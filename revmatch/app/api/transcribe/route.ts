import { NextRequest, NextResponse } from "next/server";
import { hfAudioInference } from "@/lib/hf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const result = await hfAudioInference(
      "openai/whisper-small",
      buffer,
      file.type || "audio/wav"
    );

    return NextResponse.json({ text: result.text ?? "" });
  } catch (err: any) {
    console.error("transcribe error:", err);
    return NextResponse.json(
      { error: err.message ?? "Transcription failed" },
      { status: 500 }
    );
  }
}
