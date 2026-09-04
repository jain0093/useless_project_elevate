"use client";

import { useEffect, useState } from "react";

const ZERO_PERSON_MESSAGES = [
  "The population has escaped.",
  "Absolutely nobody. An empty room achievement unlocked.",
  "Zero humans detected. The AI is questioning its purpose.",
  "Scanning... scanning... nope. Nobody home.",
  "This is the most peaceful crime scene we've ever observed.",
  "Not a single soul. Campus has entered stealth mode.",
];

const ZERO_PERSON_MALAYALAM = [
  "ആരും ഇല്ല.",
  "എല്ലാരും പോയി.",
  "ശൂന്യം.",
  "ഒരാളും കാണാനില്ല.",
];

interface CommentaryProps {
  peopleCount: number;
  commentary: string | null;
}

export default function Commentary({ peopleCount, commentary }: CommentaryProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  // Pick the text to display
  const fullText = (() => {
    if (peopleCount === 0) {
      return ZERO_PERSON_MESSAGES[
        Math.floor(Date.now() / 20000) % ZERO_PERSON_MESSAGES.length
      ];
    }
    return commentary || "AWAITING VISUAL DATA...";
  })();

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
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [textIndex, fullText]);

  // Zero-person Malayalam punchline
  const malayalamPunch =
    peopleCount === 0
      ? ZERO_PERSON_MALAYALAM[
          Math.floor(Date.now() / 20000) % ZERO_PERSON_MALAYALAM.length
        ]
      : null;

  return (
    <div className="hud-panel p-4 flex flex-col gap-3">
      <div className="text-[10px] tracking-[0.2em] uppercase text-npc-text-dim">
        Live Observation
      </div>

      {/* People count */}
      <div className={`text-sm font-bold tracking-wider ${
        peopleCount === 0 ? "text-npc-text-dim" : "text-npc-amber"
      }`}>
        {peopleCount} HUMAN{peopleCount !== 1 ? "S" : ""} DETECTED
      </div>

      {/* Commentary with typewriter */}
      <div className="pt-2 border-t border-npc-border">
        <p className="text-[11px] text-npc-text-mid leading-relaxed tracking-wide min-h-[2.5em]">
          {displayedText}
          {textIndex < fullText.length && (
            <span className="inline-block w-[6px] h-[12px] bg-npc-cyan/60 ml-0.5 animate-pulse-glow" />
          )}
        </p>

        {/* Malayalam punchline for zero-person state */}
        {malayalamPunch && textIndex >= fullText.length && (
          <p className="text-[11px] text-npc-cyan-dim italic mt-2 animate-fade-in">
            &ldquo;{malayalamPunch}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
