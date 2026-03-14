"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";

interface ExportButtonProps {
  /**
   * Optional extra CSS classes to apply to the button (e.g. for mobile
   * placement in a filter sheet footer).
   */
  className?: string;
}

/**
 * ExportButton — triggers a CSV download from /api/ideas/export.
 *
 * Implements R-011.
 *
 * Uses a programmatic anchor-click approach so the browser treats the
 * response as a file download regardless of CORS / redirect constraints.
 * Shows a brief loading spinner after click; resets once the download
 * initiates (500 ms timeout as a safe default).
 */
export function ExportButton({ className = "" }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  function handleExport() {
    if (isLoading) return;

    setIsLoading(true);

    // Create a hidden <a> tag and click it — this is the most reliable
    // cross-browser way to trigger a download without navigating away.
    const anchor = document.createElement("a");
    anchor.href = "/api/ideas/export";
    anchor.download = "ideas.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Reset loading state after 500 ms (download stream has started by then).
    setTimeout(() => setIsLoading(false), 500);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isLoading}
      aria-label="Export all ideas to CSV"
      className={[
        // Ghost button base
        "inline-flex items-center gap-1.5",
        "px-3 py-1.5",
        "text-[14px] font-medium",
        "border border-border-default rounded-[8px]",
        "bg-surface text-text-secondary",
        "hover:border-primary hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        "transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? (
        /* Spinner — matches design bible loading indicator */
        <svg
          className="w-4 h-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" />
      )}
      Export CSV
    </button>
  );
}
