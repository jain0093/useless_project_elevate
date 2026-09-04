"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PersonDetection } from "@/app/types/frontend";

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

const CONFIDENCE_THRESHOLD = 0.45;

const TARGET_OBJECT_CLASSES = new Set([
  "cell phone",
  "laptop",
  "book",
  "backpack",
  "bottle",
  "cup",
  "chair",
]);

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
      if (video.readyState < 2) return [];

      try {
        const predictions = await modelRef.current.detect(video);
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        if (vw === 0 || vh === 0) return [];

        const persons = predictions.filter(
          (p) => p.class === "person" && p.score >= CONFIDENCE_THRESHOLD
        );

        const objects = predictions.filter(
          (p) => TARGET_OBJECT_CLASSES.has(p.class) && p.score >= 0.35
        );

        return persons.map((p, index) => {
          const px = p.bbox[0] / vw;
          const py = p.bbox[1] / vh;
          const pw = p.bbox[2] / vw;
          const ph = p.bbox[3] / vh;

          // Find objects close to this person bounding box
          const nearby = objects
            .filter((o) => {
              const ox = o.bbox[0] / vw;
              const oy = o.bbox[1] / vh;
              // Simple box distance / overlap check
              return Math.abs(ox - px) < pw + 0.3 && Math.abs(oy - py) < ph + 0.3;
            })
            .map((o) => o.class);

          return {
            id: index,
            confidence: Math.round(p.score * 100) / 100,
            x: px,
            y: py,
            width: pw,
            height: ph,
            nearbyObjects: Array.from(new Set(nearby)),
          };
        });
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
