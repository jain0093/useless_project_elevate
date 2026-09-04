import fs from "fs";
import path from "path";
import {
  MEME_AUDIO_MANIFEST,
  mapActivityToAudioCategories,
} from "../lib/audioManifest";
import {
  selectDeduplicatedAudioClip,
  selectDeduplicatedMeme,
} from "../lib/meme-audio-engine";

function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTING NPC WATCH — 40 MEME AUDIO EXTRACTION & DEDUPLICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // TEST 1: Source master audio file exists
  const masterAudioPath = "public/audio/source/master_meme_audio.mp3";
  assert(fs.existsSync(masterAudioPath), `Master audio file exists at ${masterAudioPath}`);
  const masterSize = fs.statSync(masterAudioPath).size;
  assert(masterSize > 1000000, `Master audio size is valid (${(masterSize / 1024 / 1024).toFixed(2)} MB)`);

  // TEST 2: 40 clips extracted and valid
  const manifestClips = MEME_AUDIO_MANIFEST;
  assert(manifestClips.length === 40, `Manifest has exactly 40 clips (actual: ${manifestClips.length})`);

  let allFilesExist = true;
  let allFilesNonEmpty = true;
  for (let i = 1; i <= 40; i++) {
    const filename = `meme-${String(i).padStart(3, "0")}.mp3`;
    const filePath = path.join("public/audio/memes", filename);
    if (!fs.existsSync(filePath)) {
      allFilesExist = false;
      console.error(`Missing file: ${filePath}`);
    } else {
      const sz = fs.statSync(filePath).size;
      if (sz < 5000) {
        allFilesNonEmpty = false;
      }
    }
  }
  assert(allFilesExist, "All 40 meme audio files exist in public/audio/memes/");
  assert(allFilesNonEmpty, "All 40 meme audio files are non-empty valid audio clips");

  // TEST 3: Metadata completeness
  const allHaveCategories = manifestClips.every((c) => c.category && c.category.length > 0);
  const allHaveMoods = manifestClips.every((c) => c.mood && c.mood.length > 0);
  const allHaveUseWhen = manifestClips.every((c) => c.useWhen && c.useWhen.length > 0);
  assert(allHaveCategories, "Every clip has defined categories");
  assert(allHaveMoods, "Every clip has defined moods");
  assert(allHaveUseWhen, "Every clip has defined useWhen rules");

  // TEST 4: Contextual activity mapping
  const sitCats = mapActivityToAudioCategories("sitting");
  assert(sitCats.includes("sitting"), "Sitting maps to sitting category");

  const phoneCats = mapActivityToAudioCategories("sitting while using a phone", "cell phone");
  assert(phoneCats.includes("phone"), "Phone activity maps to phone category");

  const laptopCats = mapActivityToAudioCategories("sitting while using a laptop", "laptop");
  assert(laptopCats.includes("laptop"), "Laptop activity maps to laptop category");

  const walkCats = mapActivityToAudioCategories("walking");
  assert(walkCats.includes("walking"), "Walking maps to walking category");

  const groupCats = mapActivityToAudioCategories("standing in a group", null, 3);
  assert(groupCats.includes("group"), "Group maps to group category");

  // TEST 5: Zero repetition simulation across 10 consecutive encounters
  console.log("\n--- Simulating 10 Consecutive Encounters with Deduplication ---");
  const testScenarios = [
    { act: "sitting while using a phone", dev: "cell phone", grp: 1 },
    { act: "sitting", dev: null, grp: 1 },
    { act: "sitting while using a laptop", dev: "laptop", grp: 1 },
    { act: "walking", dev: null, grp: 1 },
    { act: "standing in a group", dev: null, grp: 4 },
    { act: "standing", dev: null, grp: 1 },
    { act: "sitting while using a phone", dev: "cell phone", grp: 1 },
    { act: "activity unclear", dev: null, grp: 1 },
    { act: "sitting", dev: null, grp: 1 },
    { act: "walking", dev: null, grp: 1 },
  ];

  const sessionAudioIds: string[] = [];
  const sessionMemeIds: string[] = [];
  const combinations: string[] = [];

  for (let i = 0; i < testScenarios.length; i++) {
    const sc = testScenarios[i];
    const { clip } = selectDeduplicatedAudioClip(sc.act, sc.dev, sc.grp, sessionAudioIds);
    const { meme } = selectDeduplicatedMeme(sc.act, sc.grp, sessionMemeIds);

    const combo = `${clip.id}|${meme.id}|${sc.act}`;
    assert(!sessionAudioIds.includes(clip.id), `Encounter ${i + 1}: Unused audio selected (${clip.id}: "${clip.title}")`);
    assert(!combinations.includes(combo), `Encounter ${i + 1}: Unique audio-meme-activity combination`);

    sessionAudioIds.push(clip.id);
    sessionMemeIds.push(meme.id);
    combinations.push(combo);
  }

  assert(sessionAudioIds.length === 10, "10 unique audio clips played across 10 encounters");
  assert(new Set(sessionAudioIds).size === 10, "Zero repetition in audio across 10 encounters");

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
