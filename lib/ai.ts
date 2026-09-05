// ============================================
// 🎴 AVASTHA — ONE-SENTENCE MEME ROAST ENGINE
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

// --- NPC Profile Schema ---

const npcProfileSchema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      description:
        'A stupidly funny, specific NPC class title in ALL CAPS based strictly on visible activity. Examples: "THE PHONE HAS FULL CUSTODY", "THE WALKING SIDE QUEST", "THE ONE-TAB SCHOLAR", "THE HUMAN LOADING SCREEN", "THE SILENT COMMITTEE", "THE NOTIFICATION SLAVE".',
    },
    activity: {
      type: Type.STRING,
      description:
        "Short dramatic label for what they're doing. 1-3 words. Example: 'Phone Combat', 'Strategic Standing', 'Laptop Decoration'",
    },
    detectedActivity: {
      type: Type.STRING,
      description:
        "STRICTLY what local computer vision detected and what is visually verified in the crop. Examples: 'sitting while using a phone', 'walking while using a phone', 'sitting while using a laptop', 'standing', 'walking', 'sitting', 'activity unclear'. Never invent invisible stories.",
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
        "A stupidly specific, one-sentence RPG quest grounded in what they are visibly doing. Example: 'Put the phone down for five seconds to see what happens.', 'Close one browser tab. Just one.', 'Reach your destination before the plot changes.'",
    },
    roast: {
      type: Type.STRING,
      description:
        "EXACTLY ONE short sentence (8-20 words) roasting what this person is visibly doing. Sounds like a brutally observant friend from 2026, NOT an AI. Must directly reference their visible activity. NEVER mention appearance/body/face/race/gender/identity.",
    },
    evidenceUsed: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "List of observable facts from computer vision used to generate this profile (e.g., ['person sitting', 'cell phone held in hands', 'stationary for 10s']).",
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
  ],
};

// --- Vision Analysis ---

const SCENE_ANALYSIS_PROMPT = `You are AVASTHA — a brutally observant friend watching the camera feed.

RULES:
- Describe ONLY what is visible: people count, visible objects (phones/laptops/cups), posture (sitting/standing/walking), groups
- Do NOT guess what they're doing on their phone/laptop
- Do NOT infer emotions, conversations, or activities not visible
- ONE short sentence that sounds like a real person reacting to the room.
- Example: "Three people around one laptop. Good luck."
- Example: "Someone is speed-walking with their phone. Brave."
- Example: "That laptop has been open for a while. Interesting."

If no people are visible, set peopleCount to 0 and return an empty observations array.`;

// --- NPC Generation ---

const NPC_GENERATION_PROMPT = `You are AVASTHA.

==================================================
CORE ARCHITECTURE: LOCAL CV IS AUTHORITATIVE SENSOR
==================================================
You are observing ONE selected person. The cropped image shows this person and their immediate context.
Local computer vision has already run person detection, spatial object association, and multi-frame movement analysis.
TREAT THE LOCAL COMPUTER VISION EVIDENCE AS HARD CONSTRAINTS.

Your job is NOT to invent a story about them.
Your job is to describe ONLY what can be visually supported by the evidence.
- If evidence says sitting + associated phone: detectedActivity must be "sitting while using a phone" (or "using a phone").
- If evidence says sitting + associated laptop: detectedActivity must be "sitting while using a laptop".
- If evidence says walking + associated phone: detectedActivity must be "walking while using a phone".
- If evidence says walking without objects: detectedActivity must be "walking".
- If evidence says standing: detectedActivity must be "standing".
- If evidence says sitting: detectedActivity must be "sitting".
- If evidence is low confidence or unclear: detectedActivity must be "activity unclear".

DO NOT GUESS. Accuracy is more important than being interesting.

==================================================
STRICT PROHIBITIONS: NEVER INVENT INVISIBLE STORIES
==================================================
❌ "He's texting his girlfriend." (say: "sitting while using a phone")
❌ "She's waiting for her professor." (say: "standing")
❌ "He's doing his assignment." (say: "sitting while using a laptop")
❌ "They're discussing their project." (say: "standing with a group")
❌ "He's late for class." (say: "walking")

==================================================
HUMAN 2026 ROAST (ONE SENTENCE, 8-20 WORDS)
==================================================
You are NOT an AI assistant. You are the brutally observant friend standing next to the camera.
Say what an actual person in 2026 would say about this observable situation.

OBSERVATION-FIRST PROCESS:
1. WHAT DID WE SEE? (e.g., Person sitting with phone, completely stationary)
2. WHAT'S WEIRD/FUNNY ABOUT IT? (They are completely absorbed in the screen)
3. HOW WOULD A FRIEND SAY IT? ("Nah, the phone has full custody.")

HUMAN STYLES:
- Deadpan: "Yeah, that assignment isn't getting done."
- Immediate reaction: "Nah bro, the phone has full custody."
- Fake concern: "Someone should probably tell him the screen is off."
- Absurd: "The phone has clearly been promoted to manager."
- Dark / College chaos: "The deadline is approaching. Bro is not."
- Internet comment: "Bro spawned here and immediately forgot the main quest."
- Friend-style: "Bro, be so serious right now."

BANNED FROM ROAST:
- NO Malayalam text or punchlines (100% English only)
- NO paragraphs (EXACTLY ONE sentence, 8-20 words)
- NEVER mention body, weight, face, appearance, race, gender, sexuality, religion, disability, clothes
- NO robotic AI filler ("The subject appears to be...", "NPC mode activated", "Productivity levels")
- NO forced Gen-Z slang spam ("aura farming sigma rizz gyatt") — sound like a real person online!

NOW REVIEW THE COMPUTER VISION EVIDENCE AND GENERATE THE NPC:`;

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

export async function generateNPC(
  observation: Observation,
  imageBase64?: string,
  usedNpcTypes: string[] = [],
  usedQuests: string[] = [],
  usedOpinions: string[] = []
): Promise<NPCProfile> {
  const client = getClient();

  const historySections: string[] = [];
  if (usedNpcTypes && usedNpcTypes.length > 0) {
    historySections.push(`PREVIOUSLY USED NPC TYPES IN THIS SESSION:\n${usedNpcTypes.map((t) => `- ${t}`).join("\n")}`);
  }
  if (usedQuests && usedQuests.length > 0) {
    historySections.push(`PREVIOUSLY USED QUESTS IN THIS SESSION:\n${usedQuests.slice(-5).map((q) => `- ${q}`).join("\n")}`);
  }
  if (usedOpinions && usedOpinions.length > 0) {
    historySections.push(`PREVIOUSLY USED OPINIONS / JOKES IN THIS SESSION:\n${usedOpinions.slice(-6).map((o) => `- ${o}`).join("\n")}`);
  }

  const usedHistoryNotice =
    historySections.length > 0
      ? `\n\n==================================================
PREVIOUS SESSION ENCOUNTER HISTORY (REPETITION PREVENTION):
${historySections.join("\n\n")}
CRITICAL RULE: DO NOT reuse or closely paraphrase any of the above jokes, punchlines, metaphors, or NPC types.
Create a genuinely different joke, metaphor, punchline, and sentence structure!
==================================================`
      : "";

  const evidence = observation.evidence;
  const phoneAssociated =
    evidence?.associatedObjects?.some((o) => o.associated && o.label === "cell phone") ??
    (observation.device === "cell phone");
  const laptopAssociated =
    evidence?.associatedObjects?.some((o) => o.associated && o.label === "laptop") ??
    (observation.device === "laptop");

  const visibleObjects =
    evidence?.associatedObjects?.map((o) => o.label) ||
    observation.nearbyObjects ||
    (observation.device ? [observation.device] : []);

  const factualObservation = {
    activity: observation.activity,
    movement: evidence?.movement || observation.movement,
    posture: evidence?.posture || observation.posture || "unknown",
    visibleObjects,
    phoneAssociated,
    laptopAssociated,
    groupSize: evidence?.groupSize ?? observation.groupSize,
  };

  const evidenceBlock = `
==================================================
AUTHORITATIVE FACTUAL OBSERVATION (RULE 8):
${JSON.stringify(factualObservation, null, 2)}
==================================================
RULE: The observation above is authoritative and final.
Do not modify, reinterpret, or add factual activities or objects.
Generate only the fictional NPC archetype type, quest, and roast based on this observation.
If phoneAssociated is false, DO NOT mention a phone.
If movement is stationary, DO NOT mention walking or moving.
If laptopAssociated is false, DO NOT mention a laptop.
${usedHistoryNotice}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: NPC_GENERATION_PROMPT + "\n" + evidenceBlock },
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
      temperature: 0.95,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from NPC generator");
  }

  const parsed = JSON.parse(text) as NPCProfile;
  // RULE 1: Never let Gemini override factual activity
  parsed.detectedActivity = observation.activity;
  parsed.activity = observation.activity;

  return parsed;
}
