type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const SYSTEM_PROMPT = [
  "You are an expert Telugu language editor for speech-to-text output.",
  "Rewrite the input as correct, natural Telugu sentences (సరైన తెలుగు వాక్య నిర్మాణం).",
  "Fix: spelling, grammar, case endings (విభక్తి), verb agreement, word order (SOV), sandhi, and punctuation.",
  "Turn broken or jumbled speech fragments into complete, fluent Telugu sentences.",
  "Keep the original meaning, names, places, numbers, and dates.",
  "Keep the language Telugu. Do not translate into English.",
  "Do not add new facts, greetings, titles, or extra commentary.",
  "If the input is already correct, return it with only light punctuation cleanup.",
  "Return only the corrected Telugu text.",
].join(" ");

export async function correctTeluguWithAi(text: string): Promise<string> {
  const value = text.trim();
  if (!value) {
    throw new Error("empty-text");
  }

  if (value.length > 3000) {
    throw new Error("text-too-long");
  }

  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim() || "gpt-4o-mini";
  const provider = (process.env.AI_PROVIDER?.trim() || "openai").toLowerCase();

  if (!apiKey) {
    throw new Error("missing-credentials");
  }

  if (provider !== "openai") {
    throw new Error("unsupported-provider");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Correct and form proper Telugu sentences:\n${value}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("correct-failed");
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const corrected = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!corrected) {
    throw new Error("correct-failed");
  }

  return corrected.replace(/^["'`]+|["'`]+$/g, "").trim();
}
