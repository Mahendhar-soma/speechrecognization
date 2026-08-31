"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  createSpeechRecognition,
  getSpeechErrorMessage,
  isSpeechRecognitionSupported,
  joinUniqueTranscripts,
  TELUGU_LANG,
  type RecognitionState,
  type SpeechLanguage,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionInstance,
} from "@/lib/speechRecognition";

type UseSpeechRecognitionOptions = {
  language?: SpeechLanguage;
  onSessionComplete?: (text: string) => void | Promise<void>;
};

const emptySubscribe = () => () => {};

function pushUniqueFinal(parts: string[], incoming: string): string[] {
  const next = incoming.trim();
  if (!next) {
    return parts;
  }

  const last = parts[parts.length - 1] ?? "";
  if (!last) {
    return [next];
  }

  if (last === next || last.endsWith(next)) {
    return parts;
  }

  if (next.startsWith(last) && next.length > last.length) {
    return [...parts.slice(0, -1), next];
  }

  return [...parts, next];
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    isSpeechRecognitionSupported,
    () => true,
  );
  const [runtimeState, setRuntimeState] = useState<RecognitionState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [sessionTranscript, setSessionTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const state: RecognitionState = isSupported ? runtimeState : "unsupported";

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const wantListeningRef = useRef(false);
  const startingRef = useRef(false);
  const sessionClosedRef = useRef(true);
  const lastFinalIndexRef = useRef(-1);
  const sessionFinalsRef = useRef<string[]>([]);
  const interimRef = useRef("");
  const languageRef = useRef<SpeechLanguage>(options.language ?? TELUGU_LANG);
  const onSessionCompleteRef = useRef(options.onSessionComplete);

  useEffect(() => {
    languageRef.current = options.language ?? TELUGU_LANG;
  }, [options.language]);

  useEffect(() => {
    onSessionCompleteRef.current = options.onSessionComplete;
  }, [options.onSessionComplete]);

  const disposeRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (!recognition) {
      return;
    }

    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.onspeechend = null;

    try {
      recognition.abort();
    } catch {
      // already stopped
    }
  }, []);

  const finalizeSession = useCallback(async () => {
    if (sessionClosedRef.current) {
      return;
    }

    sessionClosedRef.current = true;
    wantListeningRef.current = false;
    startingRef.current = false;
    setRuntimeState("processing");

    const leftover = interimRef.current.trim();
    if (leftover) {
      sessionFinalsRef.current = pushUniqueFinal(sessionFinalsRef.current, leftover);
    }

    interimRef.current = "";
    setInterimTranscript("");

    const combined = joinUniqueTranscripts(sessionFinalsRef.current);
    setSessionTranscript(combined);

    try {
      await onSessionCompleteRef.current?.(combined);
    } finally {
      disposeRecognition();
      setRuntimeState(combined ? "completed" : "idle");
    }
  }, [disposeRecognition]);

  const bindRecognition = useCallback(
    (recognition: SpeechRecognitionInstance) => {
      recognition.onstart = () => {
        startingRef.current = false;
        if (wantListeningRef.current && !sessionClosedRef.current) {
          setRuntimeState("listening");
        }
      };

      recognition.onspeechend = null;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        if (sessionClosedRef.current) {
          return;
        }

        let interim = "";

        for (let i = 0; i < event.results.length; i += 1) {
          const piece = event.results[i][0]?.transcript ?? "";
          if (event.results[i].isFinal) {
            if (i > lastFinalIndexRef.current) {
              lastFinalIndexRef.current = i;
              sessionFinalsRef.current = pushUniqueFinal(sessionFinalsRef.current, piece);
            }
          } else {
            interim += piece;
          }
        }

        const joined = joinUniqueTranscripts(sessionFinalsRef.current);
        setSessionTranscript(joined);

        if (interim !== interimRef.current) {
          interimRef.current = interim;
          setInterimTranscript(interim);
        }

        if (joined || interim) {
          setErrorMessage("");
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
        startingRef.current = false;
        sessionClosedRef.current = true;
        interimRef.current = "";
        setInterimTranscript("");
        disposeRecognition();
        setRuntimeState("error");
        setErrorMessage(getSpeechErrorMessage(error));
      };

      recognition.onend = () => {
        startingRef.current = false;
        void finalizeSession();
      };
    },
    [disposeRecognition, finalizeSession],
  );

  const stopRecognition = useCallback(() => {
    if (runtimeState === "processing") {
      return;
    }

    if (!wantListeningRef.current && runtimeState !== "listening") {
      return;
    }

    wantListeningRef.current = false;
    startingRef.current = false;
    setRuntimeState("processing");

    const recognition = recognitionRef.current;
    if (!recognition) {
      void finalizeSession();
      return;
    }

    try {
      recognition.stop();
    } catch {
      void finalizeSession();
    }
  }, [finalizeSession, runtimeState]);

  const startRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setRuntimeState("unsupported");
      return;
    }

    if (
      wantListeningRef.current ||
      startingRef.current ||
      runtimeState === "listening" ||
      runtimeState === "processing"
    ) {
      return;
    }

    disposeRecognition();

    wantListeningRef.current = true;
    startingRef.current = true;
    sessionClosedRef.current = false;
    lastFinalIndexRef.current = -1;
    sessionFinalsRef.current = [];
    interimRef.current = "";
    setErrorMessage("");
    setInterimTranscript("");
    setSessionTranscript("");
    setRuntimeState("listening");

    const recognition = createSpeechRecognition(languageRef.current);
    if (!recognition) {
      wantListeningRef.current = false;
      startingRef.current = false;
      sessionClosedRef.current = true;
      setRuntimeState("unsupported");
      return;
    }

    recognitionRef.current = recognition;
    bindRecognition(recognition);

    try {
      recognition.start();
    } catch {
      wantListeningRef.current = false;
      startingRef.current = false;
      sessionClosedRef.current = true;
      disposeRecognition();
      setRuntimeState("error");
      setErrorMessage(getSpeechErrorMessage("start-failed"));
    }
  }, [bindRecognition, disposeRecognition, runtimeState]);

  const toggleRecognition = useCallback(() => {
    if (state === "unsupported" || state === "processing") {
      return;
    }

    if (wantListeningRef.current || state === "listening") {
      stopRecognition();
      return;
    }

    startRecognition();
  }, [startRecognition, state, stopRecognition]);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      startingRef.current = false;
      sessionClosedRef.current = true;
      disposeRecognition();
    };
  }, [disposeRecognition]);

  return {
    state,
    interimTranscript,
    sessionTranscript,
    errorMessage,
    isSupported,
    startRecognition,
    stopRecognition,
    toggleRecognition,
  };
}
