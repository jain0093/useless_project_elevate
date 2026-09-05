// ============================================================
// 🎭 AVASTHA — MALAYALAM MEME & AUDIO REACTION ENGINE
// Authentic Kerala meme culture, temporal deduplication,
// rotating reaction encounter labels, browser autoplay priming,
// and zero-repetition asset routing.
// ============================================================

import { playMemePunchlineSound } from "@/app/utils/sound";

export interface MemeItem {
  id: string;
  category:
    | "sitting"
    | "standing"
    | "walking"
    | "phone"
    | "laptop"
    | "group"
    | "idle"
    | "confused"
    | "unclear"
    | "no-victim";
  title: string;
  subtitle: string;
  dialogue: string;
  englishTranslation: string;
  emoji: string;
  tag: string;
  badgeColor: string;
  imageSrc?: string;
  audioSrc?: string;
}

// ============================================================
// COMPREHENSIVE MEME REACTION CATALOG
// Strictly categorized by local computer vision verified activity
// Linked directly to valid local .wav audio assets in public/audio/
// ============================================================

export const MEME_CATALOG: MemeItem[] = [
  // --- PHONE ---
  {
    id: "phone_custody",
    category: "phone",
    title: "ENTHOKKE AADA IVIDE NADAKKUNNE",
    subtitle: "Full digital detachment confirmed",
    dialogue: "“Phone has taken full custody. Don't disturb.”",
    englishTranslation: "What is even happening here? The phone has full custody.",
    emoji: "📱💀",
    tag: "DIGITAL DETACHMENT",
    badgeColor: "bg-[#FFD1E3] text-[#A3225B] border-[#FF7EB6]",
    imageSrc: "/memes/phone/custody.png",
    audioSrc: "/audio/memes/meme-004.mp3",
  },
  {
    id: "phone_aishwaryam",
    category: "phone",
    title: "VEEDINTE AISHWARYAM",
    subtitle: "Staring at the screen like it holds the cure",
    dialogue: "“Veedinte aishwaryam phone nokki irikkal aanu.”",
    englishTranslation: "The glory of the house is sitting and staring at the phone.",
    emoji: "👀📲",
    tag: "SCREEN SCROLLING",
    badgeColor: "bg-[#E9E4FF] text-[#553C9A] border-[#B9A7FF]",
    imageSrc: "/memes/phone/aishwaryam.png",
    audioSrc: "/audio/memes/meme-005.mp3",
  },
  {
    id: "phone_scroll",
    category: "phone",
    title: "ALTERNATIVE DIMENSION",
    subtitle: "Bro is scrolling with zero blink reflex",
    dialogue: "“Reels scroll cheythu jeevitham theernnu.”",
    englishTranslation: "Life finished while endlessly scrolling reels.",
    emoji: "🌀🤳",
    tag: "REEL OBSESSED",
    badgeColor: "bg-[#DDF5FF] text-[#0D6E9E] border-[#8ED8FF]",
    imageSrc: "/memes/phone/scroll.png",
    audioSrc: "/audio/memes/meme-006.mp3",
  },

  // --- LAPTOP ---
  {
    id: "laptop_assignment",
    category: "laptop",
    title: "KOPPILE ASSIGNMENT",
    subtitle: "One tab opened. Productivity achieved.",
    dialogue: "“Assignment deadline is tomorrow. Mental peace is gone.”",
    englishTranslation: "Assignment deadline is tomorrow. Peace has vacated the building.",
    emoji: "💻😭",
    tag: "DEADLINE PANIC",
    badgeColor: "bg-[#DDF5FF] text-[#00527C] border-[#8ED8FF]",
    imageSrc: "/memes/laptop/assignment.png",
    audioSrc: "/audio/memes/meme-007.mp3",
  },
  {
    id: "laptop_contra",
    category: "laptop",
    title: "SCENE CONTRA",
    subtitle: "Looking ultra busy while doing zero actual work",
    dialogue: "“Laptop thurannu vechal aarkkum doubt varilla.”",
    englishTranslation: "If the laptop is kept open, nobody will suspect you're doing nothing.",
    emoji: "👨‍💻⚡",
    tag: "STRATEGIC ACTING",
    badgeColor: "bg-[#FFF4C2] text-[#8C7400] border-[#FFE68A]",
    imageSrc: "/memes/laptop/contra.png",
    audioSrc: "/audio/memes/meme-008.mp3",
  },
  {
    id: "laptop_browser_buff",
    category: "laptop",
    title: "THE GOOGLE DOC GAZER",
    subtitle: "Staring at a blank document waiting for divine intervention",
    dialogue: "“Type cheyyan thonunnilla... pakshe irikkanam.”",
    englishTranslation: "Don't feel like typing, but mandatory presence required.",
    emoji: "📄✨",
    tag: "ACADEMIC BUFFER",
    badgeColor: "bg-[#E2FAF0] text-[#1B6640] border-[#9EE6C3]",
    imageSrc: "/memes/laptop/gazer.png",
    audioSrc: "/audio/memes/meme-009.mp3",
  },

  // --- WALKING ---
  {
    id: "walk_sidequest",
    category: "walking",
    title: "AVAN ENTHAADA ANGANEYORU WALK",
    subtitle: "Walking with maximum confidence and zero navigation data",
    dialogue: "“Evidekko povaanu... pakshe evidekkennu aarkkum ariyilla.”",
    englishTranslation: "Going somewhere... but nobody knows where.",
    emoji: "🚶‍♂️✨",
    tag: "SIDE QUEST ACTIVE",
    badgeColor: "bg-[#E2FAF0] text-[#1B6640] border-[#9EE6C3]",
    imageSrc: "/memes/walking/walk.png",
    audioSrc: "/audio/memes/meme-006.mp3",
  },
  {
    id: "walk_fast",
    category: "walking",
    title: "THE SPEED RUNNER",
    subtitle: "Walking fast so nobody stops to assign work",
    dialogue: "“Vegam nadannal aarum chodhyam chodikkilla.”",
    englishTranslation: "Walk fast and nobody asks questions.",
    emoji: "🏃💨",
    tag: "TACTICAL EVASION",
    badgeColor: "bg-[#FFF4C2] text-[#8C7400] border-[#FFE68A]",
    imageSrc: "/memes/walking/speed.png",
    audioSrc: "/audio/memes/meme-004.mp3",
  },

  // --- SITTING ---
  {
    id: "sit_furniture",
    category: "sitting",
    title: "FURNITURE ARCHETYPE",
    subtitle: "Sitting completely motionless for 3 consecutive business hours",
    dialogue: "“Ivide anangathe irunnaal aarum assignment chodikkilla.”",
    englishTranslation: "If I sit here completely motionless, nobody will ask for work.",
    emoji: "🛋️🗿",
    tag: "MOTIONLESS RESISTANCE",
    badgeColor: "bg-[#FFF4C2] text-[#8C7400] border-[#FFE68A]",
    imageSrc: "/memes/sitting/furniture.png",
    audioSrc: "/audio/memes/meme-001.mp3",
  },
  {
    id: "sit_minute",
    category: "sitting",
    title: "ORU MINUTE... ORU MINUTE...",
    subtitle: "Processing why existence was requested here",
    dialogue: "“Wait cheyyu... njan ipo enthina ivide vannathu?”",
    englishTranslation: "Hold on... why did I even come here?",
    emoji: "🤔💭",
    tag: "LOADING SCREEN",
    badgeColor: "bg-[#E9E4FF] text-[#553C9A] border-[#B9A7FF]",
    imageSrc: "/memes/sitting/minute.png",
    audioSrc: "/audio/memes/meme-002.mp3",
  },
  {
    id: "sit_peace",
    category: "sitting",
    title: "SCENE COMPLETELY PEACE",
    subtitle: "Zero adrenaline detected in bloodstream",
    dialogue: "“Scene completely peace aanu, chumma irikkuva.”",
    englishTranslation: "Scene is entirely peaceful. Just sitting doing absolutely nothing.",
    emoji: "🧘‍♂️🍃",
    tag: "CHILL MAX",
    badgeColor: "bg-[#E2FAF0] text-[#1B6640] border-[#9EE6C3]",
    imageSrc: "/memes/sitting/peace.png",
    audioSrc: "/audio/memes/meme-003.mp3",
  },

  // --- STANDING ---
  {
    id: "stand_monument",
    category: "standing",
    title: "CORRIDOR MONUMENT",
    subtitle: "Standing around with the posture of a government monument",
    dialogue: "“Etho oru shubhasoojana pole ivide nikkuva.”",
    englishTranslation: "Standing here like some kind of auspicious sign.",
    emoji: "🧍‍♂️🏛️",
    tag: "AMBIENT STATUE",
    badgeColor: "bg-[#DDF5FF] text-[#0D6E9E] border-[#8ED8FF]",
    imageSrc: "/memes/standing/monument.png",
    audioSrc: "/audio/memes/meme-002.mp3",
  },
  {
    id: "stand_waiting",
    category: "standing",
    title: "THE SPAWN POINT ANCHOR",
    subtitle: "Spawned here and forgot to move",
    dialogue: "“Avan enthaada angane nilkkunne?”",
    englishTranslation: "Why is bro standing like that?",
    emoji: "🧍‍♀️📍",
    tag: "SPAWN ANCHOR",
    badgeColor: "bg-[#FFD1E3] text-[#A3225B] border-[#FF7EB6]",
    imageSrc: "/memes/standing/anchor.png",
    audioSrc: "/audio/memes/meme-007.mp3",
  },

  // --- GROUP ---
  {
    id: "group_committee",
    category: "group",
    title: "ITH ENTHINULLA COMMITTEE",
    subtitle: "Four people around one laptop, zero combined answers",
    dialogue: "“Nalu per oru laptopinte munnil... aarkkum onnum ariyilla.”",
    englishTranslation: "Four people in front of one laptop... none of them know anything.",
    emoji: "👥💻",
    tag: "CHAOTIC COMMITTEE",
    badgeColor: "bg-[#E9E4FF] text-[#553C9A] border-[#B9A7FF]",
    imageSrc: "/memes/group/committee.png",
    audioSrc: "/audio/memes/meme-008.mp3",
  },
  {
    id: "group_hostage",
    category: "group",
    title: "GROUP PROJECT SURVIVOR",
    subtitle: "Hoping someone else takes responsibility for the presentation",
    dialogue: "“Nee para... njan support tharam.”",
    englishTranslation: "You speak... I'll give silent emotional support.",
    emoji: "🤝👀",
    tag: "MUTUAL SUPPORT",
    badgeColor: "bg-[#FFF4C2] text-[#8C7400] border-[#FFE68A]",
    imageSrc: "/memes/group/survivor.png",
    audioSrc: "/audio/memes/meme-008.mp3",
  },

  // --- UNCLEAR / OCCLUDED ---
  {
    id: "unclear_refusal",
    category: "unclear",
    title: "REFUSES TO ELABORATE",
    subtitle: "Camera unable to confirm human objective",
    dialogue: "“Enthaanu bro plan? Ariyilla bro.”",
    englishTranslation: "What is the plan, bro? No idea, bro.",
    emoji: "❓🌫️",
    tag: "MYSTERY OBJECTIVE",
    badgeColor: "bg-[#E9E4FF] text-[#553C9A] border-[#B9A7FF]",
    imageSrc: "/memes/unclear/unclear.png",
    audioSrc: "/audio/memes/meme-009.mp3",
  },

  // --- NO VICTIM ---
  {
    id: "no_victim_empty",
    category: "no-victim",
    title: "AARUM ILLAATHA SCENE",
    subtitle: "Everyone successfully escaped AI judgment",
    dialogue: "“Scene clean aanu. Aarum illa.”",
    englishTranslation: "Scene is totally clean. Nobody here.",
    emoji: "👻🚪",
    tag: "EMPTY LOBBY",
    badgeColor: "bg-[#FFD1E3] text-[#A3225B] border-[#FF7EB6]",
    imageSrc: "/memes/no-victim/empty.png",
    audioSrc: "/audio/memes/meme-001.mp3",
  },
];

// ============================================================
// ROTATING ENCOUNTER LABELS (PART 13)
// Never repeat the previous label consecutively
// ============================================================

export const REACTION_LABELS = [
  "TARGET LOCKED",
  "NPC SPOTTED",
  "ENCOUNTER FOUND",
  "NEW NPC UNLOCKED",
  "TARGET ACQUIRED",
  "ANOTHER ONE",
  "SITUATION IDENTIFIED",
] as const;

export function getRotatingReactionLabel(previousLabel?: string): string {
  const candidates = REACTION_LABELS.filter((lbl) => lbl !== previousLabel);
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked || REACTION_LABELS[0];
}

// Related categories mapping for fallback when primary category is exhausted (Section 5)
const RELATED_CATEGORIES: Record<string, Array<MemeItem["category"]>> = {
  sitting: ["sitting", "idle", "standing"],
  standing: ["standing", "idle", "sitting"],
  walking: ["walking", "idle"],
  phone: ["phone", "sitting", "standing"],
  laptop: ["laptop", "sitting"],
  group: ["group", "sitting", "standing"],
  unclear: ["unclear", "confused", "idle"],
  "no-victim": ["no-victim"],
};

// ============================================================
// DEDUPLICATED MEME SELECTION (SECTIONS 1 & 5)
// Strictly grounded in validated computer vision activity
// ============================================================

export function selectDeduplicatedMeme(
  activity: string,
  groupSize: number = 1,
  usedMemeIds: string[] = []
): { meme: MemeItem; isExhausted: boolean } {
  const act = (activity || "").toLowerCase();

  // Determine authoritative category based on CV evidence
  let primaryCategory: MemeItem["category"] = "sitting";
  if (groupSize > 1) {
    primaryCategory = "group";
  } else if (act.includes("phone")) {
    primaryCategory = "phone";
  } else if (act.includes("laptop")) {
    primaryCategory = "laptop";
  } else if (act.includes("walk")) {
    primaryCategory = "walking";
  } else if (act.includes("stand")) {
    primaryCategory = "standing";
  } else if (act.includes("sit")) {
    primaryCategory = "sitting";
  } else if (act.includes("unclear")) {
    primaryCategory = "unclear";
  }

  const usedSet = new Set(usedMemeIds);

  // 1. Try finding an unused meme in the primary category
  const primaryPool = MEME_CATALOG.filter((m) => m.category === primaryCategory);
  let available = primaryPool.filter((m) => !usedSet.has(m.id));

  // 2. If primary pool exhausted, check closely related categories (Section 5)
  if (available.length === 0) {
    const relatedList = RELATED_CATEGORIES[primaryCategory] || [primaryCategory];
    for (const relCat of relatedList) {
      if (relCat === primaryCategory) continue;
      const relPool = MEME_CATALOG.filter((m) => m.category === relCat);
      const relUnused = relPool.filter((m) => !usedSet.has(m.id));
      if (relUnused.length > 0) {
        available = relUnused;
        break;
      }
    }
  }

  // 3. Only if all related categories are exhausted, reset the pool for this category
  let isExhausted = false;
  if (available.length === 0) {
    available = primaryPool.length > 0 ? primaryPool : MEME_CATALOG;
    isExhausted = true;
  }

  const selected = available[Math.floor(Math.random() * available.length)] || MEME_CATALOG[0];
  return { meme: selected, isExhausted };
}

// ============================================================
// BROWSER AUTOPLAY PRIMING & PLAYBACK HANDLER (SECTIONS 2, 7, 8)
// ============================================================

import {
  MEME_AUDIO_MANIFEST,
  MemeAudioClip,
  mapActivityToAudioCategories,
} from "./audioManifest";

export { MEME_AUDIO_MANIFEST };
export type { MemeAudioClip };

// ============================================================
// DEDUPLICATED AUDIO SELECTION FROM 31-CLIP LIBRARY (SECTIONS 4, 6, 11, 16)
// All clips are exactly 6 seconds of Malayalam meme reactions.
// ============================================================

export interface AudioSelectionResult {
  clip: MemeAudioClip;
  isExhausted: boolean;
}

/**
 * Selects a contextual, unused Malayalam meme audio clip from the 31-clip library.
 * Grounded strictly in validated activity, device, and group size (Section 4, 5, 6, 7, 8, 17).
 *
 * HARD EXCLUSION GATES:
 * - NO PHONE = NO PHONE REACTION (Section 7).
 * - NO LAPTOP = NO LAPTOP REACTION.
 * - SITTING DOING NOTHING = STRICTLY idle / sitting / waiting / stationary (Section 8).
 * - WALKING = STRICTLY walking / movement / speed.
 * - general-reaction is ALWAYS accepted as universally compatible.
 * - ZERO REPETITION across the session with multi-tier fallback (Section 17).
 */
export function selectDeduplicatedAudioClip(
  activity: string,
  device?: string | null,
  groupSize: number = 1,
  usedAudioIds: string[] = []
): AudioSelectionResult {
  const usedSet = new Set(usedAudioIds);
  const act = (activity || "").toLowerCase();

  // 1. Authoritative Computer Vision indicators
  const isPhone =
    act.includes("phone") ||
    device === "cell phone" ||
    act.includes("screen") ||
    act.includes("scrolling");

  const isLaptop =
    act.includes("laptop") ||
    device === "laptop" ||
    act.includes("computer");

  const isWalking =
    (act.includes("walk") || act.includes("moving") || act.includes("pacing")) &&
    !act.includes("stationary");

  const isSitting =
    (act.includes("sitting") || act.includes("seated") || act === "stationary") &&
    !isWalking;

  const isStanding =
    (act.includes("standing") || act.includes("stood")) &&
    !isSitting &&
    !isWalking;

  const isGroup =
    groupSize > 1 ||
    act.includes("group") ||
    act.includes("crowd") ||
    act.includes("talking");

  // 2. HARD EXCLUSION FILTER: Filter candidate pool before any selection
  // Rejects any audio incompatible with what CV actually observes.
  // Clips tagged "general-reaction" are ALWAYS accepted (universal fallback).
  const compatibleClips = MEME_AUDIO_MANIFEST.filter((clip) => {
    const cats = clip.category.map((c) => c.toLowerCase());

    // general-reaction clips are universally compatible with all activities
    const isGeneralOnly = cats.includes("general-reaction") && cats.length <= 3 &&
      !cats.includes("phone") && !cats.includes("laptop") && !cats.includes("walking") &&
      !cats.includes("speed") && !cats.includes("movement") && !cats.includes("group") &&
      !cats.includes("distraction") && !cats.includes("screen captivity");

    // Section 7: NO PHONE = NO PHONE REACTION (Hard rule)
    if (!isPhone) {
      if (
        cats.includes("phone") ||
        cats.includes("screen captivity") ||
        cats.includes("distraction")
      ) {
        return false;
      }
    }

    // NO LAPTOP = NO LAPTOP REACTION
    if (!isLaptop) {
      if (cats.includes("laptop")) {
        return false;
      }
    }

    // NO WALKING = NO WALKING / SPEED REACTION
    if (!isWalking) {
      if (
        cats.includes("walking") ||
        cats.includes("speed") ||
        cats.includes("movement")
      ) {
        return false;
      }
    }

    // NO GROUP = NO GROUP REACTION (unless isGeneralOnly)
    if (!isGroup) {
      if (cats.includes("group") && !isGeneralOnly) {
        return false;
      }
    }

    // SITTING DOING NOTHING (Section 8: strictly idle/waiting/stationary/deadpan/awkward)
    if (isSitting && !isPhone && !isLaptop) {
      const isSittingOrIdle =
        cats.includes("sitting") ||
        cats.includes("idle") ||
        cats.includes("waiting") ||
        cats.includes("stationary") ||
        cats.includes("deadpan") ||
        cats.includes("awkward") ||
        cats.includes("no activity") ||
        cats.includes("general-reaction");

      if (!isSittingOrIdle) return false;
      return true;
    }

    // PHONE CASE
    if (isPhone) {
      return cats.includes("phone") || cats.includes("distraction") || cats.includes("screen captivity") || cats.includes("sitting") || cats.includes("general-reaction");
    }

    // WALKING CASE
    if (isWalking) {
      return cats.includes("walking") || cats.includes("movement") || cats.includes("speed") || cats.includes("dramatic reaction") || cats.includes("general-reaction");
    }

    // STANDING CASE
    if (isStanding) {
      return cats.includes("standing") || cats.includes("waiting") || cats.includes("stationary") || cats.includes("idle") || cats.includes("awkward") || cats.includes("general-reaction");
    }

    // LAPTOP CASE
    if (isLaptop) {
      return cats.includes("laptop") || cats.includes("useless activity") || cats.includes("sitting") || cats.includes("general-reaction");
    }

    // GROUP CASE
    if (isGroup) {
      return cats.includes("group") || cats.includes("chaos") || cats.includes("dramatic reaction") || cats.includes("general-reaction");
    }

    return true;
  });

  // Safe fallback if compatibleClips is somehow empty
  const candidatePool = compatibleClips.length > 0 ? compatibleClips : MEME_AUDIO_MANIFEST;

  // 3. ZERO REPETITION: Filter out clips already used in this session (Section 17)
  const unusedClips = candidatePool.filter((c) => !usedSet.has(c.id));

  // Determine primary target category for ranking
  const actCategories = mapActivityToAudioCategories(activity, device, groupSize);
  const primaryCat = actCategories[0];

  if (unusedClips.length > 0) {
    // 3a. Prefer unused clips that directly match primary category
    const primaryUnused = unusedClips.filter((c) =>
      c.category.some((cat) => cat.toLowerCase() === primaryCat.toLowerCase())
    );
    if (primaryUnused.length > 0) {
      const picked = primaryUnused[Math.floor(Math.random() * primaryUnused.length)];
      return { clip: picked, isExhausted: false };
    }

    // 3b. Prefer unused clips matching secondary categories
    for (let i = 1; i < actCategories.length; i++) {
      const secCat = actCategories[i];
      const secUnused = unusedClips.filter((c) =>
        c.category.some((cat) => cat.toLowerCase() === secCat.toLowerCase())
      );
      if (secUnused.length > 0) {
        const picked = secUnused[Math.floor(Math.random() * secUnused.length)];
        return { clip: picked, isExhausted: false };
      }
    }

    // 3c. Any unused compatible clip
    const picked = unusedClips[Math.floor(Math.random() * unusedClips.length)];
    return { clip: picked, isExhausted: false };
  }

  // 4. Pool exhausted: Reset to compatible pool, but NEVER repeat immediately previous clip (Section 17)
  const lastUsedId = usedAudioIds[usedAudioIds.length - 1];
  const poolExcludingLast = candidatePool.filter((c) => c.id !== lastUsedId);
  const finalPool = poolExcludingLast.length > 0 ? poolExcludingLast : candidatePool;
  const picked = finalPool[Math.floor(Math.random() * finalPool.length)] || MEME_AUDIO_MANIFEST[0];

  return { clip: picked, isExhausted: true };
}

let globalAudioContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;

/**
 * Primes browser audio playback during initial user interaction (START SCANNING).
 * Unlocks Web Audio API AudioContext and HTML5 audio permission per Section 2, 7, 17.
 */
export function primeAudioPlayback() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      if (!globalAudioContext) {
        globalAudioContext = new AudioCtx();
      }
      if (globalAudioContext.state === "suspended") {
        globalAudioContext.resume();
      }
    }

    // Trigger an inaudible play/pause to unlock HTML5 Audio tag permissions
    const silentAudio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
    );
    silentAudio.volume = 0.01;
    const playPromise = silentAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          silentAudio.pause();
          silentAudio.currentTime = 0;
        })
        .catch(() => {
          // Ignore priming error on silent buffer
        });
    }

    console.log("[AUDIO] AudioContext & HTML5 Audio primed successfully during user gesture");
  } catch (err) {
    console.warn("[AUDIO] Priming error:", err);
  }
}

/**
 * Stops currently playing reaction audio immediately (Section 8, 9, 14, 15, 16).
 */
export function stopReactionAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    currentAudio = null;
  }
}

/**
 * Plays the Malayalam reaction audio when NPC window opens (Section 10, 11, 20).
 *
 * Rules:
 * - Plays COMPLETE clip naturally until audio.onended (Section 10).
 * - Does NOT use setTimeout to stop audio early.
 * - Does NOT truncate clips to 1 second.
 * - Audio is NOT cut during NPC reveal / React state changes (Section 11).
 * - Logs standardized format per Section 20.
 */
export async function playReactionAudio(
  audioTarget: MemeItem | MemeAudioClip | string,
  soundEnabled: boolean,
  encounterId?: number | string,
  onPlaybackStateChange?: (state: "IDLE" | "PLAYING" | "ENDED" | "FAILED") => void,
  activityContext?: string
): Promise<{ success: boolean; autoplayBlocked: boolean }> {
  if (!soundEnabled) {
    console.log("[AUDIO] Sound disabled by user preference");
    onPlaybackStateChange?.("IDLE");
    return { success: false, autoplayBlocked: false };
  }

  // Stop previous audio immediately (Section 14 & 15)
  stopReactionAudio();

  let targetSrc = "";
  let clipId = "unknown";
  let clipDuration = 0;
  let clipCategories: string[] = [];

  if (typeof audioTarget === "string") {
    targetSrc = audioTarget;
    const found = MEME_AUDIO_MANIFEST.find((c) => c.file === audioTarget || c.id === audioTarget);
    if (found) {
      clipId = found.id;
      clipDuration = found.duration;
      clipCategories = found.category;
    }
  } else if ("file" in audioTarget) {
    // MemeAudioClip
    targetSrc = audioTarget.file;
    clipId = audioTarget.id;
    clipDuration = audioTarget.duration;
    clipCategories = audioTarget.category;
  } else if ("audioSrc" in audioTarget) {
    // MemeItem
    targetSrc = audioTarget.audioSrc || "";
    clipId = audioTarget.id;
    clipCategories = [audioTarget.category];
  }

  // Fallback to known meme-001 if targetSrc is somehow empty
  if (!targetSrc) {
    targetSrc = "/audio/memes/meme-001.mp3";
    clipId = "meme-001";
    clipDuration = 6;
    clipCategories = ["general-reaction", "sitting", "idle", "stationary"];
  }

  try {
    // Section 10: New Audio instance configured for complete playback
    const audio = new Audio(targetSrc);
    audio.preload = "auto";
    audio.volume = 1.0;
    audio.currentTime = 0;
    currentAudio = audio;

    // Natural completion: allow audio to reach onended without artificial truncation (Section 10)
    audio.onended = () => {
      console.log(`[AUDIO] ${clipId} playback ended naturally (full ${clipDuration}s reached)`);
      onPlaybackStateChange?.("ENDED");
      if (currentAudio === audio) {
        currentAudio = null;
      }
    };

    audio.onerror = (e) => {
      console.error(`[AUDIO] playback failed for ${clipId}:`, e);
      onPlaybackStateChange?.("FAILED");
      if (currentAudio === audio) {
        currentAudio = null;
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
    }

    // Section 20: Mandatory standardized debug logging
    const loggedActivity = activityContext || (clipCategories[0] ?? "unknown");
    console.log(
      `[AUDIO]\nactivity: ${loggedActivity}\nselectedAudio: ${clipId}\nduration: ${clipDuration.toFixed(2)}s\ncategories: ${clipCategories.join(", ")}\nreason: matched validated activity\nplayed: true`
    );

    onPlaybackStateChange?.("PLAYING");
    return { success: true, autoplayBlocked: false };
  } catch (err: unknown) {
    console.error(`[AUDIO] playback failed for ${clipId}:`, err);
    onPlaybackStateChange?.("FAILED");
    if (currentAudio) {
      currentAudio = null;
    }

    const isBlocked =
      err instanceof Error &&
      (err.name === "NotAllowedError" ||
        err.message.toLowerCase().includes("user gesture") ||
        err.message.toLowerCase().includes("not allowed"));

    return { success: false, autoplayBlocked: isBlocked };
  }
}

// ============================================================
// NEAR-DUPLICATE DETECTION FOR OPINIONS & JOKES (SECTION 1)
// ============================================================

export function isNearDuplicate(candidate: string, history: string[]): boolean {
  if (!candidate || history.length === 0) return false;
  const clean = candidate.trim().toLowerCase();

  for (const item of history) {
    const cleanItem = item.trim().toLowerCase();
    // 1. Exact match
    if (clean === cleanItem) return true;

    // 2. Substring match for short phrases
    if (clean.length > 10 && cleanItem.includes(clean)) return true;
    if (cleanItem.length > 10 && clean.includes(cleanItem)) return true;

    // 3. Significant word tokens
    const list1 = clean.replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
    const list2 = cleanItem.replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2);

    // Check bigrams (2-word punchline phrases like "basically furniture", "full custody")
    const bigrams1 = new Set<string>();
    for (let i = 0; i < list1.length - 1; i++) {
      bigrams1.add(`${list1[i]} ${list1[i + 1]}`);
    }
    for (let i = 0; i < list2.length - 1; i++) {
      const bg = `${list2[i]} ${list2[i + 1]}`;
      if (bigrams1.has(bg)) {
        return true;
      }
    }

    // 4. Jaccard token overlap for sentences
    const words1 = new Set(list1.filter((w) => w.length > 3));
    const words2 = new Set(list2.filter((w) => w.length > 3));

    if (words1.size > 0 && words2.size > 0) {
      let intersection = 0;
      for (const w of words1) {
        if (words2.has(w)) intersection++;
      }
      const union = new Set([...words1, ...words2]).size;
      const jaccard = intersection / union;
      if (jaccard >= 0.40) {
        return true;
      }
    }
  }

  return false;
}
