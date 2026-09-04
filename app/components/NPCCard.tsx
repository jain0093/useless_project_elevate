"use client";

import type { NPCProfile } from "@/lib/types";

interface NPCCardProps {
  npc: NPCProfile;
}

export default function NPCCard({ npc }: NPCCardProps) {
  const normalizedBattery = Math.max(0, Math.min(100, npc.socialBattery));

  return (
    <div className="hud-panel hud-corners p-5 sm:p-6 flex flex-col gap-4 max-w-lg w-full rounded-sm border border-npc-cyan/40 bg-black/85 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.9)]">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-npc-border pb-2.5">
        <span className="text-[11px] font-tech tracking-[0.25em] text-npc-cyan font-bold uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
          NPC IDENTIFIED
        </span>
        <span className="px-2.5 py-0.5 text-[10px] font-tech font-bold tracking-widest border border-npc-cyan/40 text-npc-cyan bg-npc-cyan/10 uppercase">
          LIVE TARGET
        </span>
      </div>

      {/* NPC Archetype Title */}
      <div className="text-center py-1">
        <h2 className="text-2xl sm:text-3xl font-orbitron font-black tracking-wider text-npc-cyan drop-shadow-[0_0_25px_rgba(0,240,255,0.6)] uppercase">
          {npc.type}
        </h2>
      </div>

      {/* OBSERVED ACTIVITY — grounded in real detection */}
      <div className="flex flex-col gap-1 px-3 py-2.5 bg-npc-amber/10 border border-npc-amber/50 rounded-xs">
        <span className="text-[10px] font-tech tracking-[0.2em] text-npc-amber font-bold uppercase">
          OBSERVED ACTIVITY:
        </span>
        <span className="text-sm font-tech tracking-wider text-foreground font-bold uppercase">
          {npc.detectedActivity || npc.activity || "Activity observed in frame"}
        </span>
      </div>

      {/* AI VERDICT — ONE TO TWO SENTENCES MAX */}
      <div className="flex flex-col gap-1.5 p-3.5 bg-black/60 border border-npc-border/80 rounded-xs">
        <span className="text-[10px] font-tech tracking-[0.2em] text-npc-cyan font-bold uppercase">
          AI VERDICT:
        </span>
        <p className="text-base sm:text-lg font-mono font-bold text-foreground leading-snug">
          &ldquo;{npc.roast}&rdquo;
        </p>
      </div>

      {/* MALAYALAM PUNCHLINE */}
      {npc.malayalamStatus && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-tech tracking-[0.2em] text-npc-red font-bold uppercase">
            MALAYALAM:
          </span>
          <div className="p-3 border-2 border-npc-red/60 bg-npc-red/10 rounded-xs shadow-[0_0_20px_rgba(255,0,85,0.25)] text-center">
            <span className="text-xl sm:text-2xl font-black text-npc-red tracking-wide">
              {npc.malayalamStatus}
            </span>
          </div>
        </div>
      )}

      {/* QUEST */}
      <div className="flex flex-col gap-1 px-3 py-2 border border-npc-amber/30 bg-npc-amber/5 rounded-xs">
        <span className="text-[10px] font-tech tracking-[0.2em] text-npc-amber/80 font-bold uppercase">
          QUEST:
        </span>
        <p className="text-xs font-mono font-semibold text-npc-amber tracking-wide">
          {npc.quest}
        </p>
      </div>

      {/* Fictional RPG Stats Footer */}
      <div className="pt-2 border-t border-npc-border/50 flex items-center justify-between text-[9px] font-tech tracking-widest text-npc-text-dim uppercase">
        <span>FICTIONAL RPG STATS</span>
        <span>SOCIAL BATTERY: {normalizedBattery}% • BRAIN CELLS: {npc.braincells.toFixed(1)}/10</span>
      </div>
    </div>
  );
}
