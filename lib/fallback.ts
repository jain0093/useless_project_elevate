// ============================================
// 🎴 NPC WATCH — ONE-SENTENCE MEME FALLBACKS
// ============================================

import type { NPCProfile, SceneAnalysis } from "./types";

/** Pre-written one-sentence meme roast fallback NPCs grounded in actual observables */
const FALLBACK_NPCS: NPCProfile[] = [
  // PHONE ACTIVITIES
  {
    type: "THE PHONE HAS FULL CUSTODY",
    activity: "Phone Combat",
    detectedActivity: "sitting while using a phone",
    socialBattery: 5,
    braincells: 0.8,
    threatLevel: "LOW",
    quest: "Put the rectangle down before it becomes your legal guardian.",
    roast: "Nah, that phone has full custody at this point.",
  },
  {
    type: "THE NOTIFICATION SLAVE",
    activity: "Screen Scrolling",
    detectedActivity: "using phone",
    socialBattery: 10,
    braincells: 1.2,
    threatLevel: "LOW",
    quest: "Look at anything that does not emit blue light.",
    roast: "Bro is checking that phone like the stock market depends on him.",
  },
  {
    type: "THE RECTANGLE DEPENDENT",
    activity: "Digital Attachment",
    detectedActivity: "holding phone",
    socialBattery: 8,
    braincells: 1.1,
    threatLevel: "LOW",
    quest: "Survive 60 seconds without unlocking the screen.",
    roast: "The phone clearly outranks everyone else in this room.",
  },
  {
    type: "THE THUMB ATHLETE",
    activity: "Thumb Cardio",
    detectedActivity: "sitting while using a phone",
    socialBattery: 14,
    braincells: 1.5,
    threatLevel: "LOW",
    quest: "Give the dominant thumb a ten-second union break.",
    roast: "One thumb is doing Olympic gymnastics while the brain is on standby.",
  },
  {
    type: "THE BLUE LIGHT CAPTIVE",
    activity: "Retina Heating",
    detectedActivity: "standing while using a phone",
    socialBattery: 6,
    braincells: 0.9,
    threatLevel: "LOW",
    quest: "Acknowledge physical geometry instead of the feed.",
    roast: "Bro's retinas are getting cooked in ultra high definition.",
  },

  // LAPTOP ACTIVITIES
  {
    type: "THE GUY WHO OPENED THE LAPTOP FOR NO REASON",
    activity: "Laptop Decoration",
    detectedActivity: "using laptop",
    socialBattery: 12,
    braincells: 0.4,
    threatLevel: "MEDIUM",
    quest: "Close one browser tab. Just one.",
    roast: "Laptop's open. That's about as far as the productivity arc has gone.",
  },
  {
    type: "THE ONE-TAB SCHOLAR",
    activity: "Visual Staring",
    detectedActivity: "looking at laptop screen",
    socialBattery: 15,
    braincells: 1.0,
    threatLevel: "LOW",
    quest: "Press at least three keys on the keyboard.",
    roast: "Bro opened the laptop like the assignment was going to apologize first.",
  },
  {
    type: "THE DEADLINE CASUALTY",
    activity: "Strategic Procrastination",
    detectedActivity: "sitting with laptop",
    socialBattery: 20,
    braincells: 0.7,
    threatLevel: "HIGH",
    quest: "Open the assignment before the deadline opens you.",
    roast: "Bro's academic comeback has been delayed indefinitely.",
  },
  {
    type: "THE TAB HOARDER",
    activity: "RAM Depletion",
    detectedActivity: "sitting while using a laptop",
    socialBattery: 18,
    braincells: 1.3,
    threatLevel: "MEDIUM",
    quest: "Find the audio source playing from mystery tab #34.",
    roast: "Fifty-seven tabs open and not a single one contains the answer.",
  },
  {
    type: "THE DESK ARCHITECT",
    activity: "Workspace Staging",
    detectedActivity: "sitting while using a laptop",
    socialBattery: 25,
    braincells: 1.6,
    threatLevel: "LOW",
    quest: "Stop rearranging pens and type one real sentence.",
    roast: "Setting up the workspace took two hours. Actual output: zero words.",
  },

  // SITTING ACTIVITIES (NO DEVICE)
  {
    type: "THE PERMANENT FIXTURE",
    activity: "Structural Seating",
    detectedActivity: "sitting",
    socialBattery: 2,
    braincells: 0.5,
    threatLevel: "NONE",
    quest: "Shift your weight by two inches to prove biological status.",
    roast: "Bro is technically part of the structural floor plan at this point.",
  },
  {
    type: "THE ENERGY CONSERVATIONIST",
    activity: "Metabolic Minimalist",
    detectedActivity: "sitting",
    socialBattery: 0,
    braincells: 0.2,
    threatLevel: "NONE",
    quest: "Breathe with slightly more ambition.",
    roast: "Zero calories burned since the system initialized.",
  },
  {
    type: "THE ROOM VENTILATOR",
    activity: "Atmospheric Presence",
    detectedActivity: "sitting",
    socialBattery: 7,
    braincells: 0.6,
    threatLevel: "NONE",
    quest: "Remember what legs are typically engineered for.",
    roast: "Bro is solely responsible for air displacement in this sector.",
  },
  {
    type: "THE MEDITATIVE VOID",
    activity: "Zero Computation",
    detectedActivity: "sitting",
    socialBattery: -2,
    braincells: 0.1,
    threatLevel: "NONE",
    quest: "Have a single conscious thought before the timer expires.",
    roast: "Not a single thought has crossed that forehead in twenty minutes.",
  },
  {
    type: "THE CHAIR SOVEREIGN",
    activity: "Imperial Stasis",
    detectedActivity: "sitting",
    socialBattery: 11,
    braincells: 0.8,
    threatLevel: "LOW",
    quest: "Acknowledge that other furniture exists in this universe.",
    roast: "Doing absolutely nothing with startling levels of confidence.",
  },

  // STANDING / ALONE
  {
    type: "THE HUMAN LOADING SCREEN",
    activity: "Strategic Standing",
    detectedActivity: "standing",
    socialBattery: 35,
    braincells: 1.9,
    threatLevel: "NONE",
    quest: "Discover why you spawned in this exact location.",
    roast: "Bro spawned here and immediately forgot the main quest.",
  },
  {
    type: "THE CORRIDOR NPC",
    activity: "Ambient Presence",
    detectedActivity: "standing",
    socialBattery: -5,
    braincells: 0.3,
    threatLevel: "NONE",
    quest: "Blink once to confirm consciousness.",
    roast: "Bro is just standing there. No objective. No dialogue. Nothing.",
  },
  {
    type: "THE UNPROMPTED SENTINEL",
    activity: "Perimeter Loitering",
    detectedActivity: "standing",
    socialBattery: 15,
    braincells: 0.7,
    threatLevel: "LOW",
    quest: "Guard this square tile of flooring like a sacred relic.",
    roast: "Standing guard over completely empty floor space for free.",
  },
  {
    type: "THE QUEUE SIMULATOR",
    activity: "Phantom Line Standing",
    detectedActivity: "standing",
    socialBattery: 22,
    braincells: 1.1,
    threatLevel: "NONE",
    quest: "Verify whether an actual line exists in front of you.",
    roast: "Standing in a queue that exists solely in alternate dimensions.",
  },

  // WALKING
  {
    type: "THE WALKING SIDE QUEST",
    activity: "Mobile Navigation",
    detectedActivity: "walking while using a phone",
    socialBattery: 20,
    braincells: 1.1,
    threatLevel: "LOW",
    quest: "Reach your destination before the plot changes.",
    roast: "Bro is walking like Google Maps is a trusted adult.",
  },
  {
    type: "THE AUTOPILOT WANDERER",
    activity: "Motion Forward",
    detectedActivity: "walking",
    socialBattery: 30,
    braincells: 2.0,
    threatLevel: "LOW",
    quest: "Remember where you were walking to.",
    roast: "Walking with maximum confidence and absolutely zero navigation data.",
  },
  {
    type: "THE SPEEDRUN CASUALTY",
    activity: "Rapid Transit",
    detectedActivity: "walking",
    socialBattery: 40,
    braincells: 1.8,
    threatLevel: "MEDIUM",
    quest: "Pace through the hallway without checking an invisible watch.",
    roast: "Power-walking away from responsibilities at breakneck speed.",
  },
  {
    type: "THE HALLWAY EXTRA",
    activity: "Background Movement",
    detectedActivity: "walking",
    socialBattery: 28,
    braincells: 1.4,
    threatLevel: "LOW",
    quest: "Cross the camera view without making direct eye contact.",
    roast: "Just providing background extras motion for the main character.",
  },

  // GROUP ACTIVITIES
  {
    type: "THE GROUP PROJECT VICTIM",
    activity: "Committee Deliberation",
    detectedActivity: "standing in group around laptop",
    socialBattery: 45,
    braincells: 2.2,
    threatLevel: "MEDIUM",
    quest: "Elect a leader before everyone starts saying 'you do it'.",
    roast: "Four people around one laptop. This is either a group project or a hostage situation.",
  },
  {
    type: "THE UNAUTHORIZED GROUP MEETING",
    activity: "Unauthorized Meeting",
    detectedActivity: "standing in a group",
    socialBattery: 60,
    braincells: 2.8,
    threatLevel: "LOW",
    quest: "Say one thing that advances the conversation.",
    roast: "This meeting has four people and somehow less brainpower than a loading screen.",
  },
  {
    type: "THE CHAOTIC SYNDICATE",
    activity: "Collective Buffering",
    detectedActivity: "standing in a group",
    socialBattery: 50,
    braincells: 2.1,
    threatLevel: "LOW",
    quest: "Find one member with active task memory.",
    roast: "Three humans combined together to achieve zero net productivity.",
  },

  // UNCLEAR / OCCLUDED
  {
    type: "THE MYSTERY ASSET",
    activity: "Unresolved Behavior",
    detectedActivity: "activity unclear",
    socialBattery: 10,
    braincells: 1.0,
    threatLevel: "LOW",
    quest: "Step into clear lighting.",
    roast: "We have no idea what the objective is. Bro refuses to elaborate.",
  },
];

/** Returns a random fallback NPC with deduplication against usedTypes and activity grounding */
export function getRandomFallbackNPC(
  usedTypes: string[] = [],
  observedActivity?: string,
  observedDevice?: string | null,
  usedOpinions: string[] = [],
  usedQuests: string[] = []
): NPCProfile {
  const usedTypeSet = new Set(usedTypes.map((t) => t.toUpperCase().trim()));

  // Filter available fallbacks that haven't been used yet
  let candidates = FALLBACK_NPCS.filter((npc) => !usedTypeSet.has(npc.type.toUpperCase().trim()));

  // If all fallbacks are exhausted, reset candidate pool
  if (candidates.length === 0) {
    candidates = [...FALLBACK_NPCS];
  }

  // If activity or device is known, strictly match candidates
  const act = (observedActivity || "").toLowerCase();
  const isPhone = observedDevice === "cell phone" || act.includes("phone");
  const isLaptop = observedDevice === "laptop" || act.includes("laptop");
  const isWalking = act.includes("walk");
  const isSitting = act.includes("sit");
  const isStanding = act.includes("stand");

  if (isWalking && isPhone) {
    const matched = candidates.filter((n) => n.detectedActivity.includes("walk") && n.detectedActivity.includes("phone"));
    if (matched.length > 0) candidates = matched;
  } else if (isWalking) {
    const matched = candidates.filter((n) => n.detectedActivity.includes("walk") && !n.detectedActivity.includes("phone"));
    if (matched.length > 0) candidates = matched;
  } else if (isSitting && isPhone) {
    const matched = candidates.filter((n) => n.detectedActivity.includes("phone") && !n.detectedActivity.includes("walk"));
    if (matched.length > 0) candidates = matched;
  } else if (isSitting && isLaptop) {
    const matched = candidates.filter((n) => n.detectedActivity.includes("laptop"));
    if (matched.length > 0) candidates = matched;
  } else if (isSitting) {
    // Sitting with no phone/laptop — strictly filter OUT phone, laptop, and walking
    const matched = candidates.filter(
      (n) => !n.detectedActivity.includes("phone") && !n.detectedActivity.includes("walk") && !n.detectedActivity.includes("laptop")
    );
    if (matched.length > 0) candidates = matched;
  } else if (isStanding && isPhone) {
    const matched = candidates.filter((n) => n.detectedActivity.includes("phone") && !n.detectedActivity.includes("walk"));
    if (matched.length > 0) candidates = matched;
  } else if (isStanding) {
    // Standing with no device — filter OUT phone, laptop, and walking
    const matched = candidates.filter(
      (n) => n.detectedActivity.includes("stand") && !n.detectedActivity.includes("phone") && !n.detectedActivity.includes("laptop")
    );
    if (matched.length > 0) candidates = matched;
  } else if (isPhone) {
    const matched = candidates.filter((n) => n.detectedActivity.includes("phone"));
    if (matched.length > 0) candidates = matched;
  } else if (isLaptop) {
    const matched = candidates.filter((n) => n.detectedActivity.includes("laptop"));
    if (matched.length > 0) candidates = matched;
  }

  // Filter out candidates with near-duplicate roast or quest if possible
  const freshCandidates = candidates.filter(
    (c) => !usedOpinions.includes(c.roast) && !usedQuests.includes(c.quest)
  );
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  }

  const index = Math.floor(Math.random() * candidates.length);
  const selected = { ...candidates[index] };

  // RULE 1: The factual activity MUST NEVER be overridden by a fallback archetype
  if (observedActivity && observedActivity.trim().length > 0) {
    selected.detectedActivity = observedActivity.trim();
    selected.activity = observedActivity.trim();
  }

  // If the selected type is still in usedTypes (pool was exhausted), generate a fresh numbered variant
  if (usedTypeSet.has(selected.type.toUpperCase().trim())) {
    selected.type = `${selected.type} MK-${usedTypes.length + 1}`;
  }

  return selected;
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
