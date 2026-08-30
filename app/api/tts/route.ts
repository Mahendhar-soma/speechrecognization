import { NextResponse } from "next/server";
import { synthesizeTeluguSpeech } from "@/lib/googleTts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let text = "";

  try {
    const body = (await request.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 });
  }

  try {
    const audio = await synthesizeTeluguSpeech(text);
    return new NextResponse(Uint8Array.from(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "tts-failed";
    const status = message === "empty-text" || message === "text-too-long" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
