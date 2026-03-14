import type { Status } from "./validators";

/**
 * Human-readable labels for each status value.
 */
export const STATUS_LABELS: Record<Status, string> = {
  idea: "Idea",
  in_progress: "In Progress",
  launched: "Launched",
  shelved: "Shelved",
};

/**
 * Tailwind CSS background colour classes for status badges.
 * Maps to the design palette colours.
 */
export const STATUS_COLOURS: Record<Status, string> = {
  idea: "#6B7280",
  in_progress: "#3B82F6",
  launched: "#10B981",
  shelved: "#F59E0B",
};

/**
 * Tailwind CSS class names for status badge backgrounds.
 */
export const STATUS_TAILWIND_BG: Record<Status, string> = {
  idea: "bg-status-idea",
  in_progress: "bg-status-in-progress",
  launched: "bg-status-launched",
  shelved: "bg-status-shelved",
};

/**
 * Tailwind CSS border-left colour classes for stat cards.
 */
export const STATUS_BORDER_COLOURS: Record<Status, string> = {
  idea: "border-l-[#6B7280]",
  in_progress: "border-l-[#3B82F6]",
  launched: "border-l-[#10B981]",
  shelved: "border-l-[#F59E0B]",
};

/**
 * Default pagination limit for idea list queries.
 */
export const DEFAULT_PAGE_LIMIT = 50;

/**
 * Maximum number of tags allowed per idea.
 */
export const MAX_TAGS = 5;

/**
 * Maximum title length.
 */
export const MAX_TITLE_LENGTH = 120;

/**
 * Maximum description length.
 */
export const MAX_DESCRIPTION_LENGTH = 2000;
