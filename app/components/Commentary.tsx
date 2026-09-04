"use client";

import { useEffect, useState } from "react";
import type { SceneAnalysis } from "@/lib/types";

interface CommentaryProps {
  scene: SceneAnalysis | null;
}

export default function Commentary({ scene }: CommentaryProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  const commentary = scene?.sceneCommentary || "AWAITING VISUAL DATA...";

  // Typewriter effect for scene commentary
  useEffect(() => {
    setDisplayedText("");
    setTextIndex(0);
  }, [commentary]);

  useEffect(() => {
    if (textIndex < commentary.length) {
      const timer = setTimeout(() => {
        setDisplayedText(commentary.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 25);
      return () => clearTimeout(timer);
    }
  }, [textIndex, commentary]);

  const mainObservation = scene?.observations?.[0];

  return (
    <div className="hud-panel p-4 flex flex-col gap-3">
      <div className="text-[10px] tracking-[0.2em] uppercase text-npc-text-dim">
        Live Observation
      </div>

      {/* People count */}
      <div className="text-sm font-bold text-npc-amber tracking-wider">
        {scene ? `${scene.peopleCount} HUMANS DETECTED` : "0 HUMANS DETECTED"}
      </div>

      {/* Observations */}
      {mainObservation && (
        <div className="flex flex-col gap-1.5 text-xs text-npc-text-mid">
          <div className="flex items-center gap-2">
            <span className="text-npc-cyan-dim">▸</span>
            <span className="uppercase">
              {mainObservation.groupSize > 1
                ? `${mainObservation.groupSize} HUMANS`
                : "ONE HUMAN"}{" "}
              ENGAGED IN {mainObservation.activity.toUpperCase()}
            </span>
          </div>
          {mainObservation.device && (
            <div className="flex items-center gap-2">
              <span className="text-npc-cyan-dim">▸</span>
              <span className="uppercase">
                DEVICE: {mainObservation.device.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-npc-cyan-dim">▸</span>
            <span className="uppercase">
              MOVEMENT LEVEL: {mainObservation.movement.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Additional observations */}
      {scene && scene.observations.length > 1 && (
        <div className="text-[10px] text-npc-text-dim tracking-wider">
          +{scene.observations.length - 1} MORE OBSERVATION
          {scene.observations.length - 1 > 1 ? "S" : ""}
        </div>
      )}

      {/* Typewriter commentary */}
      <div className="mt-1 pt-2 border-t border-npc-border">
        <p className="text-[11px] text-npc-text-mid leading-relaxed tracking-wide min-h-[2.5em]">
          {displayedText}
          {textIndex < commentary.length && (
            <span className="inline-block w-[6px] h-[12px] bg-npc-cyan/60 ml-0.5 animate-pulse-glow" />
          )}
        </p>
      </div>
    </div>
  );
}
