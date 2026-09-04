"use client";

import { useRef, useCallback } from "react";

/**
 * Controlled speech synthesis hook.
 * Ensures each encounter is spoken exactly once.
 * Respects muted state. Never triggers from re-renders.
 */
export function useSpeech() {
  const lastSpokenIdRef = useRef<number>(-1);

  const speak = useCallback(
    (encounterId: number, text: string, muted: boolean) => {
      // Never speak when muted
      if (muted) return;

      // Never speak the same encounter twice
      if (encounterId === lastSpokenIdRef.current) return;

      // Guard against SSR
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.8;

      // Mark as spoken BEFORE speaking to prevent any re-trigger
      lastSpokenIdRef.current = encounterId;

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancelSpeech };
}
