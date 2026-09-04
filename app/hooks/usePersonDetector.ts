"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PersonDetection } from "@/app/types/frontend";

// We dynamically import COCO-SSD to avoid SSR issues
type CocoSSDModel = {
  detect: (
    video: HTMLVideoElement
  ) => Promise<
    Array<{
      class: string;
      score: number;
      bbox: [number, number, number, number]; // [x, y, width, height] in pixels
    }>
  >;
};

const CONFIDENCE_THRESHOLD = 0.50;

export function usePersonDetector() {
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const modelRef = useRef<CocoSSDModel | null>(null);
  const loadingRef = useRef(false);

  // Load the model on first call
  const loadModel = useCallback(async () => {
    if (modelRef.current || loadingRef.current) return;
    loadingRef.current = true;

    try {
      // Dynamic imports to avoid SSR bundling issues
      await import("@tensorflow/tfjs");
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      const model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      modelRef.current = model;
      setModelReady(true);
    } catch (err) {
      console.error("[NPC WATCH] Failed to load COCO-SSD model:", err);
      setModelError(true);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // Run detection on a video element
  const detect = useCallback(
    async (video: HTMLVideoElement): Promise<PersonDetection[]> => {
      if (!modelRef.current) return [];
      if (video.readyState < 2) return []; // Not enough data

      try {
        const predictions = await modelRef.current.detect(video);
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        if (vw === 0 || vh === 0) return [];

        return predictions
          .filter(
            (p) => p.class === "person" && p.score >= CONFIDENCE_THRESHOLD
          )
          .map((p, index) => ({
            id: index,
            confidence: Math.round(p.score * 100) / 100,
            // Normalize bbox to 0-1 range
            x: p.bbox[0] / vw,
            y: p.bbox[1] / vh,
            width: p.bbox[2] / vw,
            height: p.bbox[3] / vh,
          }));
      } catch (err) {
        console.error("[NPC WATCH] Detection error:", err);
        return [];
      }
    },
    []
  );

  // Cleanup
  useEffect(() => {
    return () => {
      modelRef.current = null;
    };
  }, []);

  return { loadModel, detect, modelReady, modelError };
}
