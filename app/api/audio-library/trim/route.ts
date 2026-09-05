import { NextResponse } from "next/server";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execFileAsync = util.promisify(execFile);

// Helper to find ffmpeg binary
function getFfmpegPath(): string {
  const gyanPath =
    "C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe";
  if (fs.existsSync(gyanPath)) {
    return gyanPath;
  }
  return "ffmpeg";
}

function getFfprobePath(): string {
  const gyanPath =
    "C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffprobe.exe";
  if (fs.existsSync(gyanPath)) {
    return gyanPath;
  }
  return "ffprobe";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clipId, startTime, endTime, padTo6s = false } = body;

    if (!clipId || typeof startTime !== "number" || typeof endTime !== "number") {
      return NextResponse.json(
        { error: "clipId, startTime (number), and endTime (number) are required" },
        { status: 400 }
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "endTime must be strictly greater than startTime" },
        { status: 400 }
      );
    }

    const duration = endTime - startTime;
    if (duration > 30) {
      return NextResponse.json(
        { error: "Clip duration cannot exceed 30 seconds" },
        { status: 400 }
      );
    }

    // Source master audio
    const masterMp3 = path.join(process.cwd(), "public/audio/source/master_audio.mp3");
    const masterMpeg = path.join(
      process.cwd(),
      "public/audio/source/master_meme_audio_new.mpeg"
    );
    const sourcePath = fs.existsSync(masterMp3) ? masterMp3 : masterMpeg;

    if (!fs.existsSync(sourcePath)) {
      return NextResponse.json(
        { error: "Master source audio file not found on server" },
        { status: 404 }
      );
    }

    // Determine target clip file
    const clipFileName = `${clipId}.mp3`;
    const targetPath = path.join(process.cwd(), "public/audio/memes", clipFileName);
    const ffmpegBin = getFfmpegPath();
    const ffprobeBin = getFfprobePath();

    // Build FFmpeg args
    // Use -ss before -i for fast accurate seek, -to for range
    const args: string[] = [
      "-y",
      "-ss",
      startTime.toFixed(3),
      "-to",
      endTime.toFixed(3),
      "-i",
      sourcePath,
    ];

    if (padTo6s && duration < 5.9) {
      args.push("-af", "apad=whole_dur=6");
    }

    args.push(
      "-c:a",
      "libmp3lame",
      "-b:a",
      "192k",
      "-ar",
      "44100",
      "-ac",
      "2",
      targetPath
    );

    console.log(`[Trim API] Running: ${ffmpegBin} ${args.join(" ")}`);
    await execFileAsync(ffmpegBin, args);

    // Verify output with ffprobe
    let verifiedDuration = duration;
    try {
      const { stdout } = await execFileAsync(ffprobeBin, [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        targetPath,
      ]);
      const parsed = parseFloat(stdout.trim());
      if (!isNaN(parsed) && parsed > 0) {
        verifiedDuration = Math.round(parsed * 100) / 100;
      }
    } catch (probeErr) {
      console.warn("[Trim API] ffprobe check warning:", probeErr);
    }

    // Update manifest entry if it exists
    const manifestPath = path.join(
      process.cwd(),
      "public/audio/memes/audioManifest.json"
    );
    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, "utf8");
        const parsed = JSON.parse(raw);
        const clipsArray = Array.isArray(parsed) ? parsed : parsed.clips;
        if (Array.isArray(clipsArray)) {
          const item = clipsArray.find((c: { id: string }) => c.id === clipId);
          if (item) {
            item.duration = verifiedDuration;
          }
          fs.writeFileSync(manifestPath, JSON.stringify(parsed, null, 2), "utf8");
        }
      } catch (manifestErr) {
        console.warn("[Trim API] Manifest update error:", manifestErr);
      }
    }

    return NextResponse.json({
      success: true,
      clipId,
      startTime,
      endTime,
      duration: verifiedDuration,
      fileUrl: `/audio/memes/${clipFileName}?t=${Date.now()}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Trim API] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
