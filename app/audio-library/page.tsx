"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MEME_AUDIO_MANIFEST, MemeAudioClip } from "@/lib/audioManifest";

const AVAILABLE_PRIMARY_CATEGORIES = [
  "sitting",
  "standing",
  "walking",
  "phone",
  "laptop",
  "group",
  "idle",
  "waiting",
  "awkward",
  "confusion",
];

const COMMON_TAGS = [
  "idle",
  "waiting",
  "stationary",
  "deadpan",
  "distraction",
  "screen captivity",
  "speed",
  "movement",
  "chaos",
  "awkward",
  "disappointment",
  "dramatic reaction",
  "no activity",
  "useless activity",
  "failure",
];

export default function AudioLibraryDevPage() {
  const [clips, setClips] = useState<MemeAudioClip[]>(MEME_AUDIO_MANIFEST);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savedClipId, setSavedClipId] = useState<string | null>(null);
  const [clipVersionMap, setClipVersionMap] = useState<Record<string, number>>({});

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);
  const trimmerCardRef = useRef<HTMLDivElement | null>(null);

  // --- Trimmer Studio State ---
  const [targetClipId, setTargetClipId] = useState<string>("meme-001");
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(6);
  const [padTo6s, setPadTo6s] = useState<boolean>(true);
  const [isMasterPlaying, setIsMasterPlaying] = useState<boolean>(false);
  const [masterCurrentTime, setMasterCurrentTime] = useState<number>(0);
  const [masterDuration, setMasterDuration] = useState<number>(105.95);
  const [isPreviewingTrim, setIsPreviewingTrim] = useState<boolean>(false);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [trimFeedback, setTrimFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load latest manifest from API on mount
  useEffect(() => {
    fetch("/api/audio-library")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setClips(data);
        } else if (data && Array.isArray(data.clips)) {
          setClips(data.clips);
        }
      })
      .catch((err) => {
        console.warn("Could not load /api/audio-library, using static manifest:", err);
      });
  }, []);

  // Update trimmer times when target clip changes
  const handleSelectTargetClip = (clipId: string) => {
    setTargetClipId(clipId);
    const index = clips.findIndex((c) => c.id === clipId);
    if (index >= 0) {
      const suggestedStart = Math.round(index * 6 * 100) / 100;
      const suggestedEnd = Math.min(
        Math.round((suggestedStart + 6) * 100) / 100,
        Math.round(masterDuration * 100) / 100
      );
      setStartTime(suggestedStart);
      setEndTime(suggestedEnd);
    }
  };

  // Master audio time update listener
  const handleMasterTimeUpdate = () => {
    if (!masterAudioRef.current) return;
    const cur = masterAudioRef.current.currentTime;
    setMasterCurrentTime(cur);

    if (isPreviewingTrim && cur >= endTime) {
      masterAudioRef.current.pause();
      setIsMasterPlaying(false);
      setIsPreviewingTrim(false);
    }
  };

  const togglePlayMaster = () => {
    if (!masterAudioRef.current) return;
    if (isMasterPlaying) {
      masterAudioRef.current.pause();
      setIsMasterPlaying(false);
      setIsPreviewingTrim(false);
    } else {
      stopClipAudio();
      masterAudioRef.current.play().catch((err) => console.warn(err));
      setIsMasterPlaying(true);
      setIsPreviewingTrim(false);
    }
  };

  const handlePreviewTrim = () => {
    if (!masterAudioRef.current) return;
    stopClipAudio();
    masterAudioRef.current.currentTime = Math.max(0, startTime);
    setIsPreviewingTrim(true);
    masterAudioRef.current
      .play()
      .then(() => setIsMasterPlaying(true))
      .catch((err) => console.warn("Preview playback error:", err));
  };

  const stopMasterAudio = () => {
    if (masterAudioRef.current) {
      masterAudioRef.current.pause();
      setIsMasterPlaying(false);
      setIsPreviewingTrim(false);
    }
  };

  const stopClipAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveClipId(null);
  };

  // Execute Trim via Backend FFmpeg
  const handleExecuteTrim = async () => {
    if (endTime <= startTime) {
      setTrimFeedback({ type: "error", message: "End Time must be greater than Start Time." });
      return;
    }

    setIsTrimming(true);
    setTrimFeedback(null);
    stopMasterAudio();
    stopClipAudio();

    try {
      const res = await fetch("/api/audio-library/trim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId: targetClipId,
          startTime,
          endTime,
          padTo6s,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Cache-buster update for this clip
        setClipVersionMap((prev) => ({ ...prev, [targetClipId]: Date.now() }));

        // Update local clips state with verified duration
        setClips((prev) =>
          prev.map((c) => (c.id === targetClipId ? { ...c, duration: data.duration } : c))
        );

        setTrimFeedback({
          type: "success",
          message: `✓ Successfully sliced ${targetClipId}! Duration: ${data.duration}s (${startTime.toFixed(
            2
          )}s - ${endTime.toFixed(2)}s). Clip updated live.`,
        });

        setTimeout(() => setTrimFeedback(null), 6000);
      } else {
        setTrimFeedback({ type: "error", message: data.error || "Failed to slice audio clip." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTrimFeedback({ type: "error", message: `Trimmer error: ${msg}` });
    } finally {
      setIsTrimming(false);
    }
  };

  // Scroll to trimmer and prefill clip
  const handleEditClipTiming = (clip: MemeAudioClip) => {
    handleSelectTargetClip(clip.id);
    if (trimmerCardRef.current) {
      trimmerCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filterCategories = [
    "ALL",
    "sitting",
    "standing",
    "walking",
    "phone",
    "laptop",
    "group",
    "idle",
    "waiting",
    "awkward",
  ];

  const filteredClips = clips.filter((c) => {
    const matchesCat =
      selectedFilterCategory === "ALL" ||
      c.category.map((cat) => cat.toLowerCase()).includes(selectedFilterCategory.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const playClip = (clip: MemeAudioClip) => {
    stopMasterAudio();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (activeClipId === clip.id) {
      setActiveClipId(null);
      return;
    }

    const version = clipVersionMap[clip.id] || "";
    const fileUrl = version ? `${clip.file}?v=${version}` : clip.file;
    const audio = new Audio(fileUrl);
    audio.preload = "auto";
    audio.volume = 1.0;
    audioRef.current = audio;
    setActiveClipId(clip.id);

    audio.onended = () => {
      setActiveClipId(null);
    };

    audio.onerror = (e) => {
      console.error("Failed to play audio:", fileUrl, e);
      setActiveClipId(null);
    };

    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
      setActiveClipId(null);
    });
  };

  // Update a single clip's property in local state
  const handleUpdateClip = (id: string, updates: Partial<MemeAudioClip>) => {
    setClips((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Toggle tag on a clip
  const handleToggleTag = (clipId: string, tag: string) => {
    setClips((prev) =>
      prev.map((item) => {
        if (item.id !== clipId) return item;
        const exists = item.category.map((c) => c.toLowerCase()).includes(tag.toLowerCase());
        const newCats = exists
          ? item.category.filter((c) => c.toLowerCase() !== tag.toLowerCase())
          : [...item.category, tag];
        return { ...item, category: newCats };
      })
    );
  };

  // Save all clips to backend
  const handleSaveAll = async (targetClipIdParam?: string) => {
    setSaveStatus("Saving changes...");
    try {
      const res = await fetch("/api/audio-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clips),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus(`Saved ${clips.length} clips to audio manifest!`);
        if (targetClipIdParam) {
          setSavedClipId(targetClipIdParam);
          setTimeout(() => setSavedClipId(null), 2500);
        }
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus(`Save failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveStatus(`Error saving: ${msg}`);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFF9F2",
        color: "#1A1A2E",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        padding: "32px 20px",
      }}
    >
      {/* Hidden Master Audio Element */}
      <audio
        ref={masterAudioRef}
        src="/audio/source/master_audio.mp3"
        preload="metadata"
        onTimeUpdate={handleMasterTimeUpdate}
        onLoadedMetadata={(e) => {
          const dur = (e.target as HTMLAudioElement).duration;
          if (dur && !isNaN(dur)) setMasterDuration(dur);
        }}
        onEnded={() => {
          setIsMasterPlaying(false);
          setIsPreviewingTrim(false);
        }}
      />

      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Top Navigation & Status Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "4px solid #1A1A2E",
            paddingBottom: 20,
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "4px 10px",
                backgroundColor: "#FF7EB6",
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 900,
                border: "2px solid #1A1A2E",
                borderRadius: 4,
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              MALAYALAM DIALOGUE TIMING & REACTION WORKBENCH
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>
              🎵 NPC WATCH — AUDIO LIBRARY & TRIMMER
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#666", fontSize: 14 }}>
              Interactive Dialogue Trimmer • Timing Adjuster • 9 Uniform Malayalam Reaction Dialogues
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => handleSaveAll()}
              style={{
                padding: "8px 18px",
                backgroundColor: "#9EE6C3",
                color: "#1A1A2E",
                border: "3px solid #1A1A2E",
                borderRadius: 6,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "3px 3px 0px #1A1A2E",
              }}
            >
              💾 SAVE MANIFEST
            </button>
            <button
              onClick={() => {
                stopClipAudio();
                stopMasterAudio();
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#FFE68A",
                color: "#1A1A2E",
                border: "3px solid #1A1A2E",
                borderRadius: 6,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "3px 3px 0px #1A1A2E",
              }}
            >
              ⏹ STOP ALL AUDIO
            </button>
            <Link
              href="/"
              style={{
                padding: "8px 16px",
                backgroundColor: "#8ED8FF",
                color: "#1A1A2E",
                border: "3px solid #1A1A2E",
                borderRadius: 6,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "3px 3px 0px #1A1A2E",
              }}
            >
              ← BACK TO NPC WATCH
            </Link>
          </div>
        </div>

        {/* Global Save Alert Banner */}
        {saveStatus && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor:
                saveStatus.includes("failed") || saveStatus.includes("Error") ? "#FFD1E3" : "#E2FAF0",
              border: "3px solid #1A1A2E",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 14,
              marginBottom: 20,
              boxShadow: "3px 3px 0px #1A1A2E",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{saveStatus}</span>
            <button
              onClick={() => setSaveStatus(null)}
              style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* ✂️ INTERACTIVE DIALOGUE TRIMMER & TIMING STUDIO */}
        {/* ============================================================ */}
        <div
          ref={trimmerCardRef}
          style={{
            backgroundColor: "#FFFFFF",
            border: "4px solid #1A1A2E",
            borderRadius: 16,
            padding: 24,
            marginBottom: 28,
            boxShadow: "6px 6px 0px #1A1A2E",
            background: "linear-gradient(135deg, #FFFFFF 0%, #FFF5F9 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
              borderBottom: "2px dashed #1A1A2E",
              paddingBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  backgroundColor: "#FFE68A",
                  color: "#1A1A2E",
                  fontSize: 11,
                  fontWeight: 900,
                  border: "1.5px solid #1A1A2E",
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              >
                LIVE AUDIO RE-SLICER
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                ✂️ Master Audio Timing & Dialogue Trimmer
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#555", fontSize: 13 }}>
                Listen to the master Malayalam recording, dial in the exact start & end times of any punchline, and re-slice that clip instantly.
              </p>
            </div>

            {/* Target Clip Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#1A1A2E" }}>TARGET CLIP:</span>
              <select
                value={targetClipId}
                onChange={(e) => handleSelectTargetClip(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "2px solid #1A1A2E",
                  borderRadius: 6,
                  fontWeight: 900,
                  fontSize: 13,
                  backgroundColor: "#FFE68A",
                  color: "#1A1A2E",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0px #1A1A2E",
                }}
              >
                {clips.map((clip) => (
                  <option key={clip.id} value={clip.id}>
                    {clip.id} — {clip.title} ({clip.duration}s)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Master Timeline & Scrubber */}
          <div
            style={{
              backgroundColor: "#1A1A2E",
              color: "#FFFFFF",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              boxShadow: "Inset 2px 2px 5px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                fontSize: 12,
                fontWeight: 800,
                color: "#9EE6C3",
              }}
            >
              <span>
                MASTER POSITION: {formatSeconds(masterCurrentTime)} / {formatSeconds(masterDuration)}
              </span>
              <span style={{ color: isPreviewingTrim ? "#FF7EB6" : "#FFE68A" }}>
                {isPreviewingTrim ? "▶ PREVIEWING SELECTION..." : isMasterPlaying ? "▶ PLAYING MASTER AUDIO" : "⏸ PAUSED"}
              </span>
            </div>

            {/* Visual Progress Bar with Range Markers */}
            <div
              style={{
                position: "relative",
                height: 36,
                backgroundColor: "#2E2B4A",
                borderRadius: 8,
                border: "2px solid #FFE68A",
                cursor: "pointer",
                overflow: "hidden",
                marginBottom: 12,
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                const newPos = pct * masterDuration;
                if (masterAudioRef.current) {
                  masterAudioRef.current.currentTime = newPos;
                  setMasterCurrentTime(newPos);
                }
              }}
            >
              {/* Highlight of Selected Trim Range */}
              <div
                style={{
                  position: "absolute",
                  left: `${(startTime / masterDuration) * 100}%`,
                  width: `${Math.max(0, ((endTime - startTime) / masterDuration) * 100)}%`,
                  top: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 126, 182, 0.45)",
                  borderLeft: "3px solid #FF7EB6",
                  borderRight: "3px solid #FF7EB6",
                  zIndex: 2,
                }}
              />

              {/* Current Playhead Indicator */}
              <div
                style={{
                  position: "absolute",
                  left: `${(masterCurrentTime / masterDuration) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: "#9EE6C3",
                  boxShadow: "0 0 8px #9EE6C3",
                  zIndex: 3,
                }}
              />

              {/* Scrubber background text */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.3)",
                  pointerEvents: "none",
                  letterSpacing: 1,
                }}
              >
                CLICK TIMELINE TO SCRUB
              </div>
            </div>

            {/* Master Play / Pause Buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={togglePlayMaster}
                style={{
                  padding: "6px 14px",
                  backgroundColor: isMasterPlaying ? "#FF7EB6" : "#9EE6C3",
                  color: "#1A1A2E",
                  border: "2px solid #FFFFFF",
                  borderRadius: 6,
                  fontWeight: 900,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {isMasterPlaying ? "⏸ PAUSE MASTER" : "▶ PLAY MASTER AUDIO"}
              </button>
              <button
                onClick={() => {
                  if (masterAudioRef.current) {
                    masterAudioRef.current.currentTime = Math.max(0, masterCurrentTime - 2);
                  }
                }}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#2E2B4A",
                  color: "#FFFFFF",
                  border: "1px solid #FFE68A",
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                ⏪ -2s
              </button>
              <button
                onClick={() => {
                  if (masterAudioRef.current) {
                    masterAudioRef.current.currentTime = Math.min(masterDuration, masterCurrentTime + 2);
                  }
                }}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#2E2B4A",
                  color: "#FFFFFF",
                  border: "1px solid #FFE68A",
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                ⏩ +2s
              </button>
              <span style={{ fontSize: 11, color: "#AAA", marginLeft: "auto" }}>
                Total Source File: 105.95s (MP3, 44.1kHz stereo)
              </span>
            </div>
          </div>

          {/* Timing Inputs & Fine-Tuning Controls */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* START TIME BOX */}
            <div
              style={{
                padding: 14,
                backgroundColor: "#FFFFFF",
                border: "2.5px solid #1A1A2E",
                borderRadius: 10,
                boxShadow: "3px 3px 0px #1A1A2E",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#1A1A2E" }}>START TIME (SEC):</label>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#666" }}>{formatSeconds(startTime)}</span>
              </div>
              <input
                type="number"
                step="0.05"
                min="0"
                max={endTime - 0.1}
                value={startTime}
                onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: 16,
                  fontWeight: 900,
                  border: "2px solid #1A1A2E",
                  borderRadius: 6,
                  boxSizing: "border-box",
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button
                  onClick={() => setStartTime(Math.max(0, Math.round((startTime - 1.0) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  -1.0s
                </button>
                <button
                  onClick={() => setStartTime(Math.max(0, Math.round((startTime - 0.1) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  -0.1s
                </button>
                <button
                  onClick={() => setStartTime(Math.min(endTime - 0.1, Math.round((startTime + 0.1) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  +0.1s
                </button>
                <button
                  onClick={() => setStartTime(Math.min(endTime - 0.1, Math.round((startTime + 1.0) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  +1.0s
                </button>
                <button
                  onClick={() => setStartTime(Math.round(masterCurrentTime * 100) / 100)}
                  style={{ width: "100%", padding: "5px", fontSize: 11, fontWeight: 900, backgroundColor: "#FFE68A", border: "1.5px solid #1A1A2E", borderRadius: 4, cursor: "pointer", marginTop: 4 }}
                >
                  📍 Set to Current Playhead ({formatSeconds(masterCurrentTime)})
                </button>
              </div>
            </div>

            {/* END TIME BOX */}
            <div
              style={{
                padding: 14,
                backgroundColor: "#FFFFFF",
                border: "2.5px solid #1A1A2E",
                borderRadius: 10,
                boxShadow: "3px 3px 0px #1A1A2E",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#1A1A2E" }}>END TIME (SEC):</label>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#666" }}>{formatSeconds(endTime)}</span>
              </div>
              <input
                type="number"
                step="0.05"
                min={startTime + 0.1}
                max={masterDuration}
                value={endTime}
                onChange={(e) => setEndTime(Math.min(masterDuration, parseFloat(e.target.value) || startTime + 1))}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: 16,
                  fontWeight: 900,
                  border: "2px solid #1A1A2E",
                  borderRadius: 6,
                  boxSizing: "border-box",
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button
                  onClick={() => setEndTime(Math.max(startTime + 0.1, Math.round((endTime - 1.0) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  -1.0s
                </button>
                <button
                  onClick={() => setEndTime(Math.max(startTime + 0.1, Math.round((endTime - 0.1) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  -0.1s
                </button>
                <button
                  onClick={() => setEndTime(Math.min(masterDuration, Math.round((endTime + 0.1) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  +0.1s
                </button>
                <button
                  onClick={() => setEndTime(Math.min(masterDuration, Math.round((endTime + 1.0) * 100) / 100))}
                  style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 800, backgroundColor: "#FFF3F8", border: "1px solid #1A1A2E", borderRadius: 4, cursor: "pointer" }}
                >
                  +1.0s
                </button>
                <button
                  onClick={() => setEndTime(Math.round(masterCurrentTime * 100) / 100)}
                  style={{ width: "100%", padding: "5px", fontSize: 11, fontWeight: 900, backgroundColor: "#FFE68A", border: "1.5px solid #1A1A2E", borderRadius: 4, cursor: "pointer", marginTop: 4 }}
                >
                  📍 Set to Current Playhead ({formatSeconds(masterCurrentTime)})
                </button>
              </div>
            </div>

            {/* DURATION & QUICK PRESETS */}
            <div
              style={{
                padding: 14,
                backgroundColor: "#FFFFFF",
                border: "2.5px solid #1A1A2E",
                borderRadius: 10,
                boxShadow: "3px 3px 0px #1A1A2E",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#1A1A2E" }}>CUT DURATION:</label>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#A3225B",
                    margin: "6px 0",
                  }}
                >
                  {(endTime - startTime).toFixed(2)}s
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 8 }}>
                  Quick duration presets from Start:
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[3, 4, 5, 6].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setEndTime(Math.min(masterDuration, Math.round((startTime + sec) * 100) / 100))}
                      style={{
                        flex: 1,
                        padding: "4px",
                        fontSize: 11,
                        fontWeight: 900,
                        backgroundColor: "#E9E4FF",
                        border: "1.5px solid #1A1A2E",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #CCC" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={padTo6s}
                    onChange={(e) => setPadTo6s(e.target.checked)}
                    style={{ cursor: "pointer", width: 16, height: 16 }}
                  />
                  Auto-pad with silence to 6.0s (NPC Watch standard)
                </label>
              </div>
            </div>
          </div>

          {/* Feedback message banner */}
          {trimFeedback && (
            <div
              style={{
                padding: "10px 14px",
                marginBottom: 16,
                borderRadius: 8,
                border: "2px solid #1A1A2E",
                fontWeight: 800,
                fontSize: 13,
                backgroundColor: trimFeedback.type === "success" ? "#E2FAF0" : "#FFD1E3",
                color: trimFeedback.type === "success" ? "#1B6640" : "#A3225B",
              }}
            >
              {trimFeedback.message}
            </div>
          )}

          {/* Actions: Preview Cut & Slice Clip */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={handlePreviewTrim}
              style={{
                flex: "1 1 200px",
                padding: "12px 18px",
                backgroundColor: isPreviewingTrim ? "#FF7EB6" : "#8ED8FF",
                color: isPreviewingTrim ? "#FFFFFF" : "#1A1A2E",
                border: "3px solid #1A1A2E",
                borderRadius: 8,
                fontWeight: 900,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "3px 3px 0px #1A1A2E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isPreviewingTrim ? "⏹ STOP PREVIEW" : "▶️ PREVIEW SELECTION"}
            </button>

            <button
              onClick={handleExecuteTrim}
              disabled={isTrimming}
              style={{
                flex: "2 1 280px",
                padding: "12px 20px",
                backgroundColor: isTrimming ? "#CCCCCC" : "#9EE6C3",
                color: "#1A1A2E",
                border: "3px solid #1A1A2E",
                borderRadius: 8,
                fontWeight: 900,
                fontSize: 14,
                cursor: isTrimming ? "not-allowed" : "pointer",
                boxShadow: "3px 3px 0px #1A1A2E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isTrimming ? "⏳ TRIMMING WITH FFMPEG..." : `✂️ SLICE & UPDATE ${targetClipId.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 24,
            padding: 16,
            backgroundColor: "#FFFFFF",
            border: "3px solid #1A1A2E",
            borderRadius: 10,
            boxShadow: "4px 4px 0px #1A1A2E",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900 }}>SEARCH:</span>
            <input
              type="text"
              placeholder="Search by ID (e.g. meme-007), title, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: 240,
                padding: "8px 12px",
                border: "2px solid #1A1A2E",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#FFE68A",
                  border: "2px solid #1A1A2E",
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                CLEAR
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, marginRight: 4 }}>CATEGORY FILTER:</span>
            {filterCategories.map((cat) => {
              const isSelected = selectedFilterCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedFilterCategory(cat)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    backgroundColor: isSelected ? "#FF7EB6" : "#FFF3F8",
                    color: isSelected ? "#FFFFFF" : "#1A1A2E",
                    border: "2px solid #1A1A2E",
                    borderRadius: 6,
                    cursor: "pointer",
                    boxShadow: isSelected ? "2px 2px 0px #1A1A2E" : "none",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clips Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: 18,
          }}
        >
          {filteredClips.map((clip) => {
            const isPlaying = activeClipId === clip.id;
            const isSaved = savedClipId === clip.id;
            const isTargetInTrimmer = targetClipId === clip.id;

            return (
              <div
                key={clip.id}
                style={{
                  backgroundColor: isPlaying ? "#FFF3F8" : isTargetInTrimmer ? "#FFFDF5" : "#FFFFFF",
                  border: isPlaying
                    ? "3px solid #FF7EB6"
                    : isTargetInTrimmer
                    ? "3px solid #FFE68A"
                    : "3px solid #1A1A2E",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: isPlaying
                    ? "5px 5px 0px #FF7EB6"
                    : isTargetInTrimmer
                    ? "5px 5px 0px #FFE68A"
                    : "4px 4px 0px #1A1A2E",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  transition: "all 0.15s ease",
                }}
              >
                {/* Header: ID, Real Duration, and Edit Timing Button */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        fontWeight: 900,
                        backgroundColor: isPlaying ? "#FF7EB6" : "#E9E4FF",
                        color: isPlaying ? "#FFFFFF" : "#1A1A2E",
                        padding: "3px 8px",
                        border: "1.5px solid #1A1A2E",
                        borderRadius: 4,
                      }}
                    >
                      {clip.id}
                    </span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: "#1A1A2E",
                          backgroundColor: "#FFE68A",
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: "1.5px solid #1A1A2E",
                        }}
                      >
                        ⏱ {clip.duration}s
                      </span>
                      <button
                        onClick={() => handleEditClipTiming(clip)}
                        style={{
                          padding: "2px 8px",
                          backgroundColor: "#9EE6C3",
                          border: "1.5px solid #1A1A2E",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                        title="Load this clip into Trimmer above"
                      >
                        ✂️ EDIT TIMING
                      </button>
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => playClip(clip)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      backgroundColor: isPlaying ? "#FF7EB6" : "#8ED8FF",
                      color: isPlaying ? "#FFFFFF" : "#1A1A2E",
                      border: "2.5px solid #1A1A2E",
                      borderRadius: 8,
                      fontWeight: 900,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "2px 2px 0px #1A1A2E",
                      marginBottom: 12,
                    }}
                  >
                    {isPlaying ? "⏹ STOP PLAYBACK" : "▶ PLAY COMPLETE REACTION"}
                  </button>

                  {/* Editable Title */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "#666" }}>
                      TITLE:
                    </label>
                    <input
                      type="text"
                      value={clip.title}
                      onChange={(e) => handleUpdateClip(clip.id, { title: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1.5px solid #1A1A2E",
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 13,
                        marginTop: 2,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Primary Category Selector */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "#666" }}>
                      PRIMARY CATEGORY:
                    </label>
                    <select
                      value={clip.category[0] || "sitting"}
                      onChange={(e) => {
                        const newPrimary = e.target.value;
                        const remaining = clip.category.filter((c) => c.toLowerCase() !== newPrimary.toLowerCase());
                        handleUpdateClip(clip.id, { category: [newPrimary, ...remaining] });
                      }}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1.5px solid #1A1A2E",
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 12,
                        marginTop: 2,
                        backgroundColor: "#FFF9F2",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      {AVAILABLE_PRIMARY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags Editor */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "#666" }}>
                      TAGS / SECONDARY CATEGORIES:
                    </label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                      {clip.category.map((cat) => (
                        <span
                          key={cat}
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            backgroundColor: "#DDF5FF",
                            color: "#1A1A2E",
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: "1px solid #1A1A2E",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {cat}
                          <button
                            onClick={() => handleToggleTag(clip.id, cat)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#FF7EB6",
                              fontWeight: 900,
                              cursor: "pointer",
                              padding: 0,
                              fontSize: 10,
                            }}
                            title="Remove tag"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Quick Add Common Tags */}
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 6 }}>
                      {COMMON_TAGS.filter((t) => !clip.category.includes(t))
                        .slice(0, 5)
                        .map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleToggleTag(clip.id, tag)}
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              backgroundColor: "#FFF3F8",
                              color: "#666",
                              padding: "1px 5px",
                              borderRadius: 3,
                              border: "1px dashed #B9A7FF",
                              cursor: "pointer",
                            }}
                          >
                            + {tag}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Editable Description */}
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: "#666" }}>
                      DESCRIPTION:
                    </label>
                    <textarea
                      rows={2}
                      value={clip.description || ""}
                      onChange={(e) => handleUpdateClip(clip.id, { description: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1.5px solid #1A1A2E",
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: 11,
                        marginTop: 2,
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>

                {/* Save Clip Button */}
                <button
                  onClick={() => handleSaveAll(clip.id)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: isSaved ? "#9EE6C3" : "#FFE68A",
                    color: "#1A1A2E",
                    border: "2px solid #1A1A2E",
                    borderRadius: 6,
                    fontWeight: 900,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: "2px 2px 0px #1A1A2E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {isSaved ? "✓ SAVED TO MANIFEST!" : "💾 SAVE CLIP CHANGES"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
