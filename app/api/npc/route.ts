// ============================================
// 🎴 NPC WATCH — POST /api/npc
// NPC Generation Endpoint
// Server-side only. API key never exposed.
// ============================================

import { generateNPC } from "@/lib/ai";
import { validateNPCProfile, validateObservation } from "@/lib/validation";
import { getRandomFallbackNPC } from "@/lib/fallback";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Parse request body
    let body: { observation?: unknown };
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

    // Attempt NPC generation with retry
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const rawResult = await generateNPC(validatedObservation);
        const validated = validateNPCProfile(rawResult);

        if (validated) {
          return Response.json(validated);
        }

        lastError = new Error("AI returned invalid NPC profile structure");
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    // All retries failed — use fallback
    console.error("[NPC WATCH] NPC generation failed after retries:", lastError?.message);
    const fallback = getRandomFallbackNPC();
    return Response.json({
      ...fallback,
      _fallback: true,
      _error: "AI brain temporarily cooked. Deploying emergency NPC.",
    });
  } catch (err) {
    // Catastrophic error — still don't crash
    console.error("[NPC WATCH] Catastrophic NPC error:", err);
    const fallback = getRandomFallbackNPC();
    return Response.json({
      ...fallback,
      _fallback: true,
      _error: "NPC generator malfunction. Emergency NPC deployed.",
    });
  }
}
