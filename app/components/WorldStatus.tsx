"use client";

interface WorldStatusProps {
  stats: {
    humansDetected: number;
    npcsEncountered: number;
  };
}

interface StatCellProps {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}

function StatCell({ label, value, subtext, highlight }: StatCellProps) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-black/40 border border-npc-border/60 hover:border-npc-cyan/40 transition-colors">
      <span className="text-[9px] font-tech tracking-[0.18em] text-npc-text-dim uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-lg sm:text-xl font-orbitron font-extrabold ${
            highlight ? "text-npc-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {subtext && (
          <span className="text-[9px] font-tech text-npc-text-dim uppercase">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

export default function WorldStatus({ stats }: WorldStatusProps) {
  return (
    <div className="hud-panel p-4 flex flex-col gap-3 rounded-xs border border-npc-border bg-npc-surface/90">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-tech tracking-[0.2em] uppercase text-npc-cyan flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
          ENVIRONMENTAL MATRIX // STATUS
        </span>
        <span className="text-[9px] font-tech tracking-widest text-npc-cyan/70">
          NODE: UNHINGED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCell
          label="Humans Detected"
          value={stats.humansDetected}
          subtext="IN FRAME"
          highlight
        />
        <StatCell
          label="NPCs Encountered"
          value={stats.npcsEncountered}
          subtext="TOTAL LOGGED"
          highlight
        />
        <StatCell
          label="Brainrot Mode"
          value="MAXIMUM"
          subtext="CURSED"
        />
        <StatCell
          label="AI Disposition"
          value="YELLING"
          subtext="ACTIVE"
        />
      </div>
    </div>
  );
}
