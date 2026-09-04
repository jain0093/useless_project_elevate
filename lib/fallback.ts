// ============================================
// 🎴 NPC WATCH — Emergency NPC Database
// WHEN THE AI BRAIN IS COOKED, THESE SAVE US.
// ============================================

import type { NPCProfile, SceneAnalysis } from "./types";

/** Pre-written fallback NPCs for when AI is unavailable */
const FALLBACK_NPCS: NPCProfile[] = [
  {
    type: "THE DEADLINE WARRIOR",
    activity: "Laptop combat",
    socialBattery: 12,
    braincells: 1.5,
    threatLevel: "LOW",
    quest: "Drink water. Your body is 60% deadline anxiety.",
    opinion: "This NPC has been fighting that laptop for an eternity. The laptop is winning.",
    malayalamStatus: "പണി പാളി.",
  },
  {
    type: "THE LOST FRESHIE",
    activity: "Confused standing",
    socialBattery: 87,
    braincells: 4.2,
    threatLevel: "NONE",
    quest: "Find someone who looks equally confused. Form an alliance.",
    opinion: "This NPC has the map open but is walking in the wrong direction.",
    malayalamStatus: "വഴി അറിയില്ല.",
  },
  {
    type: "THE LOADING SCREEN",
    activity: "Motionless staring",
    socialBattery: 3,
    braincells: 0.8,
    threatLevel: "NONE",
    quest: "Move approximately 4 metres. In any direction. Please.",
    opinion: "Bro is buffering. Someone check if the human has frozen.",
    malayalamStatus: "ചുമ്മാ നിൽക്കുന്നു.",
  },
  {
    type: "THE SIDE-QUEST NPC",
    activity: "Wandering aimlessly",
    socialBattery: 55,
    braincells: 3.1,
    threatLevel: "LOW",
    quest: "Pretend you know where you are going. Walk with purpose.",
    opinion: "This NPC is clearly on a side quest. The main quest has been abandoned.",
    malayalamStatus: "വെറുതേ നടക്കുവാ.",
  },
  {
    type: "THE PROFESSIONAL CHUMMA-STANDER",
    activity: "Strategic standing",
    socialBattery: 45,
    braincells: 2.0,
    threatLevel: "NONE",
    quest: "Stand somewhere else. For variety.",
    opinion: "This NPC has mastered the art of standing. No further skills detected.",
    malayalamStatus: "സീൻ ഇല്ല.",
  },
  {
    type: "THE COUNCIL",
    activity: "Group assembly",
    socialBattery: 72,
    braincells: 6.3,
    threatLevel: "MEDIUM",
    quest: "Determine the actual purpose of this meeting. Report findings.",
    opinion: "The council has assembled. Nobody knows why. Everyone pretends they do.",
    malayalamStatus: "എന്താണ് ഈ സംഭവം?",
  },
  {
    type: "THE BACKGROUND CHARACTER",
    activity: "Existing quietly",
    socialBattery: 30,
    braincells: 5.0,
    threatLevel: "NONE",
    quest: "Continue existing. You are doing great.",
    opinion: "This NPC contributes to the atmosphere. Role unclear but vibes are stable.",
    malayalamStatus: "ഒന്നും മനസ്സിലായില്ല.",
  },
  {
    type: "UNKNOWN ENTITY",
    activity: "Unclassifiable behaviour",
    socialBattery: 50,
    braincells: 9.9,
    threatLevel: "HIGH",
    quest: "Reveal your true quest line.",
    opinion: "The system cannot classify this entity. Threat assessment inconclusive.",
    malayalamStatus: "ഇത് എന്താ സാധനം?",
  },
  {
    type: "THE CHAI MERCHANT",
    activity: "Beverage acquisition",
    socialBattery: 68,
    braincells: 7.0,
    threatLevel: "NONE",
    quest: "Share chai with a stranger. Gain +5 social battery.",
    opinion: "This NPC has identified the only meaningful quest in the entire venue.",
    malayalamStatus: "പോയി ചായ കുടിക്ക്.",
  },
  {
    type: "THE PHONE ARCHAEOLOGIST",
    activity: "Intense phone scrolling",
    socialBattery: 15,
    braincells: 1.2,
    threatLevel: "LOW",
    quest: "Put the phone down for 30 seconds. Experience reality.",
    opinion: "This NPC has been scrolling for so long, the phone is now an extension of their hand.",
    malayalamStatus: "ഫോണിൽ ജീവിക്കുന്നു.",
  },
  {
    type: "THE FINAL BOSS",
    activity: "Intimidating presence",
    socialBattery: 90,
    braincells: 8.5,
    threatLevel: "CRITICAL",
    quest: "Maintain dominance. Do not break eye contact with the camera.",
    opinion: "This NPC radiates main character energy. All other NPCs are side characters now.",
    malayalamStatus: "ആളൊരു ലെവലാ.",
  },
  {
    type: "THE SLEEP-DEPRIVED CODER",
    activity: "Aggressive keyboard activity",
    socialBattery: 5,
    braincells: 0.3,
    threatLevel: "MEDIUM",
    quest: "Close one browser tab. Just one. You can do it.",
    opinion: "This NPC's code is compiling. Their will to live is not.",
    malayalamStatus: "ഉറങ്ങിക്കോ, നാളെ കൂടിയാം.",
  },
];

/** Returns a random fallback NPC */
export function getRandomFallbackNPC(): NPCProfile {
  const index = Math.floor(Math.random() * FALLBACK_NPCS.length);
  return { ...FALLBACK_NPCS[index] };
}

/** Returns a fallback scene analysis */
export function getFallbackSceneAnalysis(): SceneAnalysis {
  const count = Math.floor(Math.random() * 8) + 1;
  const activities = ["sitting", "standing", "walking", "talking", "looking around"];
  const devices = ["laptop", "phone", null, null, "tablet"];
  const movements: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];

  const commentaries = [
    "AI brain temporarily cooked. Estimating scene from emergency protocols.",
    "Vision system is napping. Deploying backup observations.",
    "The AI blinked. Generating approximate scene data.",
    "Neural pathways are buffering. Here is what the backup sensors think.",
    "Primary AI is having an existential crisis. Backup engaged.",
    "AI decided to take a chai break. Emergency mode activated.",
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

/** All fallback NPCs for reference */
export const ALL_FALLBACK_NPCS = FALLBACK_NPCS;
