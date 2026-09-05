"use client";

import { useState, useEffect } from "react";
import type { NPCProfile } from "@/lib/types";
import NPCCard from "./NPCCard";
import MemeCard from "./MemeCard";
import { stopReactionAudio } from "@/lib/meme-audio-engine";

interface NPCRevealProps {
  encounterId: number;
  npc: NPCProfile | null;
  /** Base64 data URL of the cropped person image */
  croppedImage: string | null;
  /** Whether the reveal sequence is active */
  active: boolean;
  /** Called when the user explicitly clicks NEXT VICTIM */
  onNextVictim: () => void;
  /** Called when the user clicks STOP SCANNING */
  onStopScanning: () => void;
  /** Session-level used meme IDs to prevent repetition */
  usedMemeIds?: string[];
  /** Callback when a meme is selected */
  onMemeSelected?: (memeId: string) => void;
  /** Session-level used audio IDs from 9-clip library */
  usedAudioIds?: string[];
  /** Callback when an audio clip is selected */
  onAudioSelected?: (audioId: string) => void;
  /** Group size if multiple people detected */
  groupSize?: number;
  /** Previous reaction encounter label */
  previousReactionLabel?: string;
  /** Callback when a reaction label is selected */
  onLabelSelected?: (label: string) => void;
  /** Sound enabled status from page session */
  soundEnabled: boolean;
  /** Toggle sound handler */
  onToggleSound: () => void;
}

export default function NPCReveal({
  encounterId,
  npc,
  croppedImage,
  active,
  onNextVictim,
  onStopScanning,
  usedMemeIds = [],
  onMemeSelected,
  usedAudioIds = [],
  onAudioSelected,
  groupSize = 1,
  previousReactionLabel,
  onLabelSelected,
  soundEnabled,
  onToggleSound,
}: NPCRevealProps) {
  // Staged reveal ladder per Section 9:
  // 0ms: window open -> 200ms: image -> 400ms: meme card -> 700ms: NPC TYPE -> 1000ms: activity -> 1300ms: quest -> 1600ms: AI opinion
  const [revealStage, setRevealStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setRevealStage(0);
      return;
    }

    setRevealStage(0);
    const t1 = setTimeout(() => setRevealStage(1), 200);  // 200ms: image visible
    const t2 = setTimeout(() => setRevealStage(2), 400);  // 400ms: meme card visible
    const t3 = setTimeout(() => setRevealStage(3), 700);  // 700ms: NPC type visible
    const t4 = setTimeout(() => setRevealStage(4), 1000); // 1000ms: current activity visible
    const t5 = setTimeout(() => setRevealStage(5), 1300); // 1300ms: quest visible
    const t6 = setTimeout(() => setRevealStage(6), 1600); // 1600ms: AI opinion visible

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [active, encounterId]);

  if (!active || !npc) return null;

  const handleNext = () => {
    stopReactionAudio(); // Stop audio immediately on NEXT VICTIM (Section 8, 9, 14)
    onNextVictim();
  };

  const handleStop = () => {
    stopReactionAudio(); // Stop audio immediately on STOP SCANNING (Section 8 & 15)
    onStopScanning();
  };

  const showCrop = revealStage >= 1;
  const showMeme = revealStage >= 2;
  const showType = revealStage >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 px-4 bg-[#17151C]/45 backdrop-blur-md">
      {/* Main Encounter Card Container */}
      <div className="relative z-20 flex flex-col items-center gap-4 max-w-xl w-full my-auto bg-white border-2 border-[#E6DFE5] rounded-[28px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(23,21,28,0.18)] animate-pop">
        {/* Top Status Pill: Section 16 */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DDF5FF] border border-[#8ED8FF] text-sky-900 text-xs font-bold font-body shadow-xs">
          <span>🎯</span>
          <span className="tracking-wider uppercase">TARGET IDENTIFIED</span>
        </div>

        {/* 1. NPC Archetype Title (Reveals at ~700ms per Section 9) */}
        <div
          className={`text-center py-1 transition-all duration-300 ${
            showType ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-[#17151C] uppercase leading-tight">
            {npc.type}
          </h2>
        </div>

        {/* Visuals Grid: Selected Person Crop & Reaction Meme Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          {/* Section 17: Selected Person Actual Crop (Reveals at ~200ms) */}
          {croppedImage && (
            <div
              className={`relative bg-[#FFF9F2] border-2 border-[#E6DFE5] rounded-[20px] p-3.5 flex flex-col items-center justify-center shadow-xs transition-all duration-300 ${
                showCrop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div className="flex items-center justify-between w-full pb-2 border-b border-[#E6DFE5] mb-2.5">
                <span className="text-[10px] font-mono font-bold text-[#FF7EB6] uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7EB6] animate-ping" />
                  LIVE TARGET
                </span>
                <span className="text-[9px] font-mono font-bold text-[#6F6A76]">CAMERA CROP</span>
              </div>
              <div className="relative w-full rounded-[14px] overflow-hidden bg-white border border-[#E6DFE5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={croppedImage}
                  alt="Selected NPC target from camera"
                  className="w-full h-auto object-contain max-h-[170px] mx-auto"
                />
              </div>
            </div>
          )}

          {/* Section 18-20: Reaction Meme Card with Audio Punchline & Deduplication (Reveals at ~400ms) */}
          <div
            className={`w-full transition-all duration-300 ${
              showMeme ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <MemeCard
              encounterId={encounterId}
              activity={npc.detectedActivity || npc.activity}
              device={
                (npc.detectedActivity || npc.activity || "").toLowerCase().includes("phone")
                  ? "cell phone"
                  : (npc.detectedActivity || npc.activity || "").toLowerCase().includes("laptop")
                  ? "laptop"
                  : null
              }
              groupSize={groupSize}
              usedMemeIds={usedMemeIds}
              onMemeSelected={onMemeSelected}
              usedAudioIds={usedAudioIds}
              onAudioSelected={onAudioSelected}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              previousReactionLabel={previousReactionLabel}
              onLabelSelected={onLabelSelected}
            />
          </div>
        </div>

        {/* NPCCard with Staged Reveal for Activity, Quest, and Roast */}
        <NPCCard npc={npc} revealStage={revealStage} />

        {/* Control Buttons (Section 14 & 15) */}
        <div className="flex items-center gap-3 w-full pt-2">
          <button
            onClick={handleNext}
            className="btn-y2k btn-lavender flex-1 py-3 px-6 text-sm font-display font-black tracking-wider uppercase shadow-md cursor-pointer"
          >
            NEXT VICTIM ➔
          </button>
          <button
            onClick={handleStop}
            className="btn-y2k btn-danger py-3 px-5 text-xs font-body font-bold tracking-wider uppercase shadow-md cursor-pointer"
          >
            STOP SCANNING
          </button>
        </div>
      </div>
    </div>
  );
}
