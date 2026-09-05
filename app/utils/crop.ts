// ============================================
// AVASTHA — Frame Capture & Person Crop
// Pure utility functions, no state.
// ============================================

/**
 * Captures the current video frame as a base64 JPEG data URL.
 */
export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2d context");
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.85);
}

/**
 * Crops a specific bounding box region from the video frame.
 * Bounding box coordinates are in normalized (0-1) format.
 * Returns a base64 JPEG data URL of the cropped region.
 */
export function cropPerson(
  video: HTMLVideoElement,
  bbox: { x: number; y: number; width: number; height: number }
): string {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (vw === 0 || vh === 0) return "";

  // Proportional padding: 12% of width, 10% of height
  const padX = bbox.width * 0.12;
  const padY = bbox.height * 0.10;

  const sx = Math.max(0, Math.floor((bbox.x - padX) * vw));
  const sy = Math.max(0, Math.floor((bbox.y - padY) * vh));
  const sw = Math.min(vw - sx, Math.ceil((bbox.width + padX * 2) * vw));
  const sh = Math.min(vh - sy, Math.ceil((bbox.height + padY * 2) * vh));

  if (sw <= 0 || sh <= 0) return "";

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2d context");
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas.toDataURL("image/jpeg", 0.88);
}

/**
 * Crops the Context Evidence Region (Section 6).
 * Includes the person plus surrounding evidence (hands, lap, desk, phone, laptop, chair).
 * Uses generous padding (22% width, 18% height) clamped to frame boundaries.
 */
export function cropContextRegion(
  video: HTMLVideoElement,
  bbox: { x: number; y: number; width: number; height: number }
): string {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (vw === 0 || vh === 0) return "";

  // Context padding: 22% width, 18% height to ensure phone/laptop/chair/desk are included
  const padX = bbox.width * 0.22;
  const padY = bbox.height * 0.18;

  const sx = Math.max(0, Math.floor((bbox.x - padX) * vw));
  const sy = Math.max(0, Math.floor((bbox.y - padY) * vh));
  const sw = Math.min(vw - sx, Math.ceil((bbox.width + padX * 2) * vw));
  const sh = Math.min(vh - sy, Math.ceil((bbox.height + padY * 2) * vh));

  if (sw <= 0 || sh <= 0) return "";

  const canvas = document.createElement("canvas");
  // Limit to max 640px while maintaining aspect ratio for fast, crisp Gemini processing
  const maxDim = 640;
  let targetW = sw;
  let targetH = sh;
  if (targetW > maxDim || targetH > maxDim) {
    if (targetW > targetH) {
      targetH = Math.round((sh * maxDim) / sw);
      targetW = maxDim;
    } else {
      targetW = Math.round((sw * maxDim) / sh);
      targetH = maxDim;
    }
  }

  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2d context");
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
  return canvas.toDataURL("image/jpeg", 0.90);
}
