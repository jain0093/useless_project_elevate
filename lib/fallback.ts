// ============================================
// 🎴 NPC WATCH — ONE-SENTENCE MEME FALLBACKS
// ============================================

import type { NPCProfile, SceneAnalysis } from "./types";

/** Pre-written one-sentence meme roast fallback NPCs */
const FALLBACK_NPCS: NPCProfile[] = [
  {
    type: "THE PROFESSIONAL SCROLLER",
    activity: "Phone Combat",
    detectedActivity: "sitting while using phone",
    socialBattery: 5,
    braincells: 0.8,
    threatLevel: "LOW",
    quest: "Put the phone down for 5 seconds.",
    roast: "Bro opened the phone and immediately left reality.",
    malayalamStatus: "പണി പാളി.",
  },
  {
    type: "THE TAB HOARDER",
    activity: "Laptop Decoration",
    detectedActivity: "using laptop",
    socialBattery: 12,
    braincells: 0.4,
    threatLevel: "MEDIUM",
    quest: "Close one browser tab. Just one.",
    roast: "That laptop has been opened for decorative purposes.",
    malayalamStatus: "അവസ്ഥ മോശം.",
  },
  {
    type: "THE CAMPUS FURNITURE",
    activity: "Strategic Standing",
    detectedActivity: "standing alone",
    socialBattery: 35,
    braincells: 1.9,
    threatLevel: "NONE",
    quest: "Walk somewhere with actual purpose.",
    roast: "Bro spawned here and forgot the objective.",
    malayalamStatus: "ചുമ്മാ നിൽക്കുന്നു.",
  },
  {
    type: "THE COMMITTEE MEMBER",
    activity: "Group Inspection",
    detectedActivity: "multiple people around laptop",
    socialBattery: 70,
    braincells: 2.8,
    threatLevel: "MEDIUM",
    quest: "Contribute one useful sentence to the group.",
    roast: "Four people around one laptop and somehow nobody is typing.",
    malayalamStatus: "എന്താണ് ഈ സംഭവം?",
  },
  {
    type: "THE WALKING HAZARD",
    activity: "Mobile Navigation",
    detectedActivity: "walking while using phone",
    socialBattery: 20,
    braincells: 1.1,
    threatLevel: "LOW",
    quest: "Look up from the phone. Just once.",
    roast: "Bro is letting Google Maps and God handle the rest.",
    malayalamStatus: "ദൈവമേ.",
  },
  {
    type: "THE HUMAN BUFFERING",
    activity: "Motionless Staring",
    detectedActivity: "standing motionless",
    socialBattery: -10,
    braincells: 0.3,
    threatLevel: "NONE",
    quest: "Blink. Please.",
    roast: "Bro is buffering in real life.",
    malayalamStatus: "ഓടിക്കോ.",
  },
  {
    type: "THE ATTENDANCE NPC",
    activity: "Existing",
    detectedActivity: "sitting alone",
    socialBattery: 5,
    braincells: 0.5,
    threatLevel: "LOW",
    quest: "Stay awake for 10 more minutes.",
    roast: "Bro showed up purely for attendance and his soul left 4 minutes ago.",
    malayalamStatus: "ലൈഫ് ഇല്ല.",
  },
  {
    type: "THE SCREEN STARE CHAMPION",
    activity: "Visual Meditation",
    detectedActivity: "looking at phone screen",
    socialBattery: 15,
    braincells: 1.0,
    threatLevel: "LOW",
    quest: "Look at something that isn't a screen.",
    roast: "That phone has full custody of this man's attention.",
    malayalamStatus: "ഫോൺ ഇറക്കി വയ്ക്ക്.",
  },
  {
    type: "THE GROUP PROJECT GHOST",
    activity: "Passive Observation",
    detectedActivity: "standing in group",
    socialBattery: 60,
    braincells: 2.1,
    threatLevel: "LOW",
    quest: "Say one thing in the group conversation.",
    roast: "We got a group project meeting before anyone actually doing work.",
    malayalamStatus: "ശരി മക്കളേ.",
  },
  {
    type: "THE PROFESSIONAL OXYGEN WASTER",
    activity: "Advanced Breathing",
    detectedActivity: "standing with no visible activity",
    socialBattery: -15,
    braincells: 0.2,
    threatLevel: "NONE",
    quest: "Do literally anything.",
    roast: "Bro has entered spectator mode.",
    malayalamStatus: "ചുമ്മാ.",
  },
];

/** Returns a random fallback NPC */
export function getRandomFallbackNPC(): NPCProfile {
  const index = Math.floor(Math.random() * FALLBACK_NPCS.length);
  return { ...FALLBACK_NPCS[index] };
}

/** Returns a fallback scene analysis */
export function getFallbackSceneAnalysis(): SceneAnalysis {
  const count = Math.floor(Math.random() * 6) + 1;
  const activities = [
    "sitting alone with phone",
    "standing strategically",
    "walking while reading",
    "group laptop inspection",
    "stationary gazing",
  ];
  const devices = ["laptop", "phone", null, null, "tablet", "beverage"];
  const movements: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];

  const commentaries = [
    "Three people have formed a committee around one laptop.",
    "Five people detected and somehow nobody looks employed.",
    "Two humans, one phone, zero reason to be standing this close.",
    "Someone brought a laptop and accidentally summoned the entire population.",
    "One human is moving, everyone else is apparently buffering.",
  ];

  const observations = [];
  const obsCount = Math.min(count, Math.floor(Math.random() * 3) + 1);
  for (let i = 0; i < obsCount; i++) {
    observations.push({
      activity: activities[Math.floor(Math.random() * activities.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      groupSize: Math.floor(Math.random() * 3) + 1,
      movement: movements[Math.floor(Math.random() * movements.length)],
    });
  }

  return {
    peopleCount: count,
    observations,
    sceneCommentary: commentaries[Math.floor(Math.random() * commentaries.length)],
  };
}

export const ALL_FALLBACK_NPCS = FALLBACK_NPCS;
