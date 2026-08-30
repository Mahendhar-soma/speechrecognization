import { NextResponse } from "next/server";
import { correctTeluguWithAi } from "@/lib/aiCorrect";

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
    const corrected = await correctTeluguWithAi(text);
    return NextResponse.json({ text: corrected });
  } catch (error) {
    const message = error instanceof Error ? error.message : "correct-failed";
    const status =
      message === "empty-text" || message === "text-too-long" || message === "invalid-request"
        ? 400
        : message === "missing-credentials" || message === "unsupported-provider"
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
