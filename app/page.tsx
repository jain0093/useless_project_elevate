"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { NPCProfile } from "@/lib/types";
import type { EncounterEntry, FrontendSystemStatus } from "@/app/types/frontend";
import { DEFAULT_SYSTEM_STATUS } from "@/app/types/frontend";

import { usePersonDetector } from "@/app/hooks/usePersonDetector";
import { useMicrophone } from "@/app/hooks/useMicrophone";
import { useSpeech } from "@/app/hooks/useSpeech";
import { captureFrame, cropPerson } from "@/app/utils/crop";

import Header from "@/app/components/Header";
import CameraFeed, { CameraFeedHandle } from "@/app/components/CameraFeed";
import Countdown from "@/app/components/Countdown";
import Commentary from "@/app/components/Commentary";
import NPCReveal from "@/app/components/NPCReveal";
import WorldStatus from "@/app/components/WorldStatus";
import NPCHistory from "@/app/components/NPCHistory";
import SystemStatus from "@/app/components/SystemStatus";

export default function Home() {
  // Core state
  const [scanning, setScanning] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  
  // Hooks
  const { loadModel, detect, modelReady, modelError } = usePersonDetector();
  const { noiseLevel, micStatus, startMicrophone, stopMicrophone } = useMicrophone();
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
  
  // System status
  const [systemStatus, setSystemStatus] = useState<FrontendSystemStatus>(DEFAULT_SYSTEM_STATUS);

  // Update system status based on sub-components
  useEffect(() => {
    setSystemStatus((prev) => ({
      ...prev,
      microphone: micStatus,
      personDetector: modelError ? "ERROR" : modelReady ? "READY" : "LOADING",
    }));
  }, [micStatus, modelReady, modelError]);

  // Handle camera status changes
  const handleCameraStatus = useCallback(
    (status: "ONLINE" | "OFFLINE" | "ERROR") => {
      setSystemStatus((prev) => ({
        ...prev,
        camera: status,
      }));
    },
    []
  );

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

  // Start scanning sequence
  const handleStartScan = useCallback(() => {
    setScanning(true);
    loadModel();
    startMicrophone();
  }, [loadModel, startMicrophone]);

  // Stop scanning
  useEffect(() => {
    return () => {
      stopMicrophone();
      cancelSpeech();
    };
  }, [stopMicrophone, cancelSpeech]);

  // Countdown complete -> triggers capture and NPC generation
  const handleCountdownComplete = useCallback(async () => {
    const video = cameraRef.current?.getVideo();
    if (!video || !modelReady) return;

    // Get exact frame detections
    const detections = await detect(video);
    setLiveDetections(detections);
    
    if (detections.length === 0) {
      // No people - skip NPC generation
      setLatestCommentary(null);
      return;
    }

    // People detected - pick one
    const targetIndex = Math.floor(Math.random() * detections.length);
    setSelectedDetectionIndex(targetIndex);
    const targetPerson = detections[targetIndex];

    try {
      setSystemStatus(prev => ({ ...prev, ai: "CALLING" }));
      
      // Capture the crop
      const cropDataUrl = cropPerson(video, targetPerson);
      setCroppedImage(cropDataUrl);
      
      // Show reveal UI in "loading/classifying" state
      setRevealActive(true);
      setCurrentNPC(null);

      // Call API
      const res = await fetch("/api/npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observation: {
            activity: "unspecified behaviour",
            device: null,
            groupSize: detections.length,
            movement: "medium"
          },
          image: cropDataUrl
        })
      });

      if (!res.ok) throw new Error("API response error");
      const npcData = await res.json();
      
      setCurrentNPC(npcData);
      setLatestCommentary(npcData.opinion);
      
      const newEncounterId = encounters.length + 1;
      
      setEncounters(prev => [
        {
          id: newEncounterId,
          npc: npcData,
          timestamp: Date.now(),
          croppedImage: cropDataUrl
        },
        ...prev
      ]);

      // Speak after small delay to let UI show
      setTimeout(() => {
        speak(newEncounterId, `NPC detected. ${npcData.type}. ${npcData.opinion}`, audioMuted);
      }, 2000);
      
    } catch (err) {
      console.error("[NPC WATCH] Error generating NPC:", err);
      setRevealActive(false);
      setSelectedDetectionIndex(null);
    } finally {
      setSystemStatus(prev => ({ ...prev, ai: "ONLINE" }));
    }
  }, [modelReady, detect, encounters.length, speak, audioMuted]);

  // Dismiss reveal
  const handleDismissReveal = useCallback(() => {
    setRevealActive(false);
    setCurrentNPC(null);
    setSelectedDetectionIndex(null);
  }, []);

  // Derived stats
  const worldStats = {
    humansDetected: liveDetections.length,
    npcsEncountered: encounters.length,
    confusionPercent: 0,
    productivityPercent: 0,
    chummaStanding: 0,
    activeQuests: 0,
    currentVibe: latestCommentary || "CALIBRATING",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="scanline-overlay" />

      <Header
        audioMuted={audioMuted}
        onToggleMute={() => {
          setAudioMuted((prev) => {
            const next = !prev;
            if (next) cancelSpeech();
            return next;
          });
        }}
      />

      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        {!scanning && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
            <div className="text-center flex flex-col gap-3">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[0.15em] text-npc-cyan drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                NPC WATCH
              </h2>
              <p className="text-xs sm:text-sm tracking-[0.2em] text-npc-text-dim uppercase">
                Environmental NPC Detection System v2.0
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
              THIS SYSTEM WILL REQUEST CAMERA AND MIC ACCESS. ALL CLASSIFICATIONS ARE
              FICTIONAL. NO AUDIO OR VIDEO IS RECORDED OR STORED.
            </p>
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
                onStatusChange={handleCameraStatus}
              />
              <NPCHistory encounters={encounters} />
            </div>

            <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Countdown
                  active={scanning && !revealActive && modelReady}
                  onComplete={handleCountdownComplete}
                />
                <Commentary 
                  peopleCount={liveDetections.length} 
                  commentary={latestCommentary} 
                />
              </div>
              <WorldStatus stats={{ ...worldStats, currentVibe: noiseLevel }} />
              <SystemStatus status={systemStatus} />
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
        <span className="text-[9px] tracking-[0.15em] text-npc-text-dim">
          NPC WATCH v2.0 — TINKERHUB USELESS PROJECTS — ALL CLASSIFICATIONS
          FICTIONAL
        </span>
      </footer>
    </div>
  );
}
