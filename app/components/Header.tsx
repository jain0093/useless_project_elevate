"use client";

interface HeaderProps {
  audioMuted: boolean;
  onToggleMute: () => void;
}

export default function Header({ audioMuted, onToggleMute }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-npc-border">
      {/* Title block */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-npc-cyan drop-shadow-[0_0_12px_rgba(0,229,255,0.3)]">
          NPC WATCH
        </h1>
        <p className="text-[10px] sm:text-xs tracking-[0.15em] text-npc-text-dim uppercase">
          The camera sees. The AI judges.
        </p>
      </div>

      {/* Right side: status + mute */}
      <div className="flex items-center gap-4">
        {/* System Online indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="status-dot status-online animate-pulse-glow" />
          <span className="text-[10px] tracking-[0.15em] text-npc-green uppercase">
            System Online
          </span>
        </div>

        {/* Audio toggle */}
        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-npc-border hover:border-npc-cyan-dim transition-colors text-xs tracking-wider uppercase"
          aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
        >
          <span className={`text-sm ${audioMuted ? "opacity-40" : ""}`}>
            {audioMuted ? "🔇" : "🔊"}
          </span>
          <span className="hidden sm:inline text-npc-text-mid">
            {audioMuted ? "MUTED" : "AUDIO"}
          </span>
        </button>
      </div>
    </header>
  );
}
