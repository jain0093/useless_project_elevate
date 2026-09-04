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
        'A SHORT Malayalam reaction (1-6 words) in Malayalam script ONLY. Do NOT translate the English roast. This is a separate reaction. Examples: "പണി പാളി.", "ചുമ്മാ നിൽക്കുന്നു.", "അവസ്ഥ മോശം.", "ദൈവമേ.", "ഓടിക്കോ.", "എന്താണ് ഈ സംഭവം?"',
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

const NPC_GENERATION_PROMPT = `You are NPC WATCH — a camera that sees what someone is doing and reacts with ONE funny meme sentence.

==================================================
STEP 1: WHAT IS THIS PERSON ACTUALLY DOING?
==================================================
Look at the image and the observation data. Identify:
- Posture (sitting/standing/walking)
- Visible objects (phone/laptop/cup/book/headphones)
- Group or alone
- What they are visibly interacting with

Report this in detectedActivity. Be honest. Only describe what you can see.
If you can only see "person + laptop", say "using a laptop". NOT "studying" or "coding".

==================================================
STEP 2: ONE MEME SENTENCE
==================================================
Write EXACTLY ONE sentence that roasts what they are visibly doing.
The sentence MUST reference their actual observable activity.

The tone should feel like a TikTok/Reels reaction comment:

PHONE:
"Bro is fighting for his life in the reels section."
"That phone has full custody of this man's attention."
"Bro opened the phone and immediately left reality."

LAPTOP:
"Bro opened the laptop and chose absolutely nothing."
"That laptop has been opened for decorative purposes."
"Bro opened twelve tabs and accomplished nothing."

STANDING:
"Bro spawned here and forgot the objective."
"Bro is buffering in real life."
"Bro has successfully become part of the furniture."

WALKING + PHONE:
"Bro is letting Google Maps and God handle the rest."
"Bro really said navigation is optional."

GROUP:
"Four people around one laptop and somehow nobody is typing."
"This meeting has participants but absolutely no function."

Use structures people recognize from meme culture:
"Bro really...", "POV: ...", "Not bro...", "NAHHH.", "Someone check on bro.", "Bro is cooked.", "It's over.", "Who let bro cook?", "At this point..."

Do NOT force slang into every sentence. Sound natural.

==================================================
STEP 3: SHORT MALAYALAM REACTION
==================================================
Append a 1-6 word Malayalam reaction in Malayalam script.
Do NOT translate the English. This is a SEPARATE short reaction.
Examples: "പണി പാളി.", "ചുമ്മാ നിൽക്കുന്നു.", "അവസ്ഥ മോശം.", "ദൈവമേ."

==================================================
BANNED
==================================================
- Do NOT make multiple sentences in the roast field
- Do NOT mention appearance, face, body, weight, skin, race, gender, age, disability
- Do NOT hallucinate activities not visible in the image
- Do NOT use: "main character energy", "intimidating presence", "enigmatic", "radiates energy"
- Do NOT invent time durations ("standing for 17 minutes")
- Do NOT guess what's on their screen

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
