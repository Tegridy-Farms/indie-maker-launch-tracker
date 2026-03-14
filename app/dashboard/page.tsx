import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/RecentActivity";
import type { StatusCounts } from "@/types/idea";
import type { Status } from "@/lib/validators";

async function getDashboardData() {
  try {
    // Run both queries in parallel for a single efficient round-trip
    const [statsRows, recentIdeas] = await Promise.all([
      // Stats aggregate — GROUP BY status
      db
        .select({
          status: ideas.status,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(ideas)
        .where(eq(ideas.user_id, "default"))
        .groupBy(ideas.status),

      // 5 most-recently-updated ideas
      db
        .select()
        .from(ideas)
        .where(eq(ideas.user_id, "default"))
        .orderBy(desc(ideas.updated_at))
        .limit(5),
    ]);

    // Build StatusCounts from aggregate rows
    const stats: StatusCounts = {
      idea: 0,
      in_progress: 0,
      launched: 0,
      shelved: 0,
      total: 0,
    };

    for (const row of statsRows) {
      const status = row.status as Status;
      stats[status] = row.count;
      stats.total += row.count;
    }

    return { stats, recentIdeas, error: null };
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
    return { stats: null, recentIdeas: [], error: true };
  }
}

export default async function DashboardPage() {
  const { stats, recentIdeas, error } = await getDashboardData();

  return (
    <div className="page-container py-8">
      {/* Page heading */}
      <h1 className="text-[24px] font-bold text-text-primary mb-8">
        Dashboard
      </h1>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-error rounded-lg px-4 py-3 mb-6 text-[14px]"
        >
          Couldn&apos;t load stats. Please refresh the page to retry.
        </div>
      )}

      {/* Stats section */}
      <section aria-label="Idea statistics" className="mb-8">
        <DashboardStats
          stats={stats}
          isLoading={false}
          isError={!!error}
        />
      </section>

      {/* Recent Activity section */}
      <section aria-label="Recent activity">
        <RecentActivity
          ideas={recentIdeas}
          isLoading={false}
          isError={!!error}
        />
      </section>
    </div>
  );
}
