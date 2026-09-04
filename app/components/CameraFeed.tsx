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

        // Draw rounded rectangle for detections (Section 13)
        ctx.strokeStyle = isSelected ? "#FF7EB6" : "#9EE6C3";
        ctx.fillStyle = isSelected ? "rgba(255, 126, 182, 0.12)" : "rgba(158, 230, 195, 0.08)";
        ctx.lineWidth = isSelected ? 2.5 : 1.5;

        // Use roundRect if supported by browser canvas
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(bx, by, bw, bh, 10);
        } else {
          ctx.rect(bx, by, bw, bh);
        }
        ctx.fill();
        ctx.stroke();

        // Rounded pastel label pill
        const label = isSelected ? "🎯 SELECTED" : `HUMAN #${i + 1}`;
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        const textWidth = ctx.measureText(label).width;
        const pillW = textWidth + 12;
        const pillH = 18;
        const pillX = bx + 4;
        const pillY = Math.max(4, by - pillH - 4);

        ctx.fillStyle = isSelected ? "#FF7EB6" : "#9EE6C3";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(pillX, pillY, pillW, pillH, 9);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();

        ctx.fillStyle = "#17151C";
        ctx.fillText(label, pillX + 6, pillY + 12);
      });

      ctx.setLineDash([]);
    }, [detections, selectedIndex, status]);

    return (
      <div className="relative overflow-hidden aspect-[4/3] w-full bg-[#FFF9F2] rounded-[20px] border border-[#E6DFE5] shadow-[0_8px_30px_rgba(23,21,28,0.08)]">
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

        {status !== "ONLINE" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[#FFF9F2]/80 backdrop-blur-xs">
            <div className="w-12 h-12 bg-white border-2 border-[#E6DFE5] rounded-2xl flex items-center justify-center shadow-xs">
              <span className="text-xl">📷</span>
            </div>
            <div className="text-[#8A8494] text-xs font-mono font-bold tracking-wider uppercase">
              {status === "ERROR" ? "CAMERA FEED ERROR" : "FEED OFFLINE — STANDBY"}
            </div>
            {status === "ERROR" && (
              <div className="text-[#FF6B7A] text-xs font-bold tracking-wider">
                PERMISSION DENIED OR CAMERA DISCONNECTED
              </div>
            )}
          </div>
        )}

        {/* Top left status badge */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-[#E6DFE5] rounded-full shadow-xs backdrop-blur-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                status === "ONLINE"
                  ? "bg-emerald-500 animate-pulse"
                  : status === "ERROR"
                  ? "bg-rose-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            />
            <span className="text-[11px] font-bold font-body text-[#17151C] uppercase tracking-wide">
              {status === "ONLINE" ? "LIVE CAMERA" : `CAMERA ${status}`}
            </span>
          </div>

          {status === "ONLINE" && (
            <div className="px-2.5 py-1 bg-[#DDF5FF] border border-[#8ED8FF] rounded-full text-sky-900 text-[11px] font-bold shadow-xs">
              ✦ {detections.length} {detections.length === 1 ? "HUMAN" : "HUMANS"}
            </div>
          )}
        </div>

        {/* Top right soft pink pill */}
        {status === "ONLINE" && (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1 bg-[#FFD1E3]/90 border border-[#FF7EB6] rounded-full shadow-xs backdrop-blur-sm z-20">
            <span className="w-2 h-2 rounded-full bg-[#FF7EB6] animate-pulse" />
            <span className="text-[11px] font-bold font-body text-pink-900 uppercase tracking-wide">
              SCANNING
            </span>
          </div>
        )}
      </div>
    );
  }
);

export default CameraFeed;
