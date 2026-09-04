const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Analyzing master audio with noise=-30dB and d=0.7s...");
const out = execSync('ffmpeg -i public/audio/source/master_meme_audio.mp3 -af silencedetect=noise=-30dB:d=0.7 -f null - 2>&1', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

const silenceEvents = [];
const regex = /\[Parsed_silencedetect_0[^\]]*\] (silence_start: ([\d\.]+)|silence_end: ([\d\.]+))/g;

let match;
while ((match = regex.exec(out)) !== null) {
  if (match[2]) {
    silenceEvents.push({ type: 'start', time: parseFloat(match[2]) });
  } else if (match[3]) {
    silenceEvents.push({ type: 'end', time: parseFloat(match[3]) });
  }
}

const rawClips = [];
let lastSoundStart = 0;

for (let i = 0; i < silenceEvents.length; i++) {
  const ev = silenceEvents[i];
  if (ev.type === 'start') {
    const soundEnd = ev.time;
    if (soundEnd - lastSoundStart > 0.4) {
      rawClips.push({ start: lastSoundStart, end: soundEnd });
    }
  } else if (ev.type === 'end') {
    lastSoundStart = ev.time;
  }
}

const totalDur = 185.73;
if (totalDur - lastSoundStart > 0.4) {
  rawClips.push({ start: lastSoundStart, end: totalDur });
}

console.log(`Detected ${rawClips.length} raw complete clip boundaries.`);

const outDir = path.join(__dirname, '../public/audio/memes');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const extractedClips = [];

for (let i = 0; i < rawClips.length; i++) {
  const current = rawClips[i];
  const idNum = String(i + 1).padStart(3, '0');
  const filename = `meme-${idNum}.mp3`;
  const outFile = path.join(outDir, filename);

  const prevEnd = i > 0 ? rawClips[i - 1].end : 0;
  const nextStart = i < rawClips.length - 1 ? rawClips[i + 1].start : totalDur;

  // Add 100ms lead-in padding and 150ms tail padding, bounded by neighboring clips
  const paddedStart = Math.max(0, Math.max(prevEnd, current.start - 0.10));
  const paddedEnd = Math.min(totalDur, Math.min(nextStart, current.end + 0.15));
  const duration = Math.max(0.3, paddedEnd - paddedStart);

  const cmd = `ffmpeg -y -ss ${paddedStart.toFixed(3)} -t ${duration.toFixed(3)} -i public/audio/source/master_meme_audio.mp3 -acodec libmp3lame -b:a 192k "${outFile}"`;
  execSync(cmd, { stdio: 'pipe' });

  // Probe actual output file duration using ffprobe
  const probeOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outFile}"`, { encoding: 'utf8' }).trim();
  const realDuration = parseFloat(parseFloat(probeOut).toFixed(2));

  extractedClips.push({
    id: `meme-${idNum}`,
    file: `/audio/memes/${filename}`,
    originalIndex: i + 1,
    start: parseFloat(paddedStart.toFixed(2)),
    end: parseFloat(paddedEnd.toFixed(2)),
    duration: realDuration
  });

  console.log(`[AUDIO] meme-${idNum} extracted -> duration: ${realDuration}s`);
}

fs.writeFileSync('scratch/extracted_clips_clean.json', JSON.stringify(extractedClips, null, 2));
console.log(`Done! Extracted ${extractedClips.length} complete clips.`);
