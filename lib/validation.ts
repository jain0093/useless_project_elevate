// ============================================
// 🎴 NPC WATCH — Validation Layer
// Trust no AI. Validate everything.
// ============================================

import type { SceneAnalysis, NPCProfile, Observation, ThreatLevel } from "./types";

const VALID_MOVEMENTS = ["low", "medium", "high"];
const VALID_THREAT_LEVELS: ThreatLevel[] = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

/**
 * Validates and sanitizes a SceneAnalysis response from the AI.
 * Returns a valid SceneAnalysis or null if completely unusable.
 */
export function validateSceneAnalysis(data: unknown): SceneAnalysis | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;

  // Validate peopleCount
  let peopleCount = 0;
  if (typeof raw.peopleCount === "number" && raw.peopleCount >= 0) {
    peopleCount = Math.floor(raw.peopleCount);
  }

  // Validate observations
  const observations: Observation[] = [];
  if (Array.isArray(raw.observations)) {
    for (const obs of raw.observations) {
      const validated = validateObservation(obs);
      if (validated) {
        observations.push(validated);
      }
    }
  }

  // Validate sceneCommentary
  let sceneCommentary = "Scene observed. Commentary unavailable.";
  if (typeof raw.sceneCommentary === "string" && raw.sceneCommentary.trim().length > 0) {
    sceneCommentary = raw.sceneCommentary.trim().slice(0, 500);
  }

  // If we got zero people and zero observations, still return valid data
  return {
    peopleCount,
    observations,
    sceneCommentary,
  };
}

/**
 * Validates a single observation object.
 */
export function validateObservation(data: unknown): Observation | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;

  // Activity is required
  if (typeof raw.activity !== "string" || raw.activity.trim().length === 0) {
    return null;
  }

  const activity = raw.activity.trim().slice(0, 100);

  // Device can be string or null
  let device: string | null = null;
  if (typeof raw.device === "string" && raw.device.trim().length > 0) {
    device = raw.device.trim().slice(0, 50);
  }

  // GroupSize defaults to 1
  let groupSize = 1;
  if (typeof raw.groupSize === "number" && raw.groupSize >= 1) {
    groupSize = Math.floor(raw.groupSize);
  }

  // Movement must be valid
  let movement: "low" | "medium" | "high" = "low";
  if (typeof raw.movement === "string" && VALID_MOVEMENTS.includes(raw.movement.toLowerCase())) {
    movement = raw.movement.toLowerCase() as "low" | "medium" | "high";
  }

  return { activity, device, groupSize, movement };
}

/**
 * Validates and sanitizes an NPCProfile response from the AI.
 * Returns a valid NPCProfile or null if completely unusable.
 */
export function validateNPCProfile(data: unknown): NPCProfile | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;

  // Type is required
  if (typeof raw.type !== "string" || raw.type.trim().length === 0) {
    return null;
  }

  const type = raw.type.trim().toUpperCase().slice(0, 100);

  // Activity with fallback
  const activity =
    typeof raw.activity === "string" && raw.activity.trim().length > 0
      ? raw.activity.trim().slice(0, 100)
      : "Unclassified Activity";

  // Social battery: clamp 0-100
  let socialBattery = 50;
  if (typeof raw.socialBattery === "number") {
    socialBattery = Math.max(0, Math.min(100, Math.round(raw.socialBattery)));
  }

  // Braincells: clamp 0-10
  let braincells = 5.0;
  if (typeof raw.braincells === "number") {
    braincells = Math.max(0, Math.min(10, Math.round(raw.braincells * 10) / 10));
  }

  // Threat level: validate against enum
  let threatLevel: ThreatLevel = "LOW";
  if (
    typeof raw.threatLevel === "string" &&
    VALID_THREAT_LEVELS.includes(raw.threatLevel.toUpperCase() as ThreatLevel)
  ) {
    threatLevel = raw.threatLevel.toUpperCase() as ThreatLevel;
  }

  // Quest with fallback
  const quest =
    typeof raw.quest === "string" && raw.quest.trim().length > 0
      ? raw.quest.trim().slice(0, 300)
      : "Continue existing.";

  // Opinion with fallback
  const opinion =
    typeof raw.opinion === "string" && raw.opinion.trim().length > 0
      ? raw.opinion.trim().slice(0, 500)
      : "The system has no opinion at this time.";

  // Malayalam status with fallback
  const malayalamStatus =
    typeof raw.malayalamStatus === "string" && raw.malayalamStatus.trim().length > 0
      ? raw.malayalamStatus.trim().slice(0, 200)
      : "Chumma.";

  return {
    type,
    activity,
    socialBattery,
    braincells,
    threatLevel,
    quest,
    opinion,
    malayalamStatus,
  };
}
