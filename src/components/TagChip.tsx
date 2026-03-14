"use client";

import { XMarkIcon } from "@heroicons/react/16/solid";

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  variant?: "display" | "removable";
}

export function TagChip({ label, onRemove, variant = "display" }: TagChipProps) {
  const isRemovable = variant === "removable" && onRemove;

  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-[6px] px-2 py-0.5 font-mono text-[12px] leading-[1.4] max-w-[96px]"
      style={{
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        color: "#8B5CF6",
      }}
    >
      <span className="truncate">{label}</span>
      {isRemovable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove tag ${label}`}
          className="flex-shrink-0 ml-0.5 hover:text-accent transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
        >
          <XMarkIcon className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
