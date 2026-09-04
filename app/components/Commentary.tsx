"use client";

import { useEffect, useState } from "react";

interface CommentaryProps {
  peopleCount: number;
  commentary: string | null;
  detectedObjects?: string[];
}

export default function Commentary({ peopleCount, commentary, detectedObjects = [] }: CommentaryProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  const fullText = commentary || (peopleCount === 0 ? "Scanning..." : "Watching...");

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    setTextIndex(0);
  }, [fullText]);

  useEffect(() => {
    if (textIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 15);
      return () => clearTimeout(timer);
    }
  }, [textIndex, fullText]);

  // Unique detected objects for display
  const uniqueObjects = Array.from(new Set(detectedObjects));

  return (
    <div className="hud-panel p-4 sm:p-5 flex flex-col gap-3 rounded-xs border border-npc-border bg-npc-surface/90">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-tech tracking-[0.2em] uppercase text-npc-cyan flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-npc-cyan animate-pulse-glow" />
          SCENE
        </span>
        <span className="text-sm font-orbitron font-black text-npc-amber">
          {peopleCount} HUMAN{peopleCount !== 1 ? "S" : ""}
        </span>
      </div>

      {/* Detected objects badges */}
      {uniqueObjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uniqueObjects.map((obj, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] font-tech tracking-wider uppercase border border-npc-cyan/30 text-npc-cyan bg-npc-cyan/5"
            >
              {obj.replace("cell phone", "📱 PHONE").replace("laptop", "💻 LAPTOP").replace("cup", "☕ CUP").replace("bottle", "🍶 BOTTLE").replace("book", "📖 BOOK").replace("backpack", "🎒 BAG")}
            </span>
          ))}
        </div>
      )}

      {/* Main scene commentary — BIG */}
      <div className="pt-2 border-t border-npc-border/60">
        <p className="text-base sm:text-lg md:text-xl font-mono font-bold text-foreground leading-snug tracking-wide">
          {displayedText}
          {textIndex < fullText.length && (
            <span className="inline-block w-[10px] h-[20px] bg-npc-cyan ml-1 animate-pulse-glow" />
          )}
        </p>
      </div>
    </div>
  );
}
