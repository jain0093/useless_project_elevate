"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// Countdown warning messages that change as timer drops
const COUNTDOWN_TAUNTS = [
  "ഓടിക്കോ... AI വരുന്നു! 💀",
  "NEXT ROAST LOADING...",
  "NOBODY IS SAFE. 🔥",
  "SCANNING FOR NPCs...",
  "BRAINROT CHARGING... ⚡",
];

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
    if (count <= 3) return "text-npc-red drop-shadow-[0_0_30px_rgba(255,0,85,0.7)]";
    if (count <= 7) return "text-npc-amber drop-shadow-[0_0_25px_rgba(255,183,0,0.5)]";
    return "text-npc-cyan drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]";
  };

  // Pick a taunt based on count
  const taunt = count <= 3
    ? "🚨 ROAST IMMINENT 🚨"
    : count <= 7
    ? COUNTDOWN_TAUNTS[Math.floor(count / 2) % COUNTDOWN_TAUNTS.length]
    : "NEXT SCAN IN";

  return (
    <div className="hud-panel p-4 sm:p-5 flex flex-col items-center justify-center gap-2 rounded-xs border border-npc-border bg-npc-surface/90">
      <span className="text-xs font-tech tracking-[0.2em] uppercase text-npc-text-dim font-bold">
        {taunt}
      </span>

      <div
        className={`text-6xl sm:text-7xl font-orbitron font-black tabular-nums ${getCountColor()} transition-all duration-300 ${
          animating ? "animate-countdown-pulse" : ""
        }`}
      >
        {active ? String(count).padStart(2, "0") : "--"}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[240px] stat-bar mt-1">
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
    </div>
  );
}
