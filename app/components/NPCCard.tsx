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
  if (pct <= 15) return "bg-npc-red";
  if (pct <= 40) return "bg-npc-amber";
  return "bg-npc-green";
}

export default function NPCCard({ npc }: NPCCardProps) {
  return (
    <div className="hud-panel hud-corners p-5 sm:p-6 flex flex-col gap-4 max-w-lg w-full">
      {/* NPC Type Name */}
      <div className="text-center">
        <div className="text-[10px] tracking-[0.2em] text-npc-text-dim mb-1">
          NPC CLASSIFICATION
        </div>
        <h2
          className={`text-2xl sm:text-3xl font-bold tracking-wider ${getThreatClass(
            npc.threatLevel
          )} drop-shadow-[0_0_15px_currentColor]`}
        >
          {npc.type}
        </h2>
      </div>

      {/* Activity */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-npc-text-dim tracking-[0.15em]">ACTIVITY</span>
        <span className="flex-1 h-[1px] bg-npc-border" />
        <span className="text-npc-text-mid uppercase">{npc.activity}</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Social Battery */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[0.15em] text-npc-text-dim">
            SOCIAL BATTERY
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">
              {npc.socialBattery}
            </span>
            <span className="text-[10px] text-npc-text-dim">%</span>
          </div>
          <div className="stat-bar">
            <div
              className={`stat-bar-fill ${getBatteryColor(npc.socialBattery)}`}
              style={{ width: `${npc.socialBattery}%` }}
            />
          </div>
        </div>

        {/* Brain Cells */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[0.15em] text-npc-text-dim">
            BRAIN CELLS
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">
              {npc.braincells.toFixed(1)}
            </span>
            <span className="text-[10px] text-npc-text-dim">/ 10</span>
          </div>
          <div className="stat-bar">
            <div
              className={`stat-bar-fill ${
                npc.braincells <= 2
                  ? "bg-npc-red"
                  : npc.braincells <= 5
                  ? "bg-npc-amber"
                  : "bg-npc-cyan"
              }`}
              style={{ width: `${(npc.braincells / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Threat Level */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-npc-text-dim tracking-[0.15em]">
          THREAT LEVEL
        </span>
        <span className="flex-1 h-[1px] bg-npc-border" />
        <span
          className={`px-2 py-0.5 text-[10px] font-bold tracking-wider ${getThreatBgClass(
            npc.threatLevel
          )} text-black`}
        >
          {npc.threatLevel}
        </span>
      </div>

      {/* Quest */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.15em] text-npc-text-dim">
          QUEST
        </span>
        <p className="text-xs text-npc-amber italic leading-relaxed">
          {npc.quest}
        </p>
      </div>

      {/* AI Opinion */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.15em] text-npc-text-dim">
          AI OPINION
        </span>
        <p className="text-xs text-npc-text-mid leading-relaxed">
          &ldquo;{npc.opinion}&rdquo;
        </p>
      </div>

      {/* Malayalam Status */}
      {npc.malayalamStatus && (
        <div className="pt-2 border-t border-npc-border">
          <span className="text-[10px] tracking-[0.15em] text-npc-text-dim block mb-1">
            MALAYALAM STATUS
          </span>
          <p className="text-xs text-npc-cyan-dim italic">
            &ldquo;{npc.malayalamStatus}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
