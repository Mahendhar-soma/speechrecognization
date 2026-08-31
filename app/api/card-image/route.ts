import { generateWishBackground } from "@/lib/generateCardImage";
import { getWishTheme } from "@/lib/wishThemes";
import type { ShareCardKind } from "@/lib/shareCard";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  let text = "";
  let kind: ShareCardKind = "wish";
  let fresh = false;

  try {
    const body = (await request.json()) as { text?: unknown; kind?: unknown; fresh?: unknown };
    text = typeof body.text === "string" ? body.text : "";
    kind = body.kind === "notice" || body.kind === "plain" || body.kind === "wish" ? body.kind : "wish";
    fresh = body.fresh === true;
  } catch {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "empty-text" }, { status: 400 });
  }

  try {
    const theme = getWishTheme(text, kind);
    const image = await generateWishBackground(theme.prompt, `${kind}:${theme.id}:style-v3`, {
      skipCache: fresh,
    });
    return NextResponse.json({ image, theme: theme.id, label: theme.label });
  } catch (error) {
    const message = error instanceof Error ? error.message : "image-failed";
    const status =
      message === "empty-text" || message === "invalid-request"
        ? 400
        : message === "missing-credentials" || message === "unsupported-provider"
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
