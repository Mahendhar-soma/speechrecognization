"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  createSpeechRecognition,
  getSpeechErrorMessage,
  isSpeechRecognitionSupported,
  warmupMicrophone,
  type RecognitionState,
  type SpeechRecognitionInstance,
} from "@/lib/speechRecognition";

type UseSpeechRecognitionOptions = {
  onFinalTranscript?: (text: string) => void;
};

const emptySubscribe = () => () => {};
const RESTART_DELAY_MS = 0;

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    isSpeechRecognitionSupported,
    () => true,
  );
  const [runtimeState, setRuntimeState] = useState<RecognitionState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const state: RecognitionState = isSupported ? runtimeState : "unsupported";

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const wantListeningRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const interimRef = useRef("");
  const onFinalRef = useRef(options.onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = options.onFinalTranscript;
  }, [options.onFinalTranscript]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current != null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const bindRecognitionRef = useRef<(recognition: SpeechRecognitionInstance) => void>(() => {});

  const bindRecognition = useCallback((recognition: SpeechRecognitionInstance) => {
    recognition.onstart = () => {
      if (wantListeningRef.current) {
        setRuntimeState("listening");
      }
    };

    recognition.onspeechend = null;

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";

      for (let i = 0; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          if (i >= event.resultIndex) {
            finalChunk += piece;
          }
        } else {
          interim += piece;
        }
      }

      if (interim || finalChunk.trim()) {
        setErrorMessage("");
      }

      if (interim !== interimRef.current) {
        interimRef.current = interim;
        setInterimTranscript(interim);
      }

      const trimmedFinal = finalChunk.trim();
      if (trimmedFinal) {
        onFinalRef.current?.(trimmedFinal);
        interimRef.current = "";
        setInterimTranscript("");
      }
    };

    recognition.onerror = (event) => {
      const { error } = event;

      if (error === "aborted") {
        return;
      }

      if (error === "no-speech") {
        setErrorMessage("");
        return;
      }

      wantListeningRef.current = false;
      clearRestartTimer();
      setInterimTranscript("");
      setRuntimeState("error");
      setErrorMessage(getSpeechErrorMessage(error));
    };

    recognition.onend = () => {
      if (!wantListeningRef.current || recognitionRef.current !== recognition) {
        if (recognitionRef.current === recognition && !wantListeningRef.current) {
          recognitionRef.current = null;
        }
        setInterimTranscript("");
        setRuntimeState((current) =>
          current === "error" || current === "unsupported" ? current : "idle",
        );
        return;
      }

      clearRestartTimer();
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        if (!wantListeningRef.current) {
          return;
        }

        try {
          recognition.start();
          setRuntimeState("listening");
        } catch {
          try {
            const next = createSpeechRecognition();
            if (!next) {
              wantListeningRef.current = false;
              recognitionRef.current = null;
              setRuntimeState("idle");
              return;
            }
            recognitionRef.current = next;
            bindRecognitionRef.current(next);
            next.start();
            setRuntimeState("listening");
          } catch {
            wantListeningRef.current = false;
            recognitionRef.current = null;
            setRuntimeState("idle");
            setInterimTranscript("");
          }
        }
      }, RESTART_DELAY_MS);
    };
  }, [clearRestartTimer]);

  useEffect(() => {
    bindRecognitionRef.current = bindRecognition;
  }, [bindRecognition]);

  useEffect(() => {
    void warmupMicrophone();
    if (!recognitionRef.current) {
      const recognition = createSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        bindRecognition(recognition);
      }
    }
  }, [bindRecognition]);

  const stopRecognition = useCallback(() => {
    wantListeningRef.current = false;
    clearRestartTimer();

    const leftover = interimRef.current.trim();
    if (leftover) {
      onFinalRef.current?.(leftover);
    }
    interimRef.current = "";
    setInterimTranscript("");

    const recognition = recognitionRef.current;
    if (!recognition) {
      setRuntimeState("idle");
      return;
    }

    try {
      recognition.stop();
    } catch {
      recognitionRef.current = null;
      setRuntimeState("idle");
    }
  }, [clearRestartTimer]);

  const startRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setRuntimeState("unsupported");
      return;
    }

    if (wantListeningRef.current) {
      return;
    }

    wantListeningRef.current = true;
    setErrorMessage("");
    interimRef.current = "";
    setInterimTranscript("");
    setRuntimeState("listening");

    let recognition = recognitionRef.current;
    if (!recognition) {
      recognition = createSpeechRecognition();
      if (!recognition) {
        wantListeningRef.current = false;
        setRuntimeState("unsupported");
        return;
      }
      recognitionRef.current = recognition;
      bindRecognition(recognition);
    }

    try {
      recognition.start();
    } catch {
      try {
        recognition.abort();
      } catch {
        // already stopped
      }

      const retry = createSpeechRecognition();
      if (!retry) {
        wantListeningRef.current = false;
        recognitionRef.current = null;
        setRuntimeState("error");
        setErrorMessage(getSpeechErrorMessage("start-failed"));
        return;
      }

      recognitionRef.current = retry;
      bindRecognition(retry);
      try {
        retry.start();
      } catch {
        wantListeningRef.current = false;
        recognitionRef.current = null;
        setRuntimeState("error");
        setErrorMessage(getSpeechErrorMessage("start-failed"));
      }
    }
  }, [bindRecognition]);

  const toggleRecognition = useCallback(() => {
    if (state === "unsupported") {
      return;
    }

    if (wantListeningRef.current || state === "listening" || state === "processing") {
      stopRecognition();
      return;
    }

    startRecognition();
  }, [startRecognition, state, stopRecognition]);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      if (restartTimerRef.current != null) {
        window.clearTimeout(restartTimerRef.current);
      }
      try {
        recognitionRef.current?.abort();
      } catch {
        // Recognition may already be stopped.
      }
      recognitionRef.current = null;
    };
  }, []);

  return {
    state,
    interimTranscript,
    errorMessage,
    isSupported,
    startRecognition,
    stopRecognition,
    toggleRecognition,
  };
}
