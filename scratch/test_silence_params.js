const { execSync } = require('child_process');

for (const d of [0.4, 0.5, 0.6, 0.7, 0.8, 1.0]) {
  for (const noise of ['-25dB', '-30dB', '-35dB']) {
    const out = execSync(`ffmpeg -i public/audio/source/master_meme_audio.mp3 -af silencedetect=noise=${noise}:d=${d} -f null - 2>&1`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const starts = (out.match(/silence_start/g) || []).length;
    console.log(`noise=${noise}, d=${d}s -> ${starts} silences (clips: ~${starts + 1})`);
  }
}
