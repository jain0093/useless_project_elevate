// ============================================
// 🎴 NPC WATCH — MAXIMUM BRAINROT FALLBACKS
// Real Malayalam meme energy
// ============================================

import type { NPCProfile, SceneAnalysis } from "./types";

/** Pre-written unhinged fallback NPCs with real Malayalam meme punchlines */
const FALLBACK_NPCS: NPCProfile[] = [
  {
    type: "THE THUMB ATHLETE",
    activity: "Vertical scrolling",
    socialBattery: -5,
    braincells: 0.8,
    threatLevel: "LOW",
    quest: "Put the phone down for 5 seconds. This is your final boss fight.",
    opinion: "Bro's phone is so close to their face it's basically an eye exam. The thumb has been promoted to CEO. At this point the human is just the phone's carrying case.",
    malayalamStatus: "ഡേയ് ഫോൺ വയ്ക്കടേ! ജീവിതം ഉണ്ട്! 💀",
  },
  {
    type: "THE TAB HOARDER",
    activity: "Laptop operations",
    socialBattery: 12,
    braincells: 0.4,
    threatLevel: "MEDIUM",
    quest: "Close one browser tab. Just one. We believe in you.",
    opinion: "Laptop open. 47 tabs. Zero of them are helping. The cursor hasn't moved in 8 minutes. Academic comeback: missing, presumed dead, family notified.",
    malayalamStatus: "ലാപ്ടോപ്പ് തുറന്നു വച്ച് Netflix കാണുവാണോ?! ചേട്ടാ ഒരു ലൈഫ് തരുമോ? 💀",
  },
  {
    type: "THE PROFESSIONAL CHUMMA-STANDER",
    activity: "Strategic standing",
    socialBattery: 35,
    braincells: 1.9,
    threatLevel: "NONE",
    quest: "Walk somewhere with actual purpose. Side quest: remember why.",
    opinion: "One human has loaded into the scene but their quest log is empty. They're standing like a mannequin that gained consciousness but hasn't decided what to do with it yet.",
    malayalamStatus: "ഇത്ര ചുമ്മാ ആയാൽ ഗവൺമെന്റ് job കിട്ടും! 😂",
  },
  {
    type: "THE COUNCIL MEMBER",
    activity: "Collective laptop inspection",
    socialBattery: 70,
    braincells: 2.8,
    threatLevel: "MEDIUM",
    quest: "Contribute one useful sentence to the group. Difficulty: IMPOSSIBLE.",
    opinion: "Four humans have formed a circle of mutual uselessness. Combined productivity: 0. Combined confidence: 100. The keyboard is doing more work than all of them combined.",
    malayalamStatus: "സർ ഇത് college ആണ്, ചന്ത അല്ല! 😂 പണി പാളി!",
  },
  {
    type: "THE WALKING LOADING SCREEN",
    activity: "Walking + phone",
    socialBattery: 20,
    braincells: 1.1,
    threatLevel: "LOW",
    quest: "Look up from the phone. Achievement: Peripheral Vision Unlocked.",
    opinion: "Currently navigating the physical world using a screen instead of eyes. Darwin would be fascinated. Their WiFi signal has more sense of direction than them.",
    malayalamStatus: "നേരെ നോക്കി നടക്കെടാ! AI പറഞ്ഞതാ! ഓടിക്കോ! 🔥",
  },
  {
    type: "THE CAMPUS FURNITURE",
    activity: "Stationary existence",
    socialBattery: -12,
    braincells: 1.5,
    threatLevel: "NONE",
    quest: "Stand up. Participate in the economy. Touch grass optional.",
    opinion: "An entire population is moving around them and this person has chosen to become furniture. They have been in this exact position so long they should start charging rent.",
    malayalamStatus: "ജീവിതത്തിൽ ഇത്ര ചുമ്മാ ആയിട്ട് ആരും ഇല്ല! 💀",
  },
  {
    type: "THE SCREEN STARE CHAMPION",
    activity: "Motionless staring",
    socialBattery: -10,
    braincells: 0.3,
    threatLevel: "NONE",
    quest: "Blink. Please. The AI is concerned.",
    opinion: "One human detected staring at a screen with the intensity of someone defusing a bomb. Spoiler: they're reading a WhatsApp forward from their family group.",
    malayalamStatus: "എന്താ ആ screen-ൽ? ജീവിതത്തിന്റെ meaning കണ്ടോ?! 😭💀",
  },
  {
    type: "THE DEPARTMENT OF DOING NOTHING",
    activity: "Group inactivity",
    socialBattery: 60,
    braincells: 2.1,
    threatLevel: "LOW",
    quest: "Assign one person in this group an actual task. Any task.",
    opinion: "Five people are standing together. One is holding a phone, four are watching them hold the phone. This is the Indian education system in one frame.",
    malayalamStatus: "എല്ലാരും കൂടി ഒരാളുടെ phone നോക്കി ഇരിക്കുവാണോ?! പണി കിട്ടി! 💀",
  },
  {
    type: "THE ATTENDANCE NPC",
    activity: "Existing for attendance",
    socialBattery: 5,
    braincells: 0.5,
    threatLevel: "LOW",
    quest: "Stay awake for 10 more minutes. This is your side quest.",
    opinion: "This human showed up purely for attendance and their soul left approximately 4 minutes after arrival. The body remains. The spirit does not.",
    malayalamStatus: "ക്ലാസ്സ് കട്ട് ചെയ്ത് ഇവിടെ ഇരിക്കുവാണോ?! പോയി പഠിക്കെടാ! 💀",
  },
  {
    type: "THE PROFESSIONAL OXYGEN WASTER",
    activity: "Advanced breathing",
    socialBattery: -15,
    braincells: 0.2,
    threatLevel: "NONE",
    quest: "Do literally anything. The bar is underground and you're still limbo dancing under it.",
    opinion: "Headphones firmly attached. Society is currently muted. The individual is physically present but spiritually unreachable. Their ancestors survived famines for this moment.",
    malayalamStatus: "ഡേയ് ഹെഡ്ഫോൺ ഊരി വച്ച് real world-ലേക്ക് വാ! 😂 ജീവിതം ഉണ്ട്!",
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
    "ONE HUMAN DETECTED. PHONE IN HAND. SOUL IN AIRPLANE MODE. ഡേയ് ഫോൺ വയ്ക്കടേ! 💀",
    "THREE HUMANS FORMED A COUNCIL OF DOING NOTHING. പണി പാളി! 😂",
    "FIVE HUMANS DETECTED. COMBINED PRODUCTIVITY: NEGATIVE. ഓടിക്കോ മക്കളേ! 🔥",
    "ONE HUMAN STANDING LIKE A MANNEQUIN WITH DREAMS. ചുമ്മാ ഡെക്കറേഷൻ! 💀",
    "SEVEN HUMANS DETECTED. THE AI IS LOSING HOPE IN HUMANITY. ദൈവമേ... 😭",
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
