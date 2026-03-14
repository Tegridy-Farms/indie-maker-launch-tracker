import { DashboardStats } from "./DashboardStats";
import { RecentActivity } from "./RecentActivity";

/**
 * Skeleton placeholder for the dashboard content area (below the heading).
 * Rendered as the Suspense fallback while DashboardContent awaits DB data,
 * and also by Next.js loading.tsx on full-page navigation.
 */
export function DashboardSkeleton() {
  return (
    <>
      <section aria-label="Idea statistics" className="mb-8">
        <DashboardStats stats={null} isLoading={true} />
      </section>

      <section aria-label="Recent activity">
        <RecentActivity ideas={[]} isLoading={true} />
      </section>
    </>
  );
}
