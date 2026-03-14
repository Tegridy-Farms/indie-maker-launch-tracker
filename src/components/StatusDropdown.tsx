"use client";

import { useEffect, useRef } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { STATUS_COLOURS, STATUS_LABELS } from "@/lib/constants";
import type { Status } from "@/lib/validators";

const STATUSES: Status[] = ["idea", "in_progress", "launched", "shelved"];

interface StatusDropdownProps {
  currentStatus: Status;
  onSelect: (status: Status) => void;
  onClose: () => void;
}

export function StatusDropdown({ currentStatus, onSelect, onClose }: StatusDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Select status"
      className="absolute z-50 mt-1 w-[160px] rounded-[8px] bg-surface border border-border-default shadow-md overflow-hidden"
      style={{ top: "100%", left: 0 }}
    >
      {STATUSES.map((status) => {
        const isSelected = status === currentStatus;
        const label = STATUS_LABELS[status];
        const color = STATUS_COLOURS[status];

        return (
          <button
            key={status}
            role="option"
            aria-selected={isSelected}
            type="button"
            onClick={() => {
              onSelect(status);
              onClose();
            }}
            className="flex items-center w-full px-3 py-2 text-[14px] text-text-primary hover:bg-[#F3F4F6] transition-colors gap-2 focus-visible:outline-none focus-visible:bg-[#F3F4F6]"
          >
            {/* Colour dot */}
            <span
              className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-left">{label}</span>
            {/* Checkmark for current */}
            {isSelected && (
              <CheckIcon
                className="w-4 h-4 text-primary flex-shrink-0"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
