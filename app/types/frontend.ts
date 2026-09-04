// ============================================
// NPC WATCH — Frontend State Types
// ============================================

import type {
  NPCProfile,
  SceneAnalysis,
  AppPhase,
  WorldStats,
  ThreatLevel,
  SystemStatus as SystemStatusType,
  SystemComponentStatus,
} from "@/lib/types";

// Re-export backend types for frontend convenience
export type {
  NPCProfile,
  SceneAnalysis,
  AppPhase,
  WorldStats,
  ThreatLevel,
  SystemStatusType,
  SystemComponentStatus,
};

/** A single NPC encounter logged in history */
export interface EncounterEntry {
  /** Unique encounter ID (monotonically increasing) */
  id: number;
  /** The NPC profile encountered */
  npc: NPCProfile;
  /** Timestamp of the encounter */
  timestamp: number;
}

/** Top-level frontend application state */
export interface FrontendState {
  /** Current phase of the experience */
  phase: AppPhase;
  /** Whether the camera is active */
  cameraActive: boolean;
  /** Whether audio is muted */
  audioMuted: boolean;
  /** Current countdown value (20 → 0) */
  countdown: number;
  /** The currently revealed NPC (if any) */
  currentNPC: NPCProfile | null;
  /** Latest scene analysis data */
  latestScene: SceneAnalysis | null;
  /** All encountered NPCs in reverse chronological order */
  encounters: EncounterEntry[];
  /** Running encounter counter */
  encounterCount: number;
  /** Fictional world statistics */
  worldStats: WorldStats;
  /** System component statuses */
  systemStatus: SystemStatusType;
}

/** Default world stats */
export const DEFAULT_WORLD_STATS: WorldStats = {
  humansDetected: 0,
  npcsEncountered: 0,
  confusionPercent: 0,
  productivityPercent: 0,
  chummaStanding: 0,
  activeQuests: 0,
  currentVibe: "CALIBRATING",
};

/** Default system status */
export const DEFAULT_SYSTEM_STATUS: SystemStatusType = {
  camera: "OFFLINE",
  microphone: "OFFLINE",
  ai: "OFFLINE",
  judgement: "ACTIVE",
  purpose: "NONE",
};
