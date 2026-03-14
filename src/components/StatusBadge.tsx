"use client";

import { STATUS_COLOURS, STATUS_LABELS } from "@/lib/constants";
import type { Status } from "@/lib/validators";

interface StatusBadgeProps {
  status: Status;
  interactive?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
  isLoading?: boolean;
}

export function StatusBadge({
  status,
  interactive = false,
  size = "md",
  onClick,
  isLoading = false,
}: StatusBadgeProps) {
  const label = STATUS_LABELS[status];
  const bgColor = STATUS_COLOURS[status];

  const sizeClasses =
    size === "sm"
      ? "text-[12px] py-0.5 px-2"
      : "text-[12px] py-1 px-3";

  if (interactive) {
    return (
      <button
        type="button"
        role="button"
        aria-label={`Change status: ${label}`}
        onClick={onClick}
        className={`inline-flex items-center gap-1 rounded-full font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${sizeClasses} relative`}
        style={{ backgroundColor: bgColor }}
      >
        {isLoading && (
          <span
            className="absolute inset-0 rounded-full animate-pulse opacity-50"
            style={{ backgroundColor: bgColor }}
            aria-hidden="true"
          />
        )}
        <span className="relative">{label}</span>
      </button>
    );
  }

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses}`}
      style={{ backgroundColor: bgColor }}
    >
      {label}
    </span>
  );
}
