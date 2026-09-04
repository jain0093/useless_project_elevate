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
    <div className="flex items-center gap-2 py-1">
      <span className={`status-dot ${dotClass}`} />
      <span className="text-[10px] tracking-[0.15em] text-npc-text-dim flex-1 uppercase">
        {label}
      </span>
      <span className="text-[10px] tracking-wider text-npc-text-mid uppercase">
        {value}
      </span>
    </div>
  );
}

function getStatusDotClass(status: string): string {
  switch (status) {
    case "ONLINE":
    case "READY":
    case "LISTENING":
      return "status-online";
    case "OFFLINE":
    case "OFF":
      return "status-offline";
    case "ERROR":
    case "DENIED":
      return "status-error";
    case "COOKED":
      return "status-cooked";
    case "ACTIVE":
      return "status-online";
    case "SUSPENDED":
      return "status-standby";
    case "CONNECTING":
    case "LOADING":
    case "CALLING":
      return "status-connecting";
    case "STANDBY":
      return "status-standby";
    default:
      return "status-offline";
  }
}

export default function SystemStatus({ status }: SystemStatusProps) {
  return (
    <div className="hud-panel p-4 flex flex-col gap-2">
      <div className="text-[10px] tracking-[0.2em] uppercase text-npc-text-dim mb-1">
        System Status
      </div>

      <StatusRow
        label="Camera"
        value={status.camera}
        dotClass={getStatusDotClass(status.camera)}
      />
      <StatusRow
        label="Microphone"
        value={status.microphone}
        dotClass={getStatusDotClass(status.microphone)}
      />
      <StatusRow
        label="Person Detector"
        value={status.personDetector}
        dotClass={getStatusDotClass(status.personDetector)}
      />
      <StatusRow
        label="Vision AI"
        value={status.ai}
        dotClass={getStatusDotClass(status.ai)}
      />
      <StatusRow
        label="Judgement"
        value={status.judgement}
        dotClass={getStatusDotClass(status.judgement)}
      />
    </div>
  );
}
