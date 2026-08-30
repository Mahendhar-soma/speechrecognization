"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "@/components/AppLogo";

const LINKS = [
  { href: "/", label: "హోమ్" },
  { href: "/about", label: "గురించి" },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-[#fff6eb]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-xl py-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <AppLogo size="sm" priority />
          <span className="truncate text-base font-semibold text-stone-900 sm:text-lg">
            తెలుగు వాయిస్ రైటర్
          </span>
        </Link>
        <nav aria-label="ప్రధాన నావిగేషన్" className="flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  isActive
                    ? "bg-orange-100 text-orange-900"
                    : "text-stone-600 hover:bg-orange-50 hover:text-orange-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
