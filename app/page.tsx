"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { NPCProfile } from "@/lib/types";
import type { EncounterEntry, PersonDetection, ScanState } from "@/app/types/frontend";

import { usePersonDetector } from "@/app/hooks/usePersonDetector";
import { cropPerson, cropContextRegion } from "@/app/utils/crop";
import { computeDeterministicActivity } from "@/lib/deterministic-activity";

import Header from "@/app/components/Header";
import CameraFeed, { CameraFeedHandle } from "@/app/components/CameraFeed";
import Countdown from "@/app/components/Countdown";
import Commentary from "@/app/components/Commentary";
import NPCReveal from "@/app/components/NPCReveal";
import NPCHistory from "@/app/components/NPCHistory";
import WorldStatus from "@/app/components/WorldStatus";
import { primeAudioPlayback, stopReactionAudio } from "@/lib/meme-audio-engine";

// ============================================
// ACTIVITY BUILDER — strictly observable facts
// Grounded in COCO-SSD object and posture evidence
// ============================================

function buildObservableActivity(target: PersonDetection): string {
  const hasPhone =
    target.associatedObjects?.some((o) => o.associated && o.label === "cell phone") ?? false;
  const hasLaptop =
    target.associatedObjects?.some((o) => o.associated && o.label === "laptop") ?? false;

  return computeDeterministicActivity({
    posture: target.posture || "stationary",
    postureConfidence: target.postureConfidence ?? 0.85,
    movement: target.movement || "stationary",
    movementConfidence: target.movementConfidence ?? 0.90,
    phoneAssociated: hasPhone,
    laptopAssociated: hasLaptop,
    isOccludedOrLowConfidence: target.confidenceGate === "LOW" || target.groundedActivity === "activity unclear",
  }).activity;
}

// ============================================
// DYNAMIC CROWD COMMENTARY — Section 28
// Human reaction lines grounded in camera evidence
// ============================================

function getCrowdObservationLines(detections: PersonDetection[]): string[] {
  const count = detections.length;
  if (count === 0) {
    return [
      "The lobby is empty.",
      "Everyone successfully escaped judgment.",
      "Standing by for human presence.",
    ];
  }

  const lines: string[] = [];

  // 1. Observable item & action detection
  const hasPhone = detections.some((d) => d.nearbyObjects?.includes("cell phone"));
  const hasLaptop = detections.some((d) => d.nearbyObjects?.includes("laptop"));
  const hasWalking = detections.some((d) => d.movement === "walking");
  const hasSitting = detections.some((d) => d.posture === "sitting");
  const hasDrink = detections.some(
    (d) => d.nearbyObjects?.includes("bottle") || d.nearbyObjects?.includes("cup")
  );
  const hasBook = detections.some((d) => d.nearbyObjects?.includes("book"));

  if (hasWalking && hasPhone) {
    lines.push("Someone is speed-walking with their phone. Brave.");
  } else if (hasPhone) {
    lines.push("One human completely absorbed by a glowing glass rectangle.");
  }

  if (hasLaptop && count > 1) {
    lines.push("Three people around one laptop. Good luck.");
  } else if (hasLaptop) {
    lines.push("That laptop has been open for a while. Interesting.");
  }

  if (count >= 3 && !hasLaptop) {
    lines.push("Why has everyone congregated in this exact spot.");
  } else if (count === 2 && !hasLaptop && !hasPhone) {
    lines.push("Two humans standing in silence. Zero words exchanged.");
  }

  if (hasSitting && !hasLaptop && !hasPhone) {
    lines.push("Bro is just sitting there with zero mission.");
  }

  if (hasDrink) {
    lines.push("Emergency iced beverage deployed.");
  }

  if (hasBook) {
    lines.push("Target holding an actual paper book in 2026. Wild.");
  }

  // Fallback / human closing reaction
  if (lines.length === 0) {
    if (count === 1) {
      lines.push("Bro is just existing in frame. No dialogue.");
    } else {
      lines.push("We have a situation. Multiple humans detected.");
    }
  }

  lines.push("Nobody appears to have a plan.");

  return lines.slice(0, 4);
}

export default function Home() {
  // Authoritative scanning state machine:
  // "IDLE" | "COUNTDOWN" | "ANALYZING" | "NPC_REVEAL" | "NO_VICTIM"
  const [scanState, setScanState] = useState<ScanState>("IDLE");

  // Camera & Detector
  const { loadModel, detect, modelReady } = usePersonDetector();
  const cameraRef = useRef<CameraFeedHandle>(null);

  // Live detection state
  const [liveDetections, setLiveDetections] = useState<PersonDetection[]>([]);
  const [observationLines, setObservationLines] = useState<string[]>([]);
  const [latestCommentary, setLatestCommentary] = useState<string | null>(null);
  const [currentActivityDisplay, setCurrentActivityDisplay] = useState<string>("IDLE");

  // NPC reveal state
  const [currentNPC, setCurrentNPC] = useState<NPCProfile | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedDetectionIndex, setSelectedDetectionIndex] = useState<number | null>(null);

  // Developer debug mode (Section 38)
  const [debugMode, setDebugMode] = useState(false);

  // Toggle debug mode with Shift+D or Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.shiftKey && (e.key === "D" || e.key === "d")) || (e.ctrlKey && e.key === "d")) {
        e.preventDefault();
        setDebugMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Section 11 & Part 12: Session-level Deduplication State
  const [usedNpcTypes, setUsedNpcTypes] = useState<string[]>([]);
  const [usedMemeIds, setUsedMemeIds] = useState<string[]>([]);
  const [usedAudioIds, setUsedAudioIds] = useState<string[]>([]);
  const [usedQuests, setUsedQuests] = useState<string[]>([]);
  const [usedOpinions, setUsedOpinions] = useState<string[]>([]);
  const [lastReactionLabel, setLastReactionLabel] = useState<string | undefined>(undefined);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

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
  // STOP SCANNING — Halts everything & Clears Session (Section 8 & 15)
  // ============================================
  const handleStopScanning = useCallback(() => {
    // Invalidate any ongoing asynchronous operations
    activeSessionRef.current += 1;

    // Stop currently playing reaction audio immediately (Section 8 & 15)
    stopReactionAudio();

    // Stop camera video tracks
    cameraRef.current?.stopCamera();

    // Clear all scanning state and session history (Section 8 & 15)
    setScanState("IDLE");
    setLiveDetections([]);
    setSelectedDetectionIndex(null);
    setCurrentNPC(null);
    setCroppedImage(null);
    setCurrentActivityDisplay("OFFLINE");
    setObservationLines([]);
    setLatestCommentary("The AI has been denied further access to the population.");

    // Complete session reset (Section 8, 11, 15)
    setUsedNpcTypes([]);
    setUsedMemeIds([]);
    setUsedAudioIds([]);
    setUsedQuests([]);
    setUsedOpinions([]);
    setLastReactionLabel(undefined);
    setEncounters([]);
  }, []);

  // ============================================
  // START SCANNING — Fresh Session Setup & Audio Unlock (Section 2)
  // ============================================
  const handleStartScanning = useCallback(() => {
    activeSessionRef.current += 1;

    // Prime/unlock browser audio during user interaction (Section 2)
    primeAudioPlayback();

    setLiveDetections([]);
    setSelectedDetectionIndex(null);
    setCurrentNPC(null);
    setCroppedImage(null);
    setUsedNpcTypes([]);
    setUsedMemeIds([]);
    setUsedQuests([]);
    setUsedOpinions([]);
    setLastReactionLabel(undefined);
    setEncounters([]);
    setScanState("COUNTDOWN");
    setCurrentActivityDisplay("INITIALIZING...");
    setObservationLines(["Sensors online. Scanning surveillance grid..."]);
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
          // Periodically update crowd commentary lines from actual detections
          const lines = getCrowdObservationLines(results);
          setObservationLines(lines);
          setLatestCommentary(lines[0] || null);

          if (results.length > 0) {
            const first = results[0];
            setCurrentActivityDisplay(buildObservableActivity(first));
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

    // ZERO PEOPLE HANDLING — Section 32
    if (detections.length === 0) {
      setCurrentActivityDisplay("RENDER DISTANCE EMPTY");
      setObservationLines([
        "NO NPC FOUND",
        "The lobby is empty.",
        "Everyone successfully escaped judgment.",
      ]);
      setLatestCommentary("NO NPC FOUND. The lobby is empty.");
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
      // 1. Crop selected person (Person region for card, Context region for Gemini reasoning)
      const personCropDataUrl = cropPerson(video, target);
      const contextCropDataUrl = cropContextRegion(video, target);
      setCroppedImage(personCropDataUrl || contextCropDataUrl);

      // 2. Build grounded observable activity from local CV evidence
      const nearbyObjs: string[] = target.nearbyObjects || [];
      const activityLabel = buildObservableActivity(target);
      const primaryDevice =
        target.associatedObjects?.find(
          (o) => o.associated && (o.label === "cell phone" || o.label === "laptop")
        )?.label ||
        nearbyObjs.find((o) => o === "cell phone" || o === "laptop") ||
        null;

      setCurrentActivityDisplay(activityLabel);

      // 3. Request NPC Generation with authoritative local CV evidence (Section 12 & 13)
      const res = await fetch("/api/npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observation: {
            activity: activityLabel,
            device: primaryDevice,
            groupSize: target.localGroupSize || 1,
            movement: target.movement || "stationary",
            nearbyObjects: nearbyObjs,
            posture: target.posture || "standing",
            confidence: target.confidence,
            evidence: target.evidence, // Full structured local CV evidence
          },
          image: contextCropDataUrl, // Send expanded context crop with phone/laptop/chair
          usedNpcTypes,
          usedQuests,
          usedOpinions,
        }),
      });

      if (sessionId !== activeSessionRef.current) return;

      if (!res.ok) throw new Error("API response error");
      const npcData: NPCProfile = await res.json();

      if (sessionId !== activeSessionRef.current) return;

      // RULE 1, 4, 9: The UI's activity must come directly from local CV evidence
      // Gemini's activity field is NEVER allowed to override factual activity
      npcData.detectedActivity = activityLabel;
      npcData.activity = activityLabel;

      setCurrentNPC(npcData);

      // Section 11 & Part 12: Add generated type, quest, and opinion to session history
      setUsedNpcTypes((prev) => (prev.includes(npcData.type) ? prev : [...prev, npcData.type]));
      setUsedQuests((prev) => (prev.includes(npcData.quest) ? prev : [...prev, npcData.quest]));
      setUsedOpinions((prev) => (prev.includes(npcData.roast) ? prev : [...prev, npcData.roast]));

      const newEncounterId = encounters.length + 1;
      setEncounters((prev) => [
        {
          id: newEncounterId,
          npc: npcData,
          timestamp: Date.now(),
          croppedImage: personCropDataUrl || contextCropDataUrl,
        },
        ...prev,
      ]);

      // 4. TRANSITION TO NPC REVEAL (FROZEN UNTIL USER CLICKS NEXT VICTIM)
      setScanState("NPC_REVEAL");
    } catch (err) {
      console.error("[AVASTHA] Error during analysis:", err);
      if (sessionId === activeSessionRef.current) {
        setScanState("NO_VICTIM");
      }
    }
  }, [scanState, modelReady, detect, encounters.length, usedNpcTypes, usedQuests, usedOpinions]);

  // ============================================
  // NEXT VICTIM — User explicitly continues (Section 9)
  // ============================================
  const handleNextVictim = useCallback(() => {
    // Stop any currently playing audio immediately (Section 8 & 9)
    stopReactionAudio();

    // Clear selected NPC and target
    setCurrentNPC(null);
    setCroppedImage(null);
    setSelectedDetectionIndex(null);

    // Return to live camera with a fresh 10-second countdown (history preserved)
    setScanState("COUNTDOWN");
    setObservationLines(["Acquiring next victim...", "10-second scan active."]);
    setLatestCommentary("Acquiring next victim...");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#17151C] font-sans antialiased selection:bg-[#FFD1E3]">
      {/* Header with system status, eye sticker, and STOP SCANNING button */}
      <Header
        scanning={isScanningActive}
        onStopScanning={handleStopScanning}
      />

      <main className="flex-1 p-3 sm:p-5 lg:p-6 flex flex-col max-w-7xl mx-auto w-full">
        {/* ==================================================== */}
        {/* START SCREEN (IDLE) — Pastel Y2K Hero               */}
        {/* ==================================================== */}
        {!isScanningActive && (
          <div className="flex flex-col items-center justify-center my-auto min-h-[70vh] gap-8 px-4 py-8 animate-fade-in relative">
            {/* Background Decorative Pastel Blobs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#FFD1E3]/40 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#DDF5FF]/50 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#FFF4C2]/45 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Floating Sticker Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl">
              <span className="px-3 py-1 bg-[#FFF4C2] border-2 border-[#FFE68A] text-[#8C7400] text-xs font-bold rounded-full shadow-[0_2px_0_#FFE68A] -rotate-2 hover:rotate-0 transition-transform cursor-default">
                ⚡ 0% PRODUCTIVITY
              </span>
              <div className="flex items-center gap-2 px-3.5 py-1 bg-[#E2FAF0] border-2 border-[#9EE6C3] text-[#1B6640] rounded-full shadow-[0_2px_0_#9EE6C3]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-black tracking-wider uppercase font-mono">
                  SYSTEM ONLINE
                </span>
              </div>
              <span className="px-3 py-1 bg-[#E9E4FF] border-2 border-[#B9A7FF] text-[#553C9A] text-xs font-bold rounded-full shadow-[0_2px_0_#B9A7FF] rotate-3 hover:rotate-0 transition-transform cursor-default">
                🎯 NO PURPOSE DETECTED
              </span>
            </div>

            {/* Central Hero Card */}
            <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 max-w-2xl w-full text-center bg-white/90 backdrop-blur-md rounded-3xl border-3 border-[#E6DFE5] shadow-[0_12px_40px_rgba(230,223,229,0.5)]">
              {/* Eye sticker decoration */}
              <div className="w-14 h-14 rounded-2xl bg-[#DDF5FF] border-2 border-[#8ED8FF] flex items-center justify-center text-3xl shadow-[0_4px_0_#8ED8FF] mb-4 animate-bounce">
                👁️
              </div>

              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[#17151C] mb-3 font-display">
                AVASTHA
              </h1>

              <div className="text-sm sm:text-base tracking-widest text-[#635E69] uppercase max-w-md mb-2 flex items-center justify-center gap-2 font-black">
                <span className="text-[#FF7EB6]">SERIOUS TECHNOLOGY.</span>
                <span className="text-[#17151C]">•</span>
                <span className="text-[#553C9A]">STUPID PURPOSE.</span>
              </div>

              <p className="text-xs sm:text-sm text-[#8A8494] max-w-md mb-8 font-medium">
                Turning real life into brutally specific fictional NPC encounters using unnecessary AI.
              </p>

              {/* Big Pink Tactile Button */}
              <button
                onClick={handleStartScanning}
                className="group relative px-10 py-5 bg-[#FF7EB6] hover:bg-[#FF65A7] active:translate-y-1 text-white font-display font-black tracking-wider uppercase text-base sm:text-lg rounded-2xl shadow-[0_6px_0_#D95A92] hover:shadow-[0_4px_0_#D95A92] transition-all duration-150 flex items-center gap-3"
              >
                <span>START SCANNING</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">➔</span>
              </button>

              <div className="mt-8 pt-6 border-t-2 border-[#F3EDF2] w-full flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-[#8A8494]">
                  <span className="bg-[#FFF9F2] px-2.5 py-1 rounded-lg border border-[#E6DFE5]">LOCAL COCO-SSD</span>
                  <span>•</span>
                  <span className="bg-[#FFF9F2] px-2.5 py-1 rounded-lg border border-[#E6DFE5]">10s SCAN INTERVAL</span>
                  <span>•</span>
                  <span className="bg-[#FFF9F2] px-2.5 py-1 rounded-lg border border-[#E6DFE5]">100% PRIVATE</span>
                </div>
                <p className="text-[10px] text-[#A8A2B0] font-medium mt-1">
                  Camera feed runs 100% locally in your browser. Zero video or audio is ever uploaded.
                </p>
              </div>
            </div>

            {/* Bottom playful note */}
            <div className="text-xs font-bold text-[#8A8494] bg-white/70 px-4 py-1.5 rounded-full border border-[#E6DFE5]">
              PURPOSE: NONE • COLLEGE CHAOS PARODY
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ACTIVE SCANNING HUD (COUNTDOWN / ANALYZING / ETC)   */}
        {/* ==================================================== */}
        {isScanningActive && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Top Control Bar with Live Status & Stop Button */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-2xl border-2 border-[#E6DFE5] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                <span className="text-xs font-black tracking-wider text-[#17151C] uppercase font-mono">
                  STATUS: {scanState === "COUNTDOWN" ? "10s SCAN ACTIVE" : scanState}
                </span>
              </div>

              <button
                onClick={handleStopScanning}
                className="px-4 py-1.5 bg-[#FFF3F8] hover:bg-[#FF6B7A] text-[#FF6B7A] hover:text-white border-2 border-[#FFD1E3] hover:border-[#FF6B7A] rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm"
              >
                STOP SCANNING
              </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Live Camera + NPC History */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <CameraFeed
                  ref={cameraRef}
                  active={isScanningActive && scanState !== "NO_VICTIM"}
                  detections={liveDetections}
                  selectedIndex={selectedDetectionIndex}
                />
                <NPCHistory encounters={encounters} />
              </div>

              {/* Right Column: Countdown / State Screens + Commentary + Telemetry */}
              <div className="lg:col-span-6 flex flex-col gap-4">
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
                  <div className="p-8 flex flex-col items-center justify-center gap-4 rounded-3xl border-3 border-[#FFE68A] bg-[#FFFBF0] text-center shadow-[0_8px_24px_rgba(255,230,138,0.3)] animate-pulse">
                    <div className="w-12 h-12 border-4 border-[#FFE68A] border-t-[#FF7EB6] rounded-full animate-spin" />
                    <span className="text-base font-display font-extrabold tracking-wider text-[#17151C] uppercase">
                      ANALYZING SELECTED TARGET...
                    </span>
                    <p className="text-xs font-medium text-[#635E69]">
                      Evaluating observable posture, devices, and situation.
                    </p>
                  </div>
                )}

                {/* NO VICTIM FOUND SCREEN (Cute pastel empty state) */}
                {scanState === "NO_VICTIM" && (
                  <div className="p-8 flex flex-col items-center justify-center gap-4 rounded-3xl border-3 border-[#FFD1E3] bg-[#FFF3F8] text-center shadow-[0_8px_24px_rgba(255,126,182,0.15)]">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#FFD1E3] flex items-center justify-center text-3xl shadow-sm">
                      👻
                    </div>
                    <div className="px-3 py-1 bg-white border border-[#FF7EB6] text-[#FF7EB6] font-bold text-xs rounded-full uppercase tracking-wider">
                      SCAN COMPLETE
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#17151C]">
                      NO NPC FOUND
                    </h3>
                    <div className="text-xs sm:text-sm text-[#635E69] max-w-sm space-y-1 font-medium">
                      <p>The lobby is empty.</p>
                      <p>Everyone successfully escaped judgment.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => {
                          setScanState("COUNTDOWN");
                        }}
                        className="px-6 py-3 bg-[#9EE6C3] hover:bg-[#86D9B1] active:translate-y-0.5 text-[#1B6640] font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_0_#68B991] transition-all duration-150"
                      >
                        SCAN AGAIN
                      </button>
                      <button
                        onClick={handleStopScanning}
                        className="px-6 py-3 bg-white hover:bg-[#FF6B7A] text-[#FF6B7A] hover:text-white active:translate-y-0.5 border-2 border-[#FFD1E3] font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all duration-150"
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
                  observationLines={observationLines}
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
        encounterId={encounters.length}
        npc={currentNPC}
        croppedImage={croppedImage}
        active={scanState === "NPC_REVEAL"}
        onNextVictim={handleNextVictim}
        onStopScanning={handleStopScanning}
        usedMemeIds={usedMemeIds}
        onMemeSelected={(id) =>
          setUsedMemeIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        }
        usedAudioIds={usedAudioIds}
        onAudioSelected={(id) =>
          setUsedAudioIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        }
        groupSize={
          selectedDetectionIndex !== null && liveDetections[selectedDetectionIndex]
            ? liveDetections[selectedDetectionIndex].localGroupSize
            : 1
        }
        previousReactionLabel={lastReactionLabel}
        onLabelSelected={(lbl) => setLastReactionLabel(lbl)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* ==================================================== */}
      {/* SECTION 38: DEVELOPMENT DEBUG TELEMETRY OVERLAY     */}
      {/* ==================================================== */}
      {debugMode && (
        <div className="fixed bottom-12 right-4 z-50 p-4 bg-white/95 border-2 border-[#E6DFE5] rounded-2xl font-mono text-[11px] text-[#17151C] shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur max-w-sm pointer-events-auto select-none">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E6DFE5] font-bold tracking-wider text-[#17151C]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              CV EVIDENCE TELEMETRY
            </span>
            <button
              onClick={() => setDebugMode(false)}
              className="text-[#8A8494] hover:text-[#17151C] px-1 text-xs font-bold"
              title="Close Debug Mode (Shift+D)"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8A8494]">PERSONS:</span>
              <span className="font-bold">{liveDetections.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8494]">SELECTED:</span>
              <span className="font-bold">
                {selectedDetectionIndex !== null
                  ? `person #${selectedDetectionIndex + 1}`
                  : liveDetections.length > 0
                  ? "person #1 (live)"
                  : "none"}
              </span>
            </div>
            {(() => {
              const debugTarget =
                selectedDetectionIndex !== null && liveDetections[selectedDetectionIndex]
                  ? liveDetections[selectedDetectionIndex]
                  : liveDetections[0];

              if (!debugTarget) return null;

              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">PERSON CONFIDENCE:</span>
                    <span>{debugTarget.confidence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">POSTURE:</span>
                    <span className="font-bold">
                      {debugTarget.posture} ({debugTarget.postureConfidence ?? "N/A"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">MOVEMENT:</span>
                    <span className="font-bold">
                      {debugTarget.movement} ({debugTarget.movementConfidence ?? "N/A"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">OBJECTS:</span>
                    <span className="truncate max-w-[180px] font-medium">
                      {debugTarget.associatedObjects?.map((o) => `${o.label} (${o.confidence})`).join(", ") || "none"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">PHONE ASSOCIATED:</span>
                    <span
                      className={
                        debugTarget.associatedObjects?.some((o) => o.label === "cell phone")
                          ? "text-[#10B981] font-bold"
                          : "text-[#A8A2B0]"
                      }
                    >
                      {debugTarget.associatedObjects?.some((o) => o.label === "cell phone") ? "YES" : "NO"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">LAPTOP ASSOCIATED:</span>
                    <span
                      className={
                        debugTarget.associatedObjects?.some((o) => o.label === "laptop")
                          ? "text-[#10B981] font-bold"
                          : "text-[#A8A2B0]"
                      }
                    >
                      {debugTarget.associatedObjects?.some((o) => o.label === "laptop") ? "YES" : "NO"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">GROUP SIZE:</span>
                    <span>{debugTarget.localGroupSize || 1}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E6DFE5] pt-1.5">
                    <span className="text-[#8A8494]">FINAL ACTIVITY:</span>
                    <span className="text-[#B45309] font-bold">{debugTarget.groundedActivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8494]">ACTIVITY CONFIDENCE:</span>
                    <span
                      className={
                        debugTarget.confidenceGate === "HIGH"
                          ? "text-[#10B981] font-bold"
                          : debugTarget.confidenceGate === "MEDIUM"
                          ? "text-[#D97706] font-bold"
                          : "text-[#EF4444] font-bold"
                      }
                    >
                      {debugTarget.confidenceGate || "MEDIUM"}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#E6DFE5] flex items-center justify-between text-[10px]">
            <span className="text-[#8A8494] font-bold">AUDIO: {usedAudioIds.length}/9 USED</span>
            <a
              href="/audio-library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF7EB6] font-bold hover:underline"
            >
              AUDIO LIB ↗
            </a>
          </div>
          <div className="mt-1 text-[10px] text-[#8A8494] text-center font-bold">
            TOGGLE WITH SHIFT+D
          </div>
        </div>
      )}

      {/* Footer with pastel styling */}
      <footer className="px-4 py-3 border-t-2 border-[#E6DFE5] bg-white/70 backdrop-blur-sm text-center flex flex-wrap items-center justify-center gap-2 mt-auto">
        <span className="text-[11px] font-bold tracking-wider text-[#8A8494]">
          AVASTHA — TINKERHUB USELESS PROJECTS 💀
        </span>
        <button
          onClick={() => setDebugMode((prev) => !prev)}
          className="text-[11px] text-[#8A8494] hover:text-[#17151C] ml-2 font-mono underline decoration-dotted transition-colors"
          title="Toggle Developer Computer Vision Telemetry (Shift+D)"
        >
          [DEV_DEBUG: {debugMode ? "ON" : "OFF"}]
        </button>
      </footer>
    </div>
  );
}
