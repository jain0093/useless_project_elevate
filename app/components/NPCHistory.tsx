"use client";

import type { EncounterEntry } from "@/app/types/frontend";

interface NPCHistoryProps {
  encounters: EncounterEntry[];
}

export default function NPCHistory({ encounters }: NPCHistoryProps) {
  return (
    <div className="card-pastel p-5 flex flex-col gap-3 bg-white border border-[#E6DFE5] shadow-[0_4px_20px_rgba(23,21,28,0.06)]">
      <div className="flex items-center justify-between border-b border-[#E6DFE5] pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">📚</span>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-[#17151C]">
            ENCOUNTER LOG
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFF5C7] text-amber-900 border border-[#FFE68A]">
          {encounters.length} LOGGED
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {encounters.length === 0 ? (
          <div className="text-xs font-body text-[#6F6A76] py-6 text-center border border-dashed border-[#E6DFE5] rounded-[14px]">
            No targets judged yet. Start scanning to begin.
          </div>
        ) : (
          encounters.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-2.5 rounded-[14px] bg-[#FFF9F2] border border-[#E6DFE5] hover:border-pink-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-xs font-bold text-[#6F6A76] shrink-0">
                  #{String(entry.id).padStart(2, "0")}
                </span>

                {/* Target crop mini thumbnail */}
                {entry.croppedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.croppedImage}
                    alt="NPC thumbnail"
                    className="w-9 h-9 object-cover rounded-[10px] border border-[#E6DFE5] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 bg-white border border-[#E6DFE5] rounded-[10px] shrink-0 flex items-center justify-center text-xs">
                    👤
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <span className="font-display text-xs font-extrabold text-[#17151C] truncate">
                    {entry.npc.type}
                  </span>
                  <span className="font-body text-[10px] text-[#6F6A76] uppercase font-bold truncate">
                    {entry.npc.detectedActivity || entry.npc.activity}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-[#E6DFE5] text-[#17151C] shrink-0 ml-2">
                {entry.npc.threatLevel}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
