export type WhatsAppContact = {
  id: string;
  name: string;
  phone: string;
};

const LAST_NUMBER_KEY = "tvw-whatsapp-last-number";
const CONTACTS_KEY = "tvw-whatsapp-contacts";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeWhatsAppNumber(value: string): string | null {
  let digits = digitsOnly(value);
  if (!digits) {
    return null;
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  } else if (digits.length === 10) {
    digits = `91${digits}`;
  }

  if (digits.length < 11 || digits.length > 15) {
    return null;
  }

  return digits;
}

export function formatWhatsAppNumber(digits: string): string {
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }

  return `+${digits}`;
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function loadLastWhatsAppNumber(): string {
  try {
    return window.localStorage.getItem(LAST_NUMBER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveLastWhatsAppNumber(value: string): void {
  try {
    window.localStorage.setItem(LAST_NUMBER_KEY, value);
  } catch {
    // ignore
  }
}

export function loadWhatsAppContacts(): WhatsAppContact[] {
  try {
    const raw = window.localStorage.getItem(CONTACTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const contact = item as Partial<WhatsAppContact>;
        if (typeof contact.id !== "string" || typeof contact.phone !== "string") {
          return null;
        }

        return {
          id: contact.id,
          name: typeof contact.name === "string" ? contact.name : "",
          phone: contact.phone,
        };
      })
      .filter((item): item is WhatsAppContact => item !== null);
  } catch {
    return [];
  }
}

export function saveWhatsAppContacts(contacts: WhatsAppContact[]): void {
  try {
    window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch {
    // ignore
  }
}
