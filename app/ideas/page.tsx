import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { IdeasListClient } from "./IdeasListClient";
import type { Idea } from "@/types/idea";

/**
 * Fetch ALL ideas server-side (default sort: created_at DESC).
 * Client-side pagination slices the full dataset — no additional API calls
 * needed per architecture. Total is computed via SQL COUNT aggregate.
 */
async function getIdeas(): Promise<{ ideas: Idea[]; total: number }> {
  try {
    const [allIdeas, countResult] = await Promise.all([
      db
        .select()
        .from(ideas)
        .where(eq(ideas.user_id, "default"))
        .orderBy(desc(ideas.created_at)),
      db
        .select({ count: count() })
        .from(ideas)
        .where(eq(ideas.user_id, "default")),
    ]);

    return { ideas: allIdeas, total: countResult[0]?.count ?? 0 };
  } catch (err) {
    console.error("Ideas page fetch error:", err);
    return { ideas: [], total: 0 };
  }
}

export default async function IdeasPage() {
  const { ideas: allIdeas, total } = await getIdeas();

  return (
    <div className="page-container py-8">
      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-text-primary">My Ideas</h1>
      </div>

      {/* Client component handles search/filter/sort/display */}
      <IdeasListClient initialIdeas={allIdeas} initialTotal={total} />
    </div>
  );
}
