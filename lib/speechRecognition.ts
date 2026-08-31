export type RecognitionState =
  | "idle"
  | "listening"
  | "processing"
  | "completed"
  | "error"
  | "unsupported";

export const TELUGU_LANG = "te-IN";
// export const ENGLISH_LANG = "en-IN";
export type SpeechLanguage = typeof TELUGU_LANG;
// export type SpeechLanguage = typeof TELUGU_LANG | typeof ENGLISH_LANG;

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionResultListLike {
  length: number;
  item(index: number): SpeechRecognitionResultLike;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onspeechend: ((ev: Event) => void) | null;
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export function createSpeechRecognition(
  lang: SpeechLanguage = TELUGU_LANG,
): SpeechRecognitionInstance | null {
  const SpeechRecognitionAPI = getSpeechRecognitionConstructor();
  if (!SpeechRecognitionAPI) {
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  return recognition;
}

export function getSpeechErrorMessage(error: string): string {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "మైక్ అనుమతి లేదు. బ్రౌజర్ చిరునామా పక్కన మైక్ చిహ్నం మీద అనుమతిని ఇవ్వండి.";
    case "network":
      return "ఇంటర్నెట్ లేదు. మాటలు టెక్స్ట్గా మార్చడానికి నెట్ అవసరం.";
    case "no-speech":
      return "మాట వినిపించలేదు. దయచేసి మళ్లీ మాట్లాడండి.";
    case "audio-capture":
      return "మైక్ దొరకలేదు. మైక్ కనెక్ట్ చేసి మళ్లీ ప్రయత్నించండి.";
    case "aborted":
      return "మైక్ ప్రారంభించలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.";
    case "start-failed":
      return "మైక్ ప్రారంభించలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.";
    default:
      return "మాటలు గుర్తించడంలో సమస్య వచ్చింది. మళ్లీ ప్రయత్నించండి.";
  }
}

export const UNSUPPORTED_MESSAGE =
  "ఈ బ్రౌజర్‌లో మాటలు టెక్స్ట్గా మార్చడం పని చేయదు. దయచేసి Chrome తెరవండి.";

export function appendTranscript(existing: string, incoming: string): string {
  const next = incoming.trim();
  if (!next) {
    return existing;
  }

  const current = existing.trimEnd();
  if (!current) {
    return next;
  }

  if (current.endsWith(next)) {
    return existing;
  }

  const lastLine = current.split(/\n/).pop()?.trim() ?? "";
  if (lastLine && next.startsWith(lastLine) && next.length > lastLine.length) {
    const withoutLastLine = current.slice(0, current.lastIndexOf(lastLine));
    return `${withoutLastLine}${next}`;
  }

  const separator = /[\s]$/.test(existing) ? "" : " ";
  return `${existing}${separator}${next}`;
}

export function joinUniqueTranscripts(parts: string[]): string {
  return parts.reduce((combined, part) => appendTranscript(combined, part), "");
}

export function correctTeluguTranscript(text: string): string {
  let value = text.normalize("NFC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (!value) {
    return "";
  }

  value = value.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]+/g, " ");
  value = value.replace(/\s+/g, " ");
  value = value.replace(/\s+([,.!?;:।॥])/g, "$1");
  value = value.replace(/([,.!?;:।॥])(?!\s|$)/g, "$1 ");
  value = value.replace(/([.!?।॥])\1+/g, "$1");
  value = value.replace(/([^\s]+)(?:\s+\1){2,}/giu, "$1");
  value = value.replace(/\s+/g, " ").trim();

  if (value && !/[.!?।॥]$/.test(value)) {
    value = `${value}.`;
  }

  return value;
}

export function countGraphemes(text: string): number {
  if (!text) {
    return 0;
  }

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("te", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text)).length;
  }

  return Array.from(text).length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("te", { granularity: "word" });
    return Array.from(segmenter.segment(trimmed)).filter((part) => part.isWordLike).length;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
}
