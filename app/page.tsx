"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ActionButtons from "@/components/ActionButtons";
import FormatPicker, { type OutputMode } from "@/components/FormatPicker";
import ShareCardPreview from "@/components/ShareCardPreview";
import StatusIndicator from "@/components/StatusIndicator";
import TranscriptEditor from "@/components/TranscriptEditor";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import type { MessageFormat } from "@/lib/messageFormats";
import { renderShareCard, shareCardImage, type ShareCardKind } from "@/lib/shareCard";
import { cardHeadingFor, getWishTheme } from "@/lib/wishThemes";
import { appendTranscript, TELUGU_LANG } from "@/lib/speechRecognition";
// import { ENGLISH_LANG, type SpeechLanguage } from "@/lib/speechRecognition";

const EXAMPLE_SENTENCES = [
  "నా పేరు మహేందర్.",
  "నేను హైదరాబాద్‌లో ఉంటున్నాను.",
  "బతుకమ్మ శుభాకాంక్షలు.",
  "రేపు ఉదయం పది గంటలకు మీటింగ్ ఉంది.",
];

const COPY_FAIL = "టెక్స్ట్ కాపీ కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.";
const SHARE_FAIL = "టెక్స్ట్ పంపలేకపోయాము. కాపీ చేసి పేస్ట్ చేయండి.";
const CORRECT_FAIL = "టెక్స్ట్ సరిచేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.";
const CARD_FAIL = "కార్డ్ పంపలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.";

function toMessageFormat(mode: OutputMode): MessageFormat {
  return mode === "card" ? "wish" : mode;
}

function toCardKind(mode: OutputMode): ShareCardKind {
  if (mode === "notice") {
    return "notice";
  }
  if (mode === "wish" || mode === "card") {
    return "wish";
  }
  return "plain";
}

function copyText(value: string): boolean {
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(field);
  return ok;
}

export default function Home() {
  const [text, setText] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [shareError, setShareError] = useState("");
  const [correctError, setCorrectError] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("plain");
  const [showHelp, setShowHelp] = useState<boolean | null>(null);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const speechLang = TELUGU_LANG;
  // const [speechLang, setSpeechLang] = useState<SpeechLanguage>(TELUGU_LANG);
  const committedTextRef = useRef("");

  const handleSessionComplete = useCallback(async (raw: string) => {
    const sessionRaw = raw.trim();
    if (!sessionRaw) {
      return;
    }

    setRecognizedText(sessionRaw);
    const preview = appendTranscript(committedTextRef.current, sessionRaw);
    setText(preview);
    setCorrectError("");
    setIsCorrecting(true);

    try {
      const response = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sessionRaw,
          language: "te",
          format: toMessageFormat(outputMode),
        }),
      });
      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || typeof data.text !== "string" || !data.text.trim()) {
        throw new Error(data.error || "correct-failed");
      }

      const next = data.text.trim();
      const combined = appendTranscript(committedTextRef.current, next);
      committedTextRef.current = combined;
      setText(combined);
      setRecognizedText(sessionRaw !== next ? sessionRaw : "");
    } catch {
      committedTextRef.current = preview;
      setCorrectError(CORRECT_FAIL);
    } finally {
      setIsCorrecting(false);
    }
  }, [outputMode]);

  const { state, interimTranscript, sessionTranscript, errorMessage, startRecognition, stopRecognition } =
    useSpeechRecognition({
      language: speechLang,
      onSessionComplete: handleSessionComplete,
    });

  const { isSpeaking, isPreparing, speakError, speakText, stopSpeaking } = useSpeechSynthesis();
  const isListening = state === "listening";
  const isProcessing = state === "processing" || isCorrecting;
  const liveText = isListening || state === "processing"
    ? appendTranscript(committedTextRef.current, sessionTranscript)
    : text;

  const handleMicToggle = useCallback(() => {
    if (state === "unsupported" || isProcessing) {
      return;
    }

    if (isListening) {
      stopRecognition();
      return;
    }

    stopSpeaking();
    committedTextRef.current = text;
    setRecognizedText("");
    setCorrectError("");
    startRecognition();
  }, [isListening, isProcessing, startRecognition, state, stopRecognition, stopSpeaking, text]);

  useEffect(() => {
    try {
      setShowHelp(window.sessionStorage.getItem("tvw-help-hidden") !== "1");
    } catch {
      setShowHelp(true);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    const value = text.trim();
    if (!value) {
      return;
    }

    setCopyError("");
    setShareError("");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else if (!copyText(value)) {
        throw new Error("copy-failed");
      }
      setCopied(true);
    } catch {
      try {
        if (copyText(value)) {
          setCopied(true);
          return;
        }
      } catch {
        // fall through
      }
      setCopied(false);
      setCopyError(COPY_FAIL);
    }
  }, [text]);

  const handleShare = useCallback(async () => {
    const value = text.trim();
    if (!value) {
      return;
    }

    setShareError("");
    setCopyError("");

    try {
      if (navigator.share) {
        await navigator.share({ text: value });
        return;
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(value)}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setShareError(SHARE_FAIL);
    }
  }, [text]);

  const handleCorrect = useCallback(async () => {
    const value = text.trim();
    if (!value || isListening || isProcessing) {
      return;
    }

    stopSpeaking();
    setCorrectError("");
    setIsCorrecting(true);

    try {
      const response = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: value,
          language: "te",
          format: toMessageFormat(outputMode),
        }),
      });
      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || typeof data.text !== "string" || !data.text.trim()) {
        throw new Error(data.error || "correct-failed");
      }

      const next = data.text.trim();
      committedTextRef.current = next;
      setRecognizedText(value !== next ? value : "");
      setText(next);
    } catch {
      setCorrectError(CORRECT_FAIL);
    } finally {
      setIsCorrecting(false);
    }
  }, [isListening, isProcessing, outputMode, stopSpeaking, text]);

  const handleShareCard = useCallback(async () => {
    const value = text.trim();
    if (!value) {
      return;
    }

    setShareError("");
    try {
      const kind = toCardKind(outputMode);
      const theme = getWishTheme(value, kind);
      const blob =
        cardBlob ?? (await renderShareCard(value, kind, undefined, cardHeadingFor(kind, theme), theme.style));
      await shareCardImage(blob);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setShareError(CARD_FAIL);
    }
  }, [cardBlob, outputMode, text]);

  const handleClear = useCallback(() => {
    stopSpeaking();
    committedTextRef.current = "";
    setText("");
    setRecognizedText("");
    setCopied(false);
    setCopyError("");
    setShareError("");
    setCorrectError("");
  }, [stopSpeaking]);

  const hideHelp = useCallback(() => {
    setShowHelp(false);
    try {
      window.sessionStorage.setItem("tvw-help-hidden", "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === "Enter" && !event.repeat) {
        event.preventDefault();
        handleMicToggle();
        return;
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        void handleCopy();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleCopy, handleMicToggle]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-8">
      <section className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          తెలుగు వాయిస్ రైటర్
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600 sm:text-base">
          తెలుగులో మాట్లాడండి — టెక్స్ట్‌గా మార్చుకోండి
        </p>
      </section>

      {showHelp === false ? (
        <button
          type="button"
          onClick={() => {
            setShowHelp(true);
            try {
              window.sessionStorage.removeItem("tvw-help-hidden");
            } catch {
              // ignore
            }
          }}
          className="mt-4 self-center text-sm font-medium text-orange-800 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          ఎలా ఉపయోగించాలి?
        </button>
      ) : null}

      {showHelp === true ? (
        <section className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-3 text-sm leading-relaxed text-stone-700">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-stone-900">ఎలా ఉపయోగించాలి</h2>
            <button
              type="button"
              onClick={hideHelp}
              className="rounded-lg px-2 py-1 text-xs font-medium text-stone-500 outline-none hover:bg-white hover:text-stone-800 focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              దాచు
            </button>
          </div>
          <ol className="list-decimal space-y-1 pl-5">
            <li>మైక్ నొక్కండి — తెలుగులో మాట్లాడండి.</li>
            <li>మైక్ మళ్లీ నొక్కండి — టెక్స్ట్ ఇక్కడ కనిపిస్తుంది.</li>
            <li>వాక్యం సరిచేయబడుతుంది. తప్పు ఉంటే టెక్స్ట్‌లో సరిచేయండి.</li>
            <li>వినండి నొక్కి సరిచేసిన టెక్స్ట్ వినండి.</li>
            <li>సాధారణం / నోటీసు / శుభాకాంక్షలు ఎంచుకోండి.</li>
            <li>కార్డ్ ఎంచుకుని శుభాకాంక్ష ఇమేజ్ పంపండి.</li>
          </ol>
        </section>
      ) : null}

      <section className="mt-5 rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_12px_40px_rgba(194,65,12,0.08)] sm:p-7">
        {/* Language is Telugu-only by default. English toggle is kept commented.
        <div className="mb-4 flex justify-center gap-2">
          <button type="button" className="rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-900">
            తెలుగు
          </button>
          <button type="button" className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-600">
            English
          </button>
        </div>
        */}

        <FormatPicker value={outputMode} onChange={setOutputMode} disabled={isListening || isProcessing} />

        <VoiceRecorder state={isProcessing && state !== "listening" ? "processing" : state} onToggle={handleMicToggle} />

        <div className="mt-5">
          <TranscriptEditor
            value={liveText}
            onChange={(next) => {
              if (isListening || isProcessing) {
                return;
              }
              stopSpeaking();
              committedTextRef.current = next;
              setRecognizedText("");
              setText(next);
            }}
            interimTranscript={isListening || state === "processing" ? interimTranscript : ""}
            isListening={isListening || state === "processing"}
            recognizedText={recognizedText}
          />
        </div>

        {outputMode !== "plain" && text.trim() && !isListening ? (
          <ShareCardPreview text={text} kind={toCardKind(outputMode)} onBlob={setCardBlob} />
        ) : null}

        <div className="mt-4">
          <ActionButtons
            text={text}
            copied={copied}
            copyError={copyError}
            listenError={speakError}
            shareError={shareError}
            correctError={correctError}
            isSpeaking={isSpeaking}
            isPreparingSpeech={isPreparing}
            isCorrecting={isProcessing}
            correctLabel={
              outputMode === "notice"
                ? "నోటీసుగా మార్చండి"
                : outputMode === "wish"
                  ? "శుభాకాంక్షగా మార్చండి"
                  : "తెలుగు టెక్స్ట్ సరిచేయండి"
            }
            onListen={() => speakText(text)}
            onStopListen={stopSpeaking}
            onCorrect={() => {
              void handleCorrect();
            }}
            onCopy={() => {
              void handleCopy();
            }}
            onShare={() => {
              void handleShare();
            }}
            onShareCard={
              outputMode === "card" || outputMode === "wish" || outputMode === "notice"
                ? () => {
                    void handleShareCard();
                  }
                : undefined
            }
            onClear={handleClear}
          />
        </div>
      </section>

      <section className="mt-4">
        <StatusIndicator state={state} errorMessage={errorMessage} />
      </section>

      <section className="mt-5">
        <h2 className="text-sm font-semibold text-stone-800">ఇలా చెప్పి చూడండి</h2>
        <p className="mt-1 text-xs text-stone-500">ఒక వాక్యం జోడిస్తే టెక్స్ట్‌కి జోడుతుంది. ఉన్న టెక్స్ట్ తొలగించబడదు.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_SENTENCES.map((sentence) => (
            <button
              key={sentence}
              type="button"
              onClick={() => {
                stopSpeaking();
                setText((current) => {
                  const next = appendTranscript(current, sentence);
                  committedTextRef.current = next;
                  return next;
                });
              }}
              className="rounded-full border border-orange-100 bg-white px-3 py-2 text-left text-sm leading-relaxed text-stone-800 outline-none transition hover:border-orange-200 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {sentence}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
