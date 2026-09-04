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
// MALAYALAM MEME CROWD COMMENTARY BANKS
// Real viral Kerala meme energy
// ============================================

const SOLO_COMMENTARIES = [
  "ONE HUMAN DETECTED. PHONE IN HAND. SOUL CURRENTLY IN AIRPLANE MODE. ഡേയ് ഫോൺ വച്ച് പോയി ചത്തു തുലയെടാ!! 💀",
  "ONE HUMAN DETECTED. PARKED IN PLACE LIKE AN NPC WHO FORGOT THEIR DIALOGUE TREE. ഒരു പണിയും ചെയ്യാതെ ഇവിടെ നിൽക്കുവാണോ?! 😭",
  "ONE HUMAN DETECTED. THE RECTANGLE HAS WON CUSTODY OF THEIR ATTENTION. പണി പാളി ജീവനോടെ പോയി!! 💀",
  "ONE HUMAN DETECTED. STANDING MOTIONLESS IN THE RENDER DISTANCE. സീൻ കോണ്ട്ര മാൻ!! ഓടിക്കോ! 🔥",
  "RARE SPECIES SPOTTED: A HUMAN DOING ABSOLUTELY NOTHING WITH MAXIMUM CONFIDENCE. ഇത് talent ആണ് ഭായ്! 😂",
  "ONE NPC LOCATED. THE SERVER TRIED TO GIVE THEM A PURPOSE. REQUEST TIMED OUT. ലൈഫ് buffering... 💀",
  "SOLO HUMAN. SCROLLING. THE THUMB HAS DEVELOPED FEELINGS. THE BRAIN HAS NOT. ഫോൺ ഇറക്കി വയ്ക്കടേ! 😭",
  "ONE PERSON DETECTED. CONTRIBUTING TO CAMPUS BY... OCCUPYING SPACE. RENT FREE. ചുമ്മാ ഡെക്കറേഷൻ! 💀",
];

const GROUP_COMMENTARIES = [
  "{n} HUMANS HAVE ASSEMBLED. PRODUCTIVITY HAS NOT. എന്താടാ അവിടെ തമാശ കളിക്കുന്നത്?! 💀",
  "{n} HUMANS DETECTED. ONE LAPTOP IS CURRENTLY CARRYING ENTIRE CIVILIZATION. പണി പാളി!! 😭",
  "{n} HUMANS SURROUNDED ONE SCREEN. NOBODY IS TYPING. DEMOCRACY AT WORK. എന്തുവാടെ ഇത്?! 🔥",
  "{n} NPCS IN A CLUSTER. COLLECTIVE BRAIN POWER: ONE CALCULATOR BATTERY. ആരെങ്കിലും ഒരു പണി എടുക്കെടാ! 💀",
  "{n} HUMANS FORMED A COMMITTEE. AGENDA: NONE. OUTCOME: ALSO NONE. MINUTES: WHY BOTHER. സർ ഇത് college ആണ്, parliament അല്ല! 😂",
  "{n} PEOPLE STANDING TOGETHER. WIFI HAS MORE DIRECTION THAN ALL OF THEM COMBINED. ഓടിക്കോ മക്കളേ!! 💀",
  "{n} HUMANS DETECTED. THE AI IS LOSING HOPE IN HUMANITY ONE PIXEL AT A TIME. ദൈവമേ... 😭",
  "{n} NPCS IN FORMATION. ENERGY LEVEL: SWITCHED OFF UPS. MOTIVATION: 404 NOT FOUND. പോയി രണ്ട് പേജ് പഠിക്കടേ! 💀",
];

export default function Home() {
  // Core state
  const [scanning, setScanning] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  
  // Hooks
  const { loadModel, detect, modelReady, modelError } = usePersonDetector();
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

  // Start scanning sequence
  const handleStartScan = useCallback(() => {
    setScanning(true);
    loadModel();
  }, [loadModel]);

  // Stop scanning cleanup
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [cancelSpeech]);

  // Countdown complete -> triggers capture and NPC generation
  const handleCountdownComplete = useCallback(async () => {
    const video = cameraRef.current?.getVideo();
    if (!video || !modelReady) return;

    // Get exact frame detections
    const detections = await detect(video);
    setLiveDetections(detections);
    
    if (detections.length === 0) {
      setLatestCommentary(null);
      return;
    }

    // People detected - pick one
    const targetIndex = Math.floor(Math.random() * detections.length);
    setSelectedDetectionIndex(targetIndex);
    const targetPerson = detections[targetIndex];

    try {
      // Capture the crop
      const cropDataUrl = cropPerson(video, targetPerson);
      setCroppedImage(cropDataUrl);
      
      // Show reveal UI in "loading/classifying" state
      setRevealActive(true);
      setCurrentNPC(null);

      // Determine primary device and activity from COCO-SSD object evidence
      const nearbyObjs = targetPerson.nearbyObjects || [];
      const primaryDevice = nearbyObjs.length > 0 ? nearbyObjs[0] : null;
      const activityLabel = primaryDevice
        ? `using ${primaryDevice}`
        : detections.length > 1
        ? `standing in group of ${detections.length}`
        : "standing motionless";

      // Call API with grounded evidence
      const res = await fetch("/api/npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observation: {
            activity: activityLabel,
            device: primaryDevice,
            groupSize: detections.length,
            movement: "low",
            nearbyObjects: nearbyObjs
          },
          image: cropDataUrl
        })
      });

      if (!res.ok) throw new Error("API response error");
      const npcData = await res.json();
      
      setCurrentNPC(npcData);
      
      // Generate crowd commentary
      const commentaryBank = detections.length === 1 ? SOLO_COMMENTARIES : GROUP_COMMENTARIES;
      const humanCommentary = commentaryBank[
        Math.floor(Math.random() * commentaryBank.length)
      ].replace("{n}", String(detections.length));

      setLatestCommentary(humanCommentary);
      
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

      // Speak the roast
      const spokenText = `${humanCommentary} NPC DETECTED. ${npcData.type}. ${npcData.opinion} Quest: ${npcData.quest}. ${npcData.malayalamStatus}`;

      setTimeout(() => {
        speak(newEncounterId, spokenText, audioMuted);
      }, 1600);
      
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
          setAudioMuted((prev) => {
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
              {/* Status indicator */}
              <div className="flex items-center gap-2 mb-4 px-3 py-1 border border-npc-red/30 bg-npc-red/10">
                <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
                <span className="text-[11px] font-tech tracking-[0.2em] text-npc-red uppercase font-bold">
                  BRAINROT ENGINE READY
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl sm:text-6xl font-orbitron font-black tracking-[0.18em] text-npc-cyan drop-shadow-[0_0_35px_rgba(0,240,255,0.5)] mb-2">
                NPC WATCH
              </h2>
              <p className="text-sm sm:text-base font-tech tracking-[0.15em] text-npc-text-mid uppercase max-w-md mb-8">
                AI sees you. AI roasts you. In Malayalam. 🔥
              </p>

              {/* Initialize Button */}
              <button
                onClick={handleStartScan}
                className="group relative px-10 py-5 border-2 border-npc-cyan text-npc-cyan font-orbitron font-bold tracking-[0.25em] uppercase text-sm sm:text-base hover:bg-npc-cyan hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>START ROASTING</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">➔</span>
                </span>
                <div className="absolute inset-0 bg-npc-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Bottom info */}
              <div className="mt-8 pt-4 border-t border-npc-border/60 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-4 text-[10px] font-tech text-npc-text-dim tracking-wider">
                  <span>COCO-SSD</span>
                  <span>•</span>
                  <span>GEMINI AI</span>
                  <span>•</span>
                  <span>MALAYALAM BRAINROT 💀</span>
                </div>
                <p className="text-[9px] font-mono tracking-wider text-npc-text-dim/70 max-w-sm mx-auto">
                  CAMERA ACCESS REQUIRED. ALL ROASTS ARE FICTIONAL. NO MEDIA STORED. ❤️
                </p>
              </div>
            </div>
          </div>
        )}

        {scanning && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 animate-fade-in">
            {/* Left column: Camera + History */}
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

            {/* Right column: Countdown + Commentary (HUGE) */}
            <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
              <Countdown
                active={scanning && !revealActive && modelReady}
                onComplete={handleCountdownComplete}
              />
              <Commentary 
                peopleCount={liveDetections.length} 
                commentary={latestCommentary} 
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
          NPC WATCH — TINKERHUB USELESS PROJECTS — BRAINROT EDITION 💀
        </span>
      </footer>
    </div>
  );
}
