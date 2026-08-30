"use client";

import type { RecognitionState } from "@/lib/speechRecognition";
import { UNSUPPORTED_MESSAGE } from "@/lib/speechRecognition";

type StatusIndicatorProps = {
  state: RecognitionState;
  errorMessage: string;
};

export default function StatusIndicator({ state, errorMessage }: StatusIndicatorProps) {
  const showUnsupported = state === "unsupported";
  const showError = state === "error" && Boolean(errorMessage);

  if (!showUnsupported && !showError) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl px-4 py-3 text-center text-sm leading-relaxed ${
        showUnsupported
          ? "border border-amber-200 bg-amber-50 text-amber-950"
          : "border border-red-200 bg-red-50 text-red-800"
      }`}
      role="alert"
      aria-live="polite"
    >
      {showUnsupported ? UNSUPPORTED_MESSAGE : errorMessage}
    </div>
  );
}
