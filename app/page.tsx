"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { NPCProfile } from "@/lib/types";
import type { EncounterEntry } from "@/app/types/frontend";

import { usePersonDetector } from "@/app/hooks/usePersonDetector";
import { useSpeech } from "@/app/hooks/useSpeech";
import { cropPerson } from "@/app/utils/crop";

import Header from "@/app/components/Header";
import CameraFeed, { CameraFeedHandle } from "@/app/components/CameraFeed";
import Countdown from "@/app/components/Countdown";
import Commentary from "@/app/components/Commentary";
import NPCReveal from "@/app/components/NPCReveal";
import NPCHistory from "@/app/components/NPCHistory";

// ============================================
// ACTIVITY BUILDER — from COCO-SSD evidence
// ============================================

function buildActivityDescription(
  nearbyObjects: string[],
  groupSize: number,
  bboxAspectRatio: number
): string {
  // Infer posture from bounding box aspect ratio
  // Tall/narrow bbox → standing, wide/short → sitting
  const posture = bboxAspectRatio > 1.3 ? "standing" : bboxAspectRatio < 0.9 ? "sitting" : "unclear posture";

  // Determine visible objects
  const hasPhone = nearbyObjects.includes("cell phone");
  const hasLaptop = nearbyObjects.includes("laptop");
  const hasCup = nearbyObjects.includes("cup") || nearbyObjects.includes("bottle");
  const hasBook = nearbyObjects.includes("book");
  const hasBackpack = nearbyObjects.includes("backpack");

  // Build activity string from evidence
  const parts: string[] = [];

  if (posture !== "unclear posture") {
    parts.push(posture);
  }

  if (hasPhone && hasLaptop) {
    parts.push("with phone and laptop");
  } else if (hasPhone) {
    parts.push("while using phone");
  } else if (hasLaptop) {
    parts.push("with laptop");
  }

  if (hasCup) parts.push("holding a drink");
  if (hasBook) parts.push("with a book");
  if (hasBackpack) parts.push("with backpack");

  if (groupSize > 1) {
    parts.push(`in group of ${groupSize}`);
  } else if (parts.length > 0) {
    parts.push("alone");
  }

  if (parts.length === 0) {
    return groupSize > 1 ? `${groupSize} people standing together` : "standing with no visible activity";
  }

  return parts.join(" ");
}

// ============================================
// CROWD COMMENTARY — scene-based one-liners
// ============================================

function generateCrowdOneLiner(count: number, objects: string[]): string {
  const hasLaptops = objects.includes("laptop");
  const hasPhones = objects.includes("cell phone");

  if (count === 0) {
    const lines = [
      "Nobody here. The room has achieved enlightenment.",
      "Zero humans detected. Even the WiFi is lonely.",
      "The room is empty. Peace has been restored.",
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  if (count === 1) {
    if (hasPhones) {
      const lines = [
        "One human detected. One phone detected. One soul missing.",
        "Solo human with phone. The rectangle has won.",
        "One person and their phone. A love story.",
      ];
      return lines[Math.floor(Math.random() * lines.length)];
    }
    if (hasLaptops) {
      const lines = [
        "One human with a laptop. Productivity status: unknown.",
        "Solo human, laptop open. Could be working. Probably not.",
      ];
      return lines[Math.floor(Math.random() * lines.length)];
    }
    const lines = [
      "One human detected. Standing there like the plot forgot about them.",
      "Solo NPC spotted. No visible quest. No visible purpose.",
      "One person detected. Just vibing with existence.",
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  // Multiple people
  if (hasLaptops) {
    const lines = [
      `${count} people have gathered around a laptop. Nobody is typing.`,
      `Someone brought a laptop and accidentally summoned ${count} people.`,
      `${count} humans detected. One laptop. This can only end badly.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  if (hasPhones) {
    const lines = [
      `${count} people detected. Everyone has a phone. Nobody has a plan.`,
      `${count} humans and ${count} phones. Zero conversations happening.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  const lines = [
    `${count} people detected and somehow nobody looks like they know why they're here.`,
    `${count} humans have assembled. Productivity has not.`,
    `${count} people are standing here like the WiFi personally called a meeting.`,
    `Six people detected. The group project has begun. Condolences.`,
    `Another NPC has entered the server.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)].replace("Six", String(count));
}

export default function Home() {
  // Core state
  const [scanning, setScanning] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  
  // Hooks
  const { loadModel, detect, modelReady } = usePersonDetector();
  const { speak, cancelSpeech } = useSpeech();

  const cameraRef = useRef<CameraFeedHandle>(null);
  
  // Real-time detection state
  const [liveDetections, setLiveDetections] = useState<any[]>([]);
  const [latestCommentary, setLatestCommentary] = useState<string | null>(null);
  
  // NPC reveal state
  const [revealActive, setRevealActive] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPCProfile | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedDetectionIndex, setSelectedDetectionIndex] = useState<number | null>(null);

  // Encounter data
  const [encounters, setEncounters] = useState<EncounterEntry[]>([]);

  // Continuous detection loop
  useEffect(() => {
    if (!scanning || revealActive || !modelReady) return;
    
    let cancelled = false;
    let timer: NodeJS.Timeout;
    
    const runDetection = async () => {
      if (cancelled) return;
      const video = cameraRef.current?.getVideo();
      if (video && video.readyState >= 2) {
        const results = await detect(video);
        if (!cancelled) {
          setLiveDetections(results);
        }
      }
      timer = setTimeout(runDetection, 300);
    };
    
    runDetection();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scanning, revealActive, modelReady, detect]);

  // Start scanning
  const handleStartScan = useCallback(() => {
    setScanning(true);
    loadModel();
  }, [loadModel]);

  // Cleanup
  useEffect(() => {
    return () => { cancelSpeech(); };
  }, [cancelSpeech]);

  // Countdown complete → capture, detect activity, generate NPC, speak ONE sentence
  const handleCountdownComplete = useCallback(async () => {
    const video = cameraRef.current?.getVideo();
    if (!video || !modelReady) return;

    const detections = await detect(video);
    setLiveDetections(detections);
    
    if (detections.length === 0) {
      setLatestCommentary("Nobody here. The room has achieved enlightenment.");
      return;
    }

    // Pick one person
    const targetIndex = Math.floor(Math.random() * detections.length);
    setSelectedDetectionIndex(targetIndex);
    const target = detections[targetIndex];

    try {
      const cropDataUrl = cropPerson(video, target);
      setCroppedImage(cropDataUrl);
      setRevealActive(true);
      setCurrentNPC(null);

      // Build grounded activity description from COCO-SSD evidence
      const nearbyObjs: string[] = target.nearbyObjects || [];
      const bboxAspect = target.height / (target.width || 0.01);
      const activityLabel = buildActivityDescription(nearbyObjs, detections.length, bboxAspect);
      const primaryDevice = nearbyObjs.find((o: string) => o === "cell phone" || o === "laptop") || null;

      // Collect all objects across all detections for crowd commentary
      const allObjects = detections.flatMap((d: any) => d.nearbyObjects || []);

      // Generate crowd one-liner
      const crowdLine = generateCrowdOneLiner(detections.length, allObjects);
      setLatestCommentary(crowdLine);

      // Call API
      const res = await fetch("/api/npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observation: {
            activity: activityLabel,
            device: primaryDevice,
            groupSize: detections.length,
            movement: "low",
            nearbyObjects: nearbyObjs,
          },
          image: cropDataUrl,
        }),
      });

      if (!res.ok) throw new Error("API response error");
      const npcData: NPCProfile = await res.json();
      setCurrentNPC(npcData);

      const newEncounterId = encounters.length + 1;
      setEncounters(prev => [
        { id: newEncounterId, npc: npcData, timestamp: Date.now(), croppedImage: cropDataUrl },
        ...prev,
      ]);

      // TTS: speak EXACTLY ONE SENTENCE — the roast + short Malayalam
      const spokenText = `${npcData.roast} ${npcData.malayalamStatus}`;
      setTimeout(() => {
        speak(newEncounterId, spokenText, audioMuted);
      }, 1800);

    } catch (err) {
      console.error("[NPC WATCH] Error generating NPC:", err);
      setRevealActive(false);
      setSelectedDetectionIndex(null);
    }
  }, [modelReady, detect, encounters.length, speak, audioMuted]);

  // Dismiss reveal
  const handleDismissReveal = useCallback(() => {
    setRevealActive(false);
    setCurrentNPC(null);
    setSelectedDetectionIndex(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="scanline-overlay" />

      <Header
        audioMuted={audioMuted}
        onToggleMute={() => {
          setAudioMuted(prev => {
            const next = !prev;
            if (next) cancelSpeech();
            return next;
          });
        }}
      />

      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        {!scanning && (
          <div className="flex flex-col items-center justify-center min-h-[68vh] gap-8 animate-fade-in px-4">
            <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 hud-panel hud-corners max-w-xl w-full text-center border-npc-cyan/30 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.1)]">
              <div className="flex items-center gap-2 mb-4 px-3 py-1 border border-npc-red/30 bg-npc-red/10">
                <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
                <span className="text-[11px] font-tech tracking-[0.2em] text-npc-red uppercase font-bold">
                  MEME ROAST ENGINE READY
                </span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-orbitron font-black tracking-[0.18em] text-npc-cyan drop-shadow-[0_0_35px_rgba(0,240,255,0.5)] mb-2">
                NPC WATCH
              </h2>
              <p className="text-sm sm:text-base font-tech tracking-[0.15em] text-npc-text-mid uppercase max-w-md mb-8">
                The camera sees what you're doing. Then snitches. 🔥
              </p>

              <button
                onClick={handleStartScan}
                className="group relative px-10 py-5 border-2 border-npc-cyan text-npc-cyan font-orbitron font-bold tracking-[0.25em] uppercase text-sm sm:text-base hover:bg-npc-cyan hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>START WATCHING</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">➔</span>
                </span>
                <div className="absolute inset-0 bg-npc-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="mt-8 pt-4 border-t border-npc-border/60 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-4 text-[10px] font-tech text-npc-text-dim tracking-wider">
                  <span>COCO-SSD</span>
                  <span>•</span>
                  <span>GEMINI AI</span>
                  <span>•</span>
                  <span>ONE SENTENCE. ONE ROAST. 💀</span>
                </div>
                <p className="text-[9px] font-mono tracking-wider text-npc-text-dim/70 max-w-sm mx-auto">
                  CAMERA ACCESS REQUIRED. ALL ROASTS ARE FICTIONAL. NO MEDIA STORED.
                </p>
              </div>
            </div>
          </div>
        )}

        {scanning && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 animate-fade-in">
            <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">
              <CameraFeed
                ref={cameraRef}
                active={scanning}
                detections={liveDetections}
                selectedIndex={selectedDetectionIndex}
                onStatusChange={() => {}}
              />
              <NPCHistory encounters={encounters} />
            </div>

            <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
              <Countdown
                active={scanning && !revealActive && modelReady}
                onComplete={handleCountdownComplete}
              />
              <Commentary 
                peopleCount={liveDetections.length} 
                commentary={latestCommentary}
                detectedObjects={liveDetections.flatMap((d: any) => d.nearbyObjects || [])}
              />
            </div>
          </div>
        )}
      </main>

      <NPCReveal
        npc={currentNPC}
        croppedImage={croppedImage}
        active={revealActive}
        onDismiss={handleDismissReveal}
      />

      <footer className="px-4 py-2 border-t border-npc-border/50 text-center">
        <span className="text-[10px] tracking-[0.15em] text-npc-text-dim">
          NPC WATCH — TINKERHUB USELESS PROJECTS 💀
        </span>
      </footer>
    </div>
  );
}
