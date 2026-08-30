"use client";

import { useEffect, useState } from "react";
import {
  buildWhatsAppUrl,
  formatWhatsAppNumber,
  loadLastWhatsAppNumber,
  loadWhatsAppContacts,
  normalizeWhatsAppNumber,
  saveLastWhatsAppNumber,
  saveWhatsAppContacts,
  type WhatsAppContact,
} from "@/lib/whatsapp";

type WhatsAppShareProps = {
  text: string;
};

const INVALID_NUMBER = "సరైన నంబర్ ఇవ్వండి. ఉదా: 9876543210";

export default function WhatsAppShare({ text }: WhatsAppShareProps) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNumber(loadLastWhatsAppNumber());
    setContacts(loadWhatsAppContacts());
    setReady(true);
  }, []);

  function sendToWhatsApp(rawNumber: string) {
    const value = text.trim();
    const phone = normalizeWhatsAppNumber(rawNumber);
    if (!value || !phone) {
      setError(INVALID_NUMBER);
      return;
    }

    setError("");
    saveLastWhatsAppNumber(rawNumber.trim());

    const url = buildWhatsAppUrl(phone, value);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = url;
    }
  }

  function handleSend() {
    sendToWhatsApp(number);
  }

  function handleSave() {
    const phone = normalizeWhatsAppNumber(number);
    if (!phone) {
      setError(INVALID_NUMBER);
      return;
    }

    setError("");
    const label = name.trim();
    const next: WhatsAppContact[] = [
      { id: `${phone}-${Date.now()}`, name: label, phone },
      ...contacts.filter((contact) => contact.phone !== phone),
    ].slice(0, 8);

    setContacts(next);
    saveWhatsAppContacts(next);
    saveLastWhatsAppNumber(number.trim());
    setName("");
  }

  function handleRemove(id: string) {
    const next = contacts.filter((contact) => contact.id !== id);
    setContacts(next);
    saveWhatsAppContacts(next);
  }

  if (!ready) {
    return null;
  }

  return (
    <form
      className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 sm:p-4"
      onSubmit={(event) => {
        event.preventDefault();
        handleSend();
      }}
    >
      <p className="text-sm font-semibold text-stone-900">WhatsApp నంబర్కి పంపండి</p>
      <p className="mt-1 text-xs text-stone-500">సేవ్ చేసిన నంబర్ను ఎంచుకోండి. తర్వాత ఒక నొక్కి పంపవచ్చు.</p>

      {contacts.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {contacts.map((contact) => (
            <span
              key={contact.id}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white pl-1"
            >
              <button
                type="button"
                onClick={() => {
                  setNumber(contact.phone);
                  sendToWhatsApp(contact.phone);
                }}
                className="rounded-full px-2.5 py-1.5 text-left text-sm font-medium text-emerald-900 outline-none hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {contact.name || formatWhatsAppNumber(contact.phone)}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(contact.id)}
                aria-label="నంబర్ తొలగించండి"
                className="mr-1 rounded-full px-1.5 text-sm text-stone-400 outline-none hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                x
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_8rem]">
        <label className="block">
          <span className="sr-only">ఫోన్ నంబర్</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={number}
            onChange={(event) => {
              setNumber(event.target.value);
              setError("");
            }}
            placeholder="+91 98765 43210"
            className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-base text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
        <label className="block">
          <span className="sr-only">పేరు</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="పేరు (అమ్మ, నాన్న)"
            className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-base text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 outline-none transition hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          సేవ్ చేయండి
        </button>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-medium text-white outline-none transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          WhatsApp లో పంపండి
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-center text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
