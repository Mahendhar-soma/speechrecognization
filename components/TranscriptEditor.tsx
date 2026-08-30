"use client";

import { useEffect, useRef } from "react";
import { countGraphemes, countWords } from "@/lib/speechRecognition";

type TranscriptEditorProps = {
  value: string;
  onChange: (value: string) => void;
  interimTranscript: string;
  isListening: boolean;
  recognizedText?: string;
};

const PLACEHOLDER = "మైక్ నొక్కి మాట్లాడండి — టెక్స్ట్ ఇక్కడ వస్తుంది. తప్పు ఉంటే ఇక్కడే సరిచేయండి.";

export default function TranscriptEditor({
  value,
  onChange,
  interimTranscript,
  isListening,
  recognizedText = "",
}: TranscriptEditorProps) {
  const liveRef = useRef<HTMLDivElement>(null);
  const liveValue = interimTranscript
    ? `${value}${value && !/\s$/.test(value) ? " " : ""}${interimTranscript}`
    : value;
  const characterCount = interimTranscript
    ? liveValue.length
    : countGraphemes(liveValue);
  const wordCount = interimTranscript
    ? liveValue.trim()
      ? liveValue.trim().split(/\s+/).length
      : 0
    : countWords(liveValue);

  useEffect(() => {
    if (!isListening || !liveRef.current) {
      return;
    }
    liveRef.current.scrollTop = liveRef.current.scrollHeight;
  }, [isListening, liveValue]);

  return (
    <section className="w-full">
      <div className="mb-2 flex items-end justify-between gap-3">
        <label htmlFor="telugu-transcript" className="text-base font-semibold text-stone-900">
          {isListening ? "తెలుగు టెక్స్ట్" : "సరిచేసిన టెక్స్ట్"}
        </label>
        {isListening ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-orange-700">
            <span aria-hidden="true" className="live-dot h-2 w-2 rounded-full bg-orange-500" />
            ప్రత్యక్షంగా రాస్తోంది
          </p>
        ) : null}
      </div>

      {!isListening && recognizedText ? (
        <p className="mb-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-relaxed text-stone-600">
          <span className="font-medium text-stone-800">గుర్తించిన టెక్స్ట్: </span>
          {recognizedText}
        </p>
      ) : null}

      {isListening ? (
        <div
          ref={liveRef}
          id="telugu-transcript"
          className="min-h-48 overflow-y-auto rounded-2xl border-2 border-orange-300 bg-orange-50/60 px-4 py-4 text-[18px] leading-[1.8] text-stone-900 sm:min-h-56 sm:px-5 sm:py-5 sm:text-[20px]"
          aria-live="polite"
          aria-atomic="false"
        >
          {value ? <span>{value}</span> : null}
          {value && interimTranscript && !/\s$/.test(value) ? " " : null}
          {interimTranscript ? (
            <span className="text-orange-700">{interimTranscript}</span>
          ) : (
            !value && <span className="text-stone-400">మాట్లాడండి…</span>
          )}
        </div>
      ) : (
        <textarea
          id="telugu-transcript"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          lang="te"
          className="min-h-48 w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-4 text-[18px] leading-[1.8] text-stone-900 shadow-inner outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:min-h-56 sm:px-5 sm:py-5 sm:text-[20px]"
        />
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-stone-500">
        <p>
          అక్షరాలు <span className="font-medium text-stone-800">{characterCount}</span>
          <span className="mx-2 text-stone-300">·</span>
          పదాలు <span className="font-medium text-stone-800">{wordCount}</span>
        </p>
        {!isListening && value ? (
          <p className="text-xs text-stone-400">తప్పు ఉంటే ఇక్కడ నొక్కి సరిచేయండి</p>
        ) : null}
      </div>
    </section>
  );
}
