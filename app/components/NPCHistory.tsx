"use client";

import type { EncounterEntry } from "@/app/types/frontend";

interface NPCHistoryProps {
  encounters: EncounterEntry[];
}

export default function NPCHistory({ encounters }: NPCHistoryProps) {
  return (
    <div className="hud-panel p-4 flex flex-col gap-3 rounded-xs border border-npc-border bg-npc-surface/90">
      <div className="flex items-center justify-between border-b border-npc-border/60 pb-2">
        <span className="text-[10px] font-tech tracking-[0.2em] uppercase text-npc-cyan flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-npc-cyan rounded-full" />
          ENCOUNTER HISTORY LOG
        </span>
        <span className="text-[9px] font-tech tracking-wider text-npc-amber font-bold">
          {encounters.length} ARCHIVED
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
        {encounters.length === 0 ? (
          <div className="text-xs font-tech text-npc-text-dim tracking-widest py-6 text-center border border-dashed border-npc-border/40">
            NO TARGETS PROFILED YET
          </div>
        ) : (
          encounters.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-2 text-xs border border-npc-border/40 bg-black/40 hover:border-npc-cyan/40 transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-npc-text-dim font-tech text-[10px] font-bold">
                  #{String(entry.id).padStart(3, "0")}
                </span>

                {/* Target crop mini thumbnail */}
                {entry.croppedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.croppedImage}
                    alt="NPC thumbnail"
                    className="w-7 h-7 object-cover border border-npc-cyan/40 rounded-xs shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 bg-npc-surface-light border border-npc-border shrink-0 flex items-center justify-center text-[8px] text-npc-text-dim">
                    N/A
                  </div>
                )}

                <span className="text-foreground font-orbitron text-[11px] font-bold tracking-wider truncate">
                  {entry.npc.type}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-tech font-bold px-1.5 py-0.5 rounded-xs uppercase ${
                    entry.npc.threatLevel === "CRITICAL"
                      ? "text-npc-red border border-npc-red/40 bg-npc-red/10"
                      : entry.npc.threatLevel === "HIGH"
                      ? "text-[#ff6d00] border border-[#ff6d00]/40 bg-[#ff6d00]/10"
                      : "text-npc-text-mid border border-npc-border"
                  }`}
                >
                  {entry.npc.threatLevel}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
