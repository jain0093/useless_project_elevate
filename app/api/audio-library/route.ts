import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const manifestPath = path.join(process.cwd(), "public/audio/memes/audioManifest.json");

export async function GET() {
  try {
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({ error: "Manifest not found" }, { status: 404 });
    }
    const raw = fs.readFileSync(manifestPath, "utf8");
    const data = JSON.parse(raw);
    const clips = Array.isArray(data) ? data : data.clips || [];
    return NextResponse.json(clips);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of audio clips" }, { status: 400 });
    }

    // Write to public/audio/memes/audioManifest.json
    fs.writeFileSync(manifestPath, JSON.stringify(body, null, 2), "utf8");

    // Also update lib/audioManifest.ts with the new data
    const tsPath = path.join(process.cwd(), "lib/audioManifest.ts");
    const tsContent = `// ============================================================
// 🎵 NPC WATCH — MALAYALAM MEME AUDIO MANIFEST
// Master library catalog for 18 fixed 6-second meme reaction clips
// Auto-synced from Developer Audio Library UI
// ============================================================

export interface MemeAudioClip {
  id: string;
  file: string;
  title: string;
  duration: number;
  category: string[];
  mood: string[];
  description?: string;
  useWhen: string[];
}

export const MEME_AUDIO_MANIFEST: MemeAudioClip[] = ${JSON.stringify(body, null, 2)};

export function getClipsByCategory(category: string): MemeAudioClip[] {
  const norm = category.toLowerCase().trim();
  return MEME_AUDIO_MANIFEST.filter((clip) =>
    clip.category.some((c) => c.toLowerCase() === norm)
  );
}

export function mapActivityToAudioCategories(
  activity: string,
  device?: string | null,
  groupSize: number = 1
): string[] {
  const act = (activity || "").toLowerCase();

  // Group priority
  if (groupSize > 1 || act.includes("group")) {
    return ["group", "chaos", "dramatic reaction"];
  }

  // Device priority if associated
  if (act.includes("phone") || device === "cell phone") {
    return ["phone", "distraction", "screen captivity"];
  }

  if (act.includes("laptop") || device === "laptop") {
    return ["laptop", "useless activity", "failure", "sitting"];
  }

  // Locomotion
  if (act.includes("walking") || act.includes("moving")) {
    return ["walking", "movement", "speed", "dramatic reaction"];
  }

  // Standing
  if (act.includes("standing")) {
    return ["standing", "waiting", "awkward", "idle"];
  }

  // Sitting doing nothing
  if (act.includes("sitting")) {
    return ["sitting", "idle", "waiting", "stationary", "awkward", "deadpan", "no activity"];
  }

  // Fallback / unclear
  return ["confusion", "unclear", "awkward", "surprise"];
}
`;
    fs.writeFileSync(tsPath, tsContent, "utf8");

    console.log(`[AUDIO MANIFEST] Successfully updated ${body.length} clips in manifest.`);
    return NextResponse.json({ success: true, count: body.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
