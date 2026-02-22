"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/plan", label: "Dashboard" },
  { href: "/history", label: "History" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-[#0a0a0a]/95 backdrop-blur" role="banner">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Main">
        <Link href="/plan" className="flex items-center gap-2" aria-label="GymBuddy AI dashboard">
          <LogoIcon className="h-8 w-8 text-accent" />
          <span className="text-xl font-bold text-white">GymBuddy AI</span>
        </Link>
        <div className="flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition ${pathname === href || (href === "/plan" && pathname?.startsWith("/plan")) ? "text-white font-medium" : "text-neutral-400 hover:text-white"}`}
            >
              {label}
            </Link>
          ))}
          <div className="h-8 w-8 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center" aria-hidden="true">
            <span className="text-xs text-neutral-400">You</span>
          </div>
        </div>
      </nav>
    </header>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M8 16h4v8H8v-8zm12 0h4v8h-4v-8zm-8-8h4v16h-4V8z"
        fill="currentColor"
      />
      <circle cx="16" cy="6" r="2" fill="currentColor" opacity={0.8} />
    </svg>
  );
}
