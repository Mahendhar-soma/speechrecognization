import { createSign } from "crypto";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

const TELUGU_VOICES = ["te-IN-Wavenet-A", "te-IN-Wavenet-B", "te-IN-Standard-A"] as const;

function getCredentials(): ServiceAccount {
  const raw = process.env.GOOGLE_CLOUD_CREDENTIALS_JSON;
  if (!raw) {
    throw new Error("missing-credentials");
  }

  const parsed = JSON.parse(raw) as ServiceAccount;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("invalid-credentials");
  }

  return parsed;
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const credentials = getCredentials();
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = toBase64Url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: credentials.token_uri || "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(credentials.private_key, "base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error("token-failed");
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("token-failed");
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function synthesizeWithVoice(
  text: string,
  accessToken: string,
  voiceName: string,
): Promise<string | null> {
  const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "te-IN",
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.92,
        pitch: 0,
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { audioContent?: string };
  return data.audioContent ?? null;
}

export async function synthesizeTeluguSpeech(text: string): Promise<Buffer> {
  const value = text.trim();
  if (!value) {
    throw new Error("empty-text");
  }

  if (value.length > 3000) {
    throw new Error("text-too-long");
  }

  const accessToken = await getAccessToken();

  for (const voiceName of TELUGU_VOICES) {
    const audioContent = await synthesizeWithVoice(value, accessToken, voiceName);
    if (audioContent) {
      return Buffer.from(audioContent, "base64");
    }
  }

  throw new Error("tts-failed");
}
