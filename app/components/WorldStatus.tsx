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
  badge?: string;
  bgColor?: string;
}

function StatCell({ label, value, badge, bgColor = "bg-white" }: StatCellProps) {
  return (
    <div className={`flex flex-col gap-1 p-3 rounded-[14px] border border-[#E6DFE5] ${bgColor} shadow-2xs`}>
      <span className="text-[10px] font-mono font-bold tracking-wider text-[#6F6A76] uppercase">
        {label}
      </span>
      <div className="flex items-baseline justify-between gap-1 overflow-hidden">
        <span className="font-display font-black text-base sm:text-lg text-[#17151C] truncate">
          {value}
        </span>
        {badge && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/70 border border-black/5 text-[#6F6A76]">
            {badge}
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
    <div className="card-pastel p-5 flex flex-col gap-3.5 bg-white border border-[#E6DFE5] shadow-[0_4px_20px_rgba(23,21,28,0.06)]">
      <div className="flex items-center justify-between border-b border-[#E6DFE5] pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">📊</span>
          <span className="font-display font-bold text-xs uppercase tracking-wider text-[#17151C]">
            WORLD STATUS
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#6F6A76]">
          REAL SENSOR TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <StatCell
          label="HUMANS"
          value={humansDetected}
          badge="LOCAL CV"
          bgColor="bg-[#DDF5FF]/40"
        />
        <StatCell
          label="NPCS ENCOUNTERED"
          value={npcsEncountered}
          badge="SESSION"
          bgColor="bg-[#E9E4FF]/40"
        />
        <StatCell
          label="CURRENT ACTIVITY"
          value={currentActivity.toUpperCase()}
          bgColor="bg-[#FFF5C7]/40"
        />
        <StatCell
          label="SCANNING"
          value={scanningActive ? "ACTIVE" : "STANDBY"}
          bgColor={scanningActive ? "bg-[#DDF8EA]/60" : "bg-gray-100"}
        />
        <StatCell
          label="PURPOSE"
          value="NONE"
          badge="CANONICAL"
          bgColor="bg-[#FFF3F8]/50"
        />
      </div>
    </div>
  );
}
