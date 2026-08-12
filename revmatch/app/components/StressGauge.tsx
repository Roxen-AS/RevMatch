"use client";

const MOOD_COLOR: Record<string, string> = {
  calm: "#22c55e",
  stressed: "#ef4444",
  tired: "#eab308",
};

export default function StressGauge({
  mood,
  confidence,
}: {
  mood: string;
  confidence: number;
}) {
  const color = MOOD_COLOR[mood] ?? "#ef4444";
  const pct = Math.max(0, Math.min(1, confidence));
  const angle = -90 + pct * 180;
  const needleRad = (angle * Math.PI) / 180;
  const cx = 100;
  const cy = 100;
  const r = 78;
  const nx = cx + r * 0.8 * Math.cos(needleRad);
  const ny = cy + r * 0.8 * Math.sin(needleRad);

  const arcStops = 24;
  const ticks = Array.from({ length: arcStops + 1 }, (_, i) => {
    const t = i / arcStops;
    const a = (-180 + t * 180) * (Math.PI / 180);
    const x1 = cx + (r - 6) * Math.cos(a);
    const y1 = cy + (r - 6) * Math.sin(a);
    const x2 = cx + r * Math.cos(a);
    const y2 = cy + r * Math.sin(a);
    return { x1, y1, x2, y2 };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-48 h-auto">
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={i / arcStops <= pct ? color : "#3f3f46"}
            strokeWidth={2}
          />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill={color} />
        <text x={cx} y={cy + 22} textAnchor="middle" fill="#a1a1aa" fontSize="10" letterSpacing="1">
          STRESS
        </text>
      </svg>
      <p className="text-sm font-bold uppercase tracking-wide" style={{ color }}>
        {mood} · {(pct * 100).toFixed(0)}%
      </p>
    </div>
  );
}
