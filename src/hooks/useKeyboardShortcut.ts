"use client";

import { useEffect, useCallback } from "react";

/**
 * useKeyboardShortcut — fires a callback when a key is pressed,
 * but ONLY when the active element is not an input, textarea, or
 * contenteditable element (i.e., the user is not typing).
 *
 * @param key        The key to listen for (compared case-insensitively).
 * @param callback   The function to call when the shortcut fires.
 * @param enabled    Whether the shortcut is active (default: true).
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  enabled = true
): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore when modifier keys are held
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Only fire when the pressed key matches (case-insensitive)
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      // Do NOT fire when focus is inside an editable element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName?.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      callback();
    },
    [key, callback, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
