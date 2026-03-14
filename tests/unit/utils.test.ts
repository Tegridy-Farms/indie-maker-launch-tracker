import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatRelativeTime,
  serialiseTags,
  escapeCsvValue,
  buildCsvRow,
  ideaToCsvRow,
  CSV_HEADERS,
} from "../../src/lib/utils";

describe("formatDate", () => {
  it("formats a date correctly as MMM d, yyyy", () => {
    const date = new Date("2026-03-14T00:00:00Z");
    const result = formatDate(date);
    expect(result).toBe("Mar 14, 2026");
  });

  it("accepts a string date", () => {
    const result = formatDate("2026-01-01T00:00:00Z");
    expect(result).toBe("Jan 1, 2026");
  });

  it("formats different months correctly", () => {
    expect(formatDate(new Date("2026-12-31T00:00:00Z"))).toBe("Dec 31, 2026");
    expect(formatDate(new Date("2026-07-04T00:00:00Z"))).toBe("Jul 4, 2026");
  });
});

describe("formatRelativeTime", () => {
  it("returns a relative time string", () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toContain("ago");
  });

  it("accepts a string date", () => {
    const result = formatRelativeTime(new Date(Date.now() - 3600 * 1000).toISOString());
    expect(result).toContain("ago");
  });
});

describe("serialiseTags", () => {
  it("joins tags with pipe separator", () => {
    expect(serialiseTags(["tag1", "tag2", "tag3"])).toBe("tag1|tag2|tag3");
  });

  it("returns empty string for empty array", () => {
    expect(serialiseTags([])).toBe("");
  });

  it("returns empty string for null", () => {
    expect(serialiseTags(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(serialiseTags(undefined)).toBe("");
  });

  it("handles single tag", () => {
    expect(serialiseTags(["only"])).toBe("only");
  });
});

describe("escapeCsvValue", () => {
  it("returns value unchanged when no special chars", () => {
    expect(escapeCsvValue("hello world")).toBe("hello world");
  });

  it("wraps in quotes when value contains comma", () => {
    expect(escapeCsvValue("hello, world")).toBe('"hello, world"');
  });

  it("wraps in quotes and escapes internal double quotes", () => {
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps in quotes when value contains newline", () => {
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
  });

  it("returns empty string for null", () => {
    expect(escapeCsvValue(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeCsvValue(undefined)).toBe("");
  });
});

describe("buildCsvRow", () => {
  it("joins values with comma", () => {
    expect(buildCsvRow(["a", "b", "c"])).toBe("a,b,c");
  });

  it("escapes values containing commas", () => {
    expect(buildCsvRow(["hello, world", "foo"])).toBe('"hello, world",foo');
  });

  it("handles null values as empty strings", () => {
    expect(buildCsvRow(["a", null, "c"])).toBe("a,,c");
  });
});

describe("CSV_HEADERS", () => {
  it("contains all 7 required fields", () => {
    const fields = CSV_HEADERS.split(",");
    expect(fields).toContain("title");
    expect(fields).toContain("description");
    expect(fields).toContain("status");
    expect(fields).toContain("tags");
    expect(fields).toContain("url");
    expect(fields).toContain("created_at");
    expect(fields).toContain("updated_at");
    expect(fields).toHaveLength(7);
  });
});

describe("ideaToCsvRow", () => {
  it("converts an idea to a CSV row string", () => {
    const idea = {
      title: "My Idea",
      description: "A description",
      status: "idea",
      tags: ["tag1", "tag2"],
      url: "https://example.com",
      created_at: new Date("2026-03-14T10:00:00Z"),
      updated_at: new Date("2026-03-14T11:00:00Z"),
    };
    const row = ideaToCsvRow(idea);
    expect(row).toContain("My Idea");
    expect(row).toContain("A description");
    expect(row).toContain("idea");
    expect(row).toContain("tag1|tag2");
    expect(row).toContain("https://example.com");
    expect(row).toContain("2026-03-14T10:00:00.000Z");
  });

  it("handles null optional fields", () => {
    const idea = {
      title: "Minimal Idea",
      description: null,
      status: "launched",
      tags: null,
      url: null,
      created_at: new Date("2026-03-14T10:00:00Z"),
      updated_at: new Date("2026-03-14T10:00:00Z"),
    };
    const row = ideaToCsvRow(idea);
    expect(row).toContain("Minimal Idea");
    expect(row).toContain("launched");
  });
});
