import {
  DEFAULT_NOTICE_STYLE,
  DEFAULT_WISH_STYLE,
  type CardTextStyle,
  type ShareCardKind,
} from "@/lib/shareCard";

export type WishTheme = {
  id: string;
  label: string;
  prompt: string;
  style: CardTextStyle;
};

type ThemeRule = {
  id: string;
  label: string;
  keywords: string[];
  scene: string;
  avoid: string;
  style: CardTextStyle;
};

function overlayHint(style: CardTextStyle): string {
  const full = "Full uncropped vertical 3:4 artwork. Keep the main subject fully visible.";
  const noText = "Absolutely no text, letters, numbers, watermark, logo, or caption in the image.";
  if (style.placement === "top") {
    return `${full} Soft empty sky or open space in the top fifth for a title overlay. Main subject in the middle and lower half. ${noText}`;
  }
  if (style.placement === "center") {
    return `${full} Soft open area through the middle for overlay text. Main subject stays clear above and below. ${noText}`;
  }
  return `${full} Soft open space in the bottom fifth for overlay text. Main subject in the upper two-thirds. ${noText}`;
}

function uniqueLook(id: string, label: string): string {
  return `This card is ONLY for ${label} (${id}). Make the scene instantly recognizable as ${label}. Do not use a generic Indian gold-marigold temple poster. Do not copy Bathukamma, Bonalu, Diwali, or birthday party visuals unless this theme is that event.`;
}

const THEMES: ThemeRule[] = [
  {
    id: "bathukamma",
    label: "బతుకమ్మ",
    keywords: ["బతుకమ్మ", "bathukamma", "batukamma", "saddula"],
    scene:
      "Photorealistic Telangana Bathukamma: a tall layered conical tower of yellow tangedu, marigold, chrysanthemum and pumpkin flowers standing in a village pond at dusk, women in distinctive Telangana silk sarees around the flowers, water reflections, dusk magenta sky",
    avoid:
      "No birthday cake, balloons, candles, gifts, temple gopuram, brass Bonalu pot, kites, or Christmas lights.",
    style: {
      titleFill: "#fff1b8",
      bodyFill: "#fff7ed",
      stroke: "#7c2d12",
      accent: "#fb7185",
      fallbackFrom: "#9a3412",
      fallbackTo: "#be185d",
      light: false,
      placement: "top",
      align: "center",
      frame: "floral",
    },
  },
  {
    id: "bonalu",
    label: "బోనాలు",
    keywords: ["బోనాలు", "bonalu", "పోచమ్మ", "pochamma", "యెల్లమ్మ", "yellamma", "మైసమ్మ", "maisamma"],
    scene:
      "Photorealistic Telangana Bonalu temple courtyard: a brass Bonam pot filled with cooked rice, topped with neem leaves and turmeric, carried toward a village goddess shrine with vermillion, torches, and stone temple walls, hot saffron daylight",
    avoid:
      "No Bathukamma flower tower, no birthday cake, balloons, kites, pond floral stack, or Christmas tree.",
    style: {
      titleFill: "#fde68a",
      bodyFill: "#fff7ed",
      stroke: "#431407",
      accent: "#f59e0b",
      fallbackFrom: "#7c2d12",
      fallbackTo: "#c2410c",
      light: false,
      placement: "top",
      align: "center",
      frame: "temple",
    },
  },
  {
    id: "ganesh",
    label: "వినాయక చవితి",
    keywords: ["వినాయక", "గణేశ", "గణపతి", "చవితి", "ganesh", "vinayaka", "ganapathi"],
    scene:
      "Close photorealistic Lord Ganesha clay idol on a home shrine: orange sindoor, modak sweets, banana leaves, hibiscus, brass bells, indoor puja lighting, elephant-headed idol as the clear center subject",
    avoid:
      "No cake, balloons, Bathukamma flowers, Bonalu pot, kites, or fireworks.",
    style: {
      titleFill: "#fde68a",
      bodyFill: "#fff7ed",
      stroke: "#7c2d12",
      accent: "#ea580c",
      fallbackFrom: "#9a3412",
      fallbackTo: "#c2410c",
      light: false,
      placement: "top",
      align: "center",
      frame: "temple",
    },
  },
  {
    id: "ugadi",
    label: "ఉగాది",
    keywords: ["ఉగాది", "ugadi", "yugadi"],
    scene:
      "Bright morning Telugu Ugadi: mango-leaf thoranam over a doorway, bowls of ugadi pachadi with neem, jaggery, tamarind and mango, a brass kalasham, fresh green daylight, no night lamps",
    avoid:
      "No birthday party, cake, balloons, Bathukamma tower, kites, or dark temple night.",
    style: {
      titleFill: "#fef9c3",
      bodyFill: "#ecfccb",
      stroke: "#14532d",
      accent: "#84cc16",
      fallbackFrom: "#14532d",
      fallbackTo: "#166534",
      light: false,
      placement: "center",
      align: "center",
      frame: "leaf",
    },
  },
  {
    id: "sankranti",
    label: "సంక్రాంతి",
    keywords: ["సంక్రాంతి", "పొంగల్", "sankranti", "sankranthi", "pongal", "గాలిపటం"],
    scene:
      "Bright noon Sankranti harvest: many colorful paper kites filling a huge blue sky, sugarcane bundles and rangoli in a rural courtyard below, cows, hay, hard daylight, no indoor puja",
    avoid:
      "No cake, balloons, Bathukamma flowers, night diyas, or Christmas tree.",
    style: {
      titleFill: "#fff7ed",
      bodyFill: "#ffedd5",
      stroke: "#9a3412",
      accent: "#38bdf8",
      fallbackFrom: "#0369a1",
      fallbackTo: "#c2410c",
      light: false,
      placement: "bottom",
      align: "center",
      frame: "leaf",
    },
  },
  {
    id: "dasara",
    label: "దసరా",
    keywords: ["దసరా", "విజయదశమి", "dasara", "dussehra", "vijayadashami"],
    scene:
      "Royal Dasara: a South Indian palace gopuram and gold umbrella, red-and-gold royal procession mood, marigold only as palace decoration, grand stone architecture",
    avoid:
      "No birthday cake, balloons, Bathukamma pond, kites, or Christmas lights.",
    style: {
      titleFill: "#fef3c7",
      bodyFill: "#fff7ed",
      stroke: "#7f1d1d",
      accent: "#facc15",
      fallbackFrom: "#7f1d1d",
      fallbackTo: "#b45309",
      light: false,
      placement: "top",
      align: "center",
      frame: "temple",
    },
  },
  {
    id: "diwali",
    label: "దీపావళి",
    keywords: ["దీపావళి", "దివాలీ", "diwali", "deepavali"],
    scene:
      "Night Diwali: hundreds of clay diyas in rows on a dark terrace, gold rangoli, distant fireworks in a black-blue sky, warm lamp glow, no daytime courtyard",
    avoid:
      "No cake, balloons, Bathukamma flowers, Bonalu pot, kites, or Christmas tree.",
    style: {
      titleFill: "#fde047",
      bodyFill: "#fffbeb",
      stroke: "#431407",
      accent: "#f59e0b",
      fallbackFrom: "#1c1917",
      fallbackTo: "#9a3412",
      light: false,
      placement: "center",
      align: "center",
      frame: "sparkle",
    },
  },
  {
    id: "holi",
    label: "హోలీ",
    keywords: ["హోలీ", "holi"],
    scene:
      "Daylight Holi: clouds of pink, blue, yellow and purple color powder exploding in air in a courtyard, people celebrating with colored powder, vivid saturated colors, no gold temple look",
    avoid:
      "No cake, balloons, diyas, Bathukamma flower tower, or Christmas tree.",
    style: {
      titleFill: "#ffffff",
      bodyFill: "#fdf4ff",
      stroke: "#6b21a8",
      accent: "#e879f9",
      fallbackFrom: "#db2777",
      fallbackTo: "#7c3aed",
      light: false,
      placement: "center",
      align: "center",
      frame: "floral",
    },
  },
  {
    id: "eid",
    label: "రంజాన్",
    keywords: ["రంజాన్", "ఈద్", "ramzan", "ramadan", "eid"],
    scene:
      "Peaceful Eid night: large crescent moon, hanging gold-green lanterns, mosque silhouette, starry teal sky, no Hindu temple motifs",
    avoid:
      "No cake, balloons, diyas, Bathukamma, Bonalu, kites, or Christmas tree.",
    style: {
      titleFill: "#fde68a",
      bodyFill: "#ecfdf5",
      stroke: "#064e3b",
      accent: "#34d399",
      fallbackFrom: "#064e3b",
      fallbackTo: "#115e59",
      light: false,
      placement: "bottom",
      align: "center",
      frame: "lantern",
    },
  },
  {
    id: "christmas",
    label: "క్రిస్మస్",
    keywords: ["క్రిస్మస్", "christmas"],
    scene:
      "Christmas night: decorated evergreen tree with red gold ornaments, wrapped gifts, warm fairy lights, snow-like sparkle, indoor holiday living room, no Indian temple",
    avoid:
      "No Bathukamma, Bonalu, diyas, kites, marigold garlands, or birthday cake.",
    style: {
      titleFill: "#fef3c7",
      bodyFill: "#fff7ed",
      stroke: "#14532d",
      accent: "#fca5a5",
      fallbackFrom: "#14532d",
      fallbackTo: "#7f1d1d",
      light: false,
      placement: "center",
      align: "center",
      frame: "sparkle",
    },
  },
  {
    id: "newyear",
    label: "నూతన సంవత్సరం",
    keywords: ["నూతన సంవత్సరం", "కొత్త సంవత్సరం", "new year", "newyear"],
    scene:
      "Midnight New Year city: purple-gold fireworks over a skyline, champagne-glass sparkle mood, modern night celebration, no temple and no village festival",
    avoid:
      "No Bathukamma, Bonalu, diyas, cake with candles as the main subject, or Christmas tree.",
    style: {
      titleFill: "#fde68a",
      bodyFill: "#f5f3ff",
      stroke: "#1e1b4b",
      accent: "#a78bfa",
      fallbackFrom: "#1e1b4b",
      fallbackTo: "#6d28d9",
      light: false,
      placement: "center",
      align: "center",
      frame: "sparkle",
    },
  },
  {
    id: "birthday",
    label: "పుట్టినరోజు",
    keywords: ["పుట్టినరోజు", "పుట్టిన రోజు", "birthday", "జన్మదిన", "బర్త్ డే", "బర్తుడే", "happy birthday"],
    scene:
      "Modern birthday party card: a decorated birthday cake with candles, pastel balloons in pink mint and gold, streamers, gift boxes, confetti, bright indoor party lighting, cheerful celebration table, photorealistic party photography",
    avoid:
      "No temple, no diyas, no marigold religious garlands, no Bathukamma flower tower, no Bonalu brass pot, no village festival, no gopuram, no oil lamps as the main subject.",
    style: {
      titleFill: "#9f1239",
      bodyFill: "#4c0519",
      stroke: "#fff1f2",
      accent: "#fb7185",
      fallbackFrom: "#fda4af",
      fallbackTo: "#fce7f3",
      light: true,
      placement: "top",
      align: "center",
      frame: "ribbon",
    },
  },
  {
    id: "wedding",
    label: "వివాహం",
    keywords: ["పెళ్లి", "పెళ్ళి", "వివాహ", "wedding", "marriage"],
    scene:
      "South Indian wedding mandap: cream and rose silk drapes, jasmine strings, gold jewelry still-life, turmeric and kumkum plates, wedding thali, soft daylight, romantic wedding photography, no party balloons",
    avoid:
      "No birthday cake, balloons, Bathukamma pond, Bonalu pot, kites, or Christmas tree.",
    style: {
      titleFill: "#fff1f2",
      bodyFill: "#fff7ed",
      stroke: "#7c2d12",
      accent: "#f5d0fe",
      fallbackFrom: "#7c2d12",
      fallbackTo: "#a21caf",
      light: false,
      placement: "center",
      align: "center",
      frame: "floral",
    },
  },
  {
    id: "housewarming",
    label: "గృహప్రవేశం",
    keywords: ["గృహప్రవేశం", "గృహ ప్రవేశం", "housewarming"],
    scene:
      "Housewarming doorway in daylight: rangoli on the threshold, mango-leaf thoranam, brass kalasham with coconut, new home entrance, warm cream walls, no night temple",
    avoid:
      "No birthday cake, balloons, Bathukamma tower, kites, or fireworks.",
    style: {
      titleFill: "#fef3c7",
      bodyFill: "#fff7ed",
      stroke: "#365314",
      accent: "#86efac",
      fallbackFrom: "#365314",
      fallbackTo: "#b45309",
      light: false,
      placement: "top",
      align: "center",
      frame: "leaf",
    },
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function includesKeyword(text: string, keyword: string): boolean {
  const key = keyword.trim();
  if (!key) {
    return false;
  }

  if (/^[a-z0-9 ]+$/i.test(key)) {
    const pattern = key.toLowerCase().replace(/\s+/g, "\\s+");
    return new RegExp(`(?:^|[^a-z0-9])${pattern}(?:$|[^a-z0-9])`, "i").test(text);
  }

  return normalize(text).includes(normalize(key));
}

function findTheme(text: string): ThemeRule | undefined {
  return THEMES.find((theme) => theme.keywords.some((keyword) => includesKeyword(text, keyword)));
}

function buildPrompt(kind: ShareCardKind, theme: ThemeRule, style: CardTextStyle): string {
  const kindLine =
    kind === "notice"
      ? "Print-ready vertical public-notice poster background."
      : "Vertical WhatsApp share card background.";
  return `${kindLine} ${uniqueLook(theme.id, theme.label)} ${theme.scene} ${theme.avoid} ${overlayHint(style)}`;
}

export function getWishTheme(text: string, kind: ShareCardKind): WishTheme {
  const matched = findTheme(text);

  if (matched) {
    const style =
      kind === "notice"
        ? {
            ...matched.style,
            titleFill: DEFAULT_NOTICE_STYLE.titleFill,
            bodyFill: DEFAULT_NOTICE_STYLE.bodyFill,
            stroke: DEFAULT_NOTICE_STYLE.stroke,
            light: true,
            placement: "center" as const,
          }
        : matched.style;
    return {
      id: matched.id,
      label: matched.label,
      prompt: buildPrompt(kind, matched, style),
      style,
    };
  }

  if (kind === "notice") {
    return {
      id: "notice",
      label: "నోటీసు",
      prompt: `Print-ready cream village notice background with a simple ornamental border. Not a birthday or festival photo. ${overlayHint(DEFAULT_NOTICE_STYLE)} Absolutely no text.`,
      style: DEFAULT_NOTICE_STYLE,
    };
  }

  if (kind === "wish") {
    return {
      id: "wish",
      label: "శుభాకాంక్షలు",
      prompt: `Warm generic Telugu greeting background with soft peach light and simple gold sparkle. Not a birthday cake, not Bathukamma, not a temple. ${overlayHint(DEFAULT_WISH_STYLE)} Absolutely no text.`,
      style: DEFAULT_WISH_STYLE,
    };
  }

  return {
    id: "plain",
    label: "సందేశం",
    prompt: `Simple elegant Indian message card, warm cream, decorative border. Not a festival or birthday scene. ${overlayHint(DEFAULT_NOTICE_STYLE)} Absolutely no text.`,
    style: DEFAULT_NOTICE_STYLE,
  };
}

export function cardHeadingFor(kind: ShareCardKind, theme: WishTheme): string {
  if (kind === "notice") {
    return "నోటీసు";
  }
  if (theme.id !== "wish" && theme.id !== "plain" && theme.id !== "notice") {
    return `${theme.label} శుభాకాంక్షలు`;
  }
  if (kind === "wish") {
    return "శుభాకాంక్షలు";
  }
  return "సందేశం";
}
