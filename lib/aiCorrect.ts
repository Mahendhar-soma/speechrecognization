type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const TELUGU_EXAMPLE_1 =
  "\u0C28\u0C3E\u0C15\u0C41 \u0C30\u0C47\u0C2A\u0C41 \u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D\u200C\u0C15\u0C3F \u0C35\u0C46\u0C33\u0C4D\u0C32\u0C3E\u0C32\u0C28\u0C3F \u0C05\u0C28\u0C41\u0C15\u0C41\u0C02\u0C1F\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.";
const TELUGU_EXAMPLE_2 =
  "\u0C28\u0C47\u0C28\u0C41 \u0C06\u0C2B\u0C40\u0C38\u0C41\u0C15\u0C3F \u0C35\u0C46\u0C33\u0C4D\u0C24\u0C41\u0C28\u0C4D\u0C28\u0C3E\u0C28\u0C41.";

const SYSTEM_PROMPT = [
  "You are a Telugu speech-to-text editor.",
  "Always return Telugu in Telugu script.",
  "Turn broken, mixed, or romanized speech into complete, meaningful, grammatically correct Telugu sentences.",
  "Fix sentence formation, grammar, case endings, verb agreement, word order, and punctuation.",
  "Convert romanized Telugu into Telugu script.",
  `Example: "naku repu market ki vellali anukuntunanu" → "${TELUGU_EXAMPLE_1}"`,
  `Example: "nenu office ki veltunna" → "${TELUGU_EXAMPLE_2}"`,
  "Keep the speaker's intended meaning. Do not invent facts, extra sentences, or new details.",
  "Do not unnecessarily change names, numbers, places, dates, or important words.",
  "Common spoken English loanwords may be written in Telugu script.",
  "Do not translate the message into English.",
  "Return only the corrected Telugu text. No quotes, labels, or commentary.",
].join(" ");

export async function correctSpeechWithAi(text: string, _languageHint?: "te" | "en"): Promise<string> {
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

  const hint =
    "Language: Telugu only. Convert romanized or mixed Telugu speech into correct, meaningful Telugu sentences.";

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
        { role: "user", content: `${hint}\n\nCorrect this speech text:\n${value}` },
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
