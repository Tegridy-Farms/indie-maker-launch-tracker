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
    size === "sm" ? "text-[12px] py-0.5 px-2" : "text-[12px] py-1 px-3";

  if (interactive) {
    return (
      <button
        type="button"
        role="button"
        aria-label={`Change status: ${label}`}
        aria-expanded={undefined}
        onClick={onClick}
        className={`relative inline-flex items-center gap-1.5 rounded-full font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${sizeClasses}`}
        style={{ backgroundColor: bgColor }}
      >
        {/* Spinner ring during in-flight request */}
        {isLoading && (
          <span
            className="absolute -inset-[2px] rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: bgColor,
              borderRightColor: bgColor,
              opacity: 0.6,
            }}
            aria-hidden="true"
          />
        )}
        {isLoading && (
          <span
            className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        )}
        <span>{label}</span>
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
