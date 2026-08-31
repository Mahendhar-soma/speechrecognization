"use client";

import type { RecognitionState } from "@/lib/speechRecognition";

type VoiceRecorderProps = {
  state: RecognitionState;
  onToggle: () => void;
};

function getButtonLabel(state: RecognitionState): string {
  switch (state) {
    case "listening":
      return "వింటున్నాను… మళ్లీ నొక్కి ఆపండి";
    case "processing":
      return "Processing...";
    case "unsupported":
      return "ఈ బ్రౌజర్‌లో మైక్ పని చేయదు";
    case "error":
      return "మళ్లీ నొక్కండి";
    default:
      return "మైక్ నొక్కి మాట్లాడండి";
  }
}

export default function VoiceRecorder({ state, onToggle }: VoiceRecorderProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isDisabled = state === "unsupported" || isProcessing;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
        {isListening ? (
          <>
            <span aria-hidden="true" className="mic-ring absolute inset-1 rounded-full bg-red-400/40" />
            <span
              aria-hidden="true"
              className="mic-ring absolute inset-1 rounded-full bg-red-400/25 [animation-delay:350ms]"
            />
          </>
        ) : null}
        <button
          type="button"
          disabled={isDisabled}
          aria-label={
            isProcessing ? "Processing..." : isListening ? "మైక్ ఆపండి" : "మైక్ నొక్కి మాట్లాడండి"
          }
          aria-pressed={isListening}
          onClick={onToggle}
          className={`relative z-10 flex h-20 w-20 select-none items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(194,65,12,0.35)] outline-none transition-[transform,background-color,box-shadow] duration-150 focus-visible:ring-4 focus-visible:ring-orange-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-24 sm:w-24 ${
            isProcessing
              ? "bg-stone-400 shadow-none"
              : isListening
                ? "scale-95 bg-red-600 shadow-[0_10px_24px_rgba(220,38,38,0.4)]"
                : "bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 active:scale-95"
          }`}
        >
          {isProcessing ? (
            <span className="px-1 text-center text-[11px] font-semibold leading-tight">...</span>
          ) : isListening ? (
            <span className="flex flex-col items-center gap-1">
              <span aria-hidden="true" className="h-3.5 w-3.5 rounded-sm bg-white" />
              <span className="text-[11px] font-semibold leading-none">ఆపండి</span>
            </span>
          ) : (
            <MicrophoneIcon />
          )}
        </button>
      </div>
      <p
        className={`text-center text-[15px] font-medium sm:text-base ${
          isListening ? "text-red-700" : isProcessing ? "text-stone-500" : "text-stone-700"
        }`}
        aria-live="polite"
      >
        {getButtonLabel(state)}
      </p>
    </div>
  );
}

function MicrophoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-9 w-9 sm:h-10 sm:w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
      <path d="M9 21h6" />
    </svg>
  );
}
