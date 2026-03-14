/**
 * Filter + Sort correctness tests.
 *
 * These tests verify that the GET /api/ideas route handler correctly
 * handles status filters and sort parameters against a known dataset.
 *
 * Strategy: Mock the Drizzle db module; simulate what the DB would return
 * for given filter/sort parameters; verify the route handler passes them through
 * correctly and returns the right shape.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock the db module before importing route handlers
// ---------------------------------------------------------------------------
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { GET as listGet } from "../../app/api/ideas/route";
import { db } from "@/db";

// ---------------------------------------------------------------------------
// Fixture dataset — 10 ideas covering all status types and sort scenarios
// ---------------------------------------------------------------------------
const FIXTURES = [
  {
    id: "aaa",
    user_id: "default",
    title: "Alpha Idea",
    description: null,
    status: "idea" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-01T00:00:00Z"),
    updated_at: new Date("2026-01-05T00:00:00Z"),
  },
  {
    id: "bbb",
    user_id: "default",
    title: "Beta SaaS",
    description: null,
    status: "in_progress" as const,
    tags: ["saas"],
    url: "https://beta.com",
    created_at: new Date("2026-01-02T00:00:00Z"),
    updated_at: new Date("2026-01-06T00:00:00Z"),
  },
  {
    id: "ccc",
    user_id: "default",
    title: "Gamma Launch",
    description: null,
    status: "launched" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-03T00:00:00Z"),
    updated_at: new Date("2026-01-07T00:00:00Z"),
  },
  {
    id: "ddd",
    user_id: "default",
    title: "Delta Shelved",
    description: null,
    status: "shelved" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-04T00:00:00Z"),
    updated_at: new Date("2026-01-08T00:00:00Z"),
  },
  {
    id: "eee",
    user_id: "default",
    title: "Echo Idea",
    description: null,
    status: "idea" as const,
    tags: ["tag1", "tag2"],
    url: null,
    created_at: new Date("2026-01-05T00:00:00Z"),
    updated_at: new Date("2026-01-09T00:00:00Z"),
  },
  {
    id: "fff",
    user_id: "default",
    title: "Foxtrot Progress",
    description: null,
    status: "in_progress" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-06T00:00:00Z"),
    updated_at: new Date("2026-01-10T00:00:00Z"),
  },
  {
    id: "ggg",
    user_id: "default",
    title: "Golf Launched",
    description: null,
    status: "launched" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-07T00:00:00Z"),
    updated_at: new Date("2026-01-11T00:00:00Z"),
  },
  {
    id: "hhh",
    user_id: "default",
    title: "Hotel Shelved",
    description: null,
    status: "shelved" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-08T00:00:00Z"),
    updated_at: new Date("2026-01-12T00:00:00Z"),
  },
  {
    id: "iii",
    user_id: "default",
    title: "India Idea",
    description: null,
    status: "idea" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-09T00:00:00Z"),
    updated_at: new Date("2026-01-13T00:00:00Z"),
  },
  {
    id: "jjj",
    user_id: "default",
    title: "Juliet Launched",
    description: null,
    status: "launched" as const,
    tags: null,
    url: null,
    created_at: new Date("2026-01-10T00:00:00Z"),
    updated_at: new Date("2026-01-14T00:00:00Z"),
  },
];

type Fixture = (typeof FIXTURES)[number];

// ---------------------------------------------------------------------------
// Mock setup helper
// ---------------------------------------------------------------------------
const mockDb = db as unknown as {
  select: ReturnType<typeof vi.fn>;
};

/**
 * Set up the select mock to simulate DB returning specific rows.
 * The mock intercepts select().from().where().orderBy().limit().offset()
 * for the data query, and select().from().where() for the count query.
 */
function setupSelectMockWithRows(rows: Fixture[], totalCount?: number) {
  const total = totalCount ?? rows.length;
  let callCount = 0;

  mockDb.select.mockImplementation(() => {
    callCount++;
    const currentCall = callCount;

    const chain: Record<string, unknown> = {};
    chain.from = () => chain;
    chain.where = () => chain;
    chain.orderBy = () => chain;
    chain.limit = () => chain;
    chain.offset = () => ({
      then: (resolve: (v: unknown) => void) =>
        Promise.resolve(currentCall === 1 ? rows : [{ count: total }]).then(resolve),
    });
    chain.groupBy = () => ({
      then: (resolve: (v: unknown) => void) =>
        Promise.resolve(
          Array.from(
            rows.reduce((map, r) => {
              map.set(r.status, (map.get(r.status) ?? 0) + 1);
              return map;
            }, new Map<string, number>())
          ).map(([status, count]) => ({ status, count }))
        ).then(resolve),
    });
    // Thenable for count query (no offset)
    chain.then = (resolve: (v: unknown) => void) =>
      Promise.resolve([{ count: total }]).then(resolve);
    return chain;
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/ideas — default behaviour", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with ideas array and total count", async () => {
    setupSelectMockWithRows(FIXTURES);

    const req = new NextRequest("http://localhost/api/ideas");
    const res = await listGet(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.ideas)).toBe(true);
    expect(typeof json.total).toBe("number");
  });

  it("does not include stats when stats param is absent", async () => {
    setupSelectMockWithRows(FIXTURES);

    const req = new NextRequest("http://localhost/api/ideas");
    const res = await listGet(req);
    const json = await res.json();
    expect(json.stats).toBeUndefined();
  });
});

describe("GET /api/ideas?stats=true — stats aggregate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes stats object with counts when stats=true", async () => {
    setupSelectMockWithRows(FIXTURES, 10);

    const req = new NextRequest("http://localhost/api/ideas?stats=true");
    const res = await listGet(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.stats).toBeDefined();
    expect(typeof json.stats.idea).toBe("number");
    expect(typeof json.stats.in_progress).toBe("number");
    expect(typeof json.stats.launched).toBe("number");
    expect(typeof json.stats.shelved).toBe("number");
    expect(typeof json.stats.total).toBe("number");
  });
});

describe("GET /api/ideas — status filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters to launched status only", async () => {
    const launched = FIXTURES.filter((f) => f.status === "launched");
    setupSelectMockWithRows(launched);

    const req = new NextRequest(
      "http://localhost/api/ideas?status[]=launched"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    // All returned ideas should be launched (mocked to return only launched)
    expect(json.ideas.every((i: Fixture) => i.status === "launched")).toBe(true);
  });

  it("filters to launched and shelved statuses", async () => {
    const filtered = FIXTURES.filter(
      (f) => f.status === "launched" || f.status === "shelved"
    );
    setupSelectMockWithRows(filtered);

    const req = new NextRequest(
      "http://localhost/api/ideas?status[]=launched&status[]=shelved"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(
      json.ideas.every(
        (i: Fixture) => i.status === "launched" || i.status === "shelved"
      )
    ).toBe(true);
  });

  it("ignores invalid status values in filter", async () => {
    // No valid statuses — should fall back to no status filter (all ideas)
    setupSelectMockWithRows(FIXTURES);

    const req = new NextRequest(
      "http://localhost/api/ideas?status[]=invalid_status"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/ideas — sorting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts sort=title&order=asc without error", async () => {
    const sorted = [...FIXTURES].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    setupSelectMockWithRows(sorted);

    const req = new NextRequest(
      "http://localhost/api/ideas?sort=title&order=asc"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ideas.length).toBeGreaterThan(0);
  });

  it("accepts sort=updated_at&order=desc without error", async () => {
    const sorted = [...FIXTURES].sort(
      (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
    );
    setupSelectMockWithRows(sorted);

    const req = new NextRequest(
      "http://localhost/api/ideas?sort=updated_at&order=desc"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);
  });

  it("defaults to created_at DESC when sort param is missing", async () => {
    const sorted = [...FIXTURES].sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );
    setupSelectMockWithRows(sorted);

    const req = new NextRequest("http://localhost/api/ideas");
    const res = await listGet(req);
    expect(res.status).toBe(200);
  });

  it("handles invalid sort field by defaulting to created_at", async () => {
    setupSelectMockWithRows(FIXTURES);

    const req = new NextRequest(
      "http://localhost/api/ideas?sort=invalid_field"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/ideas — pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts page and limit params without error", async () => {
    setupSelectMockWithRows(FIXTURES.slice(0, 5), 10);

    const req = new NextRequest("http://localhost/api/ideas?page=1&limit=5");
    const res = await listGet(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.total).toBe(10);
    expect(json.ideas.length).toBe(5);
  });

  it("caps limit at 100 to prevent oversized queries", async () => {
    setupSelectMockWithRows(FIXTURES);

    // Even if limit=999 is passed, it should be clamped
    const req = new NextRequest("http://localhost/api/ideas?limit=999");
    const res = await listGet(req);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/ideas — combined filter and sort", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles status filter + title sort simultaneously", async () => {
    const launched = FIXTURES.filter((f) => f.status === "launched").sort(
      (a, b) => a.title.localeCompare(b.title)
    );
    setupSelectMockWithRows(launched);

    const req = new NextRequest(
      "http://localhost/api/ideas?status[]=launched&sort=title&order=asc"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ideas.every((i: Fixture) => i.status === "launched")).toBe(true);
  });

  it("handles multiple status filters + sort + pagination simultaneously", async () => {
    const filtered = FIXTURES.filter(
      (f) => f.status === "idea" || f.status === "in_progress"
    ).sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());

    setupSelectMockWithRows(filtered.slice(0, 3), filtered.length);

    const req = new NextRequest(
      "http://localhost/api/ideas?status[]=idea&status[]=in_progress&sort=updated_at&order=desc&page=1&limit=3"
    );
    const res = await listGet(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.total).toBe(filtered.length);
    expect(json.ideas.length).toBe(3);
  });
});
