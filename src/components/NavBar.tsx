"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavBarProps {
  onNewIdea?: () => void;
}

export function NavBar({ onNewIdea }: NavBarProps) {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const isIdeas = pathname === "/ideas";

  return (
    <header className="bg-surface border-b border-border-default h-14 sticky top-0 z-10">
      <div className="flex items-center justify-between w-full max-w-[1024px] mx-auto px-6 h-full">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-primary font-semibold text-[16px] hover:opacity-80 transition-opacity"
        >
          Launch Tracker
        </Link>

        {/* Desktop Nav links */}
        <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6">
          <Link
            href="/dashboard"
            aria-current={isDashboard ? "page" : undefined}
            className={`text-[14px] transition-colors relative ${
              isDashboard
                ? "text-text-primary font-medium after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/ideas"
            aria-current={isIdeas ? "page" : undefined}
            className={`text-[14px] transition-colors relative ${
              isIdeas
                ? "text-text-primary font-medium after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Ideas
          </Link>
        </nav>

        {/* New Idea button (placeholder — wired up in Stage 6) */}
        <button
          type="button"
          onClick={onNewIdea}
          className="bg-primary hover:bg-primary-hover text-white text-[14px] font-medium py-2 px-4 rounded-lg transition-colors hidden sm:block"
        >
          New Idea
        </button>

        {/* Mobile nav */}
        <nav aria-label="Mobile navigation" className="sm:hidden flex items-center gap-4">
          <Link
            href="/dashboard"
            aria-current={isDashboard ? "page" : undefined}
            className={`text-[12px] font-medium transition-colors ${
              isDashboard ? "text-primary" : "text-text-secondary"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/ideas"
            aria-current={isIdeas ? "page" : undefined}
            className={`text-[12px] font-medium transition-colors ${
              isIdeas ? "text-primary" : "text-text-secondary"
            }`}
          >
            Ideas
          </Link>
        </nav>
      </div>
    </header>
  );
}
