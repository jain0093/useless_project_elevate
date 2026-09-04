"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface CountdownProps {
  /** Whether the countdown is actively running */
  active: boolean;
  /** Duration in seconds (default 20) */
  duration?: number;
  /** Called when countdown reaches zero */
  onComplete: () => void;
}

export default function Countdown({
  active,
  duration = 20,
  onComplete,
}: CountdownProps) {
  const [count, setCount] = useState(duration);
  const [animating, setAnimating] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref stable
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const resetCountdown = useCallback(() => {
    setCount(duration);
  }, [duration]);

  useEffect(() => {
    if (!active) {
      resetCountdown();
      return;
    }

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          // Fire completion
          onCompleteRef.current();
          return duration;
        }
        return prev - 1;
      });
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }, 1000);

    return () => clearInterval(interval);
  }, [active, duration, resetCountdown]);

  // Color shifts as countdown approaches zero
  const getCountColor = () => {
    if (count <= 3) return "text-npc-red";
    if (count <= 7) return "text-npc-amber";
    return "text-npc-cyan";
  };

  const getGlowColor = () => {
    if (count <= 3) return "drop-shadow-[0_0_20px_rgba(255,23,68,0.5)]";
    if (count <= 7) return "drop-shadow-[0_0_20px_rgba(255,171,0,0.4)]";
    return "drop-shadow-[0_0_20px_rgba(0,229,255,0.3)]";
  };

  return (
    <div className="hud-panel p-4 flex flex-col items-center gap-2">
      <span className="text-[10px] tracking-[0.2em] uppercase text-npc-text-dim">
        Next NPC Scan In
      </span>

      <div
        className={`text-5xl sm:text-6xl font-bold tabular-nums ${getCountColor()} ${getGlowColor()} transition-colors duration-300 ${
          animating ? "animate-countdown-pulse" : ""
        }`}
      >
        {active ? String(count).padStart(2, "0") : "--"}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[200px] stat-bar mt-1">
        <div
          className={`stat-bar-fill ${
            count <= 3
              ? "bg-npc-red"
              : count <= 7
              ? "bg-npc-amber"
              : "bg-npc-cyan"
          }`}
          style={{ width: active ? `${(count / duration) * 100}%` : "0%" }}
        />
      </div>

      {!active && (
        <span className="text-[10px] tracking-[0.15em] text-npc-text-dim mt-1">
          SCANNER STANDBY
        </span>
      )}
    </div>
  );
}
