"use client";

import { useEffect, useState } from "react";
import type { NPCProfile } from "@/lib/types";
import NPCCard from "./NPCCard";

interface NPCRevealProps {
  npc: NPCProfile | null;
  /** Base64 data URL of the cropped person image */
  croppedImage: string | null;
  /** Whether the reveal sequence is active */
  active: boolean;
  /** Called when the reveal sequence finishes */
  onDismiss: () => void;
}

type RevealPhase = "FLASH" | "DETECTED" | "CARD" | "IDLE";

// Dramatic detection one-liners
const DETECTION_LINES = [
  "TARGET ACQUIRED. ROAST INCOMING. 💀",
  "NPC SPOTTED. PREPARE FOR JUDGEMENT.",
  "VICTIM LOCATED. DEPLOYING BRAINROT. 🔥",
  "ONE HUMAN ISOLATED. COMMENCING ROAST.",
  "TARGET LOCKED. MALAYALAM ACTIVATED. 📢",
  "NPC FOUND. THERE IS NO ESCAPE.",
];

export default function NPCReveal({
  npc,
  croppedImage,
  active,
  onDismiss,
}: NPCRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>("IDLE");
  const [detectionLine] = useState(() => 
    DETECTION_LINES[Math.floor(Math.random() * DETECTION_LINES.length)]
  );

  useEffect(() => {
    if (!active || !npc) {
      setPhase("IDLE");
      return;
    }

    // Phase 1: Screen flash (0.4s)
    setPhase("FLASH");
    const t1 = setTimeout(() => setPhase("DETECTED"), 400);

    // Phase 2: "NPC DETECTED" title (1.2s)
    const t2 = setTimeout(() => setPhase("CARD"), 1600);

    // Phase 3: Auto-dismiss after 14s total (more time to read)
    const t3 = setTimeout(() => {
      onDismiss();
    }, 14000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, npc, onDismiss]);

  if (!active || !npc || phase === "IDLE") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 backdrop-blur-lg">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 animate-fade-in" />

      {/* Screen Flash Effect */}
      {phase === "FLASH" && (
        <div
          className="absolute inset-0 bg-npc-red/40 pointer-events-none"
          style={{ animation: "screen-flash 0.4s ease-out forwards" }}
        />
      )}

      {/* NPC DETECTED dramatic transition state */}
      {phase === "DETECTED" && (
        <div className="relative z-10 flex flex-col items-center gap-5 animate-reveal-scale px-4">
          <div className="px-4 py-1.5 bg-npc-red/20 border border-npc-red text-npc-red text-sm font-tech tracking-[0.3em] font-bold animate-pulse-glow">
            ⚠️ NPC DETECTED ⚠️
          </div>
          <div className="text-4xl sm:text-6xl font-orbitron font-black tracking-[0.15em] text-npc-cyan animate-glitch drop-shadow-[0_0_40px_rgba(0,240,255,0.6)] text-center">
            {detectionLine.split(".")[0]}
          </div>
          <div className="flex items-center gap-2 text-sm font-tech tracking-[0.15em] text-npc-amber">
            <span className="w-2.5 h-2.5 rounded-full bg-npc-amber animate-pulse" />
            <span>GENERATING ROAST...</span>
          </div>
        </div>
      )}

      {/* NPC Card with target crop image */}
      {phase === "CARD" && (
        <div className="relative z-10 flex flex-col items-center gap-4 px-4 animate-reveal-slide max-w-lg w-full">
          {/* Target crop display */}
          {croppedImage && (
            <div className="relative w-full max-w-[280px]">
              <div className="flex items-center justify-between px-2 py-1 bg-black/80 border border-b-0 border-npc-amber/60 text-[10px] font-tech tracking-widest text-npc-amber">
                <span>📸 CAUGHT IN 4K</span>
                <span>NO ESCAPE</span>
              </div>
              <div className="relative border-2 border-npc-amber/80 bg-black overflow-hidden shadow-[0_0_25px_rgba(255,183,0,0.3)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={croppedImage}
                  alt="Detected NPC target"
                  className="w-full h-auto object-contain max-h-[190px] mx-auto"
                />
                {/* Corner Accents */}
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-npc-amber pointer-events-none" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-npc-amber pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-npc-amber pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-npc-amber pointer-events-none" />
              </div>
            </div>
          )}

          {/* Main Card */}
          <NPCCard npc={npc} />

          {/* Continue button */}
          <button
            onClick={onDismiss}
            className="mt-1 px-6 py-2.5 font-tech text-xs tracking-[0.2em] uppercase border border-npc-cyan/40 text-npc-cyan bg-npc-cyan/5 hover:bg-npc-cyan/20 hover:border-npc-cyan transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          >
            NEXT VICTIM ➔
          </button>
        </div>
      )}

      {/* CRT overlay */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none" />
    </div>
  );
}
