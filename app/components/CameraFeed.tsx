"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface CameraFeedProps {
  active: boolean;
  onStatusChange?: (status: "ONLINE" | "OFFLINE" | "ERROR") => void;
}

export default function CameraFeed({
  active,
  onStatusChange,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "ERROR">(
    "OFFLINE"
  );

  const updateStatus = useCallback(
    (newStatus: "ONLINE" | "OFFLINE" | "ERROR") => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  useEffect(() => {
    if (!active) {
      // Stop stream if deactivated
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      updateStatus("OFFLINE");
      return;
    }

    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 640, height: 480 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        updateStatus("ONLINE");
      } catch {
        if (!cancelled) {
          updateStatus("ERROR");
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [active, updateStatus]);

  return (
    <div className="hud-panel hud-corners relative overflow-hidden aspect-[4/3] w-full bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${
          status === "ONLINE" ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500`}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 camera-grid pointer-events-none" />

      {/* Scanline sweep */}
      {status === "ONLINE" && (
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-npc-cyan/30 to-transparent animate-scanline pointer-events-none" />
      )}

      {/* Corner HUD decorations */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-npc-cyan/40 pointer-events-none" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-npc-cyan/40 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-npc-cyan/40 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-npc-cyan/40 pointer-events-none" />

      {/* Center crosshair */}
      {status === "ONLINE" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-16 h-16 border border-npc-cyan/20 rounded-full" />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-npc-cyan/15" />
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-npc-cyan/15" />
        </div>
      )}

      {/* Offline / Error state */}
      {status !== "ONLINE" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="text-npc-text-dim text-xs tracking-[0.2em] uppercase">
            {status === "ERROR" ? "CAMERA ERROR" : "NO CAMERA SIGNAL"}
          </div>
          {status === "ERROR" && (
            <div className="text-npc-text-dim text-[10px] tracking-wider opacity-60">
              PERMISSION DENIED OR DEVICE UNAVAILABLE
            </div>
          )}
          {/* Static noise effect */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
        </div>
      )}

      {/* Status badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <span
          className={`status-dot ${
            status === "ONLINE"
              ? "status-online"
              : status === "ERROR"
              ? "status-error"
              : "status-offline"
          }`}
        />
        <span className="text-[10px] tracking-[0.15em] uppercase text-npc-text-mid">
          Camera {status}
        </span>
      </div>

      {/* REC indicator */}
      {status === "ONLINE" && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
          <span className="text-[10px] tracking-[0.15em] text-npc-red">
            REC
          </span>
        </div>
      )}
    </div>
  );
}
