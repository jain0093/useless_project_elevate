"use client";

import type { NPCProfile } from "@/lib/types";

interface NPCCardProps {
  npc: NPCProfile;
  revealStage?: number;
}

export default function NPCCard({ npc, revealStage = 6 }: NPCCardProps) {
  const normalizedBattery = Math.max(0, Math.min(100, npc.socialBattery));

  const showActivity = revealStage >= 4;
  const showQuest = revealStage >= 5;
  const showRoast = revealStage >= 6;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* 1. CURRENT ACTIVITY — strictly observable CV fact (Reveals at ~1000ms) */}
      <div
        className={`flex flex-col gap-1 px-3.5 py-2.5 bg-[#FFF5C7]/70 border border-[#FFE68A] rounded-[14px] transition-all duration-300 ${
          showActivity ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-extrabold tracking-wider text-amber-900 uppercase">
            CURRENT ACTIVITY
          </span>
          <span className="text-[9px] font-mono font-bold text-amber-700 bg-white/60 px-2 py-0.5 rounded-full border border-amber-200">
            LOCAL CV VERIFIED
          </span>
        </div>
        <span className="text-sm sm:text-base font-body font-extrabold text-[#17151C] uppercase tracking-wide">
          {npc.detectedActivity || npc.activity || "SITTING"}
        </span>
      </div>

      {/* 2. QUEST — Collectible RPG style (Reveals at ~1300ms) */}
      <div
        className={`flex flex-col gap-1 px-4 py-3 bg-[#FFF3F8] border border-[#FFD1E3] rounded-[16px] transition-all duration-300 ${
          showQuest ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <span className="text-[10px] font-mono font-extrabold tracking-wider text-pink-700 uppercase">
          ⚔️ ACTIVE QUEST
        </span>
        <p className="text-xs sm:text-sm font-body font-bold text-[#17151C] leading-snug">
          {npc.quest}
        </p>
      </div>

      {/* 3. AI OPINION — 2026 friend roast (Reveals at ~1600ms) */}
      <div
        className={`flex flex-col gap-1.5 p-4 bg-[#FFF9F2] border border-[#E6DFE5] rounded-[18px] shadow-2xs transition-all duration-300 ${
          showRoast ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <span className="text-[10px] font-mono font-extrabold tracking-wider text-[#6F6A76] uppercase">
          💭 AI OPINION
        </span>
        <p className="text-base sm:text-lg font-body font-black text-[#17151C] leading-snug">
          &ldquo;{npc.roast}&rdquo;
        </p>
      </div>

      {/* Fictional RPG Stats Chip Bar */}
      <div className="pt-2 flex items-center justify-between text-[10px] font-mono font-bold text-[#6F6A76] border-t border-[#E6DFE5]/80">
        <span className="flex items-center gap-1">
          <span>🔋 BATTERY:</span>
          <span className="text-[#17151C] font-extrabold">{normalizedBattery}%</span>
        </span>
        <span className="flex items-center gap-1">
          <span>🧠 BRAINCELLS:</span>
          <span className="text-[#17151C] font-extrabold">{npc.braincells.toFixed(1)}/10</span>
        </span>
        <span className="flex items-center gap-1">
          <span>THREAT:</span>
          <span className="text-pink-600 font-extrabold">{npc.threatLevel}</span>
        </span>
      </div>
    </div>
  );
}
