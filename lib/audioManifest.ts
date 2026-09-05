// ============================================================
// 🎵 AVASTHA — MALAYALAM MEME AUDIO MANIFEST
// Master library catalog for 18 fixed 6-second meme reaction clips
// Auto-synced from Developer Audio Library UI
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
    "id": "meme-001",
    "file": "/audio/memes/meme-001.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 1",
    "category": [
      "confusion"
    ],
    "mood": [
      "comedic",
      "deadpan"
    ]
  },
  {
    "id": "meme-002",
    "file": "/audio/memes/meme-002.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 2",
    "category": [
      "group"
    ],
    "mood": [
      "sarcastic",
      "dry"
    ]
  },
  {
    "id": "meme-003",
    "file": "/audio/memes/meme-003.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 3",
    "category": [
      "laptop"
    ],
    "mood": [
      "deadpan",
      "blunt"
    ]
  },
  {
    "id": "meme-004",
    "file": "/audio/memes/meme-004.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 4",
    "category": [
      "walking"
    ],
    "mood": [
      "mocking",
      "sarcastic"
    ]
  },
  {
    "id": "meme-005",
    "file": "/audio/memes/meme-005.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 5",
    "category": [
      "awkward",
      "idle",
      "distraction"
    ],
    "mood": [
      "dramatic",
      "exasperated"
    ]
  },
  {
    "id": "meme-006",
    "file": "/audio/memes/meme-006.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 6",
    "category": [
      "sitting"
    ],
    "mood": [
      "amused",
      "hyper"
    ]
  },
  {
    "id": "meme-007",
    "file": "/audio/memes/meme-007.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 7",
    "category": [
      "phone"
    ],
    "mood": [
      "satirical",
      "sarcastic"
    ]
  },
  {
    "id": "meme-008",
    "file": "/audio/memes/meme-008.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 8",
    "category": [
      "standing"
    ],
    "mood": [
      "chaotic",
      "loud"
    ]
  },
  {
    "id": "meme-009",
    "file": "/audio/memes/meme-009.mp3",
    "duration": 6,
    "title": "Malayalam Reaction 9",
    "category": [
      "walking",
      "general-reaction"
    ],
    "mood": [
      "dry",
      "deadpan"
    ]
  }
];

export function getClipsByCategory(category: string): MemeAudioClip[] {
  const norm = category.toLowerCase().trim();
  return MEME_AUDIO_MANIFEST.filter((clip) =>
    clip.category.some((c) => c.toLowerCase() === norm)
  );
}

export function mapActivityToAudioCategories(
  activity: string,
  device?: string | null,
  groupSize: number = 1
): string[] {
  const act = (activity || "").toLowerCase();

  // Group priority
  if (groupSize > 1 || act.includes("group")) {
    return ["group", "chaos", "dramatic reaction"];
  }

  // Device priority if associated
  if (act.includes("phone") || device === "cell phone") {
    return ["phone", "distraction", "screen captivity"];
  }

  if (act.includes("laptop") || device === "laptop") {
    return ["laptop", "useless activity", "failure", "sitting"];
  }

  // Locomotion
  if (act.includes("walking") || act.includes("moving")) {
    return ["walking", "movement", "speed", "dramatic reaction"];
  }

  // Standing
  if (act.includes("standing")) {
    return ["standing", "waiting", "awkward", "idle"];
  }

  // Sitting doing nothing
  if (act.includes("sitting")) {
    return ["sitting", "idle", "waiting", "stationary", "awkward", "deadpan", "no activity"];
  }

  // Fallback / unclear
  return ["confusion", "unclear", "awkward", "surprise"];
}
