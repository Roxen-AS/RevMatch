"use client";

import { useRef, useState } from "react";

export default function LiveRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `live-recording-${Date.now()}.webm`, {
          type: mimeType,
        });
        onRecorded(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err: any) {
      setError(
        err.name === "NotAllowedError"
          ? "Mic permission denied. Allow microphone access and try again."
          : err.message ?? "Could not access microphone."
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-sm font-medium transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Start live recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            Stop &amp; analyze ({seconds}s)
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
