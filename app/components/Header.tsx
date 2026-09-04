"use client";

interface HeaderProps {
  scanning: boolean;
  onStopScanning?: () => void;
}

export default function Header({ scanning, onStopScanning }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 py-3.5 sm:px-8 border-b border-[#E6DFE5] bg-white/80 backdrop-blur-md z-40">
      {/* Title block */}
      <div className="flex items-center gap-3">
        {/* Playful Y2K Eye Sticker */}
        <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#FFF3F8] border border-[#FFD1E3] shadow-xs">
          <span className="text-lg select-none">👁️</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[#17151C]">
              NPC WATCH
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#FFF5C7] text-amber-900 border border-[#FFE68A]">
              v2.6 ✦
            </span>
          </div>
          <p className="text-[11px] font-body font-semibold tracking-wide text-[#6F6A76]">
            THE CAMERA SEES. THE AI JUDGES.
          </p>
        </div>
      </div>

      {/* Right status & action */}
      <div className="flex items-center gap-3">
        {/* System Online Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DDF8EA] bg-[#DDF8EA]/60 text-xs font-bold text-emerald-900 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="tracking-wide">SYSTEM ONLINE</span>
        </div>

        {/* STOP SCANNING button when active */}
        {scanning && onStopScanning && (
          <button
            onClick={onStopScanning}
            className="btn-y2k btn-danger px-4 py-1.5 text-xs tracking-wide uppercase font-bold shadow-xs cursor-pointer"
          >
            STOP SCANNING
          </button>
        )}
      </div>
    </header>
  );
}
