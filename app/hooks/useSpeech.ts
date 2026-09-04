"use client";

import { useRef, useCallback } from "react";

/**
 * Controlled speech synthesis hook for UNHINGED YELLING & MALAYALAM BRAINROT.
 * Ensures each encounter is spoken exactly once at maximum energy.
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
      utterance.rate = 1.12; // Fast energetic yelling speed
      utterance.pitch = 1.35; // High dramatic shouting pitch
      utterance.volume = 1.0; // Maximum volume

      // Search for Malayalam voice (ml-IN) or Indian voice (hi-IN / en-IN)
      const voices = window.speechSynthesis.getVoices();
      const malluVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().includes("ml") ||
            v.name.toLowerCase().includes("malayalam")
        ) ||
        voices.find(
          (v) =>
            v.lang.toLowerCase().includes("hi") ||
            v.lang.toLowerCase().includes("en-in")
        );

      if (malluVoice) {
        utterance.voice = malluVoice;
      }

      // Mark as spoken BEFORE speaking
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
