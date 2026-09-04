"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type {
  PersonDetection,
  AssociatedObject,
  DetectionEvidence,
} from "@/app/types/frontend";
import { computeDeterministicActivity } from "@/lib/deterministic-activity";

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
  "handbag",
  "keyboard",
  "mouse",
]);

interface TemporalFrame {
  timestamp: number;
  centers: Array<{ x: number; y: number; pw: number; ph: number }>;
}

/**
 * Validates whether an object is spatially associated with a person.
 * Strict spatial bounding box checks prevent attributing objects across the room.
 */
function checkSpatialAssociation(
  label: string,
  personBox: { px: number; py: number; pw: number; ph: number },
  objBox: { ox: number; oy: number; ow: number; oh: number }
): { associated: boolean; relationship?: string } {
  const { px, py, pw, ph } = personBox;
  const { ox, oy, ow, oh } = objBox;

  const ocx = ox + ow / 2;
  const ocy = oy + oh / 2;
  const pcx = px + pw / 2;

  switch (label) {
    case "cell phone": {
      // Must be near hands, torso, or lap region
      const horizontalMatch = ocx >= px - 0.10 * pw && ocx <= px + 1.10 * pw;
      const verticalMatch = ocy >= py + 0.15 * ph && ocy <= py + 0.90 * ph;
      if (horizontalMatch && verticalMatch) {
        return { associated: true, relationship: "held in hands or lap" };
      }
      return { associated: false };
    }

    case "laptop": {
      // Must be in lap or directly in front on desk
      const horizontalMatch = Math.abs(ocx - pcx) <= pw * 0.75;
      const verticalMatch = ocy >= py + 0.30 * ph && ocy <= py + 1.15 * ph;
      if (horizontalMatch && verticalMatch) {
        return { associated: true, relationship: "in lap or desk directly in front" };
      }
      return { associated: false };
    }

    case "chair": {
      // Must support the lower body / legs
      const horizontalMatch = Math.abs(ocx - pcx) <= pw * 0.85;
      const verticalMatch = ocy >= py + 0.40 * ph && ocy <= py + ph + 0.20 * ph;
      if (horizontalMatch && verticalMatch) {
        return { associated: true, relationship: "seated on chair" };
      }
      return { associated: false };
    }

    case "book": {
      const horizontalMatch = Math.abs(ocx - pcx) <= pw * 0.70;
      const verticalMatch = ocy >= py + 0.20 * ph && ocy <= py + 0.90 * ph;
      if (horizontalMatch && verticalMatch) {
        return { associated: true, relationship: "held or reading" };
      }
      return { associated: false };
    }

    case "bottle":
    case "cup": {
      const horizontalMatch = ocx >= px - 0.15 * pw && ocx <= px + 1.15 * pw;
      const verticalMatch = ocy >= py + 0.20 * ph && ocy <= py + 0.85 * ph;
      if (horizontalMatch && verticalMatch) {
        return { associated: true, relationship: "held or nearby beverage" };
      }
      return { associated: false };
    }

    case "backpack":
    case "handbag": {
      const horizontalMatch = Math.abs(ocx - pcx) <= pw * 0.95;
      const verticalMatch = ocy >= py + 0.10 * ph && ocy <= py + ph + 0.15 * ph;
      if (horizontalMatch && verticalMatch) {
        return { associated: true, relationship: "worn or placed beside" };
      }
      return { associated: false };
    }

    default:
      return { associated: false };
  }
}

export function usePersonDetector() {
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const modelRef = useRef<CocoSSDModel | null>(null);
  const loadingRef = useRef(false);

  // Multi-frame temporal buffer: stores detections from the last 8-10 ticks (~2.5s)
  const temporalTracksRef = useRef<TemporalFrame[]>([]);

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

        // 1. Filter out low-confidence person detections and invalid noise boxes
        const persons = predictions.filter((p) => {
          if (p.class !== "person" || p.score < CONFIDENCE_THRESHOLD) return false;
          const pw = p.bbox[2] / vw;
          const ph = p.bbox[3] / vh;
          return pw >= 0.05 && ph >= 0.08 && pw * ph >= 0.005;
        });

        // 2. Filter candidate objects
        const objects = predictions.filter(
          (p) => TARGET_OBJECT_CLASSES.has(p.class) && p.score >= 0.32
        );

        const now = Date.now();
        const currentCenters: Array<{ x: number; y: number; pw: number; ph: number }> = [];

        // Process each detected person
        const detections: PersonDetection[] = persons.map((p, index) => {
          const px = p.bbox[0] / vw;
          const py = p.bbox[1] / vh;
          const pw = p.bbox[2] / vw;
          const ph = p.bbox[3] / vh;

          const cx = px + pw / 2;
          const cy = py + ph / 2;
          currentCenters.push({ x: cx, y: cy, pw, ph });

          // Calculate local group size based on immediate physical proximity (< 0.35 norm dist)
          const nearbyPeopleCount = persons.filter((other, otherIdx) => {
            if (otherIdx === index) return false;
            const ox = (other.bbox[0] + other.bbox[2] / 2) / vw;
            const oy = (other.bbox[1] + other.bbox[3] / 2) / vh;
            return Math.hypot(cx - ox, cy - oy) < 0.35;
          }).length;
          const localGroupSize = 1 + nearbyPeopleCount;

          // Perform strict spatial association for each detected object
          const associatedObjects: AssociatedObject[] = [];
          for (const obj of objects) {
            const ox = obj.bbox[0] / vw;
            const oy = obj.bbox[1] / vh;
            const ow = obj.bbox[2] / vw;
            const oh = obj.bbox[3] / vh;

            const check = checkSpatialAssociation(
              obj.class,
              { px, py, pw, ph },
              { ox, oy, ow, oh }
            );

            if (check.associated) {
              associatedObjects.push({
                label: obj.class,
                confidence: Math.round(obj.score * 100) / 100,
                associated: true,
                relationship: check.relationship,
              });
            }
          }

          // Inferred Posture: based on aspect ratio (ph / pw) and chair spatial association
          const aspect = ph / (pw || 0.01);
          const hasChair = associatedObjects.some((o) => o.label === "chair");

          let posture: "standing" | "sitting" | "stationary" | "unknown" = "stationary";
          let postureConfidence = 0.70;

          if (hasChair) {
            posture = "sitting";
            postureConfidence = 0.92;
          } else if (aspect < 1.22) {
            posture = "sitting";
            postureConfidence = 0.84;
          } else if (aspect >= 1.50) {
            posture = "standing";
            postureConfidence = 0.88;
          } else {
            posture = "stationary";
            postureConfidence = 0.75;
          }

          // Inferred Movement: evaluate temporal buffer over the last 8-10 frames (~2.5s)
          let movement: "stationary" | "moving" | "walking" = "stationary";
          let movementConfidence = 0.90;

          if (temporalTracksRef.current.length >= 2) {
            // Find person center in older frames by nearest neighbor tracking
            const oldestFrame = temporalTracksRef.current[0];
            let closestDist = Infinity;
            let closestOldCenter: { x: number; y: number } | null = null;

            for (const old of oldestFrame.centers) {
              const d = Math.hypot(cx - old.x, cy - old.y);
              if (d < closestDist) {
                closestDist = d;
                closestOldCenter = old;
              }
            }

            if (closestOldCenter && closestDist < 0.25) {
              const timeDeltaSec = (now - oldestFrame.timestamp) / 1000;
              const netDisplacement = closestDist;
              const speed = netDisplacement / (timeDeltaSec || 1);

              if (netDisplacement > 0.055 && speed > 0.025) {
                movement = posture === "standing" ? "walking" : "moving";
                movementConfidence = 0.91;
              } else {
                movement = "stationary";
                movementConfidence = 0.93;
              }
            }
          }

          // Active Associated Devices
          const hasPhone = associatedObjects.some((o) => o.label === "cell phone");
          const hasLaptop = associatedObjects.some((o) => o.label === "laptop");
          const hasBook = associatedObjects.some((o) => o.label === "book");
          const hasDrink = associatedObjects.some(
            (o) => o.label === "bottle" || o.label === "cup"
          );

          // Build candidates array
          const activityCandidates: string[] = [posture];
          if (movement === "walking") activityCandidates.push("walking");
          if (hasPhone) activityCandidates.push("using phone");
          if (hasLaptop) activityCandidates.push("using laptop");
          if (hasBook) activityCandidates.push("reading book");
          if (hasDrink) activityCandidates.push("holding drink");

          // RULE 3: Deterministic Activity Mapping
          const det = computeDeterministicActivity({
            posture,
            postureConfidence,
            movement,
            movementConfidence,
            phoneAssociated: hasPhone,
            laptopAssociated: hasLaptop,
            isOccludedOrLowConfidence: ph < 0.15 || pw < 0.07 || p.score < 0.50,
          });

          const groundedActivity = det.activity;
          const confidenceGate = det.confidence;

          // Construct authoritative evidence object
          const evidence: DetectionEvidence = {
            personConfidence: Math.round(p.score * 100) / 100,
            posture,
            postureConfidence,
            movement,
            movementConfidence,
            associatedObjects,
            groupSize: localGroupSize,
            activityCandidates,
            groundedActivity,
            confidenceGate,
          };

          const nearbyLabels = Array.from(new Set(associatedObjects.map((o) => o.label)));

          return {
            id: index,
            confidence: Math.round(p.score * 100) / 100,
            x: px,
            y: py,
            width: pw,
            height: ph,
            nearbyObjects: nearbyLabels,
            associatedObjects,
            posture,
            postureConfidence,
            movement,
            movementConfidence,
            groundedActivity,
            localGroupSize,
            confidenceGate,
            evidence,
          };
        });

        // Update temporal rolling buffer (keep last 10 entries)
        temporalTracksRef.current = [
          ...temporalTracksRef.current.slice(-9),
          { timestamp: now, centers: currentCenters },
        ];

        return detections;
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
      temporalTracksRef.current = [];
    };
  }, []);

  return { loadModel, detect, modelReady, modelError };
}
