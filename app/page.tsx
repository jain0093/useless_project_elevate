"use client";

import { useState, useCallback } from "react";
import type { NPCProfile, SceneAnalysis } from "@/lib/types";
import type { EncounterEntry, WorldStats, SystemStatusType } from "@/app/types/frontend";
import {
  DEFAULT_WORLD_STATS,
  DEFAULT_SYSTEM_STATUS,
} from "@/app/types/frontend";
import { getRandomMockNPC, getMockSceneAnalysis } from "@/app/data/mock-npcs";

import Header from "@/app/components/Header";
import CameraFeed from "@/app/components/CameraFeed";
import Countdown from "@/app/components/Countdown";
import Commentary from "@/app/components/Commentary";
import NPCReveal from "@/app/components/NPCReveal";
import WorldStatus from "@/app/components/WorldStatus";
import NPCHistory from "@/app/components/NPCHistory";
import SystemStatus from "@/app/components/SystemStatus";

const VIBES = [
  "CHAOTIC NEUTRAL",
  "MILDLY PRODUCTIVE",
  "EXISTENTIAL",
  "CAFFEINATED",
  "SUSPICIOUS",
  "AGGRESSIVELY CHILL",
  "BUFFERING",
  "QUESTIONABLE",
  "VAGUELY PURPOSEFUL",
];

export default function Home() {
  // Core state
  const [scanning, setScanning] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [encounterCount, setEncounterCount] = useState(0);

  // NPC reveal state
  const [revealActive, setRevealActive] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPCProfile | null>(null);

  // Data state
  const [latestScene, setLatestScene] = useState<SceneAnalysis | null>(null);
  const [encounters, setEncounters] = useState<EncounterEntry[]>([]);
  const [worldStats, setWorldStats] = useState<WorldStats>(DEFAULT_WORLD_STATS);
  const [systemStatus, setSystemStatus] =
    useState<SystemStatusType>(DEFAULT_SYSTEM_STATUS);

  // Handle camera status changes
  const handleCameraStatus = useCallback(
    (status: "ONLINE" | "OFFLINE" | "ERROR") => {
      setSystemStatus((prev) => ({
        ...prev,
        camera: status === "ONLINE" ? "ONLINE" : status === "ERROR" ? "ERROR" : "OFFLINE",
      }));
    },
    []
  );

  // Start scanning
  const handleStartScan = useCallback(() => {
    setScanning(true);
    setSystemStatus((prev) => ({
      ...prev,
      microphone: "OFFLINE",
      ai: "ONLINE",
    }));
    // Generate initial mock scene
    setLatestScene(getMockSceneAnalysis());
  }, []);

  // Countdown complete → trigger NPC reveal
  const handleCountdownComplete = useCallback(() => {
    // Generate new mock data
    const newScene = getMockSceneAnalysis();
    setLatestScene(newScene);

    const npc = getRandomMockNPC();
    setCurrentNPC(npc);
    setRevealActive(true);

    // Update world stats
    const newCount = encounterCount + 1;
    setEncounterCount(newCount);

    setWorldStats((prev) => ({
      humansDetected: prev.humansDetected + newScene.peopleCount,
      npcsEncountered: newCount,
      confusionPercent: Math.min(99, Math.round(Math.random() * 40 + 30)),
      productivityPercent: Math.max(1, Math.round(Math.random() * 30)),
      chummaStanding: prev.chummaStanding + Math.floor(Math.random() * 3),
      activeQuests: newCount,
      currentVibe: VIBES[Math.floor(Math.random() * VIBES.length)],
    }));

    // Add to encounter log
    setEncounters((prev) => [
      {
        id: newCount,
        npc,
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    // Speak NPC info if unmuted
    if (!audioMuted && typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(
        `NPC detected. ${npc.type}. ${npc.opinion}`
      );
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, [encounterCount, audioMuted]);

  // Dismiss NPC reveal
  const handleDismissReveal = useCallback(() => {
    setRevealActive(false);
    setCurrentNPC(null);
    // Generate new scene for next cycle
    setLatestScene(getMockSceneAnalysis());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* CRT Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Header */}
      <Header
        audioMuted={audioMuted}
        onToggleMute={() => setAudioMuted((prev) => !prev)}
      />

      {/* Main content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        {/* Pre-scan: Start button */}
        {!scanning && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
            <div className="text-center flex flex-col gap-3">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[0.15em] text-npc-cyan drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                NPC WATCH
              </h2>
              <p className="text-xs sm:text-sm tracking-[0.2em] text-npc-text-dim uppercase">
                Environmental NPC Detection System v0.1
              </p>
            </div>

            <button
              onClick={handleStartScan}
              className="group relative px-8 py-4 border border-npc-cyan/40 text-npc-cyan tracking-[0.2em] uppercase text-sm hover:border-npc-cyan hover:bg-npc-cyan/5 transition-all duration-300"
            >
              <span className="relative z-10">Initialize Scanner</span>
              <div className="absolute inset-0 bg-npc-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <p className="text-[10px] tracking-wider text-npc-text-dim max-w-sm text-center">
              THIS SYSTEM WILL REQUEST CAMERA ACCESS. ALL CLASSIFICATIONS ARE
              FICTIONAL. NO PERSONAL DATA IS STORED.
            </p>
          </div>
        )}

        {/* Scanning: Full dashboard */}
        {scanning && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 animate-fade-in">
            {/* Left column: Camera + History */}
            <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">
              <CameraFeed
                active={scanning}
                onStatusChange={handleCameraStatus}
              />
              <NPCHistory encounters={encounters} />
            </div>

            {/* Right column: Countdown, Commentary, World, System */}
            <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Countdown
                  active={scanning && !revealActive}
                  onComplete={handleCountdownComplete}
                />
                <Commentary scene={latestScene} />
              </div>
              <WorldStatus stats={worldStats} />
              <SystemStatus status={systemStatus} />
            </div>
          </div>
        )}
      </main>

      {/* NPC Reveal overlay */}
      <NPCReveal
        npc={currentNPC}
        active={revealActive}
        onDismiss={handleDismissReveal}
      />

      {/* Footer */}
      <footer className="px-4 py-2 border-t border-npc-border/50 text-center">
        <span className="text-[9px] tracking-[0.15em] text-npc-text-dim">
          NPC WATCH v0.1 — TINKERHUB USELESS PROJECTS — ALL CLASSIFICATIONS
          FICTIONAL
        </span>
      </footer>
    </div>
  );
}
