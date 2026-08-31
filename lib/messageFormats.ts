export type MessageFormat = "plain" | "notice" | "wish";

export function isMessageFormat(value: unknown): value is MessageFormat {
  return value === "plain" || value === "notice" || value === "wish";
}

export function formatHint(format: MessageFormat): string {
  if (format === "notice") {
    return [
      "Format this as a formal Telugu public notice.",
      "Keep all names, dates, times, places, and facts from the input.",
      "Use official notice style with a body, then a signature block like:",
      "ఇట్టు",
      "గ్రామ సర్పంచ్",
      "name and village, if present in the input.",
      "Do not invent a name, date, or village if it is not in the input.",
      "Return only the formatted Telugu notice.",
    ].join(" ");
  }

  if (format === "wish") {
    return [
      "Format this as a warm Telugu greeting or wish for WhatsApp.",
      "Keep the speaker meaning, names, and occasion such as Bathukamma, Bonalu, birthday, or festival if present.",
      "Make it polite and complete. Do not invent extra facts.",
      "Return only the Telugu wish text.",
    ].join(" ");
  }

  return "Language: Telugu only. Convert romanized or mixed Telugu speech into correct, meaningful Telugu sentences.";
}
