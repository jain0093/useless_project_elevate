"use client";

import type { WorldStats } from "@/lib/types";

interface WorldStatusProps {
  stats: WorldStats;
}

interface StatCellProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

function StatCell({ label, value, unit, highlight }: StatCellProps) {
  return (
    <div className="flex flex-col gap-1 p-2.5 bg-npc-surface-light/50 border border-npc-border/50">
      <span className="text-[9px] tracking-[0.15em] text-npc-text-dim uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-base font-bold ${
            highlight ? "text-npc-cyan" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-npc-text-dim">{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function WorldStatus({ stats }: WorldStatusProps) {
  const npcDensity =
    stats.humansDetected > 0
      ? Math.round((stats.npcsEncountered / stats.humansDetected) * 100)
      : 0;

  return (
    <div className="hud-panel p-4 flex flex-col gap-3">
      <div className="text-[10px] tracking-[0.2em] uppercase text-npc-text-dim">
        World Status
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <StatCell
          label="Humans Detected"
          value={stats.humansDetected}
          highlight
        />
        <StatCell
          label="NPCs Encountered"
          value={stats.npcsEncountered}
          highlight
        />
        <StatCell label="NPC Density" value={npcDensity} unit="%" />
        <StatCell label="Productivity" value={stats.productivityPercent} unit="%" />
        <StatCell label="Confusion" value={stats.confusionPercent} unit="%" />
        <StatCell label="Purpose" value="UNKNOWN" />
      </div>

      {/* Current vibe */}
      <div className="flex items-center gap-2 text-[10px] text-npc-text-dim tracking-wider pt-1 border-t border-npc-border/50">
        <span>CURRENT VIBE:</span>
        <span className="text-npc-amber">{stats.currentVibe}</span>
      </div>
    </div>
  );
}
