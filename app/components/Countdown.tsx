"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { playTickSound } from "@/app/utils/sound";

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
        playTickSound();
        return prev - 1;
      });
      setAnimating(true);
      setTimeout(() => setAnimating(false), 250);
    }, 1000);

    return () => clearInterval(interval);
  }, [active, duration, resetCountdown]);

  return (
    <div className="card-pastel p-5 flex flex-col items-center justify-center gap-2.5 bg-white border border-[#E6DFE5] shadow-[0_4px_20px_rgba(23,21,28,0.06)]">
      {/* Pill header */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5C7] border border-[#FFE68A] text-amber-900 text-xs font-bold font-body">
        <span>⏱️</span>
        <span className="tracking-wide uppercase">
          {count === 1 ? "TARGET LOCKED" : "TARGET ACQUISITION"}
        </span>
      </div>

      {/* Large Chunky Countdown Display */}
      <div
        className={`font-display font-black text-6xl sm:text-7xl text-[#17151C] tabular-nums transition-all duration-200 ${
          animating ? "scale-110 text-pink-600" : "scale-100"
        }`}
      >
        {active ? (count === 1 ? "🎯" : count < 10 ? `0${count}` : count) : "--"}
      </div>

      <p className="text-[11px] font-body text-[#6F6A76] font-medium">
        {count <= 2
          ? "Locking onto nearest innocent human..."
          : "Scanning crowd for optimal victim..."}
      </p>

      {/* Progress Bar in soft butter yellow / pink */}
      <div className="w-full max-w-[220px] h-2.5 rounded-full bg-[#FFF9F2] border border-[#E6DFE5] overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            count <= 3 ? "bg-[#FF7EB6]" : count <= 6 ? "bg-[#FFE68A]" : "bg-[#8ED8FF]"
          }`}
          style={{ width: active ? `${(count / duration) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
}
