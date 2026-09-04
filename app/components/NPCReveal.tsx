"use client";

import { useEffect, useState } from "react";
import type { NPCProfile } from "@/lib/types";
import NPCCard from "./NPCCard";

interface NPCRevealProps {
  npc: NPCProfile | null;
  /** Whether the reveal sequence is active */
  active: boolean;
  /** Called when the reveal sequence finishes */
  onDismiss: () => void;
}

type RevealPhase = "FLASH" | "DETECTED" | "CARD" | "IDLE";

export default function NPCReveal({
  npc,
  active,
  onDismiss,
}: NPCRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>("IDLE");

  useEffect(() => {
    if (!active || !npc) {
      setPhase("IDLE");
      return;
    }

    // Phase 1: Screen flash (0.5s)
    setPhase("FLASH");
    const t1 = setTimeout(() => setPhase("DETECTED"), 500);

    // Phase 2: "NPC DETECTED" text (1.2s)
    const t2 = setTimeout(() => setPhase("CARD"), 1700);

    // Phase 3: Show card, auto-dismiss after 8s total
    const t3 = setTimeout(() => {
      onDismiss();
    }, 9000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, npc, onDismiss]);

  if (!active || !npc || phase === "IDLE") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 animate-fade-in" />

      {/* Flash effect */}
      {phase === "FLASH" && (
        <div
          className="absolute inset-0 bg-npc-cyan/20 pointer-events-none"
          style={{ animation: "screen-flash 0.5s ease-out forwards" }}
        />
      )}

      {/* NPC DETECTED text */}
      {phase === "DETECTED" && (
        <div className="relative z-10 flex flex-col items-center gap-3 animate-reveal-scale">
          <div className="text-[10px] tracking-[0.3em] text-npc-red animate-pulse-glow">
            ▲ ALERT ▲
          </div>
          <div className="text-3xl sm:text-5xl font-bold tracking-[0.15em] text-npc-cyan animate-glitch drop-shadow-[0_0_30px_rgba(0,229,255,0.5)]">
            NPC DETECTED
          </div>
          <div className="text-xs tracking-[0.2em] text-npc-text-dim">
            CLASSIFYING...
          </div>
        </div>
      )}

      {/* NPC Card */}
      {phase === "CARD" && (
        <div className="relative z-10 flex flex-col items-center gap-4 px-4 animate-reveal-slide">
          <div className="text-[10px] tracking-[0.3em] text-npc-amber mb-2">
            ▼ NPC CLASSIFIED ▼
          </div>
          <NPCCard npc={npc} />
          <button
            onClick={onDismiss}
            className="mt-2 px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-npc-border text-npc-text-dim hover:border-npc-cyan-dim hover:text-npc-text-mid transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Scanline over reveal */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none" />
    </div>
  );
}
