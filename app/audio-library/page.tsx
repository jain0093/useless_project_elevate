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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load latest manifest from API on mount
  useEffect(() => {
    fetch("/api/audio-library")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setClips(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load /api/audio-library, using static manifest:", err);
      });
  }, []);

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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (activeClipId === clip.id) {
      setActiveClipId(null);
      return;
    }

    const audio = new Audio(clip.file);
    audio.preload = "auto";
    audio.volume = 1.0;
    audioRef.current = audio;
    setActiveClipId(clip.id);

    audio.onended = () => {
      setActiveClipId(null);
    };

    audio.onerror = (e) => {
      console.error("Failed to play audio:", clip.file, e);
      setActiveClipId(null);
    };

    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
      setActiveClipId(null);
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveClipId(null);
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
  const handleSaveAll = async (targetClipId?: string) => {
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
        if (targetClipId) {
          setSavedClipId(targetClipId);
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
              INTERNAL DEV AUDIO WORKBENCH (SECTION 15 & 16)
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>
              🎵 NPC WATCH — MEME AUDIO LIBRARY
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#666", fontSize: 14 }}>
              Total 40 complete extracted Malayalam reaction dialogues. Full duration playback & live category tagging.
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
              💾 SAVE ALL TO MANIFEST
            </button>
            <button
              onClick={stopAudio}
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
              ⏹ STOP AUDIO
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

        {/* Global Save Alert Banner if active */}
        {saveStatus && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: saveStatus.includes("failed") || saveStatus.includes("Error") ? "#FFD1E3" : "#E2FAF0",
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

            return (
              <div
                key={clip.id}
                style={{
                  backgroundColor: isPlaying ? "#FFF3F8" : "#FFFFFF",
                  border: isPlaying ? "3px solid #FF7EB6" : "3px solid #1A1A2E",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: isPlaying ? "5px 5px 0px #FF7EB6" : "4px 4px 0px #1A1A2E",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  transition: "all 0.15s ease",
                }}
              >
                {/* Header: ID, Real Duration, and Audio Play Button */}
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

                  {/* Primary Category Selector (Section 15) */}
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

                  {/* Tags Editor (Section 15) */}
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

                  {/* Editable Description (Section 15) */}
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
