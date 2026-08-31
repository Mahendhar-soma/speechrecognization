"use client";

import { useEffect, useRef, useState } from "react";
import { renderShareCard, type ShareCardKind } from "@/lib/shareCard";
import { cardHeadingFor, getWishTheme } from "@/lib/wishThemes";

type ShareCardPreviewProps = {
  text: string;
  kind: ShareCardKind;
  onBlob?: (blob: Blob | null) => void;
};

export default function ShareCardPreview({ text, kind, onBlob }: ShareCardPreviewProps) {
  const [url, setUrl] = useState("");
  const [background, setBackground] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const onBlobRef = useRef(onBlob);
  onBlobRef.current = onBlob;

  const theme = getWishTheme(text, kind);
  const heading = cardHeadingFor(kind, theme);

  useEffect(() => {
    setBackground("");
    setError("");
  }, [kind, theme.id]);

  useEffect(() => {
    const value = text.trim();
    if (!value) {
      setUrl("");
      onBlobRef.current?.(null);
      return;
    }

    let cancelled = false;
    let objectUrl = "";

    const timeoutId = window.setTimeout(() => {
      void renderShareCard(value, kind, background || undefined, heading, theme.style)
        .then((blob) => {
          if (cancelled) {
            return;
          }
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
          onBlobRef.current?.(blob);
        })
        .catch(() => {
          if (!cancelled) {
            setUrl("");
            onBlobRef.current?.(null);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [background, heading, kind, text, theme.id]);

  async function generateAiImage() {
    const value = text.trim();
    if (!value || generating) {
      return;
    }

    setError("");
    setGenerating(true);

    try {
      const response = await fetch("/api/card-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, kind, fresh: Boolean(background) }),
      });
      const data = (await response.json()) as { image?: string; error?: string };
      if (!response.ok || typeof data.image !== "string" || !data.image) {
        throw new Error(data.error || "image-failed");
      }
      setBackground(`data:image/png;base64,${data.image}`);
    } catch {
      setError("AI ఇమేజ్ రాలేదు. మళ్లీ ప్రయత్నించండి.");
    } finally {
      setGenerating(false);
    }
  }

  if (!text.trim()) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-stone-700">
          {theme.label} కార్డ్ ప్రివ్యూ
        </p>
        <button
          type="button"
          onClick={() => {
            void generateAiImage();
          }}
          disabled={generating}
          className="rounded-full bg-orange-700 px-3 py-1.5 text-sm font-medium text-white outline-none hover:bg-orange-800 focus-visible:ring-2 focus-visible:ring-orange-500 disabled:bg-stone-300"
        >
          {generating ? "AI ఇమేజ్..." : background ? "మరో AI ఇమేజ్" : "AI ఇమేజ్ తయారు చేయండి"}
        </button>
      </div>
      {url ? (
        <img src={url} alt="" className="mx-auto h-auto max-h-[28rem] w-full object-contain rounded-xl" />
      ) : (
        <p className="py-8 text-center text-sm text-stone-500">కార్డ్ తయారవుతోంది…</p>
      )}
      {error ? (
        <p className="mt-2 text-center text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-center text-xs text-stone-500">
          టెక్స్ట్‌లో బతుకమ్మ, బోనాలు లాంటి పేరు ఉంటే అదే పండుగ ఇమేజ్ వస్తుంది.
        </p>
      )}
    </div>
  );
}
