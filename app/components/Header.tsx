"use client";

interface HeaderProps {
  audioMuted: boolean;
  onToggleMute: () => void;
}

export default function Header({ audioMuted, onToggleMute }: HeaderProps) {
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
            Camera sees. AI roasts. Malayalam destroys. 💀
          </p>
        </div>
      </div>

      {/* Audio toggle */}
      <button
        onClick={onToggleMute}
        className={`flex items-center gap-2 px-3 py-1.5 border transition-all duration-300 font-tech text-xs tracking-wider uppercase ${
          audioMuted
            ? "border-npc-border text-npc-text-dim hover:border-npc-amber-dim hover:text-npc-amber"
            : "border-npc-cyan/60 text-npc-cyan bg-npc-cyan/10 shadow-[0_0_12px_rgba(0,240,255,0.2)] hover:border-npc-cyan"
        }`}
        aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
      >
        {!audioMuted ? (
          <div className="flex items-end gap-0.5 h-3.5 w-3">
            <span className="audio-bar" style={{ animationDelay: "0ms" }} />
            <span className="audio-bar" style={{ animationDelay: "150ms" }} />
            <span className="audio-bar" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <span className="text-sm opacity-60">🔇</span>
        )}
        <span className="text-[11px] font-bold">
          {audioMuted ? "MUTED" : "YELLING 📢"}
        </span>
      </button>
    </header>
  );
}
