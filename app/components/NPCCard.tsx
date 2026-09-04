"use client";

import type { NPCProfile, ThreatLevel } from "@/lib/types";

interface NPCCardProps {
  npc: NPCProfile;
}

function getThreatClass(level: ThreatLevel): string {
  const map: Record<ThreatLevel, string> = {
    NONE: "threat-none",
    LOW: "threat-low",
    MEDIUM: "threat-medium",
    HIGH: "threat-high",
    CRITICAL: "threat-critical",
  };
  return map[level] || "threat-none";
}

function getThreatBgClass(level: ThreatLevel): string {
  const map: Record<ThreatLevel, string> = {
    NONE: "threat-bg-none",
    LOW: "threat-bg-low",
    MEDIUM: "threat-bg-medium",
    HIGH: "threat-bg-high",
    CRITICAL: "threat-bg-critical",
  };
  return map[level] || "threat-bg-none";
}

function getBatteryColor(pct: number): string {
  if (pct <= 0) return "bg-npc-red";
  if (pct <= 25) return "bg-npc-amber";
  return "bg-npc-green";
}

export default function NPCCard({ npc }: NPCCardProps) {
  const normalizedBattery = Math.max(0, Math.min(100, npc.socialBattery));

  return (
    <div className="hud-panel hud-corners p-5 sm:p-6 flex flex-col gap-4 max-w-lg w-full rounded-sm border border-npc-cyan/30 bg-npc-surface/90 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-npc-border pb-3">
        <span className="text-[10px] font-tech tracking-[0.25em] text-npc-cyan-dim uppercase">
          NPC FILE // #{Math.floor(Math.random() * 8999 + 1000)}
        </span>
        <span
          className={`px-2.5 py-0.5 text-[10px] font-bold font-tech tracking-widest ${getThreatBgClass(
            npc.threatLevel
          )} text-black uppercase shadow-sm`}
        >
          {npc.threatLevel}
        </span>
      </div>

      {/* NPC Type Name — BIG */}
      <div className="text-center py-2">
        <h2
          className={`text-2xl sm:text-3xl font-orbitron font-black tracking-wider ${getThreatClass(
            npc.threatLevel
          )} drop-shadow-[0_0_25px_currentColor]`}
        >
          {npc.type}
        </h2>
        <div className="text-xs font-tech tracking-[0.2em] text-npc-text-dim uppercase mt-1">
          Activity: <span className="text-npc-cyan font-bold">{npc.activity}</span>
        </div>
      </div>

      {/* Stats — simplified to just two bars */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 border border-npc-border/60 rounded-xs">
        {/* Social Battery */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-tech tracking-wider">
            <span className="text-npc-text-dim">SOCIAL BATTERY</span>
            <span className="text-foreground font-bold font-mono">
              {npc.socialBattery}%
            </span>
          </div>
          <div className="stat-bar">
            <div
              className={`stat-bar-fill ${getBatteryColor(npc.socialBattery)}`}
              style={{ width: `${normalizedBattery}%` }}
            />
          </div>
        </div>

        {/* Brain Cells */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-tech tracking-wider">
            <span className="text-npc-text-dim">BRAIN CELLS</span>
            <span className="text-foreground font-bold font-mono">
              {npc.braincells.toFixed(1)} <span className="text-npc-text-dim text-[9px]">/ 10</span>
            </span>
          </div>
          <div className="stat-bar">
            <div
              className={`stat-bar-fill ${
                npc.braincells <= 1.5
                  ? "bg-npc-red"
                  : npc.braincells <= 4.0
                  ? "bg-npc-amber"
                  : "bg-npc-cyan"
              }`}
              style={{ width: `${(Math.min(10, Math.max(0.1, npc.braincells)) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI ROAST — BIG AND BOLD */}
      <div className="pt-3 border-t border-npc-border/60">
        <p className="text-sm sm:text-base text-foreground leading-relaxed font-mono font-bold">
          &ldquo;{npc.opinion}&rdquo;
        </p>
      </div>

      {/* Quest — short and punchy */}
      <div className="flex items-start gap-2 p-3 border border-npc-amber/30 bg-npc-amber/5 rounded-xs">
        <span className="text-npc-amber text-base">📜</span>
        <div>
          <div className="text-[10px] font-tech tracking-[0.2em] text-npc-amber uppercase font-bold mb-1">
            QUEST
          </div>
          <p className="text-sm text-npc-amber/90 italic leading-relaxed font-mono">
            {npc.quest}
          </p>
        </div>
      </div>

      {/* MALAYALAM SLAM — THE BIGGEST TEXT, THE MAIN EVENT */}
      {npc.malayalamStatus && (
        <div className="malayalam-punchline-container pt-2">
          <p className="malayalam-punchline text-xl sm:text-2xl font-black text-npc-red text-center tracking-wide px-4 py-3 border-2 border-npc-red/60 bg-npc-red/10 rounded-sm shadow-[0_0_35px_rgba(255,0,85,0.5)]">
            {npc.malayalamStatus}
          </p>
        </div>
      )}
    </div>
  );
}
