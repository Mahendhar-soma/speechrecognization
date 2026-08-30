import type { Metadata, Viewport } from "next";
import { Noto_Sans_Telugu } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://telugu-speech-to-text.vercel.app"),
  title: "తెలుగు వాయిస్ రైటర్ - Telugu Speech to Text",
  description: "తెలుగులో మాట్లాడి సులభంగా తెలుగు టెక్స్ట్‌గా మార్చుకోండి.",
  applicationName: "తెలుగు వాయిస్ రైటర్",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "తెలుగు వాయిస్ రైటర్",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.webp", type: "image/webp" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="te" className={`${notoSansTelugu.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#fff6eb] text-stone-900">
        <PwaRegister />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
