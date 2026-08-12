"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

interface LapPoint {
  lap: number;
  lapTime: number;
}

const MOOD_COLOR: Record<string, string> = {
  calm: "#22c55e",
  stressed: "#ef4444",
  tired: "#eab308",
};

export default function LapChart({
  laps,
  mood,
}: {
  laps: LapPoint[];
  mood: string;
}) {
  if (!laps.length) return null;

  const slowest = laps.reduce((a, b) => (b.lapTime > a.lapTime ? b : a), laps[0]);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={laps} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="lap" stroke="#a1a1aa" fontSize={12} />
          <YAxis stroke="#a1a1aa" fontSize={12} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
            labelStyle={{ color: "#fafafa" }}
          />
          <Line
            type="monotone"
            dataKey="lapTime"
            stroke={MOOD_COLOR[mood] ?? "#3b82f6"}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <ReferenceDot
            x={slowest.lap}
            y={slowest.lapTime}
            r={6}
            fill={MOOD_COLOR[mood] ?? "#3b82f6"}
            stroke="none"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
