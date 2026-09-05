"use client";

import { useEffect, useState, useRef } from "react";
import {
  MemeItem,
  MemeAudioClip,
  selectDeduplicatedMeme,
  selectDeduplicatedAudioClip,
  playReactionAudio,
  getRotatingReactionLabel,
} from "@/lib/meme-audio-engine";

interface MemeCardProps {
  encounterId: number;
  activity: string;
  device?: string | null;
  groupSize?: number;
  usedMemeIds?: string[];
  onMemeSelected?: (memeId: string) => void;
  usedAudioIds?: string[];
  onAudioSelected?: (audioId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  previousReactionLabel?: string;
  onLabelSelected?: (label: string) => void;
}

export default function MemeCard({
  encounterId,
  activity,
  device,
  groupSize = 1,
  usedMemeIds = [],
  onMemeSelected,
  usedAudioIds = [],
  onAudioSelected,
  soundEnabled,
  onToggleSound,
  previousReactionLabel,
  onLabelSelected,
}: MemeCardProps) {
  const [audioStatus, setAudioStatus] = useState<"IDLE" | "PLAYING" | "ENDED" | "FAILED">("IDLE");
  const [meme, setMeme] = useState<MemeItem | null>(null);
  const [audioClip, setAudioClip] = useState<MemeAudioClip | null>(null);
  const [reactionLabel, setReactionLabel] = useState<string>("TARGET LOCKED");

  // Prevent double playback across component re-renders (Section 7, 9, 13)
  const currentEncounterRef = useRef<number>(encounterId);
  currentEncounterRef.current = encounterId;
  const playedEncounterRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Initialize deduplicated meme, audio clip & rotating encounter label when encounter opens
  useEffect(() => {
    // 1. Select deduplicated meme strictly matching validated CV activity
    const { meme: selectedMeme } = selectDeduplicatedMeme(
      activity,
      groupSize,
      usedMemeIds
    );
    setMeme(selectedMeme);
    onMemeSelected?.(selectedMeme.id);

    // 2. Select deduplicated audio clip from the 9-clip master library (Section 6, 10, 11)
    const { clip: selectedClip } = selectDeduplicatedAudioClip(
      activity,
      device,
      groupSize,
      usedAudioIds
    );
    setAudioClip(selectedClip);
    onAudioSelected?.(selectedClip.id);

    // 3. Rotate encounter label without repeating previous
    const label = getRotatingReactionLabel(previousReactionLabel);
    setReactionLabel(label);
    onLabelSelected?.(label);

    // 4. Prevent double playback across re-renders (Section 9)
    if (playedEncounterRef.current === encounterId) {
      return;
    }

    const thisEncounter = encounterId;

    // 5. Staged reveal timing (Section 8 & 9):
    // Window opens -> meme card visible -> ~450ms audio begins automatically!
    const audioTimer = setTimeout(async () => {
      if (currentEncounterRef.current !== thisEncounter) return;
      if (!soundEnabledRef.current) return;

      playedEncounterRef.current = thisEncounter;
      const result = await playReactionAudio(
        selectedClip,
        true,
        thisEncounter,
        (status) => setAudioStatus(status),
        activity
      );
      if (result.autoplayBlocked) {
        setAudioStatus("FAILED");
      }
    }, 450);

    return () => {
      if (currentEncounterRef.current !== thisEncounter) {
        clearTimeout(audioTimer);
      }
    };
  }, [encounterId]);

  // Handle manual play/replay button click (Section 10 & 11)
  const handleManualPlay = async () => {
    if (!audioClip) return;
    setAudioStatus("PLAYING");
    const res = await playReactionAudio(
      audioClip,
      true,
      encounterId,
      (status) => setAudioStatus(status),
      activity
    );
    if (res.autoplayBlocked) {
      setAudioStatus("FAILED");
    }
  };

  if (!meme) return null;

  const isPlaying = audioStatus === "PLAYING";

  return (
    <div className="w-full bg-white border-2 border-[#E6DFE5] rounded-[22px] p-4 sm:p-5 shadow-[0_6px_24px_rgba(23,21,28,0.06)] flex flex-col gap-3.5 transition-all duration-300 animate-pop">
      {/* Header: Rotating Reaction Label & Sound Controls (Section 6 & 11) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-[#17151C]">
            {reactionLabel}
          </span>
        </div>

        {/* Audio Toggle: 🔊 SOUND ON / 🔇 SOUND OFF (Section 6) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer select-none ${
              soundEnabled
                ? "bg-[#FFF4C2] border-[#FFE68A] text-[#8C7400] hover:bg-[#FFE68A]"
                : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200"
            }`}
            title={soundEnabled ? "Mute audio punchline" : "Enable audio punchline"}
          >
            <span>{soundEnabled ? "🔊" : "🔇"}</span>
            <span className="font-mono text-[10px] uppercase font-bold">
              {soundEnabled ? (isPlaying ? "PLAYING..." : "SOUND ON") : "SOUND OFF"}
            </span>
            {isPlaying && (
              <span className="flex gap-0.5 ml-1">
                <span className="w-1 h-3 bg-[#FF7EB6] rounded-full animate-bounce" />
                <span className="w-1 h-3 bg-[#8ED8FF] rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-3 bg-[#FFE68A] rounded-full animate-bounce [animation-delay:0.3s]" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Meme Visual Frame */}
      <div className="relative bg-[#FFF3F8] border-2 border-[#FFD1E3] rounded-[20px] p-4 flex flex-col items-center justify-center text-center overflow-hidden shadow-inner">
        {/* Decorative corner stars */}
        <span className="absolute top-2.5 left-3 text-[#FF7EB6] text-xs select-none">✦</span>
        <span className="absolute top-2.5 right-3 text-[#8ED8FF] text-xs select-none">✧</span>

        {/* Tag badge */}
        <span
          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider uppercase border mb-2 ${meme.badgeColor}`}
        >
          {meme.tag}
        </span>

        {/* Big Expressive Emoji / Reaction Visual */}
        <div className="text-5xl sm:text-6xl py-1.5 my-1 drop-shadow-sm select-none animate-float">
          {meme.emoji}
        </div>

        {/* Meme Title in Malayalam meme headline caps */}
        <h3 className="font-display font-black text-base sm:text-lg text-[#17151C] tracking-tight mt-1 leading-snug">
          {meme.title}
        </h3>

        {/* Dialogue Line */}
        <p className="font-body text-xs sm:text-sm text-[#17151C] font-semibold italic mt-1.5 max-w-sm">
          {meme.dialogue}
        </p>

        {/* English Translation */}
        <p className="font-body text-[11px] text-[#6F6A76] mt-1 max-w-sm">
          {meme.englishTranslation}
        </p>

        {/* Section 10 & 11: Prominent Visible Audio Control Button */}
        <div className="mt-3.5 w-full flex flex-col items-center gap-1.5">
          <button
            onClick={handleManualPlay}
            className={`w-full max-w-xs px-4 py-2 rounded-xl font-display font-bold text-xs shadow-sm transition-all active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer ${
              audioStatus === "PLAYING"
                ? "bg-[#DDF5FF] text-[#0D6E9E] border-2 border-[#8ED8FF] shadow-[0_3px_0_#8ED8FF]"
                : audioStatus === "ENDED"
                ? "bg-[#FFF4C2] text-[#8C7400] border-2 border-[#FFE68A] hover:bg-[#FFE68A] shadow-[0_3px_0_#FFE68A]"
                : audioStatus === "FAILED"
                ? "bg-[#FF7EB6] text-white border-2 border-[#D95A92] shadow-[0_3px_0_#D95A92] animate-bounce"
                : "bg-[#FF7EB6] hover:bg-[#FF65A7] text-white border-2 border-[#D95A92] shadow-[0_3px_0_#D95A92]"
            }`}
          >
            <span>🔊</span>
            <span className="tracking-wide uppercase">
              {audioStatus === "PLAYING"
                ? "PLAYING"
                : audioStatus === "ENDED"
                ? "REPLAY REACTION"
                : audioStatus === "FAILED"
                ? "TAP TO PLAY REACTION"
                : "PLAY REACTION"}
            </span>
          </button>
          <span className="text-[10px] font-mono text-[#8A8494]">
            CLIP: {audioClip?.id || "MEME"} • ⏱ {audioClip?.duration ? `${audioClip.duration}s` : ""} • {audioClip?.title || "MALAYALAM"}
          </span>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[10px] text-[#8A8494] font-mono px-1">
        <span>MALAYALAM MEME REACTION</span>
        <span>100% VISUAL CV GROUNDED</span>
      </div>
    </div>
  );
}
