// ============================================
// NPC WATCH — Frame Capture & Person Crop
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

  // Convert normalized coords to pixel coords with some padding
  const pad = 0.03; // 3% padding
  const sx = Math.max(0, Math.floor((bbox.x - pad) * vw));
  const sy = Math.max(0, Math.floor((bbox.y - pad) * vh));
  const sw = Math.min(vw - sx, Math.ceil((bbox.width + pad * 2) * vw));
  const sh = Math.min(vh - sy, Math.ceil((bbox.height + pad * 2) * vh));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2d context");
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas.toDataURL("image/jpeg", 0.85);
}
