// ============================================
// NPC WATCH — YELLING MALAYALAM BRAINROT MOCK DATABASE
// ============================================

import type { NPCProfile, SceneAnalysis, Observation } from "@/lib/types";

export const MOCK_NPCS: NPCProfile[] = [
  {
    type: "THE THUMB ATHLETE",
    activity: "Vertical scrolling",
    socialBattery: -5,
    braincells: 0.8,
    threatLevel: "LOW",
    quest: "Put the phone down for five seconds. This is your boss fight.",
    opinion: "The phone is six inches from their face. Their thumb has been promoted to senior management. At this point the human is just the phone's carrying case.",
    malayalamStatus: "ഡേയ് ഫോൺ വച്ച് പോയി ചത്തു തുലയെടാ!!",
  },
  {
    type: "THE TAB HOARDER",
    activity: "Laptop operations",
    socialBattery: 12,
    braincells: 0.4,
    threatLevel: "MEDIUM",
    quest: "Close one browser tab. Just one. Show courage.",
    opinion: "Laptop open. Multiple tabs visible. Not one of them appears to be helping. This is no longer multitasking. This is digital hoarding.",
    malayalamStatus: "ഇത് എന്തുവാടെ! ലാപ്ടോപ്പ് തുറന്നു വച്ച് സ്വപ്നം കാണുവാണോ ഫ്രോഡേ?!",
  },
  {
    type: "THE PROFESSIONAL CHUMMA-STANDER",
    activity: "Strategic standing",
    socialBattery: 35,
    braincells: 1.9,
    threatLevel: "NONE",
    quest: "Move three metres and pretend it was intentional.",
    opinion: "Standing completely still while the rest of the room continues functioning. No visible objective. No visible destination. Just raw NPC behaviour.",
    malayalamStatus: "ഒരു പണിയും ചെയ്യാതെ ഇവിടെ വെറുതേ ഡെക്കറേഷൻ ആയി നിൽക്കുവാണോ?!",
  },
  {
    type: "THE COUNCIL MEMBER",
    activity: "Collective laptop inspection",
    socialBattery: 70,
    braincells: 2.8,
    threatLevel: "MEDIUM",
    quest: "Convince your party that this meeting has no purpose.",
    opinion: "Three people are staring at the same screen. Nobody appears to be touching the keyboard. This meeting has achieved the rare state of having participants but no function.",
    malayalamStatus: "എന്താടാ അവിടെ എല്ലാവരും കൂടി തമാശ കളിക്കുന്നത്?! പണി പാളി!",
  },
  {
    type: "THE MOBILE NPC",
    activity: "Walking + phone",
    socialBattery: 20,
    braincells: 1.1,
    threatLevel: "LOW",
    quest: "Reach your destination without becoming a loading screen.",
    opinion: "Walking while looking at a rectangle. A bold collaboration between destiny and bad decision-making. The body has loaded. The brain has not.",
    malayalamStatus: "അയ്യോ കഷ്ടം! നേരെ നോക്കി നടക്കെടാ മണ്ടച്ചാ!!",
  },
  {
    type: "THE STATIONARY LEGEND",
    activity: "Stationary observation",
    socialBattery: -12,
    braincells: 1.5,
    threatLevel: "NONE",
    quest: "Stand up. Participate in the economy.",
    opinion: "An entire population is moving around them and this person has chosen to become furniture. Mobility has been temporarily disabled.",
    malayalamStatus: "ഇത് എന്തുവാടെ! ജീവനോടെ ഉണ്ടോ അതോ ഡെഡ് ആയോ?!",
  },
  {
    type: "THE CAFFEINE MERCHANT",
    activity: "Beverage ingestion",
    socialBattery: 50,
    braincells: 5.2,
    threatLevel: "NONE",
    quest: "Locate caffeine. Replenish social battery.",
    opinion: "Liquid acquired. The NPC has discovered the most advanced technology known to students: caffeine. Holding the cup like it contains the sum total of human wisdom.",
    malayalamStatus: "പോയി ചായ കുടിച്ച് കിടന്നുറങ്ങടാ സാറെ!!",
  },
  {
    type: "THE HUMAN SCREEN SAVER",
    activity: "Motionless staring",
    socialBattery: -10,
    braincells: 0.3,
    threatLevel: "NONE",
    quest: "Touch grass. Optional side quest.",
    opinion: "One human detected standing in the same location like an NPC who forgot their dialogue tree. Someone check if the server crashed.",
    malayalamStatus: "സീൻ കോണ്ട്ര മാൻ! എഴുന്നേറ്റു പോടെ മക്കളേ!!",
  },
  {
    type: "THE DEPARTMENT OF DOING NOTHING",
    activity: "Group inactivity",
    socialBattery: 60,
    braincells: 2.1,
    threatLevel: "LOW",
    quest: "Contribute one useful sentence to the committee.",
    opinion: "Four people are standing together. One is holding a phone, three are watching them hold the phone. We have successfully created a local surveillance economy.",
    malayalamStatus: "ശരി മക്കളേ! നാണം ഉണ്ടോടോ ഇങ്ങനെ നിൽക്കാൻ?!",
  },
  {
    type: "THE HUMAN BUFFERING...",
    activity: "Acoustic evasion",
    socialBattery: -15,
    braincells: 3.0,
    threatLevel: "LOW",
    quest: "Nod once to indicate you heard nothing that was just said.",
    opinion: "Headphones firmly attached. A loud, non-verbal notification that society is currently muted. The individual is physically present but spiritually unreachable.",
    malayalamStatus: "ഡേയ് ഹെഡ്ഫോൺ ഊരി വച്ച് മനുഷ്യന്മാര് പറയുന്നത് കേൾക്കെടോ!!",
  },
];

export function getRandomMockNPC(): NPCProfile {
  const index = Math.floor(Math.random() * MOCK_NPCS.length);
  return { ...MOCK_NPCS[index] };
}

export function getMockSceneAnalysis(): SceneAnalysis {
  const count = Math.floor(Math.random() * 6) + 1;
  const activities = [
    "sitting alone with phone",
    "standing strategically",
    "walking while reading",
    "group laptop inspection",
    "stationary gazing",
  ];
  const devices: (string | null)[] = [
    "laptop",
    "phone",
    null,
    null,
    "tablet",
    "beverage",
  ];
  const movements: Observation["movement"][] = ["low", "medium", "high"];

  const commentaries = [
    "ONE HUMAN DETECTED. PHONE IN HAND. ഡേയ് ഫോൺ വച്ച് പോയി ചത്തു തുലയെടാ!!",
    "THREE HUMANS HAVE FORMED A COUNCIL. എന്താടാ അവിടെ തമാശ കളിക്കുന്നത്?!",
    "FIVE HUMANS DETECTED. PRODUCTIVITY REMAINS A THEORETICAL CONCEPT. പണി പാളി!",
    "ONE HUMAN HAS BEEN STANDING LIKE AN NPC. ഒരു പണിയും ചെയ്യാതെ വെറുതേ ഡെക്കറേഷൻ ആയോ?!",
    "SEVEN HUMANS DETECTED. സീൻ കോണ്ട്ര മാൻ! എഴുന്നേറ്റു പോടെ!!",
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
