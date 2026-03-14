import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { formatRelativeTime } from "@/lib/utils";
import type { Idea } from "@/types/idea";
import type { Status } from "@/lib/validators";

interface RecentActivityProps {
  ideas: Idea[];
  isLoading?: boolean;
  isError?: boolean;
}

export function RecentActivity({
  ideas,
  isLoading = false,
  isError = false,
}: RecentActivityProps) {
  return (
    <div className="bg-surface rounded-xl border border-border-default p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-semibold text-text-primary">
          Recent Activity
        </h2>
        <Link
          href="/ideas"
          className="text-[14px] text-primary hover:text-primary-hover transition-colors"
        >
          View all →
        </Link>
      </div>

      {isLoading && (
        <div aria-busy="true" aria-label="Loading recent activity">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-border-default last:border-0"
            >
              <div className="shimmer h-4 flex-1 rounded" />
              <div className="shimmer h-5 w-20 rounded-full" />
              <div className="shimmer h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <p className="text-error text-[14px] text-center py-4">
          Couldn&apos;t load recent activity.
        </p>
      )}

      {!isLoading && !isError && ideas.length === 0 && (
        <EmptyState variant="no-ideas" />
      )}

      {!isLoading && !isError && ideas.length > 0 && (
        <ul role="list" className="divide-y divide-border-default">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              role="listitem"
              className="flex items-center gap-3 py-3 hover:bg-[#F3F4F6] -mx-2 px-2 rounded transition-colors"
            >
              {/* Title */}
              <Link
                href={`/ideas`}
                className="flex-1 min-w-0 text-[14px] font-medium text-text-primary hover:text-primary truncate transition-colors"
                title={idea.title}
              >
                {idea.title}
              </Link>

              {/* Status badge */}
              <StatusBadge
                status={idea.status as Status}
                interactive={false}
                size="sm"
              />

              {/* Relative timestamp */}
              <time
                dateTime={
                  idea.updated_at instanceof Date
                    ? idea.updated_at.toISOString()
                    : new Date(idea.updated_at).toISOString()
                }
                className="text-[12px] text-text-secondary whitespace-nowrap"
              >
                {formatRelativeTime(idea.updated_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
