// ============================================
// NPC WATCH — Frontend State Types
// ============================================

import type {
  NPCProfile,
  SceneAnalysis,
  AppPhase,
  ThreatLevel,
  SystemStatus as SystemStatusType,
  SystemComponentStatus,
} from "@/lib/types";

// Re-export backend types for frontend convenience
export type {
  NPCProfile,
  SceneAnalysis,
  AppPhase,
  ThreatLevel,
  SystemStatusType,
  SystemComponentStatus,
};

/** A single detected person from COCO-SSD */
export interface PersonDetection {
  /** Frame-local ID (index in current detection array) */
  id: number;
  /** Detection confidence (0-1) */
  confidence: number;
  /** Normalized bounding box: x position (0-1) */
  x: number;
  /** Normalized bounding box: y position (0-1) */
  y: number;
  /** Normalized bounding box: width (0-1) */
  width: number;
  /** Normalized bounding box: height (0-1) */
  height: number;
  /** Nearby detected objects (e.g. ["cell phone", "laptop"]) */
  nearbyObjects?: string[];
}

/** Scanning state machine */
export type ScanState = "IDLE" | "COUNTDOWN" | "ANALYZING" | "NPC_REVEAL" | "NO_VICTIM";

/** A single NPC encounter logged in history */
export interface EncounterEntry {
  /** Unique encounter ID (monotonically increasing) */
  id: number;
  /** The NPC profile encountered */
  npc: NPCProfile;
  /** Timestamp of the encounter */
  timestamp: number;
  /** Cropped image of the detected person (base64 data URL) */
  croppedImage?: string;
}

/** Extended system status for frontend display */
export interface FrontendSystemStatus {
  camera: SystemComponentStatus | "ONLINE" | "OFFLINE" | "ERROR";
  personDetector: "LOADING" | "READY" | "ERROR" | "OFFLINE";
  ai: "ONLINE" | "CALLING" | "OFFLINE" | "ERROR";
  judgement: "ACTIVE" | "SUSPENDED";
  purpose: "NONE";
}

/** Default system status */
export const DEFAULT_SYSTEM_STATUS: FrontendSystemStatus = {
  camera: "OFFLINE",
  personDetector: "OFFLINE",
  ai: "OFFLINE",
  judgement: "ACTIVE",
  purpose: "NONE",
};
