// ============================================
// NPC WATCH — MOCK NPC DATABASE (fallback/demo only)
// Not imported in production — real NPCs come from Gemini
// ============================================

import type { NPCProfile, SceneAnalysis, Observation } from "@/lib/types";

export const MOCK_NPCS: NPCProfile[] = [
  {
    type: "THE THUMB ATHLETE",
    activity: "Vertical scrolling",
    detectedActivity: "sitting while using phone",
    socialBattery: -5,
    braincells: 0.8,
    threatLevel: "LOW",
    quest: "Put the phone down for five seconds.",
    roast: "Bro opened the phone and immediately left reality.",
    malayalamStatus: "ഫോൺ ഇറക്കി വയ്ക്കടേ!",
  },
  {
    type: "THE TAB HOARDER",
    activity: "Laptop operations",
    detectedActivity: "sitting with laptop",
    socialBattery: 12,
    braincells: 0.4,
    threatLevel: "MEDIUM",
    quest: "Close one browser tab. Just one.",
    roast: "That laptop has been opened for decorative purposes.",
    malayalamStatus: "പണി പാളി.",
  },
  {
    type: "THE PROFESSIONAL CHUMMA-STANDER",
    activity: "Strategic standing",
    detectedActivity: "standing with no visible activity",
    socialBattery: 40,
    braincells: 3.2,
    threatLevel: "NONE",
    quest: "Walk five metres with purpose.",
    roast: "Bro spawned here and forgot the objective.",
    malayalamStatus: "ചുമ്മാ നിൽക്കുന്നു.",
  },
  {
    type: "THE CAMPUS FURNITURE",
    activity: "Existing",
    detectedActivity: "standing alone",
    socialBattery: 0,
    braincells: 1.0,
    threatLevel: "NONE",
    quest: "Make eye contact with another human.",
    roast: "Bro has successfully become part of the furniture.",
    malayalamStatus: "അവസ്ഥ മോശം.",
  },
  {
    type: "THE SIDE QUEST NPC",
    activity: "Walking with phone",
    detectedActivity: "walking while using phone",
    socialBattery: 55,
    braincells: 4.5,
    threatLevel: "LOW",
    quest: "Look up from the phone for 3 seconds.",
    roast: "Bro is letting Google Maps and God handle the rest.",
    malayalamStatus: "ദൈവമേ.",
  },
];

export function getRandomMockNPC(): NPCProfile {
  return MOCK_NPCS[Math.floor(Math.random() * MOCK_NPCS.length)];
}

export function getMockSceneAnalysis(): SceneAnalysis {
  const count = Math.floor(Math.random() * 5) + 1;
  const observations: Observation[] = Array.from({ length: count }, () => ({
    activity: "standing",
    device: null,
    groupSize: 1,
    movement: "low" as const,
  }));

  return {
    peopleCount: count,
    observations,
    sceneCommentary: `${count} humans detected. Purpose unclear.`,
  };
}
