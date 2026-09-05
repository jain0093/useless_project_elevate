// ============================================
// 🎴 AVASTHA — Validation Layer
// Trust no AI. Validate everything.
// ============================================

import type { SceneAnalysis, NPCProfile, Observation, ThreatLevel } from "./types";

const VALID_MOVEMENTS = ["low", "medium", "high", "stationary", "moving", "walking"];
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
  let movement: Observation["movement"] = "stationary";
  if (typeof raw.movement === "string" && VALID_MOVEMENTS.includes(raw.movement.toLowerCase())) {
    movement = raw.movement.toLowerCase() as Observation["movement"];
  }

  const nearbyObjects = Array.isArray(raw.nearbyObjects)
    ? (raw.nearbyObjects as unknown[]).filter((o): o is string => typeof o === "string")
    : Array.isArray(raw.visibleObjects)
    ? (raw.visibleObjects as unknown[]).filter((o): o is string => typeof o === "string")
    : undefined;

  const posture = typeof raw.posture === "string" ? raw.posture.trim().slice(0, 50) : undefined;
  const confidence = typeof raw.confidence === "number" ? raw.confidence : undefined;
  const evidence = (raw.evidence && typeof raw.evidence === "object") ? (raw.evidence as Observation["evidence"]) : undefined;

  return {
    activity,
    device,
    groupSize,
    movement,
    nearbyObjects,
    visibleObjects: nearbyObjects,
    posture,
    confidence,
    evidence,
  };
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

  // Roast: one meme sentence (replaces old opinion)
  const roast =
    typeof raw.roast === "string" && raw.roast.trim().length > 0
      ? raw.roast.trim().slice(0, 300)
      : typeof raw.opinion === "string" && raw.opinion.trim().length > 0
      ? raw.opinion.trim().slice(0, 300)
      : "Bro is just existing. Respectfully.";

  // Detected activity from AI vision
  const detectedActivity =
    typeof raw.detectedActivity === "string" && raw.detectedActivity.trim().length > 0
      ? raw.detectedActivity.trim().slice(0, 200)
      : "activity unclear";

  const evidenceUsed = Array.isArray(raw.evidenceUsed)
    ? (raw.evidenceUsed as unknown[]).filter((e): e is string => typeof e === "string")
    : undefined;

  return {
    type,
    activity,
    socialBattery,
    braincells,
    threatLevel,
    quest,
    roast,
    detectedActivity,
    evidenceUsed,
  };
}
