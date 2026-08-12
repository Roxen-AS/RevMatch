"use client";

import { useEffect, useState } from "react";
import LapChart from "./components/LapChart";
import LiveRecorder from "./components/LiveRecorder";
import StressGauge from "./components/StressGauge";

interface LapPoint {
  lap: number;
  lapTime: number;
}

type Stage = "idle" | "transcribing" | "analyzing-tone" | "generating-insight" | "done" | "error";

const MOOD_STYLE: Record<string, string> = {
  calm: "bg-green-500/10 text-green-400 border-green-500/30",
  stressed: "bg-red-500/10 text-red-400 border-red-500/30",
  tired: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<"upload" | "live">("upload");
  const [lapsText, setLapsText] = useState("1:23.4, 1:24.1, 1:26.8, 1:25.0, 1:24.6");
  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");
  const [mood, setMood] = useState<{ mood: string; confidence: number } | null>(null);
  const [insight, setInsight] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!audioFile) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  function parseLaps(text: string): LapPoint[] {
    return text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s, i) => {
        let seconds: number;
        if (s.includes(":")) {
          const [m, sec] = s.split(":");
          seconds = parseFloat(m) * 60 + parseFloat(sec);
        } else {
          seconds = parseFloat(s);
        }
        return { lap: i + 1, lapTime: seconds };
      })
      .filter((l) => !isNaN(l.lapTime));
  }

  async function runPipeline(fileOverride?: File) {
    const file = fileOverride ?? audioFile;
    if (!file) {
      setError("Upload or record a radio clip first.");
      return;
    }
    setError("");
    setTranscript("");
    setMood(null);
    setInsight("");

    try {
      const laps = parseLaps(lapsText);

      setStage("transcribing");
      const transcribeForm = new FormData();
      transcribeForm.append("audio", file);
      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: transcribeForm,
      });
      const transcribeData = await transcribeRes.json();
      if (!transcribeRes.ok) throw new Error(transcribeData.error);
      setTranscript(transcribeData.text);

      setStage("analyzing-tone");
      const toneForm = new FormData();
      toneForm.append("audio", file);
      const toneRes = await fetch("/api/tone", { method: "POST", body: toneForm });
      const toneData = await toneRes.json();
      if (!toneRes.ok) throw new Error(toneData.error);
      setMood({ mood: toneData.mood, confidence: toneData.confidence });

      setStage("generating-insight");
      const insightRes = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcribeData.text,
          mood: toneData.mood,
          confidence: toneData.confidence,
          laps,
        }),
      });
      const insightData = await insightRes.json();
      if (!insightRes.ok) throw new Error(insightData.error);
      setInsight(insightData.insight);

      setStage("done");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setStage("error");
    }
  }

  const laps = parseLaps(lapsText);
  const busy = stage !== "idle" && stage !== "done" && stage !== "error";

  return (
    <main className="relative z-10 min-h-screen px-4 py-10 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-1">
          <p className="text-lg font-bold tracking-tight text-white">
            Rev<span className="text-red-500">Match</span>
          </p>
          <p className="text-sm uppercase tracking-widest text-red-500 font-semibold">
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold">The Silent Co-Driver</h1>
          <p className="text-zinc-400">
            Play or upload a radio clip, add lap times, and see driver stress mapped against performance.
          </p>
        </header>

        <div className="checker rounded-full" />

        <section className="space-y-4 bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm">
          <div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAudioSource("upload")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  audioSource === "upload"
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setAudioSource("live")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  audioSource === "live"
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Record live
              </button>
            </div>

            {audioSource === "upload" ? (
              <>
                <label className="block text-sm font-medium mb-2">Radio clip (WAV/MP3)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-medium hover:file:bg-red-500 file:cursor-pointer cursor-pointer"
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium mb-2">
                  Speak into the mic, then stop to run the pipeline on what was just captured
                </label>
                <LiveRecorder
                  disabled={stage === "transcribing" || stage === "analyzing-tone" || stage === "generating-insight"}
                  onRecorded={(file) => {
                    setAudioFile(file);
                    runPipeline(file);
                  }}
                />
              </>
            )}

            {audioUrl && (
              <audio controls src={audioUrl} className="w-full mt-3 h-10" />
            )}

            {audioFile && (
              <p className="text-xs text-zinc-500 mt-2">
                {audioFile.name} ({(audioFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Lap times (comma-separated, m:ss.s or seconds)
            </label>
            <input
              type="text"
              value={lapsText}
              onChange={(e) => setLapsText(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={() => runPipeline()}
            disabled={busy}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {busy
              ? stage === "transcribing"
                ? "Transcribing..."
                : stage === "analyzing-tone"
                ? "Reading tone..."
                : "Generating insight..."
              : "Run analysis"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </section>

        {(transcript || mood) && (
          <section className="space-y-5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm">
            {transcript && (
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Transcript</p>
                <p className="text-zinc-200 text-lg leading-snug">&ldquo;{transcript}&rdquo;</p>
              </div>
            )}

            {mood && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <StressGauge mood={mood.mood} confidence={mood.confidence} />
                <span
                  className={`inline-block self-start px-3 py-1 rounded-full text-sm font-medium border ${
                    MOOD_STYLE[mood.mood] ?? ""
                  }`}
                >
                  {mood.mood} · {(mood.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
            )}

            {laps.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
                  Lap performance
                </p>
                <LapChart laps={laps} mood={mood?.mood ?? "calm"} />
              </div>
            )}

            {insight && (
              <div className="border-l-2 border-red-500 pl-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  Co-driver insight
                </p>
                <p className="text-zinc-100">{insight}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
