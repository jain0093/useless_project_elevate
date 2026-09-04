const fs = require("fs");
const path = require("path");

function createWavBuffer(sampleRate, durationSec, generateSample) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const blockAlign = 2; // 16-bit mono
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22); // num channels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(byteRate, 28); // byte rate
  buffer.writeUInt16LE(blockAlign, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = generateSample(t, durationSec);
    s = Math.max(-1, Math.min(1, s)); // clamp
    const intSample = Math.floor(s * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const SAMPLE_RATE = 44100;

// Sound generators for each meme reaction
const SOUND_DEFINITIONS = [
  {
    filePath: "public/audio/phone/custody.wav",
    duration: 2.2,
    gen: (t) => {
      // Notification ping followed by a heavy dramatic bass boom
      const ping = t < 0.3 ? Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 12) : 0;
      const boom = t >= 0.25 ? Math.sin(2 * Math.PI * (70 - (t - 0.25) * 20) * (t - 0.25)) * Math.exp(-(t - 0.25) * 2.2) * 1.2 : 0;
      return ping * 0.5 + boom * 0.8;
    },
  },
  {
    filePath: "public/audio/phone/aishwaryam.wav",
    duration: 2.0,
    gen: (t) => {
      // Ascending tech chime followed by comedic bell
      const chime = Math.sin(2 * Math.PI * (440 + t * 400) * t) * Math.exp(-t * 2.5);
      const bell = t > 0.8 ? Math.sin(2 * Math.PI * 1200 * (t - 0.8)) * Math.exp(-(t - 0.8) * 4) : 0;
      return (chime + bell) * 0.6;
    },
  },
  {
    filePath: "public/audio/phone/scroll.wav",
    duration: 1.8,
    gen: (t) => {
      // Swoosh + bubbly arpeggio
      const freq = 300 + Math.sin(t * 15) * 200;
      const synth = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 1.8);
      return synth * 0.7;
    },
  },
  {
    filePath: "public/audio/laptop/assignment.wav",
    duration: 2.5,
    gen: (t) => {
      // Dramatic brass chord shock
      const f1 = 220, f2 = 277.18, f3 = 329.63;
      const chord = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) + Math.sin(2 * Math.PI * f3 * t)) / 3;
      const env = Math.exp(-t * 1.5);
      return chord * env * 0.85;
    },
  },
  {
    filePath: "public/audio/laptop/contra.wav",
    duration: 2.2,
    gen: (t) => {
      // Dramatic "Dun Dun Dunnnn"
      let freq = 200;
      if (t > 0.5 && t <= 1.0) freq = 180;
      if (t > 1.0) freq = 140;
      const staccato = Math.sin(2 * Math.PI * freq * t) * (t < 1.0 ? Math.exp(-(t % 0.5) * 6) : Math.exp(-(t - 1.0) * 2));
      return staccato * 0.8;
    },
  },
  {
    filePath: "public/audio/laptop/gazer.wav",
    duration: 2.0,
    gen: (t) => {
      // Hollow comedic bonk + dream chime
      const bonk = t < 0.4 ? Math.sin(2 * Math.PI * (350 - t * 400) * t) * Math.exp(-t * 10) : 0;
      const chime = t >= 0.3 ? Math.sin(2 * Math.PI * 660 * (t - 0.3)) * Math.exp(-(t - 0.3) * 2.5) : 0;
      return bonk * 0.8 + chime * 0.5;
    },
  },
  {
    filePath: "public/audio/walking/walk.wav",
    duration: 2.2,
    gen: (t) => {
      // Cartoon slide whistle up
      const f = 300 + (t / 2.2) * 600;
      return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 0.8) * 0.7;
    },
  },
  {
    filePath: "public/audio/walking/speed.wav",
    duration: 1.8,
    gen: (t) => {
      // Rapid energetic turbo pulse
      const f = 500 + Math.sin(t * 30) * 150;
      return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.5) * 0.7;
    },
  },
  {
    filePath: "public/audio/sitting/furniture.wav",
    duration: 2.4,
    gen: (t) => {
      // Heavy stone thud + low drone
      const thud = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-t * 4);
      const drone = Math.sin(2 * Math.PI * 130 * t) * Math.exp(-t * 1.2) * 0.5;
      return (thud + drone) * 0.9;
    },
  },
  {
    filePath: "public/audio/sitting/minute.wav",
    duration: 2.3,
    gen: (t) => {
      // Clock tick tick tick followed by rising question note
      let sound = 0;
      if (t < 0.4) sound = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-(t % 0.2) * 30);
      else if (t < 0.8) sound = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-((t - 0.4) % 0.2) * 30);
      else {
        const qf = 400 + (t - 0.8) * 300;
        sound = Math.sin(2 * Math.PI * qf * (t - 0.8)) * Math.exp(-(t - 0.8) * 2);
      }
      return sound * 0.75;
    },
  },
  {
    filePath: "public/audio/sitting/peace.wav",
    duration: 2.5,
    gen: (t) => {
      // Peaceful chime + funny chirp
      const chime = Math.sin(2 * Math.PI * 528 * t) * Math.exp(-t * 1.5);
      const chirp = t > 1.2 ? Math.sin(2 * Math.PI * (1200 + Math.sin(t * 40) * 200) * (t - 1.2)) * Math.exp(-(t - 1.2) * 5) : 0;
      return chime * 0.6 + chirp * 0.4;
    },
  },
  {
    filePath: "public/audio/standing/monument.wav",
    duration: 2.5,
    gen: (t) => {
      // Grand trumpet fanfare chord
      const f1 = 293.66, f2 = 369.99, f3 = 440;
      const brass = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) + Math.sin(2 * Math.PI * f3 * t)) / 3;
      return brass * Math.exp(-t * 1.4) * 0.8;
    },
  },
  {
    filePath: "public/audio/standing/anchor.wav",
    duration: 2.0,
    gen: (t) => {
      // Heavy anchor clank and boing
      const clank = Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t * 6);
      const boing = t > 0.4 ? Math.sin(2 * Math.PI * (200 + Math.sin(t * 50) * 50) * (t - 0.4)) * Math.exp(-(t - 0.4) * 3) : 0;
      return (clank + boing) * 0.8;
    },
  },
  {
    filePath: "public/audio/group/committee.wav",
    duration: 2.5,
    gen: (t) => {
      // Chaos cluster chord + gavel strike
      const chaos = (Math.sin(2 * Math.PI * 300 * t) + Math.sin(2 * Math.PI * 320 * t) + Math.sin(2 * Math.PI * 350 * t)) / 3 * Math.exp(-t * 2);
      const gavel = t > 0.6 ? Math.sin(2 * Math.PI * 80 * (t - 0.6)) * Math.exp(-(t - 0.6) * 8) : 0;
      return (chaos + gavel) * 0.8;
    },
  },
  {
    filePath: "public/audio/group/survivor.wav",
    duration: 2.2,
    gen: (t) => {
      // Tense dramatic heartbeat + sigh chord
      const beat = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-(t % 0.5) * 15);
      const sigh = t > 1.0 ? Math.sin(2 * Math.PI * 220 * (t - 1.0)) * Math.exp(-(t - 1.0) * 2) : 0;
      return (beat + sigh) * 0.75;
    },
  },
  {
    filePath: "public/audio/unclear/unclear.wav",
    duration: 2.0,
    gen: (t) => {
      // Glitchy synth sweeps
      const sweep = Math.sin(2 * Math.PI * (200 + Math.sin(t * 30) * 400) * t) * Math.exp(-t * 1.5);
      return sweep * 0.7;
    },
  },
  {
    filePath: "public/audio/no-victim/empty.wav",
    duration: 2.2,
    gen: (t) => {
      // Ghostly wind chord
      const f1 = 200, f2 = 203;
      const beat = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t)) * 0.5 * Math.exp(-t * 1.2);
      return beat * 0.7;
    },
  },
];

console.log("Generating audio assets...");

for (const def of SOUND_DEFINITIONS) {
  const fullPath = path.resolve(__dirname, "..", def.filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const wavBuf = createWavBuffer(SAMPLE_RATE, def.duration, def.gen);
  fs.writeFileSync(fullPath, wavBuf);
  console.log(`Generated: ${def.filePath} (${wavBuf.length} bytes)`);
}

console.log("All audio assets generated successfully!");
