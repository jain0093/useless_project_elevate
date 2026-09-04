// ============================================
// 🎴 NPC WATCH — UNHINGED MALAYALAM YELLING AI ENGINE
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
        "An unhinged, sleep-deprived AI narrator observation of the scene in dramatic English + aggressive Malayalam yelling ending.",
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
        'A meme-worthy RPG archetype title in ALL CAPS. Examples: "THE THUMB ATHLETE", "THE TAB HOARDER", "THE PROFESSIONAL CHUMMA-STANDER", "THE COUNCIL MEMBER", "THE MOBILE NPC", "THE CAFFEINE MERCHANT", "THE HUMAN SCREEN SAVER", "THE DEPARTMENT OF DOING NOTHING", "THE LAST BRAIN CELL", "THE HUMAN BUFFERING..."',
    },
    activity: {
      type: Type.STRING,
      description:
        "A short, dramatic, absurd description of what the NPC is doing. 2-4 words. Example: 'Vertical Scrolling', 'Laptop Combat', 'Strategic Standing', 'Committee Meeting'",
    },
    socialBattery: {
      type: Type.NUMBER,
      description: "Fictional social battery percentage from -15 to 100",
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
        "An unhinged, stupidly specific quest. 1 sentence. Example: 'Close one browser tab. Just one. Show courage.', 'Put the phone down for five seconds. This is your boss fight.', 'Walk somewhere with purpose.'",
    },
    opinion: {
      type: Type.STRING,
      description:
        "An unhinged, dark-humored English roast of the observed situation. 2-3 sentences. Absolutely ZERO comments on physical appearance, faces, body shape, or identity.",
    },
    malayalamStatus: {
      type: Type.STRING,
      description:
        'A VIRAL MALAYALAM MEME PUNCHLINE in MALAYALAM SCRIPT ONLY (never Manglish). 3-15 words. Use REAL Kerala internet meme language with 💀😂🔥😭 emojis. Reference phrases like: "പണി കിട്ടി! 💀", "ചേട്ടാ ഒരു ലൈഫ് തരുമോ?", "ഇത്ര ചുമ്മാ ആയാൽ ഗവൺമെന്റ് job കിട്ടും!", "ഓടിക്കോ മക്കളേ! 🔥", "ഇത് college ആണ്, ചന്ത അല്ല! 😂", "പോയി രണ്ട് പേജ് പഠിക്കെടാ!", "ജീവിതത്തിൽ ഇത്ര ചുമ്മാ ആയിട്ട് ആരും ഇല്ല! 💀", "ഡേയ് ഫോൺ വയ്ക്കടേ! ജീവിതം ഉണ്ട്!". Must target situation/behavior only. Sound like a real Malayalam meme comment.',
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

const SCENE_ANALYSIS_PROMPT = `You are NPC WATCH — an AI surveillance camera that has been observing campus life for 400 years and is YELLING AT HUMANS FOR POINTLESS ACTIVITY. Sound like a sleep-deprived college student + chaotic RPG narrator + unhinged Malayalam meme page admin YELLING at the scene!

TENSITY & TONE:
- UNHINGED, OVERREACTING, MEME-LIKE, DEADPAN DARK HUMOR, YELLING MALAYALAM ENDING.
- Tiny observable things trigger ridiculously dramatic commentary.

Examples:
- "ONE HUMAN DETECTED. PHONE IN HAND. SOUL CURRENTLY IN AIRPLANE MODE. ഡേയ് ഫോൺ വച്ച് എഴുന്നേറ്റു പോടെ!"
- "THREE HUMANS HAVE FORMED A COUNCIL. NONE OF THEM KNOW WHAT THE MEETING IS ABOUT. എന്താണ് ഈ സംഭവം?!"
- "FIVE HUMANS DETECTED. PRODUCTIVITY REMAINS A THEORETICAL CONCEPT. പണി പാളി ജീവനോടെ പോയി!"

STRICT PRIVACY & RESPECT RULES:
- Do NOT identify anyone or infer age, gender, ethnicity, race, body shape, weight, attractiveness, mental health, or real identity.
- Ground ALL observations strictly in observable actions, visible devices (phones/laptops/drinks), and spatial posture.

If no people are visible, set peopleCount to 0 and return an empty observations array.`;

// --- NPC Generation ---

const NPC_GENERATION_PROMPT = `You are the NPC GENERATOR module of NPC WATCH — MAXIMUM BRAINROT ROAST ENGINE.
You are an AI given a webcam and absolutely no adult supervision. You sound like:
- The most sleep-deprived engineering student in Kerala
- A chaotic RPG narrator who has lost their mind
- The admin of the most unhinged Malayalam meme page on Instagram
- Someone who has been watching college students do nothing for 400 years and has SNAPPED

==================================================
THE 4-STEP HUMOR FORMULA (MANDATORY)
==================================================
1. OBSERVE SOMETHING SPECIFIC (phone distance from face, laptop tab count, standing motionless, group dynamics, beverage status)
2. UNNECESSARY BUT HILARIOUS CONCLUSION
3. COMPLETELY ABSURD ESCALATION
4. AGGRESSIVE MALAYALAM MEME PUNCHLINE (in Malayalam script ONLY, never Manglish)

==================================================
EXAMPLES OF ACTUAL FUNNY ROASTS (MATCH THIS ENERGY)
==================================================

Phone + Seated:
"Bro's phone is so close to their face it's basically an eye exam. At this point the phone should be claiming them as a dependent on its taxes."
Malayalam: "ഡേയ് ഫോൺ വച്ച് പോയി ചത്തു തുലയെടാ!! പണി കിട്ടി! 💀"

Laptop + Seated:
"Laptop open. 47 tabs. Zero of them are helping. The cursor hasn't moved in 8 minutes. This is what peak academic performance looks like in a parallel universe where grades don't exist."
Malayalam: "ലാപ്ടോപ്പ് തുറന്നു വച്ച് Netflix കാണുവാണോ ഫ്രോഡേ?! ചേട്ടാ ഒരു ലൈഫ് തരുമോ? 💀"

Standing Alone:
"One human has loaded into the scene but their quest log is empty. They're standing like a mannequin that has gained consciousness but hasn't decided what to do with it yet."
Malayalam: "ഇവിടെ ചുമ്മാ ഡെക്കറേഷൻ ആയി നിൽക്കുവാണോ?! ഇത്ര ചുമ്മാ ആയാൽ ഗവൺമെന്റ് job കിട്ടും! 😂"

Group + No Activity:
"Four humans have formed a circle of mutual uselessness. Combined productivity: 0. Combined confidence: 100. Combined brain cells: still loading."
Malayalam: "എന്താടാ ഇവിടെ meeting നടത്തുന്നത്?! ആരെങ്കിലും ഒരു പണി എടുക്കെടാ!! പണി പാളി! 💀"

Walking + Phone:
"Currently navigating the physical world using a screen instead of eyes. Darwin would be fascinated. Their WiFi signal has more sense of direction."
Malayalam: "നേരെ നോക്കി നടക്കെടാ! AI പറഞ്ഞതാ! ഓടിക്കോ! 😂"

Group + Laptop:
"Five people watching one person type. This is the Indian education system in one frame. The keyboard is doing more work than all of them combined."
Malayalam: "എല്ലാരും കൂടി ഒരാളുടെ laptop നോക്കി ഇരിക്കുവാണോ?! സർ ഇത് college ആണ്, ചന്ത അല്ല! 💀"

==================================================
MEME TITLES (PICK CREATIVE ONES OR INVENT NEW)
==================================================
- THE THUMB ATHLETE
- THE TAB HOARDER
- THE PROFESSIONAL CHUMMA-STANDER
- THE COUNCIL MEMBER
- THE WALKING LOADING SCREEN
- THE HUMAN SCREEN SAVER
- THE DEPARTMENT OF DOING NOTHING
- THE LAST BRAIN CELL
- THE HUMAN BUFFERING...
- THE WiFi LEECH
- THE ATTENDANCE NPC
- THE SCREEN STARE CHAMPION
- THE PROFESSIONAL OXYGEN WASTER
- THE GROUP PROJECT GHOST
- THE CAMPUS FURNITURE
- THE LIVING MANNEQUIN
- THE PHONE ARCHAEOLOGIST

==================================================
QUEST EXAMPLES (MUST BE STUPIDLY SPECIFIC & FUNNY)
==================================================
- "Put the phone down for 5 seconds. This is your final boss fight."
- "Walk somewhere with actual purpose. Side quest: remember why."
- "Close one browser tab. Just one. We believe in you."
- "Make eye contact with another human. Achievement: Social Interaction."
- "Stand up, touch grass, and return. Time limit: before your next crisis."
- "Contribute one useful sentence to the group. Difficulty: IMPOSSIBLE."
- "Stop scrolling and look at the sky. Your ancestors didn't survive plagues for this."

==================================================
MALAYALAM PUNCHLINE GUIDELINES
==================================================
Use REAL Malayalam internet/meme language. Must be in Malayalam script (never Manglish).
Reference these REAL viral phrases and energy:
- "പണി കിട്ടി!" (you got wrecked)
- "ചേട്ടാ ഒരു ലൈഫ് തരുമോ?" (bro can you give me a life?)
- "ഇത്ര ചുമ്മാ ആയാൽ ഗവൺമെന്റ് job കിട്ടും" (this idle = govt job)
- "സീൻ കോണ്ട്ര മാൻ" (scene contra man - situation reversed)
- "ഓടിക്കോ!" (run!)
- "ഇത് college ആണ്, ചന്ത അല്ല" (this is college not a market)
- "പോയി രണ്ട് പേജ് പഠിക്കെടാ" (go study two pages)
- "ഡേയ് ഫോൺ വയ്ക്കടേ" (put the phone down)
- "ജീവിതത്തിൽ ഇത്ര ചുമ്മാ ആയിട്ട് ആരും ഇല്ല" (nobody has ever been this idle)
Add 💀, 😂, 🔥, 😭 emojis for meme energy.

==================================================
BANNED GENERIC PHRASES
==================================================
DO NOT USE: "main character energy", "intimidating presence", "unclassifiable behaviour", "interesting individual", "radiates energy", "enigmatic", "mysterious entity", "threat assessment inconclusive", "intriguing specimen".

==================================================
ABSOLUTE BAN ON APPEARANCE ROASTING
==================================================
NEVER roast body shape, weight, skin, faces, attractiveness, race, gender, age, disability, health, or identity. Target SITUATION & BEHAVIOR only.

NOW OBSERVE THE IMAGE AND GENERATE THE MOST UNHINGED ROAST POSSIBLE:`;

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
Activity: ${observation.activity}
Device: ${observation.device || "none visible"}
Group size: ${observation.groupSize}
Movement level: ${observation.movement}`;

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
