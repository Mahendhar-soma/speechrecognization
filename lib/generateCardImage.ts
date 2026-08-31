type ImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: {
    message?: string;
    code?: string;
  };
};

const memoryCache = new Map<string, string>();

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function isGptImageModel(model: string): boolean {
  return model.startsWith("gpt-image");
}

function sizesFor(model: string): string[] {
  if (model.startsWith("dall-e-2")) {
    return ["1024x1024"];
  }
  if (model.startsWith("dall-e")) {
    return ["1024x1792", "1024x1024"];
  }
  return ["1024x1536", "1024x1024"];
}

async function imageFromPayload(payload: ImageResponse): Promise<string> {
  const first = payload.data?.[0];
  if (first?.b64_json) {
    return first.b64_json;
  }

  if (first?.url) {
    const imageResponse = await fetch(first.url);
    if (!imageResponse.ok) {
      throw new Error("image-failed");
    }
    return Buffer.from(await imageResponse.arrayBuffer()).toString("base64");
  }

  throw new Error("image-failed");
}

async function requestImage(apiKey: string, model: string, prompt: string, size: string) {
  const body: Record<string, unknown> = {
    model,
    prompt,
    n: 1,
    size,
  };

  if (isGptImageModel(model)) {
    body.quality = "medium";
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as ImageResponse;
  return { ...payload, ok: response.ok, status: response.status };
}

export async function generateWishBackground(
  prompt: string,
  cacheKey: string,
  options?: { skipCache?: boolean },
): Promise<string> {
  if (!options?.skipCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const apiKey = process.env.AI_API_KEY?.trim();
  const provider = (process.env.AI_PROVIDER?.trim() || "openai").toLowerCase();
  const preferred = process.env.AI_IMAGE_MODEL?.trim() || "gpt-image-2";

  if (!apiKey) {
    throw new Error("missing-credentials");
  }

  if (provider !== "openai") {
    throw new Error("unsupported-provider");
  }

  const models = unique([preferred, "gpt-image-2", "gpt-image-1", "gpt-image-1-mini"]);
  let lastMessage = "";

  for (const model of models) {
    for (const size of sizesFor(model)) {
      const result = await requestImage(apiKey, model, prompt, size);
      if (result.ok) {
        const image = await imageFromPayload(result);
        memoryCache.set(cacheKey, image);
        return image;
      }

      lastMessage = result.error?.message ?? "";
      console.error("OpenAI image generation failed", {
        model,
        size,
        status: result.status,
        message: lastMessage,
      });

      const missingModel =
        result.status === 404 ||
        result.error?.code === "model_not_found" ||
        /does not exist|not have access|unknown model|deprecated/i.test(lastMessage);

      if (missingModel) {
        break;
      }

      if (/unknown parameter|invalid/i.test(lastMessage)) {
        continue;
      }
    }
  }

  throw new Error("image-failed");
}
