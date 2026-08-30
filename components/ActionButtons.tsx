"use client";

import { useEffect, useState } from "react";

type ActionButtonsProps = {
  text: string;
  copied: boolean;
  copyError: string;
  listenError: string;
  shareError: string;
  isSpeaking: boolean;
  isPreparingSpeech: boolean;
  onListen: () => void;
  onStopListen: () => void;
  onCopy: () => void;
  onShare: () => void;
  onClear: () => void;
};

export default function ActionButtons({
  text,
  copied,
  copyError,
  listenError,
  shareError,
  isSpeaking,
  isPreparingSpeech,
  onListen,
  onStopListen,
  onCopy,
  onShare,
  onClear,
}: ActionButtonsProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const hasText = text.trim().length > 0;
  const listenBusy = isSpeaking || isPreparingSpeech;

  useEffect(() => {
    if (!hasText) {
      setConfirmingClear(false);
    }
  }, [hasText]);

  function handleClearClick() {
    if (!hasText) {
      setConfirmingClear(false);
      return;
    }

    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }

    onStopListen();
    onClear();
    setConfirmingClear(false);
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={listenBusy ? onStopListen : onListen}
          disabled={!hasText}
          aria-label={listenBusy ? "వినడం ఆపండి" : "టెక్స్ట్ వినండి"}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
        >
          <SpeakerIcon />
          {isPreparingSpeech ? "సిద్ధం…" : isSpeaking ? "ఆపండి" : "వినండి"}
        </button>
        <button
          type="button"
          onClick={onCopy}
          disabled={!hasText}
          aria-label="టెక్స్ట్ కాపీ చేయండి"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-3 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
        >
          {copied ? "కాపీ అయింది" : "కాపీ చేయండి"}
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={!hasText}
          aria-label="టెక్స్ట్ పంపండి"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 outline-none transition hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
        >
          పంపండి
        </button>
        <button
          type="button"
          onClick={handleClearClick}
          disabled={!hasText}
          aria-label="టెక్స్ట్ తొలగించండి"
          className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400 ${
            confirmingClear
              ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
              : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
          }`}
        >
          {confirmingClear ? "ఖచ్చితంగా?" : "తొలగించండి"}
        </button>
      </div>

      {confirmingClear ? (
        <button
          type="button"
          onClick={() => setConfirmingClear(false)}
          className="self-center text-sm text-stone-500 underline-offset-2 outline-none hover:text-stone-800 hover:underline focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          రద్దు చేయండి
        </button>
      ) : null}

      {copied ? (
        <p className="text-center text-sm font-medium text-green-700" role="status">
          కాపీ అయింది — WhatsApp లో పేస్ట్ చేయండి
        </p>
      ) : null}
      {copyError ? (
        <p className="text-center text-sm font-medium text-red-700" role="alert">
          {copyError}
        </p>
      ) : null}
      {shareError ? (
        <p className="text-center text-sm font-medium text-red-700" role="alert">
          {shareError}
        </p>
      ) : null}
      {listenError ? (
        <p className="text-center text-sm font-medium text-red-700" role="alert">
          {listenError}
        </p>
      ) : null}
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}
