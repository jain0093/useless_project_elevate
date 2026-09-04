const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const boundaries = JSON.parse(fs.readFileSync('scratch/clip_boundaries.json', 'utf8'));
const outDir = path.join(__dirname, '../public/audio/memes');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Extracting ${boundaries.length} meme audio clips...`);

const extracted = [];

for (let i = 0; i < boundaries.length; i++) {
  const current = boundaries[i];
  const idNum = String(i + 1).padStart(3, '0');
  const filename = `meme-${idNum}.mp3`;
  const outFile = path.join(outDir, filename);

  // Calculate safe padded start and end
  const prevEnd = i > 0 ? boundaries[i - 1].end : 0;
  const nextStart = i < boundaries.length - 1 ? boundaries[i + 1].start : 185.73;

  // Add 0.08s lead-in padding and 0.12s tail padding, bounded by adjacent clips
  const paddedStart = Math.max(0, Math.max(prevEnd, current.start - 0.08));
  const paddedEnd = Math.min(185.73, Math.min(nextStart, current.end + 0.12));
  const duration = Math.max(0.2, paddedEnd - paddedStart);

  const cmd = `ffmpeg -y -ss ${paddedStart.toFixed(3)} -t ${duration.toFixed(3)} -i public/audio/source/master_meme_audio.mp3 -acodec libmp3lame -b:a 192k "${outFile}"`;
  execSync(cmd, { stdio: 'pipe' });

  extracted.push({
    id: `meme-${idNum}`,
    file: `/audio/memes/${filename}`,
    originalIndex: i + 1,
    start: paddedStart,
    end: paddedEnd,
    duration: parseFloat(duration.toFixed(2))
  });
}

console.log(`Successfully extracted ${extracted.length} clips into ${outDir}`);
fs.writeFileSync('scratch/extracted_clips.json', JSON.stringify(extracted, null, 2));
