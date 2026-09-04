const { execSync } = require('child_process');

const out = execSync('ffmpeg -i public/audio/source/master_meme_audio.mp3 -af silencedetect=noise=-30dB:d=0.6 -f null - 2>&1', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

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

const clips = [];
let lastSoundStart = 0;

for (let i = 0; i < silenceEvents.length; i++) {
  const ev = silenceEvents[i];
  if (ev.type === 'start') {
    const soundEnd = ev.time;
    if (soundEnd - lastSoundStart > 0.4) {
      clips.push({ start: lastSoundStart, end: soundEnd, dur: parseFloat((soundEnd - lastSoundStart).toFixed(2)) });
    }
  } else if (ev.type === 'end') {
    lastSoundStart = ev.time;
  }
}

const totalDur = 185.73;
if (totalDur - lastSoundStart > 0.4) {
  clips.push({ start: lastSoundStart, end: totalDur, dur: parseFloat((totalDur - lastSoundStart).toFixed(2)) });
}

console.log(`Found ${clips.length} clips with noise=-30dB, d=0.6s:`);
clips.forEach((c, i) => {
  console.log(`[${String(i + 1).padStart(2, '0')}] ${c.start.toFixed(2)}s -> ${c.end.toFixed(2)}s | Duration: ${c.dur}s`);
});
