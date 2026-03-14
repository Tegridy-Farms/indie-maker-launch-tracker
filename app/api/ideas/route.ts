import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ideas } from "@/db/schema";
import { CreateIdeaSchema } from "@/lib/validators";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";
import { eq, desc, asc, inArray, count, and } from "drizzle-orm";
import type { SortField, SortOrder, StatusCounts } from "@/types/idea";
import type { Status } from "@/lib/validators";

/**
 * GET /api/ideas
 *
 * Query params:
 *   status[]   - filter by one or more statuses
 *   sort       - "created_at" | "updated_at" | "title" (default: "created_at")
 *   order      - "asc" | "desc" (default: "desc")
 *   page       - page number (default: 1)
 *   limit      - results per page (default: 50)
 *   stats      - "true" to include status counts in response
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const statusFilter = searchParams.getAll("status[]");
    const sortParam = (searchParams.get("sort") ?? "created_at") as SortField;
    const orderParam = (searchParams.get("order") ?? "desc") as SortOrder;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_LIMIT), 10))
    );
    const includeStats = searchParams.get("stats") === "true";
    const offset = (page - 1) * limit;

    // Validate sort field
    const validSortFields: SortField[] = ["created_at", "updated_at", "title"];
    const sortField: SortField = validSortFields.includes(sortParam)
      ? sortParam
      : "created_at";
    const sortOrder: SortOrder = orderParam === "asc" ? "asc" : "desc";

    // Build where condition
    const userCondition = eq(ideas.user_id, "default");
    let whereCondition = userCondition;

    if (statusFilter.length > 0) {
      const validStatuses = statusFilter.filter((s) =>
        ["idea", "in_progress", "launched", "shelved"].includes(s)
      ) as Status[];
      if (validStatuses.length > 0) {
        whereCondition = and(userCondition, inArray(ideas.status, validStatuses))!;
      }
    }

    // Sort column
    const sortColumn =
      sortField === "title"
        ? ideas.title
        : sortField === "updated_at"
        ? ideas.updated_at
        : ideas.created_at;

    const orderFn = sortOrder === "asc" ? asc : desc;

    // Fetch ideas with pagination and total count in parallel
    const [ideaRows, totalResult] = await Promise.all([
      db
        .select()
        .from(ideas)
        .where(whereCondition)
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(ideas)
        .where(whereCondition),
    ]);

    const total = totalResult[0]?.count ?? 0;

    // Build response
    const response: {
      ideas: typeof ideaRows;
      total: number;
      stats?: StatusCounts;
    } = {
      ideas: ideaRows,
      total,
    };

    // Include stats if requested
    if (includeStats) {
      const statsRows = await db
        .select({ status: ideas.status, count: count() })
        .from(ideas)
        .where(eq(ideas.user_id, "default"))
        .groupBy(ideas.status);

      const stats: StatusCounts = {
        idea: 0,
        in_progress: 0,
        launched: 0,
        shelved: 0,
        total: 0,
      };

      for (const row of statsRows) {
        stats[row.status] = row.count;
        stats.total += row.count;
      }

      response.stats = stats;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/ideas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ideas
 *
 * Body: { title, description?, status, tags?, url? }
 * Returns: 201 { idea } or 400 { error, fieldErrors }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod schema - never accept user_id from client
    const result = CreateIdeaSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const [field, errors] of Object.entries(
        result.error.flatten().fieldErrors
      )) {
        if (errors) fieldErrors[field] = errors;
      }
      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, status, tags, url } = result.data;

    const [inserted] = await db
      .insert(ideas)
      .values({
        title,
        description: description ?? null,
        status,
        tags: tags && tags.length > 0 ? tags : null,
        url: url && url !== "" ? url : null,
        user_id: "default",
      })
      .returning();

    return NextResponse.json({ idea: inserted }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ideas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
