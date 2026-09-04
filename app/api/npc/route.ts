// ============================================
// 🎴 NPC WATCH — POST /api/npc
// NPC Generation Endpoint
// Server-side only. API key never exposed.
// ============================================

import { generateNPC } from "@/lib/ai";
import { validateNPCProfile, validateObservation } from "@/lib/validation";
import { getRandomFallbackNPC } from "@/lib/fallback";
import { computeDeterministicActivity } from "@/lib/deterministic-activity";
import { isNearDuplicate } from "@/lib/meme-audio-engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Parse request body
    let body: {
      observation?: unknown;
      image?: string;
      usedNpcTypes?: unknown;
      usedQuests?: unknown;
      usedOpinions?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate observation
    if (!body.observation) {
      return Response.json(
        { error: "Missing 'observation' field." },
        { status: 400 }
      );
    }

    const validatedObservation = validateObservation(body.observation);
    if (!validatedObservation) {
      return Response.json(
        { error: "Invalid observation structure. Expected { activity, device, groupSize, movement }." },
        { status: 400 }
      );
    }

    // Compute authoritative deterministic activity from local CV evidence
    const ev = validatedObservation.evidence;
    const phoneAssoc =
      ev?.associatedObjects?.some((o) => o.associated && o.label === "cell phone") ??
      (validatedObservation.device === "cell phone");
    const laptopAssoc =
      ev?.associatedObjects?.some((o) => o.associated && o.label === "laptop") ??
      (validatedObservation.device === "laptop");

    const deterministic = computeDeterministicActivity({
      posture: (ev?.posture || validatedObservation.posture || "stationary") as
        | "sitting"
        | "standing"
        | "stationary"
        | "unknown",
      postureConfidence: ev?.postureConfidence ?? 0.85,
      movement: (ev?.movement || validatedObservation.movement || "stationary") as
        | "stationary"
        | "moving"
        | "walking",
      movementConfidence: ev?.movementConfidence ?? 0.90,
      phoneAssociated: phoneAssoc,
      laptopAssociated: laptopAssoc,
      isOccludedOrLowConfidence: ev?.confidenceGate === "LOW",
    });

    const authoritativeActivity = deterministic.activity;

    // Overwrite observation activity with authoritative activity to ensure AI receives ground truth
    validatedObservation.activity = authoritativeActivity;

    // Extract used NPC types, quests, and opinions for session deduplication (Part 12)
    const usedNpcTypes: string[] = Array.isArray(body.usedNpcTypes)
      ? (body.usedNpcTypes as unknown[])
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const usedQuests: string[] = Array.isArray(body.usedQuests)
      ? (body.usedQuests as unknown[])
          .filter((q): q is string => typeof q === "string")
          .map((q) => q.trim())
          .filter((q) => q.length > 0)
      : [];

    const usedOpinions: string[] = Array.isArray(body.usedOpinions)
      ? (body.usedOpinions as unknown[])
          .filter((o): o is string => typeof o === "string")
          .map((o) => o.trim())
          .filter((o) => o.length > 0)
      : [];

    const usedTypesSet = new Set(usedNpcTypes.map((t) => t.toUpperCase()));

    // Extract optional image (strip data URL prefix if present)
    let imageBase64: string | undefined;
    if (typeof body.image === "string" && body.image.length > 0) {
      const dataUrlMatch = body.image.match(/^data:image\/\w+;base64,(.+)$/);
      imageBase64 = dataUrlMatch ? dataUrlMatch[1] : body.image;
    }

    // Attempt NPC generation with up to 3 retries (Part 12)
    let lastError: Error | null = null;
    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const rawResult = await generateNPC(
          validatedObservation,
          imageBase64,
          usedNpcTypes,
          usedQuests,
          usedOpinions
        );
        const validated = validateNPCProfile(rawResult);

        if (validated) {
          const isTypeDuplicate = usedTypesSet.has(validated.type.toUpperCase());
          const isOpinionDuplicate = isNearDuplicate(validated.roast, usedOpinions);

          // Check for duplicate NPC type or near-duplicate joke
          if (isTypeDuplicate || isOpinionDuplicate) {
            console.warn(
              `[NPC WATCH] Duplicate detected (type: ${isTypeDuplicate}, opinion: ${isOpinionDuplicate}). Attempt ${attempt + 1}/${MAX_RETRIES}`
            );
            if (attempt < MAX_RETRIES - 1) {
              // Retry with Gemini
              continue;
            }
            // If duplicate persists on final attempt, replace with fresh activity-grounded fallback
            const replacement = getRandomFallbackNPC(
              usedNpcTypes,
              authoritativeActivity,
              validatedObservation.device,
              usedOpinions,
              usedQuests
            );
            if (isTypeDuplicate) validated.type = replacement.type;
            if (isOpinionDuplicate) validated.roast = replacement.roast;
          }

          // RULE 1 & 4: FORCE deterministic activity — Gemini can NEVER override CV facts
          validated.detectedActivity = authoritativeActivity;
          validated.activity = authoritativeActivity;

          // Contradiction gate on roast: ensure roast doesn't reference unassociated phone or impossible walking
          if (!phoneAssoc && validated.roast.toLowerCase().includes("phone")) {
            validated.roast =
              authoritativeActivity === "sitting"
                ? "Bro is just sitting there. Zero thoughts. Zero mission."
                : "Bro spawned here and immediately forgot the main quest.";
          }
          if (ev?.movement !== "walking" && validated.roast.toLowerCase().includes("walk")) {
            validated.roast = "Bro has entered complete standby mode.";
          }

          const deviceTag =
            ev?.associatedObjects && ev.associatedObjects.length > 0
              ? ev.associatedObjects.map((o) => o.label.toUpperCase()).join(" + ")
              : validatedObservation.device
              ? validatedObservation.device.toUpperCase()
              : "NO DEVICE";

          const postureTag = (ev?.posture || validatedObservation.posture || "OBSERVED").toUpperCase();
          const movementTag = (ev?.movement || validatedObservation.movement || "STATIONARY").toUpperCase();
          const groupTag =
            validatedObservation.groupSize > 1
              ? `GROUP OF ${validatedObservation.groupSize}`
              : "SOLO";

          const observedSummary =
            validated.observedDetails ||
            `${postureTag} • ${movementTag} • ${deviceTag} • ${groupTag}`;

          return Response.json({
            ...validated,
            observedDetails: observedSummary,
          });
        }

        lastError = new Error("AI returned invalid NPC profile structure");
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    // All retries failed — use deduplicated fallback matched to authoritative activity
    console.error("[NPC WATCH] NPC generation failed after retries:", lastError?.message);
    const fallback = getRandomFallbackNPC(
      usedNpcTypes,
      authoritativeActivity,
      validatedObservation.device,
      usedOpinions,
      usedQuests
    );

    // Enforce authoritative activity on fallback
    fallback.detectedActivity = authoritativeActivity;
    fallback.activity = authoritativeActivity;

    const fallbackDevice = validatedObservation.device ? `${validatedObservation.device.toUpperCase()} DETECTED` : "TARGET OBSERVED";
    return Response.json({
      ...fallback,
      observedDetails: `${authoritativeActivity.toUpperCase()} • ${fallbackDevice}`,
      _fallback: true,
      _error: "AI brain temporarily cooked. Deploying emergency NPC.",
    });
  } catch (err) {
    const fallback = getRandomFallbackNPC();
    return Response.json({
      ...fallback,
      observedDetails: fallback.observedDetails || "TARGET OBSERVED • LIVE FEED",
      _fallback: true,
      _error: "NPC generator malfunction. Emergency NPC deployed.",
    });
  }
}
