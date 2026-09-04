"use client";

import type { EncounterEntry } from "@/app/types/frontend";

interface NPCHistoryProps {
  encounters: EncounterEntry[];
}

export default function NPCHistory({ encounters }: NPCHistoryProps) {
  return (
    <div className="hud-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] uppercase text-npc-text-dim">
          Encounter Log
        </span>
        <span className="text-[10px] tracking-wider text-npc-text-dim">
          {encounters.length} TOTAL
        </span>
      </div>

      <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
        {encounters.length === 0 ? (
          <div className="text-xs text-npc-text-dim tracking-wider py-4 text-center">
            NO ENCOUNTERS YET
          </div>
        ) : (
          encounters.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 py-1.5 px-2 text-xs border-b border-npc-border/30 last:border-0 animate-fade-in"
            >
              <span className="text-npc-text-dim font-mono text-[10px] w-10 shrink-0">
                #{String(entry.id).padStart(3, "0")}
              </span>
              <span className="text-npc-text-mid uppercase tracking-wider truncate flex-1">
                {entry.npc.type}
              </span>
              <span
                className={`text-[9px] tracking-wider ${
                  entry.npc.threatLevel === "CRITICAL"
                    ? "text-npc-red"
                    : entry.npc.threatLevel === "HIGH"
                    ? "text-[#ff6d00]"
                    : "text-npc-text-dim"
                }`}
              >
                {entry.npc.threatLevel}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
