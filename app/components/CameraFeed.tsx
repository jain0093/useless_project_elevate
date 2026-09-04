"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { PersonDetection } from "@/app/types/frontend";

interface CameraFeedProps {
  active: boolean;
  detections: PersonDetection[];
  selectedIndex: number | null;
  onStatusChange?: (status: "ONLINE" | "OFFLINE" | "ERROR") => void;
}

export interface CameraFeedHandle {
  getVideo: () => HTMLVideoElement | null;
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  function CameraFeed({ active, detections, selectedIndex, onStatusChange }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "ERROR">("OFFLINE");

    // Expose the video element to parent
    useImperativeHandle(ref, () => ({
      getVideo: () => videoRef.current,
    }));

    const updateStatus = useCallback(
      (newStatus: "ONLINE" | "OFFLINE" | "ERROR") => {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      },
      [onStatusChange]
    );

    // Camera stream management
    useEffect(() => {
      if (!active) {
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

    // Draw bounding boxes on canvas overlay
    useEffect(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Match canvas size to video display size
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (status !== "ONLINE" || detections.length === 0) return;

      const w = canvas.width;
      const h = canvas.height;

      detections.forEach((det, i) => {
        const isSelected = selectedIndex === i;
        const bx = det.x * w;
        const by = det.y * h;
        const bw = det.width * w;
        const bh = det.height * h;

        // Box style
        ctx.strokeStyle = isSelected ? "#ffab00" : "rgba(0, 229, 255, 0.6)";
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.setLineDash(isSelected ? [] : [6, 4]);
        ctx.strokeRect(bx, by, bw, bh);

        // Corner accents for selected
        if (isSelected) {
          const cornerLen = Math.min(bw, bh) * 0.15;
          ctx.strokeStyle = "#ffab00";
          ctx.lineWidth = 3;
          ctx.setLineDash([]);

          // Top-left
          ctx.beginPath();
          ctx.moveTo(bx, by + cornerLen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cornerLen, by);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + cornerLen);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - cornerLen);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + cornerLen, by + bh);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - cornerLen);
          ctx.stroke();
        }

        // Label
        const label = isSelected
          ? "NPC TARGET"
          : `HUMAN #${i + 1}`;
        ctx.font = `bold ${isSelected ? 11 : 9}px monospace`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = isSelected
          ? "rgba(255, 171, 0, 0.85)"
          : "rgba(0, 229, 255, 0.7)";
        ctx.fillRect(bx, by - (isSelected ? 18 : 14), textWidth + 8, isSelected ? 18 : 14);
        ctx.fillStyle = "#000";
        ctx.fillText(label, bx + 4, by - 4);

        // Confidence for selected
        if (isSelected) {
          const confLabel = `${Math.round(det.confidence * 100)}%`;
          ctx.font = "9px monospace";
          ctx.fillStyle = "rgba(255, 171, 0, 0.7)";
          ctx.fillText(confLabel, bx + 4, by + bh + 12);
        }
      });

      ctx.setLineDash([]);
    }, [detections, selectedIndex, status]);

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

        {/* Detection overlay canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 camera-grid pointer-events-none" />

        {/* Scanline sweep */}
        {status === "ONLINE" && (
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-npc-cyan/30 to-transparent animate-scanline pointer-events-none" />
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
            {status === "ONLINE" ? "DETECTING" : `Camera ${status}`}
          </span>
        </div>

        {/* Live detection count */}
        {status === "ONLINE" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/60">
            <span className="text-[10px] tracking-[0.15em] text-npc-amber font-bold">
              {detections.length} HUMAN{detections.length !== 1 ? "S" : ""}
            </span>
          </div>
        )}

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
);

export default CameraFeed;
