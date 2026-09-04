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
  stopCamera: () => void;
}

const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  function CameraFeed({ active, detections, selectedIndex, onStatusChange }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "ERROR">("OFFLINE");

    const stopCamera = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      setStatus("OFFLINE");
      onStatusChange?.("OFFLINE");
    }, [onStatusChange]);

    // Expose video element and explicit stop
    useImperativeHandle(ref, () => ({
      getVideo: () => videoRef.current,
      stopCamera,
    }), [stopCamera]);

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
        stopCamera();
        return;
      }

      let cancelled = false;

      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: 1280, height: 720 },
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

        // Draw shadow glow for box
        ctx.shadowColor = isSelected ? "#ffb700" : "#00f0ff";
        ctx.shadowBlur = isSelected ? 16 : 8;

        // Box style
        ctx.strokeStyle = isSelected ? "#ffb700" : "rgba(0, 240, 255, 0.7)";
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.setLineDash(isSelected ? [] : [8, 4]);
        ctx.strokeRect(bx, by, bw, bh);

        // Reset shadow
        ctx.shadowBlur = 0;

        // Corner accents for selected target
        const cornerLen = Math.min(bw, bh) * 0.2;
        ctx.strokeStyle = isSelected ? "#ffb700" : "#00f0ff";
        ctx.lineWidth = isSelected ? 3 : 2;
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

        // Target label header
        const label = isSelected ? "🎯 TARGET LOCK" : `HUMAN #${i + 1}`;
        ctx.font = `bold ${isSelected ? 11 : 9}px "Share Tech Mono", monospace`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = isSelected ? "rgba(255, 183, 0, 0.95)" : "rgba(0, 240, 255, 0.85)";
        ctx.fillRect(bx, by - (isSelected ? 20 : 16), textWidth + 10, isSelected ? 20 : 16);
        ctx.fillStyle = "#000";
        ctx.fillText(label, bx + 5, by - (isSelected ? 5 : 4));

        // Confidence badge
        const confLabel = `CONF: ${Math.round(det.confidence * 100)}%`;
        ctx.font = '9px "Share Tech Mono", monospace';
        ctx.fillStyle = isSelected ? "rgba(255, 183, 0, 0.85)" : "rgba(0, 240, 255, 0.7)";
        ctx.fillText(confLabel, bx + 4, by + bh + 14);
      });

      ctx.setLineDash([]);
    }, [detections, selectedIndex, status]);

    return (
      <div className="hud-panel hud-corners relative overflow-hidden aspect-[4/3] w-full bg-black rounded-xs border border-npc-border">
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
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 camera-grid pointer-events-none z-10" />

        {/* Center reticle */}
        {status === "ONLINE" && (
          <div className="reticle-center z-10 opacity-40 pointer-events-none" />
        )}

        {/* Laser scanline sweep */}
        {status === "ONLINE" && (
          <div className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-npc-cyan to-transparent animate-scanline pointer-events-none z-20 shadow-[0_0_15px_#00f0ff]" />
        )}

        {/* Offline / Error state */}
        {status !== "ONLINE" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-12 h-12 border border-npc-cyan/30 rounded-full flex items-center justify-center animate-pulse-glow">
              <span className="text-npc-cyan text-xl">📷</span>
            </div>
            <div className="text-npc-text-dim text-xs font-tech tracking-[0.2em] uppercase">
              {status === "ERROR" ? "CAMERA FEED ERROR" : "FEED OFFLINE — STANDBY"}
            </div>
            {status === "ERROR" && (
              <div className="text-npc-red text-[10px] font-mono tracking-wider opacity-80">
                PERMISSION DENIED OR CAMERA DISCONNECTED
              </div>
            )}
          </div>
        )}

        {/* Top left status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 border border-npc-border backdrop-blur-md">
            <span
              className={`status-dot ${
                status === "ONLINE"
                  ? "status-online"
                  : status === "ERROR"
                  ? "status-error"
                  : "status-offline"
              }`}
            />
            <span className="text-[10px] font-tech tracking-[0.15em] uppercase text-npc-text-mid">
              {status === "ONLINE" ? "LIVE SURVEILLANCE" : `SIGNAL ${status}`}
            </span>
          </div>
          {status === "ONLINE" && (
            <div className="px-2 py-1 bg-npc-amber/10 border border-npc-amber/40 text-npc-amber text-[10px] font-tech font-bold tracking-wider">
              {detections.length} DETECTED
            </div>
          )}
        </div>

        {/* Top right REC indicator */}
        {status === "ONLINE" && (
          <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 bg-black/80 border border-npc-red/40 z-20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-npc-red animate-pulse-glow" />
            <span className="text-[10px] font-tech tracking-[0.18em] text-npc-red font-bold uppercase">
              REC // LIVE
            </span>
          </div>
        )}

        {/* Bottom bar tech telemetry */}
        {status === "ONLINE" && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 text-[9px] font-tech tracking-widest text-npc-text-dim/80 bg-black/60 px-3 py-1 border border-npc-border/40">
            <span>RES: 1280x720</span>
            <span>FPS: 30.0</span>
            <span>MODE: COCO-SSD</span>
          </div>
        )}
      </div>
    );
  }
);

export default CameraFeed;
