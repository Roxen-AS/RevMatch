"use client";

import { useEffect, useState } from "react";

export default function Background() {
  const [streaks, setStreaks] = useState<number[]>([]);

  useEffect(() => {
    setStreaks(Array.from({ length: 6 }, (_, i) => i));
  }, []);

  return (
    <>
      <div className="carbon" />
      <div className="bg-glow" />
      <div className="streaks">
        {streaks.map((i) => (
          <div
            key={i}
            className="streak"
            style={{
              // @ts-expect-error custom properties
              "--top": `${8 + i * 15}%`,
              "--dur": `${5 + (i % 3)}s`,
              "--delay": `${i * 0.7}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
