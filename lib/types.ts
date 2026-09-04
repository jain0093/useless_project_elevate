// ============================================
// 🎴 NPC WATCH — Shared Type Definitions
// THE CAMERA SEES. THE AI JUDGES.
// ============================================

// --- Vision Analysis Types ---

/** A single observable person/group behaviour from the scene */
export interface Observation {
  /** What the person/group is doing: sitting, standing, walking, talking, eating, etc. */
  activity: string;
  /** Visible device if any: laptop, phone, tablet, book, or null */
  device: string | null;
  /** How many people in this observed group */
  groupSize: number;
  /** Observable movement level */
  movement: "low" | "medium" | "high";
}

/** Structured response from the /api/analyze vision endpoint */
export interface SceneAnalysis {
  /** Number of people visible in the frame */
  peopleCount: number;
  /** Array of observable behaviours (one per person/group) */
  observations: Observation[];
  /** Short AI-generated commentary about the scene */
  sceneCommentary: string;
}

// --- NPC Generation Types ---

/** Threat level classification for an NPC */
export type ThreatLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** A fully generated NPC profile */
export interface NPCProfile {
  /** The NPC archetype name, e.g. "THE DEADLINE WARRIOR" */
  type: string;
  /** Short description of what they're doing */
  activity: string;
  /** Fictional social battery percentage (0-100) */
  socialBattery: number;
  /** Fictional braincell count (0-10, can be decimal) */
  braincells: number;
  /** Fictional threat assessment */
  threatLevel: ThreatLevel;
  /** Absurd quest assignment */
  quest: string;
  /** Unsolicited AI opinion about this NPC */
  opinion: string;
  /** Optional Malayalam-flavoured status line */
  malayalamStatus: string;
}

// --- API Request/Response Types ---

/** Request body for POST /api/analyze */
export interface AnalyzeRequest {
  /** Base64-encoded JPEG image from webcam */
  image: string;
}

/** Request body for POST /api/npc */
export interface NPCRequest {
  /** The observation to generate an NPC from */
  observation: Observation;
}

// --- App State Types ---

/** All possible phases of the NPC WATCH experience */
export type AppPhase =
  | "INITIAL"
  | "CAMERA_PERMISSION"
  | "SCANNING"
  | "ANALYZING"
  | "NPC_SELECTION"
  | "NPC_REVEAL"
  | "SPEAKING"
  | "RETURN_TO_SCANNING"
  | "AI_ERROR"
  | "CAMERA_ERROR"
  | "NO_HUMANS"
  | "FALLBACK_MODE";

/** Fictional world statistics */
export interface WorldStats {
  humansDetected: number;
  npcsEncountered: number;
  confusionPercent: number;
  productivityPercent: number;
  chummaStanding: number;
  activeQuests: number;
  currentVibe: string;
}

/** NPC history entry (grouped by type) */
export interface NPCHistoryEntry {
  type: string;
  count: number;
}

/** System component status */
export type SystemComponentStatus = "ONLINE" | "OFFLINE" | "ERROR" | "COOKED";

/** System status indicators */
export interface SystemStatus {
  camera: SystemComponentStatus;
  microphone: SystemComponentStatus;
  ai: SystemComponentStatus;
  judgement: "ACTIVE" | "SUSPENDED";
  purpose: "NONE";
}
