import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

interface LapPoint {
  lap: number;
  lapTime: number; // seconds
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, mood, confidence, laps } = (await req.json()) as {
      transcript: string;
      mood: string;
      confidence: number;
      laps: LapPoint[];
    };

    const lapSummary = laps
      .map((l) => `Lap ${l.lap}: ${l.lapTime.toFixed(2)}s`)
      .join(", ");

    const avgLap = laps.reduce((s, l) => s + l.lapTime, 0) / (laps.length || 1);
    const slowestLap = laps.reduce((a, b) => (b.lapTime > a.lapTime ? b : a), laps[0]);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are 'the silent co-driver' — a race engineer's assistant that turns radio tone analysis into one crisp, actionable insight. Be specific, cite lap numbers, keep it to 2-3 sentences, no fluff, no markdown.",
        },
        {
          role: "user",
          content: `Radio transcript: "${transcript}"
Detected tone: ${mood} (confidence ${(confidence * 100).toFixed(0)}%)
Lap times: ${lapSummary}
Average lap: ${avgLap.toFixed(2)}s
Slowest lap: Lap ${slowestLap?.lap} at ${slowestLap?.lapTime.toFixed(2)}s

Explain what the tone change likely means for performance and what the team should watch for.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    const insight = completion.choices[0]?.message?.content ?? "No insight generated.";
    return NextResponse.json({ insight });
  } catch (err: any) {
    console.error("insight error:", err);
    return NextResponse.json({ error: err.message ?? "Insight generation failed" }, { status: 500 });
  }
}
