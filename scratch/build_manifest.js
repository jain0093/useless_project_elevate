const fs = require('fs');
const path = require('path');

const cleanClips = JSON.parse(fs.readFileSync('scratch/extracted_clips_clean.json', 'utf8'));

// Curated categorizations strictly mapped to real situations:
// 1. Sitting / Idle / Procrastination / Stationary / Waiting
// 2. Phone / Screen distraction
// 3. Laptop / Work simulation / Academic crisis
// 4. Walking / Movement / Speed
// 5. Standing / Waiting / Spawn point
// 6. Group / Chaos / Committee
// 7. Unclear / Glitched / Confused

const categoryMap = {
  1: {
    title: "Instant Shock Strike",
    categories: ["sitting", "idle", "deadpan", "stationary"],
    mood: ["blunt", "deadpan"],
    description: "Short sharp impact reaction appropriate for sudden discovery or person sitting stationary",
    useWhen: ["person sitting doing nothing", "stationary in chair", "immediate shock"]
  },
  2: {
    title: "Awkward Silence Pause",
    categories: ["sitting", "standing", "waiting", "awkward"],
    mood: ["awkward", "deadpan"],
    description: "Awkward pause dialogue for someone just standing or sitting with zero mission",
    useWhen: ["person stationary in one spot", "waiting for plot to begin", "awkward silence"]
  },
  3: {
    title: "Deadline Reality Check",
    categories: ["laptop", "useless activity", "failure", "sitting"],
    mood: ["disappointed", "sarcastic"],
    description: "Deadline roast dialogue suitable for someone pretending to work on a laptop",
    useWhen: ["sitting with laptop open", "pretending to work", "academic panic"]
  },
  4: {
    title: "Digital Trance Scroll",
    categories: ["phone", "distraction", "sitting", "screen captivity"],
    mood: ["captivated", "hopeless"],
    description: "Reels scrolling commentary appropriate for someone completely absorbed in their phone",
    useWhen: ["staring into phone screen", "doomscrolling reels", "sitting while using phone"]
  },
  5: {
    title: "Screen Custody Warning",
    categories: ["phone", "distraction", "awkward", "screen captivity"],
    mood: ["warning", "comedic"],
    description: "Reaction when the phone has taken full custody of the human subject",
    useWhen: ["phone has full custody", "unresponsive to physical reality"]
  },
  6: {
    title: "Sudden Evacuation Stinger",
    categories: ["walking", "movement", "speed"],
    mood: ["urgent", "startled"],
    description: "Quick movement sound appropriate for someone walking rapidly past camera",
    useWhen: ["speed-walking past camera", "leaving scene suddenly"]
  },
  7: {
    title: "The Overthinking Lecture",
    categories: ["laptop", "sitting", "disappointment", "dramatic reaction"],
    mood: ["dramatic", "exhausted"],
    description: "Extended philosophical lecture appropriate for someone staring blankly at a laptop screen",
    useWhen: ["staring at laptop blank document", "brain freeze with laptop"]
  },
  8: {
    title: "Furniture Status Confirmed",
    categories: ["sitting", "idle", "waiting", "stationary", "no activity"],
    mood: ["deadpan", "dry"],
    description: "Reaction appropriate for someone sitting around doing nothing, achieving furniture status",
    useWhen: ["person sitting unmoving for 10+ seconds", "blending into chair", "sitting doing nothing"]
  },
  9: {
    title: "Notification Addiction Hit",
    categories: ["phone", "distraction", "screen captivity"],
    mood: ["suspicious", "amused"],
    description: "Reaction appropriate for someone checking phone notifications obsessively",
    useWhen: ["checking phone every 2 seconds", "holding phone with two hands"]
  },
  10: {
    title: "Committee Of Zero Outcomes",
    categories: ["group", "laptop", "chaos", "useless activity"],
    mood: ["chaotic", "roast"],
    description: "Group roast dialogue when multiple people congregate around one screen with zero output",
    useWhen: ["multiple people surrounding one screen", "group project summit"]
  },
  11: {
    title: "Existential Standby Mode",
    categories: ["sitting", "idle", "waiting", "stationary", "no activity"],
    mood: ["philosophical", "tired"],
    description: "Slow reflection dialogue for someone sitting in complete standby mode doing nothing",
    useWhen: ["staring into empty space", "zero observable motion", "sitting doing nothing"]
  },
  12: {
    title: "The Secret Reel Watcher",
    categories: ["phone", "distraction", "sitting"],
    mood: ["secretive", "chuckling"],
    description: "Reaction for someone secretly grinning at reels on their phone screen",
    useWhen: ["smiling at phone privately", "secret reel watcher", "sitting with phone"]
  },
  13: {
    title: "Heroic Path To Nowhere",
    categories: ["walking", "movement", "dramatic reaction"],
    mood: ["triumphant", "absurd"],
    description: "Epic cinematic dialogue appropriate for someone walking with tremendous confidence into the void",
    useWhen: ["confident walking without purpose", "side-quest traversal"]
  },
  14: {
    title: "Human Loading Screen",
    categories: ["sitting", "idle", "waiting", "stationary", "awkward"],
    mood: ["baffled", "glitched"],
    description: "Complete dialogue roasting a person sitting motionless like a human loading screen",
    useWhen: ["human loading screen", "sitting with zero movement", "sitting doing nothing"]
  },
  15: {
    title: "Spawn Point Anchor",
    categories: ["standing", "waiting", "idle", "stationary", "awkward"],
    mood: ["grounded", "deadpan"],
    description: "Reaction for someone standing frozen in one tile like an un-triggered NPC",
    useWhen: ["standing in one tile", "spawn point camping", "standing still"]
  },
  16: {
    title: "Double-Tap Reflex",
    categories: ["phone", "distraction", "useless activity"],
    mood: ["frenetic", "addicted"],
    description: "Reaction for someone thumb-scrolling at 120 FPS",
    useWhen: ["thumb scrolling rapidly", "sitting while holding phone"]
  },
  17: {
    title: "Corridor Patrol Steps",
    categories: ["walking", "movement", "dramatic reaction"],
    mood: ["suspicious", "stealthy"],
    description: "Pacing dialogue suitable for someone walking back and forth along the hallway",
    useWhen: ["pacing back and forth", "walking slowly across room"]
  },
  18: {
    title: "Open Tab Graveyard",
    categories: ["laptop", "sitting", "failure", "useless activity"],
    mood: ["resigned", "sarcastic"],
    description: "Reaction suitable for someone sitting in front of a laptop with 47 inactive tabs",
    useWhen: ["sitting in front of laptop", "47 tabs open simulation"]
  },
  19: {
    title: "Syndicate Deliberation",
    categories: ["group", "chaos", "dramatic reaction"],
    mood: ["conspiratorial", "loud"],
    description: "Loud group discussion dialogue for 3 or more people gathered in a huddle",
    useWhen: ["group of 3+ people huddled", "corridor conference"]
  },
  20: {
    title: "Patient Monument Stinger",
    categories: ["standing", "waiting", "stationary"],
    mood: ["zen", "frozen"],
    description: "Reaction for someone standing around with the stillness of a historic monument",
    useWhen: ["standing still", "waiting for someone"]
  },
  21: {
    title: "Quick Standby Ping",
    categories: ["sitting", "idle", "stationary", "deadpan"],
    mood: ["deadpan", "dry"],
    description: "Short punchy observation for someone sitting doing absolutely nothing",
    useWhen: ["sitting doing nothing", "motionless seated posture"]
  },
  22: {
    title: "Disapproving Friend",
    categories: ["sitting", "standing", "awkward", "waiting"],
    mood: ["disapproving", "sharp"],
    description: "Reaction judging someone's total lack of life direction while sitting or standing idle",
    useWhen: ["sitting doing nothing", "standing staring blankly"]
  },
  23: {
    title: "Pacing Side Quest",
    categories: ["walking", "movement", "speed"],
    mood: ["hasty", "alert"],
    description: "Walking commentary for someone traversing the room like an active side quest",
    useWhen: ["walking across camera", "moving between rooms"]
  },
  24: {
    title: "Phantom Notification Ping",
    categories: ["phone", "waiting", "distraction"],
    mood: ["hopeful", "delusional"],
    description: "Reaction for someone staring at a dark phone screen hoping for a notification",
    useWhen: ["looking at locked screen", "checking phone for non-existent text"]
  },
  25: {
    title: "Hallway Traffic Obstacle",
    categories: ["standing", "waiting", "stationary", "awkward"],
    mood: ["immovable", "awkward"],
    description: "Extended dialogue roasting someone standing right in the middle of pedestrian flow",
    useWhen: ["standing in middle of hallway", "blocking traffic effortlessly", "standing still"]
  },
  26: {
    title: "Cognitive Reboot Needed",
    categories: ["sitting", "idle", "confusion", "unclear"],
    mood: ["blank", "glitched"],
    description: "Reaction for someone sitting with 0.1 braincells currently firing",
    useWhen: ["sitting doing nothing", "activity unclear", "blank stare"]
  },
  27: {
    title: "Professional Screen Stare",
    categories: ["laptop", "sitting", "useless activity"],
    mood: ["serious", "counterproductive"],
    description: "Dialogue roasting someone staring intently at a laptop with zero typing occurring",
    useWhen: ["staring intently at laptop with zero keystrokes", "sitting while using laptop"]
  },
  28: {
    title: "Uncoordinated Gathering",
    categories: ["group", "chaos", "confusion"],
    mood: ["chaotic", "unstructured"],
    description: "Dialogue for a confused group with zero leadership and no agreed agenda",
    useWhen: ["group gathered without clear leader", "chaos syndicate"]
  },
  29: {
    title: "Assignment Surrender",
    categories: ["laptop", "sitting", "failure", "disappointment"],
    mood: ["defeated", "deadpan"],
    description: "Reaction for someone sitting with laptop accepting that the assignment is lost",
    useWhen: ["deadline in 10 minutes", "sitting with laptop"]
  },
  30: {
    title: "Pacing Philosopher",
    categories: ["walking", "movement", "dramatic reaction"],
    mood: ["pompous", "aimless"],
    description: "Dialogue for someone pacing slowly while pretending to solve the mysteries of the universe",
    useWhen: ["walking while thinking", "endless corridor pacing"]
  },
  31: {
    title: "Solo Queue Simulator",
    categories: ["standing", "waiting", "stationary", "awkward"],
    mood: ["patient", "bizarre"],
    description: "Extended monologue roasting someone standing in a non-existent queue",
    useWhen: ["standing in a line that doesn't exist", "waiting for elevator that never comes"]
  },
  32: {
    title: "Brainstorm Catastrophe",
    categories: ["group", "chaos", "failure"],
    mood: ["baffling", "noisy"],
    description: "Dialogue for a noisy group meeting where IQ actively decreases by the minute",
    useWhen: ["group trying to solve one basic problem", "loud discussion with no resolution"]
  },
  33: {
    title: "Typing Combat Illusion",
    categories: ["laptop", "sitting", "useless activity"],
    mood: ["intense", "futile"],
    description: "Long dialogue for someone sitting typing violently on a laptop with zero output",
    useWhen: ["typing furiously on laptop", "coder posture"]
  },
  34: {
    title: "The Ultimate Group Verdict",
    categories: ["group", "dramatic reaction", "chaos"],
    mood: ["grandiose", "chaotic"],
    description: "Dramatic group reaction dialogue when collective NPC chaos reaches its peak",
    useWhen: ["large group celebration or catastrophe", "collective NPC awakening"]
  },
  35: {
    title: "Reel Scrolling Sigh",
    categories: ["phone", "sitting", "distraction"],
    mood: ["drained", "zoned-out"],
    description: "Short heavy sigh reaction for someone totally drained by 4 continuous hours of reels",
    useWhen: ["sitting on phone with vacant stare", "slouched with device"]
  },
  36: {
    title: "Tactical Evasion Step",
    categories: ["walking", "movement", "speed"],
    mood: ["abrupt", "hurried"],
    description: "Reaction for someone walking briskly to avoid meeting anyone they know",
    useWhen: ["sudden movement detected", "walking out of frame"]
  },
  37: {
    title: "System Glitch Reaction",
    categories: ["unclear", "confusion", "awkward"],
    mood: ["mysterious", "startled"],
    description: "Reaction for an unclear situation where the AI cannot determine the human objective",
    useWhen: ["activity unclear", "sudden posture shift"]
  },
  38: {
    title: "Permanent Chair Statue",
    categories: ["sitting", "idle", "stationary", "waiting", "no activity"],
    mood: ["clinical", "dry"],
    description: "Observation for someone who has bonded at the molecular level with their chair",
    useWhen: ["person sitting unmoving", "sitting doing nothing", "stationary seated"]
  },
  39: {
    title: "Unbothered Zen Master",
    categories: ["sitting", "idle", "waiting", "stationary", "deadpan"],
    mood: ["unbothered", "serene"],
    description: "Deadpan reaction for someone sitting peacefully in complete detachment from all responsibilities",
    useWhen: ["peaceful sitting without a care in the world", "sitting doing nothing"]
  },
  40: {
    title: "Screen Glow Transfixion",
    categories: ["phone", "distraction", "sitting", "screen captivity"],
    mood: ["entranced", "quiet"],
    description: "Reaction dialogue for someone sitting with their face completely lit up by phone screen",
    useWhen: ["staring into glowing screen", "holding phone with intense focus"]
  }
};

const fullManifest = cleanClips.map((c, idx) => {
  const meta = categoryMap[idx + 1] || {
    title: `Meme Clip ${c.id}`,
    categories: ["idle", "sitting"],
    mood: ["deadpan"],
    description: "Authentic Malayalam meme reaction clip",
    useWhen: ["person detected in scene"]
  };

  return {
    id: c.id,
    file: c.file,
    duration: c.duration,
    title: meta.title,
    category: meta.categories,
    mood: meta.mood,
    description: meta.description,
    useWhen: meta.useWhen
  };
});

fs.writeFileSync('public/audio/memes/audioManifest.json', JSON.stringify(fullManifest, null, 2), 'utf8');

const tsPath = path.join(__dirname, '../lib/audioManifest.ts');
const tsContent = `// ============================================================
// 🎵 NPC WATCH — MALAYALAM MEME AUDIO MANIFEST
// Master library catalog for 40 extracted meme reaction clips
// With verified real durations and activity category routing
// ============================================================

export interface MemeAudioClip {
  id: string;
  file: string;
  title: string;
  duration: number;
  category: string[];
  mood: string[];
  description?: string;
  useWhen: string[];
}

export const MEME_AUDIO_MANIFEST: MemeAudioClip[] = ${JSON.stringify(fullManifest, null, 2)};

export function getClipsByCategory(category: string): MemeAudioClip[] {
  const norm = category.toLowerCase().trim();
  return MEME_AUDIO_MANIFEST.filter((clip) =>
    clip.category.some((c) => c.toLowerCase() === norm)
  );
}

/**
 * Strict activity to audio categories mapping per Section 5, 6, 7, 8.
 * Hard rule: NO PHONE = NO PHONE REACTION. SITTING DOING NOTHING = IDLE/SITTING ONLY.
 */
export function mapActivityToAudioCategories(
  activity: string,
  device?: string | null,
  groupSize: number = 1
): string[] {
  const act = (activity || "").toLowerCase();

  // 1. Group priority
  if (groupSize > 1 || act.includes("group")) {
    return ["group", "chaos", "dramatic reaction"];
  }

  // 2. Phone priority ONLY if associated (Section 7)
  const isPhone = act.includes("phone") || device === "cell phone";
  if (isPhone) {
    return ["phone", "distraction", "screen captivity"];
  }

  // 3. Laptop priority ONLY if associated
  const isLaptop = act.includes("laptop") || device === "laptop";
  if (isLaptop) {
    return ["laptop", "useless activity", "failure", "sitting"];
  }

  // 4. Locomotion / walking
  if (act.includes("walking") || act.includes("moving")) {
    return ["walking", "movement", "speed", "dramatic reaction"];
  }

  // 5. Standing still / waiting
  if (act.includes("standing")) {
    return ["standing", "waiting", "stationary", "awkward", "idle"];
  }

  // 6. Sitting doing nothing (Section 8: strictly idle/waiting/stationary/deadpan)
  if (act.includes("sitting") || act === "stationary") {
    return ["sitting", "idle", "waiting", "stationary", "awkward", "deadpan", "no activity"];
  }

  // 7. Fallback / unclear
  return ["confusion", "unclear", "awkward", "idle"];
}
`;

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log("Built full manifest with 40 clips and accurate durations.");
