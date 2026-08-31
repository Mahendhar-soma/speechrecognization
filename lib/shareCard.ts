export type ShareCardKind = "notice" | "wish" | "plain";

export type CardPlacement = "top" | "center" | "bottom";
export type CardAlign = "center" | "left";
export type CardFrame = "ornate" | "floral" | "temple" | "leaf" | "lantern" | "sparkle" | "ribbon";

export type CardTextStyle = {
  titleFill: string;
  bodyFill: string;
  stroke: string;
  accent: string;
  fallbackFrom: string;
  fallbackTo: string;
  light: boolean;
  placement: CardPlacement;
  align: CardAlign;
  frame: CardFrame;
};

export const DEFAULT_WISH_STYLE: CardTextStyle = {
  titleFill: "#fde68a",
  bodyFill: "#fff7ed",
  stroke: "#431407",
  accent: "#fbbf24",
  fallbackFrom: "#7c2d12",
  fallbackTo: "#c2410c",
  light: false,
  placement: "top",
  align: "center",
  frame: "ornate",
};

export const DEFAULT_NOTICE_STYLE: CardTextStyle = {
  titleFill: "#7c2d12",
  bodyFill: "#1c1917",
  stroke: "#fff7ed",
  accent: "#d97706",
  fallbackFrom: "#fff7ed",
  fallbackTo: "#ffedd5",
  light: true,
  placement: "center",
  align: "center",
  frame: "ribbon",
};

const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1620;
const FALLBACK_WIDTH = 1080;
const FALLBACK_HEIGHT = 1350;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r/g, "").split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim() ? paragraph.trim().split(/\s+/) : [""];
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth) {
        current = next;
      } else {
        if (current) {
          lines.push(current);
        }
        current = word;
      }
    }

    lines.push(current);
  }

  return lines;
}

export function headingFor(kind: ShareCardKind): string {
  if (kind === "notice") {
    return "నోటీసు";
  }
  if (kind === "wish") {
    return "శుభాకాంక్షలు";
  }
  return "సందేశం";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("card-failed"));
    image.src = src;
  });
}

function sizeForImage(image: HTMLImageElement): { width: number; height: number } {
  const scale = Math.min(MAX_WIDTH / image.width, MAX_HEIGHT / image.height);
  return {
    width: Math.max(1, Math.round(image.width * scale)),
    height: Math.max(1, Math.round(image.height * scale)),
  };
}

function drawFallback(ctx: CanvasRenderingContext2D, width: number, height: number, style: CardTextStyle) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, style.fallbackFrom);
  gradient.addColorStop(0.55, style.fallbackTo);
  gradient.addColorStop(1, style.fallbackFrom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, style: CardTextStyle) {
  const accent = style.accent;
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;

  if (style.frame === "floral") {
    ctx.lineWidth = 18;
    ctx.strokeRect(28, 28, width - 56, height - 56);
    ctx.lineWidth = 4;
    ctx.strokeRect(52, 52, width - 104, height - 104);
    for (const [x, y] of [
      [40, 40],
      [width - 40, 40],
      [40, height - 40],
      [width - 40, height - 40],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = style.titleFill;
      ctx.fill();
      ctx.fillStyle = accent;
    }
    return;
  }

  if (style.frame === "temple") {
    ctx.lineWidth = 26;
    ctx.strokeRect(24, 24, width - 48, height - 48);
    ctx.lineWidth = 6;
    ctx.strokeRect(50, 50, width - 100, height - 100);
    ctx.lineWidth = 8;
    const arm = 70;
    for (const [x, y, dx, dy] of [
      [50, 50, 1, 1],
      [width - 50, 50, -1, 1],
      [50, height - 50, 1, -1],
      [width - 50, height - 50, -1, -1],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * arm);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * arm, y);
      ctx.stroke();
    }
    return;
  }

  if (style.frame === "leaf") {
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, width - 96, height - 96);
    for (const [x, y] of [
      [36, 36],
      [width - 36, 36],
      [36, height - 36],
      [width - 36, height - 36],
    ] as const) {
      ctx.beginPath();
      ctx.ellipse(x, y, 18, 10, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (style.frame === "lantern") {
    ctx.lineWidth = 10;
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, width - 104, height - 104);
    for (const [x, y] of [
      [36, 36],
      [width - 36, 36],
      [36, height - 36],
      [width - 36, height - 36],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x + 12, y);
      ctx.lineTo(x, y + 12);
      ctx.lineTo(x - 12, y);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  if (style.frame === "sparkle") {
    ctx.lineWidth = 8;
    ctx.strokeRect(34, 34, width - 68, height - 68);
    for (let i = 0; i < 18; i += 1) {
      const t = (i + 1) / 19;
      ctx.beginPath();
      ctx.arc(34 + (width - 68) * t, 34, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(34 + (width - 68) * t, height - 34, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (style.frame === "ribbon") {
    ctx.lineWidth = 16;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, width - 96, height - 96);
    return;
  }

  ctx.lineWidth = 22;
  ctx.strokeRect(32, 32, width - 64, height - 64);
  ctx.lineWidth = 5;
  ctx.strokeRect(56, 56, width - 112, height - 112);
  for (const [x, y] of [
    [44, 44],
    [width - 44, 44],
    [44, height - 44],
    [width - 44, height - 44],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawReadableWash(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: CardTextStyle,
) {
  const dark = style.light ? "rgba(255, 247, 237," : "rgba(20, 8, 4,";
  if (style.placement === "top") {
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.46);
    gradient.addColorStop(0, `${dark} 0.58)`);
    gradient.addColorStop(0.7, `${dark} 0.18)`);
    gradient.addColorStop(1, `${dark} 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height * 0.46);
    return;
  }

  if (style.placement === "center") {
    const gradient = ctx.createLinearGradient(0, height * 0.22, 0, height * 0.78);
    gradient.addColorStop(0, `${dark} 0)`);
    gradient.addColorStop(0.35, `${dark} 0.42)`);
    gradient.addColorStop(0.65, `${dark} 0.42)`);
    gradient.addColorStop(1, `${dark} 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height * 0.22, width, height * 0.56);
    return;
  }

  const gradient = ctx.createLinearGradient(0, height * 0.52, 0, height);
  gradient.addColorStop(0, `${dark} 0)`);
  gradient.addColorStop(0.45, `${dark} 0.22)`);
  gradient.addColorStop(1, `${dark} 0.55)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height * 0.52, width, height * 0.48);
}

function fontStack(): { title: string; body: string } {
  const sans =
    typeof document === "undefined"
      ? "sans-serif"
      : getComputedStyle(document.body).fontFamily || "sans-serif";
  const serifVar =
    typeof document === "undefined"
      ? ""
      : getComputedStyle(document.documentElement).getPropertyValue("--font-telugu-serif").trim();
  const serif = serifVar ? `${serifVar}, ${sans}` : sans;
  return { title: serif, body: sans };
}

function drawStrokedText(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  fill: string,
  stroke: string,
  width: number,
) {
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = width;
  ctx.strokeStyle = stroke;
  ctx.strokeText(value, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(value, x, y);
}

function drawFlourish(ctx: CanvasRenderingContext2D, x: number, y: number, accent: string, align: CardAlign) {
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 3;
  const left = align === "left" ? x : x - 200;
  const right = align === "left" ? x + 280 : x + 200;
  const mid = align === "left" ? x + 140 : x;

  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(mid - 22, y);
  ctx.moveTo(mid + 22, y);
  ctx.lineTo(right, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(mid, y - 9);
  ctx.lineTo(mid + 9, y);
  ctx.lineTo(mid, y + 9);
  ctx.lineTo(mid - 9, y);
  ctx.closePath();
  ctx.fill();
}

function splitCardText(text: string, heading: string): { title: string; body: string } {
  const paragraphs = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length > 1 && (paragraphs[0] === heading || paragraphs[0].includes(heading) || heading.includes(paragraphs[0]))) {
    return { title: paragraphs[0], body: paragraphs.slice(1).join("\n") };
  }

  return { title: heading, body: text };
}

function textOrigin(width: number, align: CardAlign, pad: number): number {
  return align === "left" ? pad : width / 2;
}

export async function renderShareCard(
  text: string,
  kind: ShareCardKind,
  backgroundSrc?: string,
  heading?: string,
  style?: CardTextStyle,
): Promise<Blob> {
  const value = text.trim();
  if (!value) {
    throw new Error("empty-text");
  }

  const cardStyle = style ?? (kind === "notice" || kind === "plain" ? DEFAULT_NOTICE_STYLE : DEFAULT_WISH_STYLE);

  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  let image: HTMLImageElement | null = null;
  if (backgroundSrc) {
    try {
      image = await loadImage(backgroundSrc);
    } catch {
      image = null;
    }
  }

  const size = image ? sizeForImage(image) : { width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("card-failed");
  }

  if (image) {
    ctx.drawImage(image, 0, 0, size.width, size.height);
  } else {
    drawFallback(ctx, size.width, size.height, cardStyle);
  }

  drawReadableWash(ctx, size.width, size.height, cardStyle);
  drawFrame(ctx, size.width, size.height, cardStyle);

  const fonts = fontStack();
  const titleText = heading?.trim() || headingFor(kind);
  const parts = splitCardText(value, titleText);
  const bodyText = parts.body.trim() === parts.title.trim() ? "" : parts.body;
  const pad = 96;
  const maxWidth = size.width - pad * 2;
  const titleSize = parts.title.length > 16 ? 42 : parts.title.length > 10 ? 52 : 60;
  const bodySize = bodyText.length > 220 ? 30 : bodyText.length > 120 ? 34 : 38;
  const lineHeight = bodySize + 14;
  const x = textOrigin(size.width, cardStyle.align, pad);

  ctx.textAlign = cardStyle.align;
  ctx.shadowColor = cardStyle.light ? "rgba(255, 247, 237, 0.7)" : "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  ctx.font = `700 ${titleSize}px ${fonts.title}`;
  const titleLines = wrapLines(ctx, parts.title, maxWidth).slice(0, 2);

  ctx.font = `600 ${bodySize}px ${fonts.body}`;
  const bodyLines = bodyText ? wrapLines(ctx, bodyText, maxWidth).slice(0, 10) : [];
  const blockHeight = titleLines.length * (titleSize + 8) + 40 + bodyLines.length * lineHeight;

  let startY = pad + titleSize;
  if (cardStyle.placement === "center") {
    startY = (size.height - blockHeight) / 2 + titleSize;
  } else if (cardStyle.placement === "bottom") {
    startY = size.height - pad - blockHeight + titleSize;
  }
  startY = Math.min(Math.max(startY, pad + titleSize), size.height - pad - 24);

  let y = startY;
  ctx.font = `700 ${titleSize}px ${fonts.title}`;
  for (const line of titleLines) {
    drawStrokedText(ctx, line, x, y, cardStyle.titleFill, cardStyle.stroke, 10);
    y += titleSize + 8;
  }

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  drawFlourish(ctx, x, y + 8, cardStyle.accent, cardStyle.align);
  y += 44;

  ctx.shadowColor = cardStyle.light ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.font = `600 ${bodySize}px ${fonts.body}`;
  for (const line of bodyLines) {
    drawStrokedText(ctx, line, x, y, cardStyle.bodyFill, cardStyle.stroke, 7);
    y += lineHeight;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("card-failed"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function shareCardImage(blob: Blob): Promise<void> {
  const file = new File([blob], "telugu-card.png", { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "telugu-card.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
