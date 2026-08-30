"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SPEAK_FAIL = "టెక్స్ట్ వినిపించలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [speakError, setSpeakError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setIsPreparing(false);
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value) {
        return;
      }

      stopSpeaking();
      setSpeakError("");
      setIsPreparing(true);

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: value }),
        });

        if (!response.ok) {
          throw new Error("tts-failed");
        }

        const audioBlob = await response.blob();
        const objectUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = objectUrl;

        const audio = new Audio(objectUrl);
        audioRef.current = audio;
        audio.onended = () => stopSpeaking();
        audio.onerror = () => {
          setSpeakError(SPEAK_FAIL);
          stopSpeaking();
        };
        setIsPreparing(false);
        setIsSpeaking(true);
        await audio.play();
      } catch {
        setSpeakError(SPEAK_FAIL);
        stopSpeaking();
      }
    },
    [stopSpeaking],
  );

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    isSpeaking,
    isPreparing,
    speakError,
    speakText,
    stopSpeaking,
  };
}
