import { DashboardSkeleton } from "@/components/DashboardSkeleton";

/**
 * Next.js App Router loading.tsx — shown automatically while page.tsx is
 * streaming server data. Renders skeleton shimmer placeholders so users see
 * aria-busy="true" content during the DB fetch (acceptance criterion 9).
 */
export default function DashboardLoading() {
  return (
    <div className="page-container py-8">
      <h1 className="text-[24px] font-bold text-text-primary mb-8">
        Dashboard
      </h1>

      <DashboardSkeleton />
    </div>
  );
}
