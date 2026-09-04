// ============================================
// 🎴 NPC WATCH — AI Client (Gemini)
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

// --- Scene Analysis Schema (for structured output) ---

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
              "Observable activity: sitting, standing, walking, talking, eating, writing, typing, looking at phone, gesturing, etc.",
          },
          device: {
            type: Type.STRING,
            description:
              "Visible device if any: laptop, phone, tablet, book, paper, or null if none visible",
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
        "Array of observable person/group behaviours. One entry per distinct person or group.",
    },
    sceneCommentary: {
      type: Type.STRING,
      description:
        "A short, witty, observational commentary about the scene. 1-2 sentences. Dry humor. Do NOT identify anyone or infer emotions/personality.",
    },
  },
  required: ["peopleCount", "observations", "sceneCommentary"],
};

// --- NPC Profile Schema (for structured output) ---

const npcProfileSchema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      description:
        'A fictional RPG/NPC archetype name in ALL CAPS, like "THE DEADLINE WARRIOR" or "THE LOST FRESHIE". Be creative and funny. Always starts with "THE" or is a short dramatic title.',
    },
    activity: {
      type: Type.STRING,
      description:
        "A short, dramatic, fictional description of what the NPC is doing. 2-4 words. Example: 'Laptop Combat', 'Strategic Standing', 'Beverage Acquisition'",
    },
    socialBattery: {
      type: Type.NUMBER,
      description: "Fictional social battery percentage from 0 to 100",
    },
    braincells: {
      type: Type.NUMBER,
      description: "Fictional braincell count from 0.0 to 10.0 (can be decimal)",
    },
    threatLevel: {
      type: Type.STRING,
      description: "Fictional threat assessment",
      enum: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
    quest: {
      type: Type.STRING,
      description:
        "A completely unnecessary, harmless, absurd quest. 1 sentence. Example: 'Drink water.', 'Find someone wearing the same colour.', 'Walk 5 metres with purpose.'",
    },
    opinion: {
      type: Type.STRING,
      description:
        "An unsolicited AI opinion about this NPC. Observational, playful humor. 1-2 sentences. Never cruel or about sensitive traits.",
    },
    malayalamStatus: {
      type: Type.STRING,
      description:
        'A short Malayalam brainrot/dark-humor punchline in MALAYALAM SCRIPT ONLY (never romanized/Manglish). 1-6 words max. This is a deadpan Malayalam insult or absurd observation that lands as an unexpected punchline after the English commentary. Examples: "ചുമ്മാ നിൽക്കുന്നു.", "പണി പാളി.", "എന്താണ് ഈ സംഭവം?", "പോയി ചായ കുടിക്ക്.", "ഒന്നും മനസ്സിലായില്ല.", "ആളൊരു ലെവലാ.", "സീൻ ഇല്ല.". Must target the observable situation/behavior. Never hateful, discriminatory, sexual, or personally degrading.',
    },
  },
  required: [
    "type",
    "activity",
    "socialBattery",
    "braincells",
    "threatLevel",
    "quest",
    "opinion",
    "malayalamStatus",
  ],
};

// --- Vision Analysis ---

const SCENE_ANALYSIS_PROMPT = `You are NPC WATCH, a fictional AI surveillance system that observes a physical environment through a camera.

YOUR TASK: Analyze this image and return STRUCTURED data about the observable scene.

RULES — READ CAREFULLY:
1. Count the number of PEOPLE visible in the image.
2. For each person or small group, describe ONLY what is DIRECTLY OBSERVABLE:
   - What they are doing (sitting, standing, walking, talking, eating, typing, etc.)
   - What device they are holding/using if visible (laptop, phone, tablet, book, etc.)
   - How many people are in their immediate group
   - Their movement level (low = still/seated, medium = walking/gesturing, high = running/active)
3. Write a short, witty commentary about the overall scene (1-2 sentences).

STRICT PRIVACY RULES — YOU MUST FOLLOW THESE:
- Do NOT attempt to identify any person
- Do NOT infer age, gender, ethnicity, race, or any demographic information  
- Do NOT infer emotions, personality, mental state, or intelligence
- Do NOT infer relationships between people
- Do NOT make claims about anyone's private life
- Do NOT reference sensitive characteristics
- ONLY describe directly observable ACTIONS and OBJECTS

If no people are visible, set peopleCount to 0 and return an empty observations array.

Keep the commentary dry, deadpan, and slightly absurd — like a bored surveillance AI.`;

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
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from vision model");
  }

  const parsed = JSON.parse(text);
  return parsed as SceneAnalysis;
}

// --- NPC Generation ---

const NPC_GENERATION_PROMPT = `You are the NPC GENERATOR module of NPC WATCH — a fictional AI system that turns real-world observable behaviour into absurd RPG character archetypes.

You will receive a description of OBSERVABLE BEHAVIOUR. Your job is to create a FICTIONAL NPC profile.

TONE: You are a deadpan English AI commentator. All main fields (type, activity, quest, opinion) must be in ENGLISH. Dry, sardonic, slightly dark observational humor. Think bored surveillance AI that has seen too much.

RULES:
1. The NPC type should be a creative, funny RPG archetype name. ALL CAPS. Examples: "THE DEADLINE WARRIOR", "THE LOST FRESHIE", "THE LOADING SCREEN", "THE CHAI MERCHANT", "THE PROFESSIONAL CHUMMA-STANDER", "THE BACKGROUND CHARACTER", "THE SIDE-QUEST NPC"
2. Be CREATIVE — don't just repeat the examples. Invent new types based on the observed behaviour.
3. The quest should be harmless, absurd, and unnecessary.
4. The opinion should be deadpan English. Observational and playful — NEVER cruel, NEVER about sensitive traits. Think: "This individual has been standing here for 47 seconds without contributing anything to society." or "14 browser tabs. Zero measurable progress. A catastrophic deployment of human resources."
5. The malayalamStatus is the PUNCHLINE. It must be:
   - Written ENTIRELY in Malayalam script (മലയാളം). NEVER romanized/Manglish.
   - Short: 1-6 words maximum.
   - A teasing, absurd, deadpan, occasionally dark Malayalam brainrot observation.
   - It should feel like an unexpected punchline that drops AFTER the English commentary.
   - Examples: "ചുമ്മാ നിൽക്കുന്നു.", "പണി പാളി.", "എന്താണ് ഈ സംഭവം?", "പോയി ചായ കുടിക്ക്.", "ഒന്നും മനസ്സിലായില്ല.", "ആളൊരു ലെവലാ.", "സീൻ ഇല്ല.", "വെറുതേ ജീവിക്കുന്നു.", "ബ്രോ എന്തിനാ ഇവിടെ?"
   - NEVER hateful, discriminatory, sexual, or personally degrading. Target the situation, not the person.
6. Social battery: 0-100 (lower = more antisocial in the scene)
7. Braincells: 0.0-10.0 (fictional, humorous)
8. The NPC is FICTIONAL. This is a game. Make it funny.

OBSERVABLE BEHAVIOUR TO FICTIONALIZE:`;

export async function generateNPC(observation: Observation): Promise<NPCProfile> {
  const client = getClient();

  const observationText = `
Activity: ${observation.activity}
Device: ${observation.device || "none visible"}
Group size: ${observation.groupSize}
Movement level: ${observation.movement}`;

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: NPC_GENERATION_PROMPT + observationText }],
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
