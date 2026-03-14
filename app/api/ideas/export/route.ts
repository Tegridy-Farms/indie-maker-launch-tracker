import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ideas } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CSV_HEADERS, ideaToCsvRow } from "@/lib/utils";

/**
 * GET /api/ideas/export
 *
 * Streams all ideas for user_id = 'default' as a CSV download.
 * Headers: title,description,status,tags,url,created_at,updated_at
 *
 * Uses a streaming response to avoid buffering large datasets in memory.
 * Returns: 200 text/csv with Content-Disposition: attachment
 */
export async function GET(_request: NextRequest) {
  try {
    // Fetch all ideas for the default user, ordered by created_at DESC
    const rows = await db
      .select()
      .from(ideas)
      .where(eq(ideas.user_id, "default"))
      .orderBy(desc(ideas.created_at));

    // Build CSV content as a stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // Write header row
        controller.enqueue(encoder.encode(CSV_HEADERS + "\n"));

        // Write data rows
        for (const idea of rows) {
          controller.enqueue(encoder.encode(ideaToCsvRow(idea) + "\n"));
        }

        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ideas.csv"',
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("GET /api/ideas/export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
