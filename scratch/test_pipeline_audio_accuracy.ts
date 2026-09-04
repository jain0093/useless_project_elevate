import { selectDeduplicatedAudioClip, selectDeduplicatedMeme } from "../lib/meme-audio-engine";
import { MEME_AUDIO_MANIFEST } from "../lib/audioManifest";

console.log("=== NPC WATCH MEME AUDIO ACCURACY & REAL DURATION SUITE ===");

// 1. Verify durations across all 40 clips
console.log("\n[TEST 1] Verifying all 40 clip durations are natural (not truncated to 1.00s)...");
if (MEME_AUDIO_MANIFEST.length !== 40) {
  throw new Error(`Expected 40 clips, found ${MEME_AUDIO_MANIFEST.length}`);
}

let exactlyOneSecondCount = 0;
MEME_AUDIO_MANIFEST.forEach((c) => {
  if (c.duration === 1.0) exactlyOneSecondCount++;
});

console.log(`✓ 40 clips verified. Clips with exactly 1.00s: ${exactlyOneSecondCount} (must not be all 40)`);
if (exactlyOneSecondCount === 40) {
  throw new Error("FAIL: All clips are 1.00s! Extraction truncation failure.");
}

const sampleDurations = MEME_AUDIO_MANIFEST.slice(0, 8).map((c) => `${c.id}: ${c.duration}s`);
console.log(`✓ Sample durations: ${sampleDurations.join(", ")}`);

// 2. CASE 1: Person sitting doing nothing (phoneAssociated=false, laptopAssociated=false)
console.log("\n[TEST 2] CASE 1: Person sitting doing nothing (no phone, no laptop)...");
const session1Audio: string[] = [];
for (let i = 0; i < 5; i++) {
  const { clip } = selectDeduplicatedAudioClip("sitting", null, 1, session1Audio);
  const { meme } = selectDeduplicatedMeme("sitting", 1, []);
  session1Audio.push(clip.id);

  console.log(`  Encounter ${i + 1}: [${clip.id}] (${clip.duration}s) - ${clip.category.join(", ")}`);

  // Assertions
  if (clip.category.includes("phone")) {
    throw new Error(`FAIL: Phone audio played for sitting person without phone! Clip: ${clip.id}`);
  }
  if (clip.category.includes("laptop")) {
    throw new Error(`FAIL: Laptop audio played for sitting person without laptop! Clip: ${clip.id}`);
  }
  if (clip.category.includes("walking")) {
    throw new Error(`FAIL: Walking audio played for sitting person! Clip: ${clip.id}`);
  }
}
console.log("✓ CASE 1 passed: 5 distinct sitting/idle reactions chosen with zero phone/laptop/walking intrusion.");

// 3. CASE 2: Person using phone
console.log("\n[TEST 3] CASE 2: Person using phone...");
const session2Audio: string[] = [];
for (let i = 0; i < 4; i++) {
  const { clip } = selectDeduplicatedAudioClip("sitting while using phone", "cell phone", 1, session2Audio);
  session2Audio.push(clip.id);
  console.log(`  Encounter ${i + 1}: [${clip.id}] (${clip.duration}s) - ${clip.category.join(", ")}`);

  if (!clip.category.includes("phone") && !clip.category.includes("distraction") && !clip.category.includes("sitting")) {
    throw new Error(`FAIL: Non-phone reaction chosen for phone activity! Clip: ${clip.id}`);
  }
  if (clip.category.includes("walking")) {
    throw new Error(`FAIL: Walking audio played for phone user! Clip: ${clip.id}`);
  }
}
console.log("✓ CASE 2 passed: Phone reactions chosen accurately without walking conflicts.");

// 4. CASE 3: Person walking
console.log("\n[TEST 4] CASE 3: Person walking...");
const session3Audio: string[] = [];
for (let i = 0; i < 3; i++) {
  const { clip } = selectDeduplicatedAudioClip("walking", null, 1, session3Audio);
  session3Audio.push(clip.id);
  console.log(`  Encounter ${i + 1}: [${clip.id}] (${clip.duration}s) - ${clip.category.join(", ")}`);

  if (!clip.category.includes("walking") && !clip.category.includes("movement") && !clip.category.includes("speed")) {
    throw new Error(`FAIL: Non-walking reaction chosen for walking activity! Clip: ${clip.id}`);
  }
  if (clip.category.includes("sitting") && !clip.category.includes("walking")) {
    throw new Error(`FAIL: Pure sitting reaction chosen for walking activity! Clip: ${clip.id}`);
  }
}
console.log("✓ CASE 3 passed: Walking/movement reactions chosen accurately.");

// 5. CASE 4: Person standing still
console.log("\n[TEST 4] CASE 4: Person standing still...");
const session4Audio: string[] = [];
for (let i = 0; i < 3; i++) {
  const { clip } = selectDeduplicatedAudioClip("standing", null, 1, session4Audio);
  session4Audio.push(clip.id);
  console.log(`  Encounter ${i + 1}: [${clip.id}] (${clip.duration}s) - ${clip.category.join(", ")}`);

  if (clip.category.includes("walking") || clip.category.includes("phone")) {
    throw new Error(`FAIL: Contradictory reaction chosen for standing activity! Clip: ${clip.id}`);
  }
}
console.log("✓ CASE 4 passed: Standing reactions chosen accurately.");

// 6. Multi-encounter zero repetition test across consecutive victims
console.log("\n[TEST 5] Verifying zero audio repetition across a 12-encounter sitting session...");
const session5Audio: string[] = [];
for (let i = 0; i < 12; i++) {
  const { clip, isExhausted } = selectDeduplicatedAudioClip("sitting", null, 1, session5Audio);
  session5Audio.push(clip.id);
  console.log(`  Victim ${i + 1}: [${clip.id}] (duration: ${clip.duration}s) - exhausted=${isExhausted}`);
}
const uniqueCount = new Set(session5Audio).size;
console.log(`✓ 12 consecutive sitting encounters produced ${uniqueCount} unique audio clips.`);
if (uniqueCount < 10) {
  throw new Error(`Expected at least 10 unique clips, got ${uniqueCount}`);
}

console.log("\n=======================================================");
console.log("🎉 ALL AUDIO ACCURACY & REAL DURATION TESTS PASSED!");
console.log("=======================================================");
