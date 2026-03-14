import { describe, it, expect } from "vitest";
import { CreateIdeaSchema, PatchStatusSchema, UpdateIdeaSchema } from "../../src/lib/validators";

describe("CreateIdeaSchema", () => {
  it("passes with minimum valid input", () => {
    const result = CreateIdeaSchema.parse({ title: "x", status: "idea" });
    expect(result.title).toBe("x");
    expect(result.status).toBe("idea");
  });

  it("throws when title is empty", () => {
    expect(() => CreateIdeaSchema.parse({ title: "", status: "idea" })).toThrow();
  });

  it("throws when title exceeds 120 characters", () => {
    expect(() =>
      CreateIdeaSchema.parse({ title: "x".repeat(121), status: "idea" })
    ).toThrow();
  });

  it("passes with title exactly 120 characters", () => {
    const result = CreateIdeaSchema.parse({
      title: "x".repeat(120),
      status: "idea",
    });
    expect(result.title.length).toBe(120);
  });

  it("passes with all optional fields populated", () => {
    const result = CreateIdeaSchema.parse({
      title: "My SaaS idea",
      description: "A great idea",
      status: "in_progress",
      tags: ["tag1", "tag2"],
      url: "https://example.com",
    });
    expect(result.tags).toEqual(["tag1", "tag2"]);
    expect(result.url).toBe("https://example.com");
  });

  it("throws when status is invalid", () => {
    expect(() =>
      CreateIdeaSchema.parse({ title: "test", status: "invalid_status" as never })
    ).toThrow();
  });

  it("accepts all valid status values", () => {
    const statuses = ["idea", "in_progress", "launched", "shelved"] as const;
    for (const status of statuses) {
      expect(() => CreateIdeaSchema.parse({ title: "test", status })).not.toThrow();
    }
  });

  it("throws when more than 5 tags are provided", () => {
    expect(() =>
      CreateIdeaSchema.parse({
        title: "test",
        status: "idea",
        tags: ["a", "b", "c", "d", "e", "f"],
      })
    ).toThrow();
  });

  it("passes with exactly 5 tags", () => {
    const result = CreateIdeaSchema.parse({
      title: "test",
      status: "idea",
      tags: ["a", "b", "c", "d", "e"],
    });
    expect(result.tags).toHaveLength(5);
  });

  it("throws when a tag exceeds 50 characters", () => {
    expect(() =>
      CreateIdeaSchema.parse({
        title: "test",
        status: "idea",
        tags: ["x".repeat(51)],
      })
    ).toThrow();
  });

  it("throws when URL is invalid format", () => {
    expect(() =>
      CreateIdeaSchema.parse({
        title: "test",
        status: "idea",
        url: "not-a-url",
      })
    ).toThrow();
  });

  it("passes with empty string URL (optional URL allowed to be empty)", () => {
    expect(() =>
      CreateIdeaSchema.parse({ title: "test", status: "idea", url: "" })
    ).not.toThrow();
  });

  it("throws when description exceeds 2000 characters", () => {
    expect(() =>
      CreateIdeaSchema.parse({
        title: "test",
        status: "idea",
        description: "x".repeat(2001),
      })
    ).toThrow();
  });

  it("passes with description exactly 2000 characters", () => {
    const result = CreateIdeaSchema.parse({
      title: "test",
      status: "idea",
      description: "x".repeat(2000),
    });
    expect(result.description?.length).toBe(2000);
  });

  it("passes without optional fields", () => {
    const result = CreateIdeaSchema.parse({ title: "test", status: "idea" });
    expect(result.description).toBeUndefined();
    expect(result.tags).toBeUndefined();
    expect(result.url).toBeUndefined();
  });
});

describe("PatchStatusSchema", () => {
  it("passes with a valid status", () => {
    const result = PatchStatusSchema.parse({ status: "launched" });
    expect(result.status).toBe("launched");
  });

  it("throws with an invalid status", () => {
    expect(() =>
      PatchStatusSchema.parse({ status: "unknown" as never })
    ).toThrow();
  });

  it("throws with empty object", () => {
    expect(() => PatchStatusSchema.parse({})).toThrow();
  });
});

describe("UpdateIdeaSchema", () => {
  it("is identical in shape to CreateIdeaSchema", () => {
    // Both should validate the same input
    const input = { title: "Updated title", status: "in_progress" as const };
    const createResult = CreateIdeaSchema.parse(input);
    const updateResult = UpdateIdeaSchema.parse(input);
    expect(createResult).toEqual(updateResult);
  });

  it("throws when title is empty", () => {
    expect(() =>
      UpdateIdeaSchema.parse({ title: "", status: "idea" })
    ).toThrow();
  });
});
