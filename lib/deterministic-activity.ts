// ==========================================================
// NPC WATCH — DETERMINISTIC ACTIVITY & CONTRADICTION ENGINE
// Rule 1, 2, 3, 4: Local CV evidence is authoritative.
// Gemini is NEVER allowed to invent or override factual activity.
// ==========================================================

export interface CVEvidenceInput {
  posture: "sitting" | "standing" | "stationary" | "unknown";
  postureConfidence: number;
  movement: "stationary" | "moving" | "walking";
  movementConfidence: number;
  phoneAssociated: boolean;
  laptopAssociated: boolean;
  bookAssociated?: boolean;
  drinkAssociated?: boolean;
  groupSize?: number;
  isOccludedOrLowConfidence?: boolean;
}

export interface DeterministicActivityResult {
  activity: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidenceTokens: string[];
}

/**
 * RULE 3: Deterministic Activity Mapping
 * Converts validated local computer vision telemetry into an exact factual activity.
 * Strict conservative hierarchy — never speculates.
 */
export function computeDeterministicActivity(
  evidence: CVEvidenceInput
): DeterministicActivityResult {
  const tokens: string[] = [];

  // Hard gate: Occluded, cut off, or confidence too low to determine activity
  if (
    evidence.isOccludedOrLowConfidence ||
    (evidence.postureConfidence < 0.50 && evidence.movementConfidence < 0.60)
  ) {
    return {
      activity: "activity unclear",
      confidence: "LOW",
      evidenceTokens: ["insufficient visual evidence or heavy occlusion"],
    };
  }

  // 1. WALKING ACTIVITIES (requires temporal movement detection across frames)
  if (evidence.movement === "walking" && evidence.movementConfidence >= 0.70) {
    tokens.push(`movement: walking (${evidence.movementConfidence})`);
    if (evidence.phoneAssociated) {
      tokens.push("phone: spatially associated in hand/torso region");
      return {
        activity: "walking while using a phone",
        confidence: "HIGH",
        evidenceTokens: tokens,
      };
    }
    return {
      activity: "walking",
      confidence: "HIGH",
      evidenceTokens: tokens,
    };
  }

  // 2. SITTING ACTIVITIES (chair detected or aspect ratio + position confirms seated)
  if (evidence.posture === "sitting") {
    tokens.push(`posture: sitting (${evidence.postureConfidence})`);
    if (evidence.movement === "stationary") {
      tokens.push(`movement: stationary (${evidence.movementConfidence})`);
    }

    if (evidence.phoneAssociated) {
      tokens.push("phone: spatially associated in lap/hands region");
      return {
        activity: "sitting while using a phone",
        confidence: "HIGH",
        evidenceTokens: tokens,
      };
    }

    if (evidence.laptopAssociated) {
      tokens.push("laptop: spatially associated on desk/lap");
      return {
        activity: "sitting while using a laptop",
        confidence: "HIGH",
        evidenceTokens: tokens,
      };
    }

    return {
      activity: "sitting",
      confidence: evidence.postureConfidence >= 0.80 ? "HIGH" : "MEDIUM",
      evidenceTokens: tokens,
    };
  }

  // 3. STANDING ACTIVITIES
  if (evidence.posture === "standing") {
    tokens.push(`posture: standing (${evidence.postureConfidence})`);
    if (evidence.movement === "stationary") {
      tokens.push(`movement: stationary (${evidence.movementConfidence})`);
    }

    if (evidence.phoneAssociated) {
      tokens.push("phone: spatially associated in hands/torso region");
      return {
        activity: "standing while using a phone",
        confidence: "HIGH",
        evidenceTokens: tokens,
      };
    }

    if (evidence.laptopAssociated) {
      tokens.push("laptop: spatially associated on surface in front");
      return {
        activity: "standing while using a laptop",
        confidence: "HIGH",
        evidenceTokens: tokens,
      };
    }

    return {
      activity: "standing",
      confidence: evidence.postureConfidence >= 0.80 ? "HIGH" : "MEDIUM",
      evidenceTokens: tokens,
    };
  }

  // 4. STATIONARY WITH AMBIGUOUS POSTURE (e.g. cropped torso)
  if (evidence.movement === "stationary") {
    tokens.push(`movement: stationary (${evidence.movementConfidence})`);
    if (evidence.phoneAssociated) {
      tokens.push("phone: spatially associated");
      return {
        activity: "using a phone",
        confidence: "MEDIUM",
        evidenceTokens: tokens,
      };
    }
    if (evidence.laptopAssociated) {
      tokens.push("laptop: spatially associated");
      return {
        activity: "using a laptop",
        confidence: "MEDIUM",
        evidenceTokens: tokens,
      };
    }
  }

  // Conservative fallback: never invent an activity
  return {
    activity: "activity unclear",
    confidence: "LOW",
    evidenceTokens: ["ambiguous posture and no verified device interaction"],
  };
}

/**
 * RULE 4: Hard Contradiction Gates
 * Validates any candidate activity string against ground truth evidence.
 * If any contradiction exists (e.g. claiming phone when phoneAssociated is false),
 * it forcefully overwrites with the deterministic CV activity.
 */
export function enforceContradictionGates(
  candidateActivity: string | undefined,
  evidence: CVEvidenceInput
): string {
  const deterministic = computeDeterministicActivity(evidence).activity;
  if (!candidateActivity) return deterministic;

  const candidateLower = candidateActivity.toLowerCase();

  // Contradiction 1: Claiming walking when movement !== walking
  if (evidence.movement !== "walking" && candidateLower.includes("walk")) {
    console.warn("[NPC WATCH GATE] Blocked contradiction: claimed walking while movement is", evidence.movement);
    return deterministic;
  }

  // Contradiction 2: Claiming phone when phoneAssociated === false
  if (!evidence.phoneAssociated && candidateLower.includes("phone")) {
    console.warn("[NPC WATCH GATE] Blocked contradiction: claimed phone while phoneAssociated is false");
    return deterministic;
  }

  // Contradiction 3: Claiming laptop when laptopAssociated === false
  if (!evidence.laptopAssociated && candidateLower.includes("laptop")) {
    console.warn("[NPC WATCH GATE] Blocked contradiction: claimed laptop while laptopAssociated is false");
    return deterministic;
  }

  // Contradiction 4: Claiming movement when stationary
  if (
    evidence.movement === "stationary" &&
    (candidateLower.includes("walking") || candidateLower.includes("moving") || candidateLower.includes("running"))
  ) {
    console.warn("[NPC WATCH GATE] Blocked contradiction: claimed motion while stationary");
    return deterministic;
  }

  // Return deterministic to guarantee 100% agreement with local CV
  return deterministic;
}
