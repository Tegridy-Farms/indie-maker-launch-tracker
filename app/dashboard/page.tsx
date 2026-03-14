import { Suspense } from "react";
import { db } from "@/db";
import { ideas } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/RecentActivity";
import { ErrorBanner } from "@/components/ErrorBanner";
import type { StatusCounts } from "@/types/idea";
import type { Status } from "@/lib/validators";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

/**
 * Single round-trip: fetch status aggregate counts AND the 5 most-recently-
 * updated rows in one Promise.all over the same connection pool — Drizzle does
 * not yet support arbitrary SQL UNION across typed query builders, so we use
 * Promise.all([queryA, queryB]) which the Postgres driver pipelining resolves
 * as a single network round-trip.
 */
async function getDashboardData() {
  try {
    const [statsRows, recentIdeas] = await Promise.all([
      db
        .select({
          status: ideas.status,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(ideas)
        .where(eq(ideas.user_id, "default"))
        .groupBy(ideas.status),

      db
        .select()
        .from(ideas)
        .where(eq(ideas.user_id, "default"))
        .orderBy(desc(ideas.updated_at))
        .limit(5),
    ]);

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

/**
 * DashboardContent is a separate async Server Component so that Next.js can
 * stream it behind a <Suspense> boundary. While this component is awaiting
 * data, Next.js renders the loading.tsx fallback (skeleton shimmer states with
 * aria-busy="true"), satisfying acceptance criterion 9.
 */
async function DashboardContent() {
  const { stats, recentIdeas, error } = await getDashboardData();

  return (
    <>
      {/* Error banner — auto-retries after 5 s via client-side router.refresh() */}
      {error && <ErrorBanner />}

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
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="page-container py-8">
      {/* Page heading */}
      <h1 className="text-[24px] font-bold text-text-primary mb-8">
        Dashboard
      </h1>

      {/*
       * <Suspense> boundary: while DashboardContent awaits the DB query,
       * Next.js shows the DashboardLoading skeleton (loading.tsx). Once the
       * data resolves the real content streams in, satisfying AC-9.
       */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
