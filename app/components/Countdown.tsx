"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface CountdownProps {
  /** Whether the countdown is actively running */
  active: boolean;
  /** Duration in seconds (exact 10 seconds per requirements) */
  duration?: number;
  /** Called when countdown reaches zero */
  onComplete: () => void;
}

export default function Countdown({
  active,
  duration = 10,
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

    // Reset to full duration when becoming active
    setCount(duration);

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
      setAnimating(true);
      setTimeout(() => setAnimating(false), 250);
    }, 1000);

    return () => clearInterval(interval);
  }, [active, duration, resetCountdown]);

  // Color shifts as countdown approaches zero
  const getCountColor = () => {
    if (count <= 3) return "text-npc-red drop-shadow-[0_0_30px_rgba(255,0,85,0.8)]";
    if (count <= 5) return "text-npc-amber drop-shadow-[0_0_25px_rgba(255,183,0,0.6)]";
    return "text-npc-cyan drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]";
  };

  return (
    <div className="hud-panel p-4 sm:p-5 flex flex-col items-center justify-center gap-2 rounded-xs border border-npc-border bg-npc-surface/90">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
        <span className="text-xs sm:text-sm font-tech tracking-[0.25em] uppercase text-npc-cyan font-bold">
          NEXT VICTIM IN
        </span>
      </div>

      <div
        className={`text-6xl sm:text-7xl font-orbitron font-black tabular-nums ${getCountColor()} transition-all duration-200 ${
          animating ? "scale-105" : "scale-100"
        }`}
      >
        {active ? count : "--"}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[240px] stat-bar mt-1">
        <div
          className={`stat-bar-fill ${
            count <= 3
              ? "bg-npc-red"
              : count <= 5
              ? "bg-npc-amber"
              : "bg-npc-cyan"
          }`}
          style={{ width: active ? `${(count / duration) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
}
