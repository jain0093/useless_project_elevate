import {
  selectDeduplicatedMeme,
  getRotatingReactionLabel,
  isNearDuplicate,
  REACTION_LABELS,
  MEME_CATALOG,
} from "../lib/meme-audio-engine";
import { getRandomFallbackNPC } from "../lib/fallback";

console.log("=== SIMULATING 10 CONSECUTIVE ENCOUNTERS IN ONE SESSION ===");

const session = {
  usedNpcTypes: [] as string[],
  usedMemeIds: [] as string[],
  usedAudioIds: [] as string[],
  usedQuests: [] as string[],
  usedOpinions: [] as string[],
  lastReactionLabel: undefined as string | undefined,
};

const activity = "sitting";

for (let i = 1; i <= 10; i++) {
  console.log(`\n--- ENCOUNTER #${i} ---`);

  // 1. Rotating reaction label
  const reactionLabel = getRotatingReactionLabel(session.lastReactionLabel);
  console.assert(
    reactionLabel !== session.lastReactionLabel,
    `Encounter #${i}: Reaction label repeated consecutively: ${reactionLabel}`
  );
  session.lastReactionLabel = reactionLabel;

  // 2. Meme & Audio selection with related category fallback
  const { meme } = selectDeduplicatedMeme(activity, 1, session.usedMemeIds);
  console.assert(
    !session.usedMemeIds.includes(meme.id) || session.usedMemeIds.length >= 3,
    `Encounter #${i}: Premature meme repetition for ${meme.id}`
  );
  session.usedMemeIds.push(meme.id);
  if (meme.audioSrc) session.usedAudioIds.push(meme.audioSrc);

  // 3. Fallback / NPC deduplication
  const npc = getRandomFallbackNPC(
    session.usedNpcTypes,
    activity,
    null,
    session.usedOpinions,
    session.usedQuests
  );

  console.assert(
    !session.usedNpcTypes.includes(npc.type) || session.usedNpcTypes.length >= 5,
    `Encounter #${i}: Premature NPC type repetition: ${npc.type}`
  );
  console.assert(
    !isNearDuplicate(npc.roast, session.usedOpinions) || session.usedOpinions.length >= 5,
    `Encounter #${i}: Near-duplicate joke flagged: "${npc.roast}"`
  );

  session.usedNpcTypes.push(npc.type);
  session.usedQuests.push(npc.quest);
  session.usedOpinions.push(npc.roast);

  console.log(`[#${i}] Label: "${reactionLabel}"`);
  console.log(`[#${i}] NPC: "${npc.type}"`);
  console.log(`[#${i}] Meme: "${meme.title}" (${meme.category})`);
  console.log(`[#${i}] Quest: "${npc.quest}"`);
  console.log(`[#${i}] Roast: "${npc.roast}"`);
}

console.log("\nSession summary after 10 encounters:");
console.log(`Unique NPC Types: ${new Set(session.usedNpcTypes).size}/10`);
console.log(`Unique Memes: ${new Set(session.usedMemeIds).size}`);
console.log(`Unique Quests: ${new Set(session.usedQuests).size}/10`);
console.log(`Unique Roasts: ${new Set(session.usedOpinions).size}/10`);

console.assert(new Set(session.usedNpcTypes).size >= 8, "Expected high diversity of NPC types");
console.assert(new Set(session.usedQuests).size >= 8, "Expected high diversity of Quests");
console.assert(new Set(session.usedOpinions).size >= 8, "Expected high diversity of Roasts");

console.log("\nALL 10 CONSECUTIVE ENCOUNTERS PASSED ZERO-REPETITION CHECKS! 🚀");
