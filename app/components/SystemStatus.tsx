"use client";

import type { FrontendSystemStatus } from "@/app/types/frontend";

interface SystemStatusProps {
  status: FrontendSystemStatus;
}

interface StatusRowProps {
  label: string;
  value: string;
  dotClass: string;
}

function StatusRow({ label, value, dotClass }: StatusRowProps) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 border border-npc-border/30 bg-black/30">
      <span className={`status-dot ${dotClass}`} />
      <span className="text-[10px] font-tech tracking-[0.18em] text-npc-text-dim flex-1 uppercase">
        {label}
      </span>
      <span className="text-[10px] font-tech font-bold tracking-wider text-npc-cyan uppercase">
        {value}
      </span>
    </div>
  );
}

function getStatusDotClass(status: string): string {
  switch (status) {
    case "ONLINE":
    case "READY":
    case "ACTIVE":
      return "status-online";
    case "OFFLINE":
    case "OFF":
      return "status-offline";
    case "ERROR":
      return "status-error";
    case "COOKED":
    case "UNHINGED":
      return "status-cooked";
    case "CONNECTING":
    case "LOADING":
    case "CALLING":
      return "status-connecting";
    default:
      return "status-online";
  }
}

export default function SystemStatus({ status }: SystemStatusProps) {
  return (
    <div className="hud-panel p-4 flex flex-col gap-2 rounded-xs border border-npc-border bg-npc-surface/90">
      <div className="text-[10px] font-tech tracking-[0.2em] uppercase text-npc-text-dim mb-1">
        SUBSYSTEM MONITORING
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <StatusRow
          label="Camera Sensor"
          value={status.camera}
          dotClass={getStatusDotClass(status.camera)}
        />
        <StatusRow
          label="COCO-SSD Detector"
          value={status.personDetector}
          dotClass={getStatusDotClass(status.personDetector)}
        />
        <StatusRow
          label="Gemini Vision AI"
          value={status.ai}
          dotClass={getStatusDotClass(status.ai)}
        />
        <StatusRow
          label="Human Roast Engine"
          value="BRUTAL"
          dotClass="status-cooked"
        />
      </div>
    </div>
  );
}
