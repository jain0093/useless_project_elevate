// ============================================================
// 🎵 NPC WATCH — MALAYALAM MEME AUDIO MANIFEST
// Master library catalog for 9 fixed Malayalam meme reaction clips (meme-001 to meme-009)
// ============================================================

export interface MemeAudioClip {
  id: string;
  file: string;
  title: string;
  duration: number;
  category: string[];
  mood: string[];
  description?: string;
  useWhen?: string[];
}

export const MEME_AUDIO_MANIFEST: MemeAudioClip[] = [
  {
    id: "meme-001",
    file: "/audio/memes/meme-001.mp3",
    duration: 6,
    title: "Malayalam Reaction 1",
    category: ["sitting", "idle", "stationary", "deadpan", "general-reaction"],
    mood: ["comedic", "deadpan"],
    description: "Malayalam reaction — suitable for idle/sitting scenarios",
    useWhen: ["person sitting doing nothing", "stationary in chair", "idle detection"],
  },
  {
    id: "meme-002",
    file: "/audio/memes/meme-002.mp3",
    duration: 6,
    title: "Malayalam Reaction 2",
    category: ["sitting", "idle", "waiting", "standing", "walking", "general-reaction"],
    mood: ["sarcastic", "dry"],
    description: "Malayalam reaction — suitable for someone sitting/waiting or standing",
    useWhen: ["person waiting", "sitting doing nothing", "idle in lobby"],
  },
  {
    id: "meme-003",
    file: "/audio/memes/meme-003.mp3",
    duration: 6,
    title: "Malayalam Reaction 3",
    category: ["sitting", "stationary", "deadpan", "general-reaction"],
    mood: ["deadpan", "blunt"],
    description: "Malayalam reaction — deadpan observation for stationary person",
    useWhen: ["sitting motionless", "zero movement detected", "furniture mode"],
  },
  {
    id: "meme-004",
    file: "/audio/memes/meme-004.mp3",
    duration: 6,
    title: "Malayalam Reaction 4",
    category: ["phone", "distraction", "screen captivity", "walking", "general-reaction"],
    mood: ["mocking", "sarcastic"],
    description: "Malayalam reaction — comedic reaction for someone glued to their phone",
    useWhen: ["victim looking at phone", "scrolling reels", "zombie phone posture"],
  },
  {
    id: "meme-005",
    file: "/audio/memes/meme-005.mp3",
    duration: 6,
    title: "Malayalam Reaction 5",
    category: ["phone", "screen captivity", "idle", "general-reaction"],
    mood: ["dramatic", "exasperated"],
    description: "Malayalam reaction — exasperated tone suitable for phone addiction",
    useWhen: ["endless scrolling", "texting in public", "phone in hand"],
  },
  {
    id: "meme-006",
    file: "/audio/memes/meme-006.mp3",
    duration: 6,
    title: "Malayalam Reaction 6",
    category: ["walking", "movement", "speed", "phone", "general-reaction"],
    mood: ["amused", "hyper"],
    description: "Malayalam reaction — dynamic commentary for moving or walking NPC",
    useWhen: ["person pacing", "walking fast nowhere", "directionless movement"],
  },
  {
    id: "meme-007",
    file: "/audio/memes/meme-007.mp3",
    duration: 6,
    title: "Malayalam Reaction 7",
    category: ["laptop", "useless activity", "failure", "standing", "sitting", "general-reaction"],
    mood: ["satirical", "sarcastic"],
    description: "Malayalam reaction — mocking fake productivity / laptop staring",
    useWhen: ["victim typing furiously", "pretending to work", "laptop open in public"],
  },
  {
    id: "meme-008",
    file: "/audio/memes/meme-008.mp3",
    duration: 6,
    title: "Malayalam Reaction 8",
    category: ["group", "chaos", "dramatic reaction", "laptop", "general-reaction"],
    mood: ["chaotic", "loud"],
    description: "Malayalam reaction — chaotic commentary for group gathering or collaboration",
    useWhen: ["2+ people clustered", "group detected", "social circle chaos"],
  },
  {
    id: "meme-009",
    file: "/audio/memes/meme-009.mp3",
    duration: 6,
    title: "Malayalam Reaction 9",
    category: ["confusion", "unclear", "awkward", "laptop", "idle", "general-reaction"],
    mood: ["dry", "deadpan"],
    description: "Malayalam reaction — baffled reaction to unidentified or confusing behavior",
    useWhen: ["unclear activity", "weird posture", "CV confidence low"],
  },
];

export function getAudioClipById(id: string): MemeAudioClip | undefined {
  return MEME_AUDIO_MANIFEST.find((clip) => clip.id === id);
}

export function getClipsByCategory(category: string): MemeAudioClip[] {
  const norm = category.toLowerCase().trim();
  return MEME_AUDIO_MANIFEST.filter((clip) =>
    clip.category.some((c) => c.toLowerCase() === norm)
  );
}

/**
 * Strict activity to audio categories mapping.
 * Hard rule: NO PHONE = NO PHONE REACTION. SITTING DOING NOTHING = IDLE/SITTING ONLY.
 * general-reaction is always accepted as a universal fallback category.
 */
export function mapActivityToAudioCategories(
  activity: string,
  device?: string | null,
  groupSize: number = 1
): string[] {
  const act = (activity || "").toLowerCase();

  // 1. Group priority
  if (groupSize > 1 || act.includes("group")) {
    return ["group", "chaos", "dramatic reaction", "general-reaction"];
  }

  // 2. Phone priority ONLY if associated
  const isPhone = act.includes("phone") || device === "cell phone";
  if (isPhone) {
    return ["phone", "distraction", "screen captivity", "general-reaction"];
  }

  // 3. Laptop priority ONLY if associated
  const isLaptop = act.includes("laptop") || device === "laptop";
  if (isLaptop) {
    return ["laptop", "useless activity", "failure", "sitting", "general-reaction"];
  }

  // 4. Locomotion / walking
  if (act.includes("walking") || act.includes("moving")) {
    return ["walking", "movement", "speed", "dramatic reaction", "general-reaction"];
  }

  // 5. Standing still / waiting
  if (act.includes("standing")) {
    return ["standing", "waiting", "stationary", "awkward", "idle", "general-reaction"];
  }

  // 6. Sitting doing nothing (strictly idle/waiting/stationary/deadpan)
  if (act.includes("sitting") || act === "stationary") {
    return ["sitting", "idle", "waiting", "stationary", "awkward", "deadpan", "no activity", "general-reaction"];
  }

  // 7. Fallback / unclear
  return ["confusion", "unclear", "awkward", "idle", "general-reaction"];
}
