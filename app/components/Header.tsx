"use client";

interface HeaderProps {
  scanning: boolean;
  onStopScanning?: () => void;
}

export default function Header({ scanning, onStopScanning }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-npc-border bg-black/40 backdrop-blur-md z-40">
      {/* Glow highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-npc-cyan/40 to-transparent" />

      {/* Title block */}
      <div className="flex items-center gap-3">
        {/* Eye icon */}
        <div className="relative flex items-center justify-center w-9 h-9 border border-npc-cyan/40 bg-npc-cyan/5 rounded-sm">
          <span className="text-npc-cyan text-base font-orbitron font-bold animate-pulse-glow">
            👁
          </span>
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-npc-cyan" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-npc-cyan" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold font-orbitron tracking-[0.2em] text-npc-cyan drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            NPC WATCH
          </h1>
          <p className="text-[9px] sm:text-[10px] font-tech tracking-[0.18em] text-npc-text-dim uppercase">
            THE CAMERA SEES. THE AI JUDGES.
          </p>
        </div>
      </div>

      {/* Right status & action */}
      <div className="flex items-center gap-3">
        {/* System Online Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 border border-npc-border/50 bg-black/50 text-[10px] font-tech tracking-[0.2em] uppercase">
          <span
            className={`w-2 h-2 rounded-full ${
              scanning ? "bg-npc-cyan animate-pulse-glow" : "bg-npc-text-dim"
            }`}
          />
          <span className={scanning ? "text-npc-cyan font-bold" : "text-npc-text-dim"}>
            {scanning ? "SYSTEM ONLINE" : "STANDBY"}
          </span>
        </div>

        {/* STOP SCANNING button when active */}
        {scanning && onStopScanning && (
          <button
            onClick={onStopScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-npc-red text-npc-red bg-npc-red/10 hover:bg-npc-red hover:text-black transition-all duration-200 font-tech text-xs tracking-wider uppercase font-bold shadow-[0_0_15px_rgba(255,0,85,0.25)]"
          >
            <span className="w-2 h-2 rounded-full bg-npc-red group-hover:bg-black" />
            <span>STOP SCANNING</span>
          </button>
        )}
      </div>
    </header>
  );
}
