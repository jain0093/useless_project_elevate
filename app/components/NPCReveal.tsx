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
  /** Called when the user explicitly clicks NEXT VICTIM */
  onNextVictim: () => void;
  /** Called when the user clicks STOP SCANNING */
  onStopScanning: () => void;
}

export default function NPCReveal({
  npc,
  croppedImage,
  active,
  onNextVictim,
  onStopScanning,
}: NPCRevealProps) {
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (active && npc) {
      setFlashing(true);
      const timer = setTimeout(() => setFlashing(false), 350);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, npc]);

  if (!active || !npc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-6 px-3 sm:px-4 backdrop-blur-xl bg-black/90">
      {/* Screen flash on entrance */}
      {flashing && (
        <div
          className="absolute inset-0 bg-npc-red/40 pointer-events-none z-10"
          style={{ animation: "screen-flash 0.35s ease-out forwards" }}
        />
      )}

      {/* Main Encounter Modal Container */}
      <div className="relative z-20 flex flex-col items-center gap-4 max-w-xl w-full my-auto animate-reveal-scale">
        {/* Banner: NPC DETECTED */}
        <div className="flex flex-col items-center gap-1">
          <div className="px-4 py-1 bg-npc-red/20 border-2 border-npc-red text-npc-red font-tech tracking-[0.3em] font-bold text-xs sm:text-sm animate-pulse-glow uppercase">
            ⚠️ NPC DETECTED ⚠️
          </div>
          <span className="text-[10px] font-tech tracking-[0.2em] text-npc-amber uppercase">
            ENCOUNTER LOCKED // SCANNING PAUSED
          </span>
        </div>

        {/* Selected person actual image crop */}
        {croppedImage && (
          <div className="relative w-full max-w-[260px]">
            <div className="flex items-center justify-between px-2 py-1 bg-black/90 border border-b-0 border-npc-amber/70 text-[10px] font-tech tracking-widest text-npc-amber">
              <span>🎯 SELECTED TARGET</span>
              <span>LIVE FRAME CROP</span>
            </div>
            <div className="relative border-2 border-npc-amber bg-black overflow-hidden shadow-[0_0_30px_rgba(255,183,0,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={croppedImage}
                alt="Selected NPC target from camera"
                className="w-full h-auto object-contain max-h-[190px] mx-auto"
              />
              {/* Corner accents */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-npc-amber pointer-events-none" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-npc-amber pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-npc-amber pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-npc-amber pointer-events-none" />
            </div>
          </div>
        )}

        {/* Main NPC Card Details */}
        <NPCCard npc={npc} />

        {/* Action Controls: NEXT VICTIM & STOP SCANNING */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg mt-1">
          {/* STOP SCANNING BUTTON */}
          <button
            onClick={onStopScanning}
            className="w-full sm:w-auto px-5 py-3 border border-npc-red/60 text-npc-red bg-npc-red/10 hover:bg-npc-red hover:text-black font-tech text-xs tracking-[0.2em] uppercase font-bold transition-all duration-200"
          >
            STOP SCANNING
          </button>

          {/* LARGE NEXT VICTIM BUTTON */}
          <button
            onClick={onNextVictim}
            className="w-full sm:flex-1 group relative px-8 py-4 bg-npc-cyan text-black font-orbitron font-black text-sm sm:text-base tracking-[0.2em] uppercase transition-all duration-200 shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:shadow-[0_0_50px_rgba(0,240,255,0.9)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>NEXT VICTIM</span>
              <span className="text-xl group-hover:translate-x-1.5 transition-transform duration-200">➔</span>
            </span>
          </button>
        </div>

        <p className="text-[10px] font-mono tracking-wider text-npc-text-dim text-center">
          WINDOW REMAINS OPEN UNTIL YOU CHOOSE THE NEXT VICTIM
        </p>
      </div>

      {/* CRT scanline overlay */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none" />
    </div>
  );
}
