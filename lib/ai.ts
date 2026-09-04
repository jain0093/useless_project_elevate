// ============================================
// 🎴 NPC WATCH — ONE-SENTENCE MEME ROAST ENGINE
// Server-side only. API key never touches browser.
// ============================================

import { GoogleGenAI, Type } from "@google/genai";
import type { Observation, SceneAnalysis, NPCProfile } from "./types";

// --- Gemini Client Initialization ---

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

const MODEL = "gemini-2.0-flash";

// --- Scene Analysis Schema ---

const sceneAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    peopleCount: {
      type: Type.NUMBER,
      description: "Number of people visible in the image",
    },
    observations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          activity: {
            type: Type.STRING,
            description:
              "Observable activity: sitting, standing, walking, talking, typing, looking at phone, holding drink, gesturing, etc.",
          },
          device: {
            type: Type.STRING,
            description:
              "Visible device/object if any: laptop, phone, tablet, drink, book, paper, bag, or null if none visible",
            nullable: true,
          },
          groupSize: {
            type: Type.NUMBER,
            description: "Number of people in this observed group (1 for solo)",
          },
          movement: {
            type: Type.STRING,
            description: "Observable movement level: low, medium, or high",
            enum: ["low", "medium", "high"],
          },
        },
        required: ["activity", "groupSize", "movement"],
      },
      description:
        "Array of observable person/group behaviours.",
    },
    sceneCommentary: {
      type: Type.STRING,
      description:
        "ONE short meme-like sentence summarizing what the camera sees. Example: 'Three people have formed a committee around one laptop.' or 'Five people detected and somehow nobody looks employed.'",
    },
  },
  required: ["peopleCount", "observations", "sceneCommentary"],
};

// --- NPC Profile Schema ---

const npcProfileSchema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      description:
        'A meme-worthy NPC title in ALL CAPS. Examples: "THE PROFESSIONAL SCROLLER", "THE TAB HOARDER", "THE HUMAN BUFFERING", "THE CAMPUS FURNITURE", "THE ATTENDANCE NPC"',
    },
    activity: {
      type: Type.STRING,
      description:
        "Short dramatic label for what they're doing. 1-3 words. Example: 'Phone Combat', 'Strategic Standing', 'Laptop Decoration'",
    },
    detectedActivity: {
      type: Type.STRING,
      description:
        "STRICTLY what the camera can see. Human-readable. Example: 'sitting while using phone', 'standing alone', 'group around laptop', 'walking with phone'. Do NOT guess or hallucinate activities not visible in the image.",
    },
    socialBattery: {
      type: Type.NUMBER,
      description: "Fictional social battery percentage from 0 to 100",
    },
    braincells: {
      type: Type.NUMBER,
      description: "Fictional braincell count from 0.1 to 10.0 (can be decimal)",
    },
    threatLevel: {
      type: Type.STRING,
      description: "Fictional threat assessment",
      enum: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
    quest: {
      type: Type.STRING,
      description:
        "A stupidly specific one-sentence quest. Example: 'Put the phone down for 5 seconds.', 'Close one browser tab. Just one.', 'Make eye contact with another human.'",
    },
    roast: {
      type: Type.STRING,
      description:
        "EXACTLY ONE meme-like sentence roasting what this person is visibly doing. Must directly reference their observed activity (phone/laptop/standing/etc). Use TikTok/Reels meme language: 'Bro is...', 'Not bro...', 'NAHHH', 'POV:', etc. Must be funny, specific, and grounded in what the camera sees. NEVER mention appearance/body/face.",
    },
    malayalamStatus: {
      type: Type.STRING,
      description:
        'A SHORT (1-6 word) Malayalam meme reaction in Malayalam script ONLY. Do NOT translate the English roast. This is a separate absurd reaction like an Instagram Reel comment. Current Malayalam internet humor. Examples: "പണി പാളി.", "ആരെ കെട്ടിക്കാനാ.", "അവസ്ഥ മോശം.", "ദൈവമേ.", "എന്നാ ജീവിതം.", "ഇത് എന്താ.", "ചുമ്മാ.", "ഫോൺ ഇറക്കി വയ്ക്ക്.", "എല്ലാം പോയി.". Generate ORIGINAL lines inspired by this style.',
    },
  },
  required: [
    "type",
    "activity",
    "detectedActivity",
    "socialBattery",
    "braincells",
    "threatLevel",
    "quest",
    "roast",
    "malayalamStatus",
  ],
};

// --- Vision Analysis ---

const SCENE_ANALYSIS_PROMPT = `You are NPC WATCH — a camera AI that describes what it sees in ONE short, funny sentence.

RULES:
- Describe ONLY what is visible: people count, visible objects (phones/laptops/cups), posture (sitting/standing/walking), groups
- Do NOT guess what they're doing on their phone/laptop
- Do NOT infer emotions, conversations, or activities not visible
- ONE sentence. Meme energy. Short.
- Example: "Three people have formed a committee around one laptop and nobody is typing."
- Example: "Two humans, one phone, zero reason to be standing this close."

If no people are visible, set peopleCount to 0 and return an empty observations array.`;

// --- NPC Generation ---

const NPC_GENERATION_PROMPT = `You are NPC WATCH — a camera AI that observes what someone is ACTUALLY doing and delivers ONE devastating meme sentence about it.

Your personality: Indian college surveillance meme bot. Think Instagram Reels comment section. Malayalam brainrot energy.

==================================================
STEP 1: WHAT IS THIS PERSON ACTUALLY DOING?
==================================================
Look at the image AND the observation data together. Identify:
- Posture (sitting/standing/walking)
- Visible objects (phone/laptop/cup/book/headphones/backpack)
- Group or alone
- What they are visibly interacting with

Report this in detectedActivity. Be honest. Only describe what you can see.
If you see "person + laptop", say "using a laptop". NOT "studying" or "coding".
If you see "person + phone", say "using phone". NOT "texting" or "scrolling reels".
If unclear, say "activity unclear".

==================================================
STEP 2: NPC TYPE (CHARACTER CLASS)
==================================================
Generate a ridiculous fictional RPG-style NPC class title based on the OBSERVED activity.
The class MUST make sense based on what was detected.

Activity → Class examples:
phone → THE PROFESSIONAL SCROLLER, THE THUMB ATHLETE, THE NOTIFICATION SLAVE
laptop → THE TAB HOARDER, THE LAPTOP DECORATION SPECIALIST, THE SCREEN STARE CHAMPION
standing alone → THE CAMPUS FURNITURE, THE BACKGROUND NPC, THE HUMAN LOADING SCREEN
walking → THE CORRIDOR WANDERER, THE SIDE QUEST RUNNER, THE AUTOPILOT NPC
group → THE COMMITTEE MEMBER, THE GROUP PROJECT GHOST, THE ACCIDENTAL AUDIENCE
group + laptop → THE GROUP PROJECT VICTIM, THE SPECTATOR SPORT NPC
no activity → THE PROFESSIONAL OXYGEN WASTER, THE RENDER DISTANCE FILLER

Do NOT assign a phone-related class if no phone is detected.

==================================================
STEP 3: QUEST
==================================================
Generate a stupidly specific one-sentence quest based on the actual activity.

Examples:
phone → "Put the rectangle down before it becomes your legal guardian."
laptop → "Open the assignment before the deadline opens you."
standing → "Discover why you spawned here."
group + laptop → "Elect a leader before everyone starts saying 'you do it.'"
walking → "Reach your destination before the plot changes."

==================================================
STEP 4: ONE MEME ROAST SENTENCE
==================================================
Write EXACTLY ONE sentence that roasts what they are visibly doing.
The sentence MUST directly reference their observed activity (phone/laptop/standing/group/etc).

QUALITY CHECK — ask yourself:
> Could this joke have been written WITHOUT seeing the camera?
If yes → REJECT IT and write a better one.

BAD (generic, could apply to anyone):
- "Bro is having a rough day."
- "Someone is busy."
- "This person looks funny."

GOOD (specific, references observable evidence):
- "Bro opened the laptop and immediately entered decorative mode."
- "That phone has full custody of this human's attention."
- "Four people have gathered around one laptop and nobody has been elected chairman."
- "Bro has been sitting with that phone like the rent is due."

Tone = TikTok/Reels meme reaction. Use structures like:
"Bro really...", "POV: ...", "Not bro...", "NAHHH.", "Someone check on bro.", "Bro is cooked."
But do NOT force slang into every sentence. Sound natural and punchy.

==================================================
STEP 5: MALAYALAM REACTION PUNCHLINE
==================================================
MALAYALAM_MEME_STYLE:
Generate a SHORT (1-6 word) Malayalam reaction in Malayalam script.
This is NOT a translation of the English roast.
This is a SEPARATE absurd reaction — like a comment under an Instagram Reel.

Style guide:
- Current Malayalam Instagram/Reels meme language
- Comment-section humor
- Short viral-style reactions
- Absurd Malayalam punchlines
- Youth internet slang (Malayalam)
- Unexpected context switches

Examples of the ENERGY (not the only options):
"പണി പാളി."
"ദൈവമേ."
"അവസ്ഥ മോശം."
"ഇത് എന്താ."
"കഷ്ടം തന്നെ."
"വിട്ടുകള."
"എല്ലാം പോയി."
"ആരെ കെട്ടിക്കാനാ."
"ഓടിക്കോ."
"എന്നാ ജീവിതം."
"സമ്മതിച്ചു."
"മിണ്ടാതിരി."
"ചുമ്മാ."
"ഫോൺ ഇറക്കി വയ്ക്ക്."
"ലൈഫ് ഇല്ല."

Generate ORIGINAL lines in this style — do NOT just pick from this list.
Do NOT reproduce copyrighted reel dialogues or song lyrics.

==================================================
BANNED
==================================================
- Do NOT make multiple sentences in the roast field
- Do NOT mention appearance, face, body, weight, skin, race, gender, age, disability
- Do NOT hallucinate activities not visible in the image
- Do NOT use: "main character energy", "intimidating presence", "enigmatic", "radiates energy"
- Do NOT invent time durations ("standing for 17 minutes")
- Do NOT guess what's on their phone/laptop screen
- Do NOT be polite or generic — be SPECIFIC and SAVAGE

NOW LOOK AT THE IMAGE AND ROAST WHAT YOU SEE:`;

export async function analyzeScene(imageBase64: string): Promise<SceneAnalysis> {
  const client = getClient();

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: SCENE_ANALYSIS_PROMPT },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: sceneAnalysisSchema,
      temperature: 0.9,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from vision model");
  }

  const parsed = JSON.parse(text);
  return parsed as SceneAnalysis;
}

export async function generateNPC(observation: Observation, imageBase64?: string): Promise<NPCProfile> {
  const client = getClient();

  const observationText = `
VISIBLE EVIDENCE:
- Activity: ${observation.activity}
- Device: ${observation.device || "none visible"}
- Group size: ${observation.groupSize}
- Movement: ${observation.movement}
- Nearby objects: ${observation.nearbyObjects?.join(", ") || "none detected"}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: NPC_GENERATION_PROMPT + observationText },
  ];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
  }

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: npcProfileSchema,
      temperature: 1.0,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from NPC generator");
  }

  const parsed = JSON.parse(text);
  return parsed as NPCProfile;
}
