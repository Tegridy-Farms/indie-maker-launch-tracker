import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { IdeasListClient } from "./IdeasListClient";
import type { Idea } from "@/types/idea";

/**
 * Fetch the first page of ideas server-side (default sort: created_at DESC).
 * All further filtering, sorting, and searching is done client-side on the
 * full fetched dataset — no additional API calls needed per architecture.
 */
async function getIdeas(): Promise<{ ideas: Idea[]; total: number }> {
  try {
    const [allIdeas, countResult] = await Promise.all([
      db
        .select()
        .from(ideas)
        .where(eq(ideas.user_id, "default"))
        .orderBy(desc(ideas.created_at))
        .limit(50),
      db
        .select({ count: ideas.id })
        .from(ideas)
        .where(eq(ideas.user_id, "default")),
    ]);

    return { ideas: allIdeas, total: countResult.length };
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
