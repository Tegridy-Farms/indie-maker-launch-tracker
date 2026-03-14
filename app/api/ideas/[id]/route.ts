import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ideas } from "@/db/schema";
import { PatchStatusSchema, UpdateIdeaSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

type RouteParams = { params: { id: string } };

/**
 * GET /api/ideas/[id]
 *
 * Returns: 200 { idea } or 404 { error }
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    const [idea] = await db
      .select()
      .from(ideas)
      .where(and(eq(ideas.id, id), eq(ideas.user_id, "default")));

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ idea }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/ideas/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ideas/[id]
 *
 * Body: { status }
 * Updates only the status field and refreshes updated_at.
 * Returns: 200 { idea } or 400 { error } or 404 { error }
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();

    const result = PatchStatusSchema.safeParse(body);
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

    const { status } = result.data;

    const [updated] = await db
      .update(ideas)
      .set({
        status,
        updated_at: sql`now()`,
      })
      .where(and(eq(ideas.id, id), eq(ideas.user_id, "default")))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ idea: updated }, { status: 200 });
  } catch (error) {
    console.error(`PATCH /api/ideas/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ideas/[id]
 *
 * Body: { title, description?, status, tags?, url? }
 * Full update of all fields. Sets updated_at = now().
 * Returns: 200 { idea } or 400 { error, fieldErrors } or 404 { error }
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();

    const result = UpdateIdeaSchema.safeParse(body);
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

    const [updated] = await db
      .update(ideas)
      .set({
        title,
        description: description ?? null,
        status,
        tags: tags && tags.length > 0 ? tags : null,
        url: url && url !== "" ? url : null,
        updated_at: sql`now()`,
      })
      .where(and(eq(ideas.id, id), eq(ideas.user_id, "default")))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ idea: updated }, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/ideas/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ideas/[id]
 *
 * Hard-deletes a single idea.
 * Returns: 204 (no content) or 404 { error }
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    const [deleted] = await db
      .delete(ideas)
      .where(and(eq(ideas.id, id), eq(ideas.user_id, "default")))
      .returning({ id: ideas.id });

    if (!deleted) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/ideas/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
