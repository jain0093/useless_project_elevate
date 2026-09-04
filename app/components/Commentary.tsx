"use client";

import { useEffect, useState } from "react";

interface CommentaryProps {
  peopleCount: number;
  commentary: string | null;
  observationLines?: string[];
  detectedObjects?: string[];
}

export default function Commentary({
  peopleCount,
  commentary,
  observationLines = [],
  detectedObjects = [],
}: CommentaryProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  const fullText =
    commentary || (peopleCount === 0 ? "Scanning room..." : "Monitoring targets...");

  // Typewriter effect for headline commentary
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

  const uniqueObjects = Array.from(new Set(detectedObjects));

  return (
    <div className="card-pastel p-5 flex flex-col gap-3 bg-white border border-[#E6DFE5] shadow-[0_4px_20px_rgba(23,21,28,0.06)]">
      {/* Header with pastel badge */}
      <div className="flex items-center justify-between border-b border-[#E6DFE5] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">💬</span>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-[#17151C]">
            ROOM COMMENTARY
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#DDF5FF] text-sky-900 border border-[#8ED8FF]">
          👥 {peopleCount} {peopleCount === 1 ? "HUMAN" : "HUMANS"} VISIBLE
        </span>
      </div>

      {/* Main typewriter commentary */}
      <div className="p-3.5 rounded-[14px] bg-[#FFF3F8] border border-[#FFD1E3]">
        <p className="font-body text-sm sm:text-base font-bold text-[#17151C] leading-snug">
          &ldquo;{displayedText}&rdquo;
          {textIndex < fullText.length && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-pink-500 rounded-xs animate-pulse align-middle" />
          )}
        </p>
      </div>

      {/* Detected objects badges */}
      {uniqueObjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-[#6F6A76] font-semibold mr-1">
            OBJECTS:
          </span>
          {uniqueObjects.map((obj, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E9E4FF] text-purple-900 border border-[#B9A7FF]"
            >
              ✦ {obj}
            </span>
          ))}
        </div>
      )}

      {/* Observable detail lines */}
      {observationLines.length > 1 && (
        <div className="flex flex-col gap-1 border-t border-[#E6DFE5] pt-2">
          {observationLines.slice(1, 3).map((line, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-[#6F6A76] font-body">
              <span className="text-pink-400 font-bold select-none">•</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
