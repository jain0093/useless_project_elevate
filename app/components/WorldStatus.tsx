"use client";

interface WorldStatusProps {
  humansDetected: number;
  npcsEncountered: number;
  currentActivity: string;
  scanningActive: boolean;
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
      <div className="flex items-baseline gap-1.5 overflow-hidden">
        <span
          className={`text-base sm:text-lg font-orbitron font-extrabold truncate ${
            highlight ? "text-npc-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {subtext && (
          <span className="text-[8px] sm:text-[9px] font-tech text-npc-text-dim uppercase shrink-0">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

export default function WorldStatus({
  humansDetected,
  npcsEncountered,
  currentActivity,
  scanningActive,
}: WorldStatusProps) {
  return (
    <div className="hud-panel p-4 flex flex-col gap-3 rounded-xs border border-npc-border bg-npc-surface/90">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-tech tracking-[0.2em] uppercase text-npc-cyan flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-npc-cyan animate-pulse-glow" />
          REAL TELEMETRY // WORLD STATUS
        </span>
        <span className="text-[9px] font-tech tracking-widest text-npc-text-dim uppercase">
          CAMERA SENSOR DATA
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCell
          label="HUMANS"
          value={humansDetected}
          subtext="IN FRAME"
          highlight
        />
        <StatCell
          label="NPCS ENCOUNTERED"
          value={npcsEncountered}
          subtext="LOGGED"
          highlight
        />
        <StatCell
          label="CURRENT ACTIVITY"
          value={currentActivity || "SCANNING..."}
          subtext="OBSERVED"
        />
        <StatCell
          label="SCANNING"
          value={scanningActive ? "ACTIVE" : "STANDBY"}
          subtext={scanningActive ? "LIVE" : "OFF"}
          highlight={scanningActive}
        />
      </div>
    </div>
  );
}
