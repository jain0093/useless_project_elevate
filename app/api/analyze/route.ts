// ============================================
// 🎴 NPC WATCH — POST /api/analyze
// Vision Analysis Endpoint
// Server-side only. API key never exposed.
// ============================================

import { analyzeScene } from "@/lib/ai";
import { validateSceneAnalysis } from "@/lib/validation";
import { getFallbackSceneAnalysis } from "@/lib/fallback";

export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(request: Request) {
  try {
    // Parse request body
    let body: { image?: string };
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate image field
    if (!body.image || typeof body.image !== "string") {
      return Response.json(
        { error: "Missing or invalid 'image' field. Expected base64 string." },
        { status: 400 }
      );
    }

    // Check size
    if (body.image.length > MAX_IMAGE_SIZE_BYTES) {
      return Response.json(
        { error: "Image too large. Max 10MB base64." },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present (e.g., "data:image/jpeg;base64,...")
    let imageBase64 = body.image;
    const dataUrlMatch = imageBase64.match(/^data:image\/\w+;base64,(.+)$/);
    if (dataUrlMatch) {
      imageBase64 = dataUrlMatch[1];
    }

    // Attempt AI analysis with retry
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const rawResult = await analyzeScene(imageBase64);
        const validated = validateSceneAnalysis(rawResult);

        if (validated) {
          return Response.json(validated);
        }

        // If validation failed, try again
        lastError = new Error("AI returned invalid scene analysis structure");
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Brief pause before retry
        if (attempt < 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    // All retries failed — use fallback
    console.error("[NPC WATCH] Scene analysis failed after retries:", lastError?.message);
    const fallback = getFallbackSceneAnalysis();
    return Response.json({
      ...fallback,
      _fallback: true,
      _error: "AI temporarily unavailable. Using backup sensors.",
    });
  } catch (err) {
    // Catastrophic error — still don't crash
    console.error("[NPC WATCH] Catastrophic analyze error:", err);
    const fallback = getFallbackSceneAnalysis();
    return Response.json({
      ...fallback,
      _fallback: true,
      _error: "System error. Emergency protocols engaged.",
    });
  }
}
