import { StatCard } from "./StatCard";
import { STATUS_COLOURS, STATUS_LABELS } from "@/lib/constants";
import type { StatusCounts } from "@/types/idea";
import type { Status } from "@/lib/validators";

interface DashboardStatsProps {
  stats: StatusCounts | null;
  isLoading?: boolean;
  isError?: boolean;
}

const STATUS_ORDER: Status[] = ["idea", "in_progress", "launched", "shelved"];

export function DashboardStats({
  stats,
  isLoading = false,
  isError = false,
}: DashboardStatsProps) {
  return (
    <div aria-busy={isLoading} aria-label={isLoading ? "Loading stats" : undefined}>
      {/* Total Ideas — full-width */}
      <div className="mb-4">
        <StatCard
          label="Total Ideas"
          count={stats?.total ?? 0}
          isLoading={isLoading}
          isError={isError}
          fullWidth
        />
      </div>

      {/* Per-status grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => (
          <StatCard
            key={status}
            label={STATUS_LABELS[status]}
            count={stats?.[status] ?? 0}
            color={STATUS_COLOURS[status]}
            isLoading={isLoading}
            isError={isError}
          />
        ))}
      </div>
    </div>
  );
}
