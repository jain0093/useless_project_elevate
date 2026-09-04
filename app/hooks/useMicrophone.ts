"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { NoiseLevel, MicStatus } from "@/app/types/frontend";

// RMS thresholds for noise classification
const THRESHOLD_QUIET = 0.015;
const THRESHOLD_NORMAL = 0.05;
const THRESHOLD_LOUD = 0.15;

function classifyNoise(rms: number): NoiseLevel {
  if (rms < THRESHOLD_QUIET) return "QUIET";
  if (rms < THRESHOLD_NORMAL) return "NORMAL";
  if (rms < THRESHOLD_LOUD) return "LOUD";
  return "CHAOS";
}

export function useMicrophone() {
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>("QUIET");
  const [micStatus, setMicStatus] = useState<MicStatus>("OFF");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const measure = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current as any);

    // Calculate RMS
    let sumSquares = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const normalized = (dataArrayRef.current[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / dataArrayRef.current.length);

    setNoiseLevel(classifyNoise(rms));
    rafRef.current = requestAnimationFrame(measure);
  }, []);

  const startMicrophone = useCallback(async () => {
    if (streamRef.current) return; // Already running

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);
      // Do NOT connect to destination — we don't play back the audio

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      streamRef.current = stream;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setMicStatus("LISTENING");
      rafRef.current = requestAnimationFrame(measure);
    } catch (err) {
      console.error("[NPC WATCH] Microphone permission denied:", err);
      setMicStatus("DENIED");
    }
  }, [measure]);

  const stopMicrophone = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setMicStatus("OFF");
    setNoiseLevel("QUIET");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { noiseLevel, micStatus, startMicrophone, stopMicrophone };
}
