// ============================================
// NPC WATCH — Mock NPC Data for Frontend Demo
// These mirror the backend fallback.ts shapes
// ============================================

import type { NPCProfile, SceneAnalysis, Observation } from "@/lib/types";

export const MOCK_NPCS: NPCProfile[] = [
  {
    type: "THE DEADLINE WARRIOR",
    activity: "Laptop combat",
    socialBattery: 12,
    braincells: 1.5,
    threatLevel: "LOW",
    quest: "Drink water. Your body is 60% deadline anxiety.",
    opinion:
      "This NPC has been fighting that laptop for an eternity. The laptop is winning.",
    malayalamStatus: "Pani paali bro.",
  },
  {
    type: "THE LOST FRESHIE",
    activity: "Confused standing",
    socialBattery: 87,
    braincells: 4.2,
    threatLevel: "NONE",
    quest: "Find someone who looks equally confused. Form an alliance.",
    opinion:
      "This NPC has the map open but is walking in the wrong direction.",
    malayalamStatus: "Entha mone, vazi ariyunnundo?",
  },
  {
    type: "THE LOADING SCREEN",
    activity: "Motionless staring",
    socialBattery: 3,
    braincells: 0.8,
    threatLevel: "NONE",
    quest: "Move approximately 4 metres. In any direction. Please.",
    opinion:
      "Bro is buffering. Someone check if the human has frozen.",
    malayalamStatus: "Chumma nilkkunnu, oru karyavum illa.",
  },
  {
    type: "THE SIDE-QUEST NPC",
    activity: "Wandering aimlessly",
    socialBattery: 55,
    braincells: 3.1,
    threatLevel: "LOW",
    quest: "Pretend you know where you are going. Walk with purpose.",
    opinion:
      "This NPC is clearly on a side quest. The main quest has been abandoned.",
    malayalamStatus: "Veruthe nadakkuva.",
  },
  {
    type: "THE PROFESSIONAL CHUMMA-STANDER",
    activity: "Strategic standing",
    socialBattery: 45,
    braincells: 2.0,
    threatLevel: "NONE",
    quest: "Stand somewhere else. For variety.",
    opinion:
      "This NPC has mastered the art of standing. No further skills detected.",
    malayalamStatus: "Scene illa, chumma nilkkuva.",
  },
  {
    type: "THE COUNCIL",
    activity: "Group assembly",
    socialBattery: 72,
    braincells: 6.3,
    threatLevel: "MEDIUM",
    quest: "Determine the actual purpose of this meeting. Report findings.",
    opinion:
      "The council has assembled. Nobody knows why. Everyone pretends they do.",
    malayalamStatus: "Ithentha sambhavam? Aarum ariyilla.",
  },
  {
    type: "THE BACKGROUND CHARACTER",
    activity: "Existing quietly",
    socialBattery: 30,
    braincells: 5.0,
    threatLevel: "NONE",
    quest: "Continue existing. You are doing great.",
    opinion:
      "This NPC contributes to the atmosphere. Role unclear but vibes are stable.",
    malayalamStatus: "Onnum manasilayilla.",
  },
  {
    type: "UNKNOWN ENTITY",
    activity: "Unclassifiable behaviour",
    socialBattery: 50,
    braincells: 9.9,
    threatLevel: "HIGH",
    quest: "Reveal your true quest line.",
    opinion:
      "The system cannot classify this entity. Threat assessment inconclusive.",
    malayalamStatus: "Eda ithu entha?",
  },
  {
    type: "THE CHAI MERCHANT",
    activity: "Beverage acquisition",
    socialBattery: 68,
    braincells: 7.0,
    threatLevel: "NONE",
    quest: "Share chai with a stranger. Gain +5 social battery.",
    opinion:
      "This NPC has identified the only meaningful quest in the entire venue.",
    malayalamStatus: "Poi chaaya kudikk.",
  },
  {
    type: "THE PHONE ARCHAEOLOGIST",
    activity: "Intense phone scrolling",
    socialBattery: 15,
    braincells: 1.2,
    threatLevel: "LOW",
    quest: "Put the phone down for 30 seconds. Experience reality.",
    opinion:
      "This NPC has been scrolling for so long, the phone is now an extension of their hand.",
    malayalamStatus: "Phone-il entha kanduvo, aarum ariyilla.",
  },
  {
    type: "THE FINAL BOSS",
    activity: "Intimidating presence",
    socialBattery: 90,
    braincells: 8.5,
    threatLevel: "CRITICAL",
    quest: "Maintain dominance. Do not break eye contact with the camera.",
    opinion:
      "This NPC radiates main character energy. All other NPCs are side characters now.",
    malayalamStatus: "Adi poli, boss vannu!",
  },
  {
    type: "THE SLEEP-DEPRIVED CODER",
    activity: "Aggressive keyboard activity",
    socialBattery: 5,
    braincells: 0.3,
    threatLevel: "MEDIUM",
    quest: "Close one browser tab. Just one. You can do it.",
    opinion:
      "This NPC's code is compiling. Their will to live is not.",
    malayalamStatus: "Urangikko mone, nale koodiyaam.",
  },
];

/** Returns a random mock NPC */
export function getRandomMockNPC(): NPCProfile {
  const index = Math.floor(Math.random() * MOCK_NPCS.length);
  return { ...MOCK_NPCS[index] };
}

/** Generates a mock scene analysis */
export function getMockSceneAnalysis(): SceneAnalysis {
  const count = Math.floor(Math.random() * 8) + 1;
  const activities = [
    "sitting",
    "standing",
    "walking",
    "talking",
    "looking around",
    "typing furiously",
    "staring at phone",
  ];
  const devices: (string | null)[] = [
    "laptop",
    "phone",
    null,
    null,
    "tablet",
  ];
  const movements: Observation["movement"][] = ["low", "medium", "high"];

  const commentaries = [
    `${count} HUMANS DETECTED. SCANNING FOR NPC BEHAVIOUR.`,
    `${count} BIOLOGICAL ENTITIES LOCATED. ANALYSING THREAT LEVELS.`,
    `DETECTED ${count} LIFE FORMS. MOST APPEAR HARMLESS.`,
    `${count} SUBJECTS IN FRAME. INITIATING BEHAVIOURAL ANALYSIS.`,
    `SCANNER REPORTS ${count} HUMANS. PURPOSE: UNCLEAR.`,
  ];

  const observations: Observation[] = [];
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
    sceneCommentary:
      commentaries[Math.floor(Math.random() * commentaries.length)],
  };
}
