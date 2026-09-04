"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { NPCProfile } from "@/lib/types";
import type { EncounterEntry, PersonDetection, ScanState } from "@/app/types/frontend";

import { usePersonDetector } from "@/app/hooks/usePersonDetector";
import { cropPerson, captureFrame } from "@/app/utils/crop";

import Header from "@/app/components/Header";
import CameraFeed, { CameraFeedHandle } from "@/app/components/CameraFeed";
import Countdown from "@/app/components/Countdown";
import Commentary from "@/app/components/Commentary";
import NPCReveal from "@/app/components/NPCReveal";
import NPCHistory from "@/app/components/NPCHistory";
import WorldStatus from "@/app/components/WorldStatus";

// ============================================
// ACTIVITY BUILDER — strictly observable facts
// Do not invent intent (phone = using phone, not texting gf)
// ============================================

function buildObservableActivity(
  nearbyObjects: string[],
  groupSize: number,
  bboxAspectRatio: number
): string {
  // Infer posture strictly from aspect ratio
  // height / width > 1.35 -> standing, < 0.95 -> sitting
  let posture = "Stationary";
  if (bboxAspectRatio > 1.35) {
    posture = "Standing";
  } else if (bboxAspectRatio < 0.95) {
    posture = "Sitting";
  }

  const hasPhone = nearbyObjects.includes("cell phone");
  const hasLaptop = nearbyObjects.includes("laptop");
  const hasCup = nearbyObjects.includes("cup") || nearbyObjects.includes("bottle");
  const hasBook = nearbyObjects.includes("book");
  const hasBackpack = nearbyObjects.includes("backpack");

  const actions: string[] = [];

  if (hasPhone && hasLaptop) {
    actions.push("using laptop and phone");
  } else if (hasPhone) {
    actions.push("using phone");
  } else if (hasLaptop) {
    actions.push("using laptop");
  }

  if (hasCup) actions.push("holding a drink");
  if (hasBook) actions.push("with a book");
  if (hasBackpack) actions.push("carrying backpack");

  if (groupSize > 1) {
    actions.push(`with ${groupSize - 1} other human${groupSize > 2 ? "s" : ""}`);
  } else {
    actions.push("alone");
  }

  if (actions.length === 0) {
    return `${posture} with no visible objects`;
  }

  return `${posture} while ${actions.join(" and ")}`;
}

// ============================================
// DYNAMIC CROWD COMMENTARY — reacts to reality
// ============================================

function getCrowdObservation(detections: PersonDetection[]): string {
  const count = detections.length;
  if (count === 0) {
    return "Nobody here. Everybody escaped the render distance.";
  }

  const allObjects = detections.flatMap((d) => d.nearbyObjects || []);
  const hasLaptop = allObjects.includes("laptop");
  const hasPhone = allObjects.includes("cell phone");

  if (count === 1) {
    if (hasLaptop) return "One human with a laptop. Browsing tabs they will never close.";
    if (hasPhone) return "One human completely absorbed by a glowing glass rectangle.";
    return "One human detected in frame. Objective currently unknown.";
  }

  if (count === 2) {
    if (hasPhone) return "Two humans. One phone. Zero reason to be standing this close.";
    if (hasLaptop) return "Two humans orbiting one screen like moths to a flame.";
    return "Two humans detected. Standing together in silence.";
  }

  if (count >= 3) {
    if (hasLaptop) return `${count} humans have formed a committee around one laptop.`;
    if (hasPhone) return `${count} humans gathered and productivity has left the chat.`;
    return `${count} humans detected and somehow nobody looks employed.`;
  }

  return "Monitoring live targets in surveillance zone.";
}

export default function Home() {
  // Authoritative scanning state machine:
  // "IDLE" | "STOPPED" | "COUNTDOWN" | "ANALYZING" | "NPC_REVEAL" | "NO_VICTIM"
  const [scanState, setScanState] = useState<ScanState | "STOPPED">("IDLE");

  // Camera & Detector
  const { loadModel, detect, modelReady } = usePersonDetector();
  const cameraRef = useRef<CameraFeedHandle>(null);

  // Live detection state
  const [liveDetections, setLiveDetections] = useState<PersonDetection[]>([]);
  const [latestCommentary, setLatestCommentary] = useState<string | null>(null);
  const [currentActivityDisplay, setCurrentActivityDisplay] = useState<string>("IDLE");

  // NPC reveal state
  const [currentNPC, setCurrentNPC] = useState<NPCProfile | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedDetectionIndex, setSelectedDetectionIndex] = useState<number | null>(null);

  // Encounter history
  const [encounters, setEncounters] = useState<EncounterEntry[]>([]);

  // Cancellation ref to discard pending asynchronous API calls if stopped
  const activeSessionRef = useRef<number>(0);

  // Track previous target index to prefer a different person when multiple are present
  const lastTargetIndexRef = useRef<number | null>(null);

  const isScanningActive =
    scanState === "COUNTDOWN" ||
    scanState === "ANALYZING" ||
    scanState === "NPC_REVEAL" ||
    scanState === "NO_VICTIM";

  // ============================================
  // STOP SCANNING — Halts everything immediately
  // ============================================
  const handleStopScanning = useCallback(() => {
    // Invalidate any ongoing asynchronous operations
    activeSessionRef.current += 1;

    // Stop camera video tracks
    cameraRef.current?.stopCamera();

    // Clear all scanning state
    setScanState("STOPPED");
    setLiveDetections([]);
    setSelectedDetectionIndex(null);
    setCurrentNPC(null);
    setCroppedImage(null);
    setCurrentActivityDisplay("OFFLINE");
    setLatestCommentary("The AI has been denied further access to the population.");
  }, []);

  // ============================================
  // START SCANNING — Clean initial or restart flow
  // ============================================
  const handleStartScanning = useCallback(() => {
    activeSessionRef.current += 1;
    setLiveDetections([]);
    setSelectedDetectionIndex(null);
    setCurrentNPC(null);
    setCroppedImage(null);
    setScanState("COUNTDOWN");
    setCurrentActivityDisplay("INITIALIZING...");
    setLatestCommentary("Sensors online. Scanning surveillance grid...");
    loadModel();
  }, [loadModel]);

  // ============================================
  // CONTINUOUS LIVE DETECTION LOOP (COUNTDOWN only)
  // ============================================
  useEffect(() => {
    if (scanState !== "COUNTDOWN" || !modelReady) return;

    let cancelled = false;
    let timer: NodeJS.Timeout;

    const runDetection = async () => {
      if (cancelled) return;
      const video = cameraRef.current?.getVideo();
      if (video && video.readyState >= 2) {
        const results = await detect(video);
        if (!cancelled) {
          setLiveDetections(results);
          // Periodically update crowd commentary from actual detections
          const obs = getCrowdObservation(results);
          setLatestCommentary(obs);
          if (results.length > 0) {
            const first = results[0];
            const aspect = first.height / (first.width || 0.01);
            setCurrentActivityDisplay(
              buildObservableActivity(first.nearbyObjects || [], results.length, aspect)
            );
          } else {
            setCurrentActivityDisplay("NO HUMANS DETECTED");
          }
        }
      }
      if (!cancelled) {
        timer = setTimeout(runDetection, 300);
      }
    };

    runDetection();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scanState, modelReady, detect]);

  // ============================================
  // COUNTDOWN COMPLETE (AFTER EXACT 10 SECONDS)
  // Freeze frame, detect people, pick 1 or NO_VICTIM
  // ============================================
  const handleCountdownComplete = useCallback(async () => {
    if (scanState !== "COUNTDOWN") return;

    const sessionId = activeSessionRef.current;
    setScanState("ANALYZING");

    const video = cameraRef.current?.getVideo();
    if (!video || !modelReady) {
      if (sessionId === activeSessionRef.current) {
        setScanState("NO_VICTIM");
      }
      return;
    }

    // Capture current frame and run fresh detection
    const detections = await detect(video);
    if (sessionId !== activeSessionRef.current) return;

    setLiveDetections(detections);

    // ZERO PEOPLE HANDLING — Do not hallucinate NPC!
    if (detections.length === 0) {
      setCurrentActivityDisplay("RENDER DISTANCE EMPTY");
      setLatestCommentary("NO VICTIM FOUND. Everybody escaped the render distance.");
      setScanState("NO_VICTIM");
      return;
    }

    // SELECT ONE PERSON (prefer different from last if multiple people visible)
    let targetIndex = 0;
    if (detections.length > 1) {
      const candidates = detections
        .map((_, idx) => idx)
        .filter((idx) => idx !== lastTargetIndexRef.current);
      targetIndex =
        candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : Math.floor(Math.random() * detections.length);
    }
    lastTargetIndexRef.current = targetIndex;
    setSelectedDetectionIndex(targetIndex);

    const target = detections[targetIndex];

    try {
      // 1. Crop selected person from current frame
      const cropDataUrl = cropPerson(video, target);
      setCroppedImage(cropDataUrl);

      // 2. Build grounded observable activity from COCO-SSD signals
      const nearbyObjs: string[] = target.nearbyObjects || [];
      const bboxAspect = target.height / (target.width || 0.01);
      const activityLabel = buildObservableActivity(nearbyObjs, detections.length, bboxAspect);
      const primaryDevice =
        nearbyObjs.find((o) => o === "cell phone" || o === "laptop") || null;

      setCurrentActivityDisplay(activityLabel);

      // 3. Request NPC Generation from backend
      const res = await fetch("/api/npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observation: {
            activity: activityLabel,
            device: primaryDevice,
            groupSize: detections.length,
            movement: "stationary",
            nearbyObjects: nearbyObjs,
          },
          image: cropDataUrl,
        }),
      });

      if (sessionId !== activeSessionRef.current) return;

      if (!res.ok) throw new Error("API response error");
      const npcData: NPCProfile = await res.json();

      if (sessionId !== activeSessionRef.current) return;

      setCurrentNPC(npcData);

      const newEncounterId = encounters.length + 1;
      setEncounters((prev) => [
        {
          id: newEncounterId,
          npc: npcData,
          timestamp: Date.now(),
          croppedImage: cropDataUrl,
        },
        ...prev,
      ]);

      // 4. TRANSITION TO NPC REVEAL (FROZEN UNTIL USER CLICKS NEXT VICTIM)
      setScanState("NPC_REVEAL");
    } catch (err) {
      console.error("[NPC WATCH] Error during analysis:", err);
      if (sessionId === activeSessionRef.current) {
        setScanState("NO_VICTIM");
      }
    }
  }, [scanState, modelReady, detect, encounters.length]);

  // ============================================
  // NEXT VICTIM — User explicitly continues
  // ============================================
  const handleNextVictim = useCallback(() => {
    // Clear selected NPC and target
    setCurrentNPC(null);
    setCroppedImage(null);
    setSelectedDetectionIndex(null);

    // Return to live camera with a fresh 10-second countdown
    setScanState("COUNTDOWN");
    setLatestCommentary("Acquiring next victim...");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="scanline-overlay" />

      {/* Header with real system status and STOP SCANNING button */}
      <Header
        scanning={isScanningActive}
        onStopScanning={handleStopScanning}
      />

      <main className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col">
        {/* ==================================================== */}
        {/* START SCREEN (IDLE or STOPPED)                      */}
        {/* ==================================================== */}
        {!isScanningActive && (
          <div className="flex flex-col items-center justify-center my-auto min-h-[65vh] gap-6 px-4 animate-fade-in">
            <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 hud-panel hud-corners max-w-xl w-full text-center border-npc-cyan/40 bg-black/70 backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.15)]">
              {scanState === "STOPPED" ? (
                <>
                  <div className="flex items-center gap-2 mb-4 px-3 py-1 border border-npc-red/40 bg-npc-red/10">
                    <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
                    <span className="text-[11px] font-tech tracking-[0.2em] text-npc-red uppercase font-bold">
                      SCANNING STOPPED
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-orbitron font-black tracking-[0.15em] text-foreground mb-3">
                    FEED TERMINATED
                  </h2>
                  <p className="text-sm font-tech tracking-[0.15em] text-npc-text-mid uppercase max-w-md mb-8 leading-relaxed">
                    The AI has been denied further access to the population. Camera sensors have been powered down.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 px-3 py-1 border border-npc-cyan/40 bg-npc-cyan/10">
                    <span className="w-2 h-2 rounded-full bg-npc-cyan animate-pulse-glow" />
                    <span className="text-[11px] font-tech tracking-[0.2em] text-npc-cyan uppercase font-bold">
                      SURVEILLANCE RADAR READY
                    </span>
                  </div>

                  <h2 className="text-4xl sm:text-6xl font-orbitron font-black tracking-[0.18em] text-npc-cyan drop-shadow-[0_0_35px_rgba(0,240,255,0.5)] mb-3">
                    NPC WATCH
                  </h2>
                  <p className="text-sm sm:text-base font-tech tracking-[0.15em] text-npc-text-mid uppercase max-w-md mb-8">
                    Let&apos;s see who&apos;s cooked. The camera sees. The AI judges. 💀
                  </p>
                </>
              )}

              {/* Big START SCANNING button */}
              <button
                onClick={handleStartScanning}
                className="group relative px-10 py-5 border-2 border-npc-cyan text-npc-cyan font-orbitron font-bold tracking-[0.25em] uppercase text-sm sm:text-base hover:bg-npc-cyan hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>START SCANNING</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">➔</span>
                </span>
                <div className="absolute inset-0 bg-npc-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="mt-8 pt-4 border-t border-npc-border/60 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-4 text-[10px] font-tech text-npc-text-dim tracking-wider">
                  <span>LOCAL COCO-SSD</span>
                  <span>•</span>
                  <span>10s COUNTDOWN</span>
                  <span>•</span>
                  <span>VISUAL ONLY</span>
                </div>
                <p className="text-[9px] font-mono tracking-wider text-npc-text-dim/70 max-w-sm mx-auto">
                  CAMERA ACCESS REQUIRED FOR PERSON DETECTION. NO AUDIO OR MEDIA STORED.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ACTIVE SCANNING HUD (COUNTDOWN / ANALYZING / ETC)   */}
        {/* ==================================================== */}
        {isScanningActive && (
          <div className="flex flex-col gap-3 sm:gap-4 animate-fade-in">
            {/* Top Control Bar with Live Status & Stop Button */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/60 border border-npc-border rounded-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-npc-cyan animate-pulse-glow" />
                <span className="text-xs font-tech tracking-[0.2em] text-npc-cyan font-bold uppercase">
                  STATUS: {scanState === "COUNTDOWN" ? "COUNTDOWN ACTIVE" : scanState}
                </span>
              </div>

              <button
                onClick={handleStopScanning}
                className="px-4 py-1.5 border border-npc-red/80 text-npc-red bg-npc-red/10 hover:bg-npc-red hover:text-black font-tech text-xs tracking-wider uppercase font-bold transition-all duration-200"
              >
                STOP SCANNING
              </button>
            </div>

            {/* Main HUD Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              {/* Left Column: Live Camera + NPC History */}
              <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
                <CameraFeed
                  ref={cameraRef}
                  active={isScanningActive && scanState !== "NO_VICTIM"}
                  detections={liveDetections}
                  selectedIndex={selectedDetectionIndex}
                />
                <NPCHistory encounters={encounters} />
              </div>

              {/* Right Column: Countdown / State Screens + Commentary + Telemetry */}
              <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
                {/* 10-Second Countdown */}
                {scanState === "COUNTDOWN" && (
                  <Countdown
                    active={modelReady}
                    duration={10}
                    onComplete={handleCountdownComplete}
                  />
                )}

                {/* Analyzing Screen */}
                {scanState === "ANALYZING" && (
                  <div className="hud-panel p-8 flex flex-col items-center justify-center gap-4 rounded-xs border border-npc-amber/60 bg-black/80 text-center animate-pulse">
                    <div className="w-10 h-10 border-2 border-npc-amber border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-orbitron font-bold tracking-[0.2em] text-npc-amber uppercase">
                      ANALYZING SELECTED TARGET...
                    </span>
                    <p className="text-xs font-tech tracking-wider text-npc-text-dim uppercase">
                      Evaluating observable posture, devices, and situation.
                    </p>
                  </div>
                )}

                {/* NO VICTIM FOUND SCREEN */}
                {scanState === "NO_VICTIM" && (
                  <div className="hud-panel p-6 sm:p-8 flex flex-col items-center justify-center gap-4 rounded-xs border border-npc-red/60 bg-black/80 text-center">
                    <div className="px-3 py-1 bg-npc-red/20 border border-npc-red text-npc-red font-tech text-xs tracking-widest font-bold uppercase">
                      SCAN COMPLETED
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-orbitron font-black text-npc-red tracking-wider">
                      NO VICTIM FOUND
                    </h3>
                    <p className="text-sm font-tech tracking-wider text-npc-text-mid max-w-sm">
                      &ldquo;Everybody escaped the render distance.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => {
                          setScanState("COUNTDOWN");
                        }}
                        className="px-6 py-3 border-2 border-npc-cyan text-npc-cyan hover:bg-npc-cyan hover:text-black font-orbitron font-bold text-xs tracking-[0.2em] uppercase transition-all duration-200"
                      >
                        SCAN AGAIN
                      </button>
                      <button
                        onClick={handleStopScanning}
                        className="px-6 py-3 border border-npc-red text-npc-red hover:bg-npc-red hover:text-black font-orbitron font-bold text-xs tracking-[0.2em] uppercase transition-all duration-200"
                      >
                        STOP SCANNING
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Scene Commentary */}
                <Commentary
                  peopleCount={liveDetections.length}
                  commentary={latestCommentary}
                  detectedObjects={liveDetections.flatMap((d) => d.nearbyObjects || [])}
                />

                {/* Real World Status Telemetry */}
                <WorldStatus
                  humansDetected={liveDetections.length}
                  npcsEncountered={encounters.length}
                  currentActivity={currentActivityDisplay}
                  scanningActive={isScanningActive}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* NPC REVEAL MODAL (STAYS OPEN UNTIL NEXT VICTIM)      */}
      {/* ==================================================== */}
      <NPCReveal
        npc={currentNPC}
        croppedImage={croppedImage}
        active={scanState === "NPC_REVEAL"}
        onNextVictim={handleNextVictim}
        onStopScanning={handleStopScanning}
      />

      <footer className="px-4 py-2 border-t border-npc-border/50 text-center">
        <span className="text-[10px] tracking-[0.15em] text-npc-text-dim">
          NPC WATCH — TINKERHUB USELESS PROJECTS 💀
        </span>
      </footer>
    </div>
  );
}
