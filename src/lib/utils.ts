import { format, formatDistanceToNow } from "date-fns";

/**
 * Formats a date as "MMM D, YYYY" (e.g. "Mar 14, 2026").
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Formats a date as a relative timestamp (e.g. "2 hours ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Serialises a tags array to a CSV-safe string.
 * Uses pipe | as separator to avoid conflicts with commas.
 * Handles null/undefined gracefully.
 */
export function serialiseTags(tags: string[] | null | undefined): string {
  if (!tags || tags.length === 0) return "";
  return tags.join("|");
}

/**
 * Escapes a value for CSV output.
 * Wraps in double quotes if it contains a comma, newline, or double-quote.
 * Double-quotes within the value are escaped as "".
 */
export function escapeCsvValue(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Escape double quotes
  const escaped = str.replace(/"/g, '""');
  // Wrap in quotes if the value contains commas, quotes, or newlines
  if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n") || escaped.includes("\r")) {
    return `"${escaped}"`;
  }
  return escaped;
}

/**
 * Builds a CSV row string from an array of values.
 */
export function buildCsvRow(values: (string | null | undefined)[]): string {
  return values.map(escapeCsvValue).join(",");
}

/**
 * CSV header row for idea exports.
 */
export const CSV_HEADERS = "title,description,status,tags,url,created_at,updated_at";

/**
 * Converts an idea object to a CSV row string.
 */
export function ideaToCsvRow(idea: {
  title: string;
  description: string | null | undefined;
  status: string;
  tags: string[] | null | undefined;
  url: string | null | undefined;
  created_at: Date;
  updated_at: Date;
}): string {
  return buildCsvRow([
    idea.title,
    idea.description,
    idea.status,
    serialiseTags(idea.tags),
    idea.url,
    idea.created_at.toISOString(),
    idea.updated_at.toISOString(),
  ]);
}
