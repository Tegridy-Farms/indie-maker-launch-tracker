/**
 * Integration tests for the /api/ideas Route Handlers.
 *
 * Strategy: We mock the `@/db` module so we don't hit a real database.
 * Each test sets up the mock return values and invokes the handler directly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock the Drizzle db module before importing route handlers
// ---------------------------------------------------------------------------
const mockReturning = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockOffset = vi.fn();
const mockGroupBy = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockValues = vi.fn();
const mockSet = vi.fn();

// Chain builder — returns itself for chaining, overridable per test
function makeChain(finalResult: unknown[]) {
  const chain: Record<string, unknown> = {};
  const fn = () => chain;
  chain.from = fn;
  chain.where = fn;
  chain.orderBy = fn;
  chain.limit = fn;
  chain.offset = fn;
  chain.groupBy = fn;
  chain.values = fn;
  chain.set = fn;
  chain.returning = () => Promise.resolve(finalResult);
  // Make the chain itself thenable (so await chain resolves to finalResult)
  chain.then = (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
    Promise.resolve(finalResult).then(resolve, reject);
  return chain;
}

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Import route handlers AFTER the mock is set up
// ---------------------------------------------------------------------------
import { GET as listGet, POST as createPost } from "../../app/api/ideas/route";
import {
  GET as singleGet,
  PATCH as patchIdea,
  PUT as putIdea,
  DELETE as deleteIdea,
} from "../../app/api/ideas/[id]/route";
import { GET as exportGet } from "../../app/api/ideas/export/route";
import { db } from "@/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockDb = db as unknown as {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

function makeRequest(
  method: string,
  url: string,
  body?: object
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

const SAMPLE_IDEA = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "default",
  title: "Test Idea",
  description: "A test description",
  status: "idea" as const,
  tags: ["tag1"],
  url: null,
  created_at: new Date("2026-03-14T10:00:00Z"),
  updated_at: new Date("2026-03-14T10:00:00Z"),
};

// ---------------------------------------------------------------------------
// Tests: POST /api/ideas
// ---------------------------------------------------------------------------
describe("POST /api/ideas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 with the created idea on valid input", async () => {
    // Mock insert().values().returning() chain
    mockDb.insert.mockReturnValue({
      values: () => ({
        returning: () => Promise.resolve([SAMPLE_IDEA]),
      }),
    });

    const req = makeRequest("POST", "http://localhost/api/ideas", {
      title: "Test",
      status: "idea",
    });

    const res = await createPost(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.idea).toBeDefined();
    expect(json.idea.user_id).toBe("default");
  });

  it("returns 400 with fieldErrors when title is empty", async () => {
    const req = makeRequest("POST", "http://localhost/api/ideas", {
      title: "",
      status: "idea",
    });

    const res = await createPost(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.fieldErrors).toBeDefined();
    expect(json.fieldErrors.title).toBeDefined();
    expect(json.fieldErrors.title.length).toBeGreaterThan(0);
  });

  it("returns 400 when title is 121 characters", async () => {
    const req = makeRequest("POST", "http://localhost/api/ideas", {
      title: "x".repeat(121),
      status: "idea",
    });

    const res = await createPost(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.fieldErrors.title).toBeDefined();
  });

  it("sets user_id to 'default' server-side regardless of request body", async () => {
    const capturedValues: unknown[] = [];
    mockDb.insert.mockReturnValue({
      values: (v: unknown) => {
        capturedValues.push(v);
        return {
          returning: () => Promise.resolve([{ ...SAMPLE_IDEA, ...(v as object) }]),
        };
      },
    });

    const req = makeRequest("POST", "http://localhost/api/ideas", {
      title: "Test Idea",
      status: "idea",
      // Attacker tries to inject user_id — should be ignored
      user_id: "attacker",
    });

    await createPost(req);

    expect(capturedValues.length).toBe(1);
    expect((capturedValues[0] as { user_id: string }).user_id).toBe("default");
  });

  it("returns 400 with invalid status", async () => {
    const req = makeRequest("POST", "http://localhost/api/ideas", {
      title: "Test",
      status: "unknown_status",
    });

    const res = await createPost(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Tests: GET /api/ideas
// ---------------------------------------------------------------------------
describe("GET /api/ideas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupSelectMock(rows: typeof SAMPLE_IDEA[], total = rows.length) {
    let callCount = 0;
    mockDb.select.mockImplementation(() => {
      callCount++;
      const chain = {
        from: () => chain,
        where: () => chain,
        orderBy: () => chain,
        limit: () => chain,
        offset: () => ({
          // Final thenable for data query
          then: (res: (v: unknown) => void) =>
            Promise.resolve(callCount === 1 ? rows : [{ count: total }]).then(res),
        }),
        groupBy: () => ({
          then: (res: (v: unknown) => void) =>
            Promise.resolve(
              Object.entries(
                rows.reduce(
                  (acc, r) => ({
                    ...acc,
                    [r.status]: (acc[r.status as keyof typeof acc] || 0) + 1,
                  }),
                  {} as Record<string, number>
                )
              ).map(([status, count]) => ({ status, count }))
            ).then(res),
        }),
        // For count query (no offset in count path)
        then: (res: (v: unknown) => void) =>
          Promise.resolve([{ count: total }]).then(res),
      };
      return chain;
    });
  }

  it("returns 200 with ideas and total", async () => {
    setupSelectMock([SAMPLE_IDEA]);

    const req = makeRequest("GET", "http://localhost/api/ideas");
    const res = await listGet(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ideas).toBeDefined();
    expect(json.total).toBeDefined();
  });

  it("does not include stats by default", async () => {
    setupSelectMock([SAMPLE_IDEA]);

    const req = makeRequest("GET", "http://localhost/api/ideas");
    const res = await listGet(req);
    const json = await res.json();
    expect(json.stats).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Tests: GET /api/ideas/[id]
// ---------------------------------------------------------------------------
describe("GET /api/ideas/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with the idea when found", async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([SAMPLE_IDEA]),
      }),
    });

    const req = makeRequest("GET", "http://localhost/api/ideas/11111111-1111-1111-1111-111111111111");
    const params = { id: "11111111-1111-1111-1111-111111111111" };
    const res = await singleGet(req, { params });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.idea.id).toBe(SAMPLE_IDEA.id);
  });

  it("returns 404 when idea is not found", async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([]),
      }),
    });

    const req = makeRequest("GET", "http://localhost/api/ideas/non-existent-id");
    const res = await singleGet(req, { params: { id: "non-existent-id" } });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Tests: PATCH /api/ideas/[id]
// ---------------------------------------------------------------------------
describe("PATCH /api/ideas/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with updated idea on valid status", async () => {
    const updatedIdea = { ...SAMPLE_IDEA, status: "launched" as const };
    mockDb.update.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([updatedIdea]),
        }),
      }),
    });

    const req = makeRequest(
      "PATCH",
      "http://localhost/api/ideas/11111111-1111-1111-1111-111111111111",
      { status: "launched" }
    );
    const res = await patchIdea(req, {
      params: { id: "11111111-1111-1111-1111-111111111111" },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.idea.status).toBe("launched");
  });

  it("returns 404 when idea is not found", async () => {
    mockDb.update.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    });

    const req = makeRequest(
      "PATCH",
      "http://localhost/api/ideas/non-existent",
      { status: "launched" }
    );
    const res = await patchIdea(req, { params: { id: "non-existent" } });
    expect(res.status).toBe(404);
  });

  it("returns 400 on invalid status", async () => {
    const req = makeRequest(
      "PATCH",
      "http://localhost/api/ideas/some-id",
      { status: "invalid_status" }
    );
    const res = await patchIdea(req, { params: { id: "some-id" } });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Tests: PUT /api/ideas/[id]
// ---------------------------------------------------------------------------
describe("PUT /api/ideas/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with updated idea on valid input", async () => {
    const updatedIdea = {
      ...SAMPLE_IDEA,
      title: "Updated Title",
      status: "in_progress" as const,
    };
    mockDb.update.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([updatedIdea]),
        }),
      }),
    });

    const req = makeRequest(
      "PUT",
      "http://localhost/api/ideas/11111111-1111-1111-1111-111111111111",
      { title: "Updated Title", status: "in_progress" }
    );
    const res = await putIdea(req, {
      params: { id: "11111111-1111-1111-1111-111111111111" },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.idea.title).toBe("Updated Title");
  });

  it("returns 400 when title is missing", async () => {
    const req = makeRequest(
      "PUT",
      "http://localhost/api/ideas/some-id",
      { status: "idea" }
    );
    const res = await putIdea(req, { params: { id: "some-id" } });
    expect(res.status).toBe(400);
  });

  it("returns 404 when idea does not exist", async () => {
    mockDb.update.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    });

    const req = makeRequest(
      "PUT",
      "http://localhost/api/ideas/no-such-id",
      { title: "Valid Title", status: "idea" }
    );
    const res = await putIdea(req, { params: { id: "no-such-id" } });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Tests: DELETE /api/ideas/[id]
// ---------------------------------------------------------------------------
describe("DELETE /api/ideas/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 204 on successful delete", async () => {
    mockDb.delete.mockReturnValue({
      where: () => ({
        returning: () =>
          Promise.resolve([{ id: "11111111-1111-1111-1111-111111111111" }]),
      }),
    });

    const req = makeRequest(
      "DELETE",
      "http://localhost/api/ideas/11111111-1111-1111-1111-111111111111"
    );
    const res = await deleteIdea(req, {
      params: { id: "11111111-1111-1111-1111-111111111111" },
    });

    expect(res.status).toBe(204);
  });

  it("returns 404 when idea is not found", async () => {
    mockDb.delete.mockReturnValue({
      where: () => ({
        returning: () => Promise.resolve([]),
      }),
    });

    const req = makeRequest(
      "DELETE",
      "http://localhost/api/ideas/no-such-id"
    );
    const res = await deleteIdea(req, { params: { id: "no-such-id" } });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Tests: GET /api/ideas/export
// ---------------------------------------------------------------------------
describe("GET /api/ideas/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with text/csv content type", async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve([SAMPLE_IDEA]),
        }),
      }),
    });

    const req = makeRequest("GET", "http://localhost/api/ideas/export");
    const res = await exportGet(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
  });

  it("response includes Content-Disposition attachment header", async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve([SAMPLE_IDEA]),
        }),
      }),
    });

    const req = makeRequest("GET", "http://localhost/api/ideas/export");
    const res = await exportGet(req);

    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    expect(res.headers.get("Content-Disposition")).toContain(".csv");
  });

  it("response body contains the CSV header row", async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve([SAMPLE_IDEA]),
        }),
      }),
    });

    const req = makeRequest("GET", "http://localhost/api/ideas/export");
    const res = await exportGet(req);

    const text = await res.text();
    expect(text).toContain("title,description,status,tags,url,created_at,updated_at");
  });

  it("response body contains one data row per idea", async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () =>
            Promise.resolve([
              SAMPLE_IDEA,
              { ...SAMPLE_IDEA, id: "22222222-2222-2222-2222-222222222222", title: "Second Idea" },
            ]),
        }),
      }),
    });

    const req = makeRequest("GET", "http://localhost/api/ideas/export");
    const res = await exportGet(req);

    const text = await res.text();
    const lines = text.trim().split("\n");
    // 1 header + 2 data rows
    expect(lines.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Tests: No route reads user_id from request
// ---------------------------------------------------------------------------
describe("Security: user_id is never read from client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST ignores user_id in request body", async () => {
    const capturedValues: unknown[] = [];
    mockDb.insert.mockReturnValue({
      values: (v: unknown) => {
        capturedValues.push(v);
        return {
          returning: () => Promise.resolve([SAMPLE_IDEA]),
        };
      },
    });

    const req = makeRequest("POST", "http://localhost/api/ideas", {
      title: "Test",
      status: "idea",
      user_id: "hacker",
    });

    await createPost(req);

    if (capturedValues.length > 0) {
      expect((capturedValues[0] as { user_id: string }).user_id).toBe("default");
    }
  });
});
