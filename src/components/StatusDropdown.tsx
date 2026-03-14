"use client";

import { useEffect, useRef } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { STATUS_COLOURS, STATUS_LABELS } from "@/lib/constants";
import type { Status } from "@/lib/validators";

const STATUSES: Status[] = ["idea", "in_progress", "launched", "shelved"];

interface StatusDropdownProps {
  currentStatus: Status;
  onSelect: (status: Status) => void;
  onClose: () => void;
}

/**
 * StatusDropdown — uses @headlessui/react Listbox for full keyboard support:
 *   Arrow keys navigate options, Enter/Space selects, Escape closes.
 *   ARIA roles (listbox / option) and aria-selected are provided automatically.
 *
 * The Listbox is rendered in "open" mode (static options) because the open/close
 * state is managed by IdeaRow. The invisible ListboxButton is still required so
 * HeadlessUI can anchor the options panel and manage keyboard events correctly.
 */
export function StatusDropdown({
  currentStatus,
  onSelect,
  onClose,
}: StatusDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={containerRef} className="absolute z-50" style={{ top: "100%", left: 0 }}>
      <Listbox
        value={currentStatus}
        onChange={(status: Status) => {
          onSelect(status);
        }}
      >
        {/* Hidden trigger — keyboard events are captured by ListboxButton;
            the real visual trigger is StatusBadge rendered by IdeaRow. */}
        <ListboxButton
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        >
          {STATUS_LABELS[currentStatus]}
        </ListboxButton>

        {/* static keeps the panel visible; we handle mount/unmount in IdeaRow */}
        <ListboxOptions
          static
          className="w-[160px] rounded-[8px] bg-surface border border-border-default shadow-md overflow-hidden focus:outline-none"
          aria-label="Select status"
        >
          {STATUSES.map((status) => {
            const label = STATUS_LABELS[status];
            const color = STATUS_COLOURS[status];

            return (
              <ListboxOption
                key={status}
                value={status}
                className={({ focus }: { focus: boolean }) =>
                  `flex items-center w-full px-3 py-2 text-[14px] text-text-primary gap-2 cursor-pointer transition-colors ${
                    focus ? "bg-[#F3F4F6]" : ""
                  }`
                }
              >
                {({ selected }: { selected: boolean }) => (
                  <>
                    {/* Colour dot */}
                    <span
                      className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-left">{label}</span>
                    {/* Checkmark for currently selected */}
                    {selected && (
                      <CheckIcon
                        className="w-4 h-4 text-primary flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
