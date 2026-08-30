import type { Metadata } from "next";
import Link from "next/link";
import AppLogo from "@/components/AppLogo";

export const metadata: Metadata = {
  title: "ఈ యాప్ గురించి | తెలుగు వాయిస్ రైటర్",
  description: "తెలుగు వాయిస్ రైటర్ ఎలా పనిచేస్తుందో తెలుసుకోండి.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <article className="rounded-3xl border border-orange-100 bg-white p-6 shadow-[0_12px_40px_rgba(194,65,12,0.08)] sm:p-8">
        <AppLogo size="md" />
        <h1 className="mt-4 text-3xl font-bold text-stone-900">ఈ యాప్ గురించి</h1>
        <p className="mt-4 text-base leading-relaxed text-stone-700">
          తెలుగు వాయిస్ రైటర్ మీ బ్రౌజర్‌లో తెలుగులో మాట్లాడినదాన్ని టెక్స్ట్గా మారుస్తుంది. టెక్స్ట్ను సరిచేసి, కాపీ చేసి WhatsApp, Gmail, Word లో పేస్ట్ చేయవచ్చు.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-stone-900">ఎలా ఉపయోగించాలి</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-700">
          <li>మైక్ నొక్కండి — తెలుగులో మాట్లాడండి.</li>
          <li>మైక్ మళ్లీ నొక్కండి — టెక్స్ట్ ఇక్కడ కనిపిస్తుంది.</li>
          <li>వాక్యం సరిచేయబడుతుంది. తప్పు ఉంటే టెక్స్ట్‌లో సరిచేయండి.</li>
          <li>వినండి నొక్కి సరిచేసిన టెక్స్ట్ వినండి.</li>
          <li>తెలుగు టెక్స్ట్ సరిచేయండి నొక్కి సరైన వాక్యంగా మార్చండి.</li>
        </ol>

        <h2 className="mt-8 text-xl font-semibold text-stone-900">గోప్యత</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-700">
          మీ ఆడియోను ఈ యాప్‌లో సేవ్ చేయము. ఆడియో ఫైళ్లను అప్‌లోడ్ చేయదు, మైక్ రికార్డింగ్లను దాచుకోండు.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-stone-900">బ్రౌజర్ మద్దతు</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-700">
          మాటలు గుర్తించడం Chromeలో బాగా పనిచేస్తుంది. మైక్ అనుమతి అవసరం. కొన్ని బ్రౌజర్లకి ఇంటర్నెట్ కూడవచ్చు.
        </p>

        <p className="mt-8">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            హోమ్‌కు వెళ్ళండి
          </Link>
        </p>
      </article>
    </main>
  );
}
