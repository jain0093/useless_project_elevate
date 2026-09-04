"use client";

import { useEffect, useState, useRef } from "react";

// ============================================
// REAL MALAYALAM MEMES — viral Kerala internet culture
// These are actual meme phrases used across Instagram/YouTube/WhatsApp in Kerala
// ============================================

const ZERO_PERSON_ROASTS = [
  "SCANNING COMPLETE. ZERO LIFE FORMS. THE ROOM HAS MORE PERSONALITY THAN THE PEOPLE WHO LEFT IT.",
  "ABSOLUTELY NOBODY. THIS ROOM HAS ACHIEVED ENLIGHTENMENT THROUGH ABANDONMENT.",
  "NO HUMANS DETECTED. EVEN THE WIFI IS LONELY.",
  "SCANNING... SCANNING... THE VOID STARES BACK.",
  "ZERO OCCUPANTS. THE CHAIRS ARE HOLDING A MEETING WITHOUT YOU.",
  "NOBODY HOME. THE ROOM IS FINALLY AT PEACE.",
  "POPULATION: 0. PRODUCTIVITY: ALSO 0. AT LEAST IT'S CONSISTENT.",
];

const ZERO_PERSON_MALAYALAM = [
  "ആരും ഇല്ല... ശൂന്യത ആസ്വദിക്കുന്നു 💀",
  "ജനം പോയി... AI ഒറ്റയ്ക്ക് 😭",
  "ഒരാളും ഇല്ല. പണി ഇല്ല. ലൈഫ് ഇല്ല.",
  "എവിടെ പോയെടാ എല്ലാരും?!",
  "ക്ലാസ്സ് കട്ട് ചെയ്തു പോയോ?! 💀",
];

// Solo person — movement-based roasts
const SOLO_IDLE_ROASTS = [
  "ONE HUMAN DETECTED. STANDING STILL. THE LOADING BAR OF THEIR LIFE IS AT 0%.",
  "ONE HUMAN. ZERO MOVEMENT. THEY'VE BEEN BUFFERING SINCE MORNING.",
  "SINGLE NPC SPOTTED. MOVEMENT: NONE. THEIR WIFI SIGNAL HAS MORE DIRECTION THAN THEM.",
  "ONE HUMAN DETECTED. CURRENTLY CONTRIBUTING TO SOCIETY BY... EXISTING. BARELY.",
  "SOLO HUMAN SPOTTED. FROZEN IN PLACE LIKE THEY OWE THE UNIVERSE MONEY.",
  "ONE PERSON. STANDING. DOING NOTHING. THEIR ANCESTORS FOUGHT WARS FOR THIS.",
];

const SOLO_PHONE_ROASTS = [
  "ONE HUMAN DETECTED. PHONE HAS FULL CUSTODY OF THEIR SOUL. COURT DATE: NEVER.",
  "BHAI IS HOLDING THAT PHONE LIKE IT'S THE LAST SLICE OF POROTTA.",
  "ONE HUMAN. PHONE GLUED TO FACE. THE SCREEN IS RAISING THEM AT THIS POINT.",
  "SOLO NPC. SCROLLING. THE THUMB HAS ACHIEVED SENTIENCE. THE BRAIN HAS NOT.",
  "ONE PERSON. ONE PHONE. ZERO PURPOSE. THE HOLY TRINITY OF CAMPUS LIFE.",
  "PHONE AND HUMAN DETECTED. IT'S UNCLEAR WHO IS USING WHOM.",
];

const SOLO_MOVING_ROASTS = [
  "ONE HUMAN DETECTED. ACTUALLY WALKING. THIS IS NOT A DRILL. SOMEONE IS MOVING.",
  "RARE FOOTAGE: A HUMAN WITH LEGS THAT WORK AND A DESTINATION IN MIND.",
  "ONE NPC IN TRANSIT. WALKING WITH THE ENERGY OF SOMEONE LATE FOR NOTHING.",
  "MOVEMENT DETECTED. THEY'RE WALKING. THE AI IS IMPRESSED. THE BAR WAS ON THE FLOOR.",
  "ONE HUMAN SPOTTED ACTUALLY GOING SOMEWHERE. WE ARE WITNESSING EVOLUTION.",
];

// Group roasts
const GROUP_IDLE_ROASTS = [
  "{n} HUMANS FORMED A CIRCLE. NOBODY KNOWS WHY. THIS IS THE COMMITTEE OF DOING NOTHING.",
  "{n} PEOPLE STANDING TOGETHER. COLLECTIVE BRAIN CELLS: 2. SHARED EQUALLY.",
  "{n} HUMANS DETECTED IN A CLUSTER. NOT ONE OF THEM HAS A PLAN.",
  "{n} PEOPLE ASSEMBLED. THE COMBINED PRODUCTIVITY IS STILL NEGATIVE.",
  "{n} HUMANS STANDING. GOAL: UNKNOWN. PROGRESS: NONE. VIBES: QUESTIONABLE.",
  "{n} NPC COUNCIL DETECTED. THEY'VE BEEN HERE FOR SO LONG THEY'VE BECOME FURNITURE.",
];

const GROUP_ACTIVE_ROASTS = [
  "{n} HUMANS WITH ONE LAPTOP. ONLY THE WIFI IS WORKING HARDER THAN THEM.",
  "{n} PEOPLE STARING AT ONE SCREEN. NOBODY IS TYPING. THE CURSOR IS JUDGING THEM.",
  "{n} HUMANS AROUND A DEVICE. THIS IS CALLED TEAMWORK IN THEORY, CHUMMA IN PRACTICE.",
  "{n} PEOPLE. ONE PHONE. FOUR OPINIONS. ZERO PROGRESS.",
  "{n} HUMANS DETECTED. ACADEMIC COLLABORATION IN PROGRESS. (SOURCE: TRUST ME BRO)",
];

const GROUP_CHAOS_ROASTS = [
  "{n} HUMANS IN FULL CHAOS MODE. NOISE LEVEL: FISH MARKET. PRODUCTIVITY: AQUARIUM.",
  "{n} HUMANS DETECTED. EVERYONE IS TALKING. NOBODY IS LISTENING. DEMOCRACY.",
  "{n} PEOPLE. MAXIMUM NOISE. MINIMUM PURPOSE. CAMPUS CULTURE AT ITS PEAK.",
  "{n} HUMANS MOVING EVERYWHERE. THE AI CAN'T TRACK THIS MANY BAD DECISIONS AT ONCE.",
  "{n} NPCS ENGAGED IN MASS CONFUSION. THE ROOM'S IQ DROPPED 40 POINTS.",
];

// REAL viral Malayalam meme punchlines
const MALAYALAM_MEME_PUNCHLINES = [
  "പണി കിട്ടി! 💀",
  "ഇതാണ് മക്കളേ real ലൈഫ്!",
  "എന്റമ്മോ... ഇതെന്താ ഈ കാണുന്നത്! 😭",
  "ചുമ്മാ നിന്ന് തള്ളല്ലേ... പണി എടുക്കെടാ!",
  "ആ സാധനം കൊണ്ട് വാ! 🔥",
  "നിങ്ങളെ ഒക്കെ ഒരു AI ജഡ്ജ് ചെയ്യുന്നു... ഓടിക്കോ! 💀",
  "ലൈഫ് ഇല്ല, ഫ്യൂച്ചർ ഇല്ല, എന്നാലും ചിരിക്കുന്നു!",
  "ഇത് കാണുന്നവർ ചിരിക്കും, ഇതിൽ ഉള്ളവർ കരയും! 😂",
  "ജീവിതത്തിൽ ഇത്ര ചുമ്മാ ആയിട്ട് ആരും ഇല്ല!",
  "മ്യൂസിക് ഇല്ല, മൂഡ് ഇല്ല, ഒരു hope ഇല്ല! 💀",
  "ഒരു പണിയും ഇല്ലാത്തവന്റെ ലൈഫ് ആണ് ഭായ്!",
  "ഡേയ്... ഫോൺ വയ്ക്കടേ! ജീവിതം ഉണ്ട്!",
  "ക്ലാസ്സ് കട്ട് ചെയ്ത് ഇവിടെ ഇരിക്കുവാണോ?! 💀",
  "എടാ... നിന്നെ AI catch ചെയ്തു! ഓടിക്കോ! 😂",
  "ബ്രോ... ഇത് NPC ലൈഫ് അല്ല, ഇത് നിന്റെ ലൈഫ്! 💀",
  "ചേട്ടാ ഒരു ലൈഫ് തരുമോ? ഇവിടെ stock തീർന്നു!",
  "എന്നാ പിന്നെ ഞാൻ പോട്ടെ... ഇവിടെ നിന്നാൽ mental ആകും!",
  "സർ ഇത് college ആണ്, ചന്ത അല്ല! 😂",
  "പോയി രണ്ട് പേജ് പഠിക്കടേ... AI പറഞ്ഞതാ!",
  "ഇത്ര ചുമ്മാ ആയാൽ ഗവൺമെന്റ് job കിട്ടും!",
];

interface CommentaryProps {
  peopleCount: number;
  commentary: string | null;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCrowdCommentary(count: number): { roast: string; malayalam: string } {
  if (count === 0) {
    return {
      roast: pickRandom(ZERO_PERSON_ROASTS),
      malayalam: pickRandom(ZERO_PERSON_MALAYALAM),
    };
  }

  if (count === 1) {
    // Rotate between different solo roast types
    const bucket = Math.floor(Date.now() / 15000) % 3;
    const roast = bucket === 0
      ? pickRandom(SOLO_IDLE_ROASTS)
      : bucket === 1
      ? pickRandom(SOLO_PHONE_ROASTS)
      : pickRandom(SOLO_MOVING_ROASTS);
    return { roast, malayalam: pickRandom(MALAYALAM_MEME_PUNCHLINES) };
  }

  // Group roasts
  const bucket = Math.floor(Date.now() / 12000) % 3;
  const templates = bucket === 0
    ? GROUP_IDLE_ROASTS
    : bucket === 1
    ? GROUP_ACTIVE_ROASTS
    : GROUP_CHAOS_ROASTS;

  return {
    roast: pickRandom(templates).replace("{n}", String(count)),
    malayalam: pickRandom(MALAYALAM_MEME_PUNCHLINES),
  };
}

export default function Commentary({ peopleCount, commentary }: CommentaryProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [crowdData, setCrowdData] = useState<{ roast: string; malayalam: string }>({
    roast: "INITIALIZING BRAINROT ENGINE...",
    malayalam: "ലോഡിംഗ്...",
  });

  // Track previous people count for movement detection
  const prevCountRef = useRef(peopleCount);

  // Generate fresh crowd commentary when people count changes significantly
  useEffect(() => {
    const diff = Math.abs(peopleCount - prevCountRef.current);
    prevCountRef.current = peopleCount;

    // Generate new commentary when count changes or periodically
    const fresh = generateCrowdCommentary(peopleCount);
    setCrowdData(fresh);
  }, [peopleCount]);

  // Also cycle commentary every ~15 seconds even if count doesn't change
  useEffect(() => {
    const interval = setInterval(() => {
      setCrowdData(generateCrowdCommentary(peopleCount));
    }, 15000);
    return () => clearInterval(interval);
  }, [peopleCount]);

  // Pick the text to typewrite
  const fullText = commentary || crowdData.roast;

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    setTextIndex(0);
  }, [fullText]);

  useEffect(() => {
    if (textIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 12); // faster typing for big text
      return () => clearTimeout(timer);
    }
  }, [textIndex, fullText]);

  // Movement status indicator
  const getMovementStatus = () => {
    if (peopleCount === 0) return { label: "EMPTY ZONE", color: "text-npc-text-dim" };
    if (peopleCount === 1) return { label: "SOLO NPC", color: "text-npc-cyan" };
    if (peopleCount <= 3) return { label: "SMALL SQUAD", color: "text-npc-amber" };
    if (peopleCount <= 6) return { label: "CROWD FORMING", color: "text-npc-red" };
    return { label: "ABSOLUTE CHAOS", color: "text-npc-red animate-pulse" };
  };

  const movement = getMovementStatus();

  return (
    <div className="hud-panel p-4 sm:p-5 flex flex-col gap-3 rounded-xs border border-npc-border bg-npc-surface/90 col-span-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-tech tracking-[0.2em] uppercase text-npc-cyan flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-npc-cyan animate-pulse-glow" />
          CROWD ROAST ENGINE
        </span>
        <span className={`text-xs font-tech tracking-widest font-bold ${movement.color}`}>
          {movement.label}
        </span>
      </div>

      {/* People count — BIG */}
      <div className="flex items-center gap-3">
        <div
          className={`text-3xl sm:text-4xl font-orbitron font-black tabular-nums ${
            peopleCount === 0 ? "text-npc-text-dim" : peopleCount >= 4 ? "text-npc-red" : "text-npc-amber"
          } drop-shadow-[0_0_20px_currentColor]`}
        >
          {peopleCount}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-tech font-bold tracking-wider text-foreground uppercase">
            HUMAN{peopleCount !== 1 ? "S" : ""} DETECTED
          </span>
          <span className="text-[10px] font-tech text-npc-text-dim tracking-wider">
            {peopleCount === 0 ? "ZONE CLEAR" : "IN SURVEILLANCE RANGE"}
          </span>
        </div>
      </div>

      {/* Main commentary — HUGE TEXT */}
      <div className="pt-3 border-t border-npc-border/60">
        <p className="text-base sm:text-lg md:text-xl font-mono font-bold text-foreground leading-snug tracking-wide">
          {displayedText}
          {textIndex < fullText.length && (
            <span className="inline-block w-[10px] h-[22px] bg-npc-cyan ml-1 animate-pulse-glow" />
          )}
        </p>
      </div>

      {/* Malayalam meme punchline — always visible, BIG and RED */}
      {textIndex >= fullText.length && (
        <div className="pt-2 animate-fade-in">
          <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-npc-red text-center tracking-wide px-3 py-3 border-2 border-npc-red/50 bg-npc-red/10 rounded-sm shadow-[0_0_30px_rgba(255,0,85,0.3)]">
            {crowdData.malayalam}
          </p>
        </div>
      )}
    </div>
  );
}
