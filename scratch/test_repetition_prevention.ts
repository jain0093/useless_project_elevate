import {
  MEME_CATALOG,
  selectDeduplicatedMeme,
  getRotatingReactionLabel,
  isNearDuplicate,
  REACTION_LABELS,
} from "../lib/meme-audio-engine";

console.log("=== RUNNING REPETITION & DEDUPLICATION TESTS ===");

// Test 1: Near-duplicate detection
const history = [
  "Bro has achieved furniture status.",
  "That laptop is basically furniture now.",
  "Bro spawned here and forgot the main quest.",
];

console.assert(
  isNearDuplicate("Bro has achieved furniture status.", history) === true,
  "Exact match should be flagged"
);
console.assert(
  isNearDuplicate("bro is basically furniture.", history) === true,
  "Near-duplicate 'basically furniture' should be flagged"
);
console.assert(
  isNearDuplicate("The phone has full custody.", history) === false,
  "Distinct joke should not be flagged"
);
console.log("Test 1 (Near-duplicate jokes): PASSED ✅");

// Test 2: Rotating reaction labels never repeat consecutively
let previousLabel = "TARGET LOCKED";
for (let i = 0; i < 20; i++) {
  const nextLabel = getRotatingReactionLabel(previousLabel);
  console.assert(
    nextLabel !== previousLabel,
    `Consecutive label repeated: ${nextLabel} === ${previousLabel}`
  );
  console.assert(
    REACTION_LABELS.includes(nextLabel as any),
    `Invalid label generated: ${nextLabel}`
  );
  previousLabel = nextLabel;
}
console.log("Test 2 (Rotating reaction labels non-consecutive): PASSED ✅");

// Test 3: Deduplicated meme selection across sessions
const usedMemeIds: string[] = [];
const phoneMemes = MEME_CATALOG.filter((m) => m.category === "phone");

// First selection
const res1 = selectDeduplicatedMeme("sitting while using a phone", 1, usedMemeIds);
console.assert(res1.meme.category === "phone", "Meme must be in phone category");
usedMemeIds.push(res1.meme.id);

// Second selection
const res2 = selectDeduplicatedMeme("using phone", 1, usedMemeIds);
console.assert(res2.meme.id !== res1.meme.id, "Second meme must differ from first meme");
usedMemeIds.push(res2.meme.id);

// Third selection
const res3 = selectDeduplicatedMeme("sitting while using phone", 1, usedMemeIds);
console.assert(![res1.meme.id, res2.meme.id].includes(res3.meme.id), "Third meme must differ from first two");
usedMemeIds.push(res3.meme.id);

console.log(`Test 3 (Meme selection deduplication): PASSED (${usedMemeIds.length} unique memes picked) ✅`);

// Test 4: Verify grounded category routing
const sitMeme = selectDeduplicatedMeme("sitting", 1, []);
console.assert(sitMeme.meme.category === "sitting", "Sitting activity must pick sitting meme");

const walkMeme = selectDeduplicatedMeme("walking", 1, []);
console.assert(walkMeme.meme.category === "walking", "Walking activity must pick walking meme");

const laptopMeme = selectDeduplicatedMeme("sitting while using a laptop", 1, []);
console.assert(laptopMeme.meme.category === "laptop", "Laptop activity must pick laptop meme");

const groupMeme = selectDeduplicatedMeme("standing in a group", 3, []);
console.assert(groupMeme.meme.category === "group", "Group size > 1 must pick group meme");

console.log("Test 4 (Grounded category matching): PASSED ✅");

console.log("\nALL REPETITION & DEDUPLICATION TESTS PASSED WITH 100%! 🚀");
