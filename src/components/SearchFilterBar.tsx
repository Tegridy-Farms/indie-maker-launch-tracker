"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/20/solid";
import { STATUS_LABELS, STATUS_COLOURS } from "@/lib/constants";
import { EmptyState } from "@/components/EmptyState";
import { ExportButton } from "@/components/ExportButton";
import { IdeaRow } from "@/components/IdeaRow";
import type { Idea } from "@/types/idea";
import type { Status } from "@/lib/validators";

type SortOption = "newest" | "recently-updated" | "title-asc";

interface SearchFilterBarProps {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  onDelete?: (idea: Idea) => void;
  onStatusChange?: (id: string, newStatus: Status) => Promise<void>;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

const STATUS_OPTIONS: Status[] = ["idea", "in_progress", "launched", "shelved"];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "recently-updated", label: "Recently updated" },
  { value: "title-asc", label: "Title A→Z" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchFilterBar({
  ideas,
  onEdit,
  onDelete,
  onStatusChange,
  total,
  page,
  onPageChange,
  pageSize,
}: SearchFilterBarProps) {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");

  const debouncedSearch = useDebounce(search, 200);

  // Reset to page 1 whenever filters/sort change
  useEffect(() => {
    onPageChange(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedStatuses, sort]);

  const hasActiveFilters =
    debouncedSearch !== "" || selectedStatuses.length > 0 || sort !== "newest";

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedStatuses([]);
    setSort("newest");
    onPageChange(1);
  }, [onPageChange]);

  const toggleStatus = useCallback((status: Status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }, []);

  // Client-side filtering + sorting
  const filtered = useMemo(() => {
    let result = [...ideas];

    // Search filter
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((idea) =>
        idea.title.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      result = result.filter((idea) =>
        selectedStatuses.includes(idea.status as Status)
      );
    }

    // Sort
    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "recently-updated") {
      result.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else if (sort === "title-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [ideas, debouncedSearch, selectedStatuses, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  // Paginate the filtered+sorted results
  const paginatedIdeas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ideas by title"
            aria-label="Search ideas by title"
            className="w-full pl-9 pr-8 py-2 text-[14px] border border-border-default rounded-[8px] bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <XMarkIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div
          role="group"
          aria-label="Filter by status"
          className="flex items-center gap-1.5 flex-wrap"
        >
          {/* "All" pill */}
          <button
            type="button"
            role="checkbox"
            aria-checked={selectedStatuses.length === 0}
            onClick={() => setSelectedStatuses([])}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
              selectedStatuses.length === 0
                ? "bg-primary text-white border-primary"
                : "bg-surface text-text-secondary border-border-default hover:border-primary hover:text-primary"
            }`}
          >
            All
          </button>

          {STATUS_OPTIONS.map((status) => {
            const isSelected = selectedStatuses.includes(status);
            const color = STATUS_COLOURS[status];
            return (
              <button
                key={status}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggleStatus(status)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  backgroundColor: isSelected ? color : "transparent",
                  borderColor: isSelected ? color : "#E5E7EB",
                  color: isSelected ? "#FFFFFF" : "#6B7280",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ["--tw-ring-color" as any]: color,
                }}
              >
                {STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1">
          <FunnelIcon className="w-4 h-4 text-text-secondary flex-shrink-0" aria-hidden="true" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort ideas"
            className="text-[14px] border border-border-default rounded-[8px] bg-surface text-text-primary px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters (visible when filters active) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[14px] text-text-secondary hover:text-primary transition-colors underline"
          >
            Clear Filters
          </button>
        )}

        {/* Export CSV button — desktop: far right of filter bar */}
        <div className="ml-auto">
          <ExportButton />
        </div>
      </div>

      {/* Active filter summary */}
      {hasActiveFilters && (
        <p
          className="text-[12px] text-text-secondary mb-3"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {filtered.length} of {ideas.length} ideas
          {(debouncedSearch || selectedStatuses.length > 0) && (
            <span>
              {" "}• {[debouncedSearch && "search", selectedStatuses.length > 0 && "status filter"].filter(Boolean).join(", ")} active
            </span>
          )}
        </p>
      )}

      {/* Idea list */}
      {filtered.length === 0 ? (
        <EmptyState
          variant={ideas.length === 0 ? "no-ideas" : "no-results"}
          onClear={ideas.length > 0 ? clearFilters : undefined}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
          {/* Column headers (hidden on mobile) — must NOT be inside <ul> */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-b border-border-default bg-[#F9FAFB]" aria-hidden="true">
            <div className="flex-1 text-[12px] font-medium text-text-secondary">Title</div>
            <div className="w-[200px] flex-shrink-0 text-[12px] font-medium text-text-secondary">Tags</div>
            <div className="w-6 flex-shrink-0" />
            <div className="w-[120px] flex-shrink-0 text-[12px] font-medium text-text-secondary">Status</div>
            <div className="w-[96px] flex-shrink-0 text-[12px] font-medium text-text-secondary">Created</div>
            <div className="w-[64px] flex-shrink-0" />
          </div>

          <ul
            role="list"
            aria-live="polite"
            aria-label="Ideas list"
          >
            {paginatedIdeas.map((idea) => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-[14px] border border-border-default rounded-lg bg-surface text-text-secondary hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-[14px] text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-[14px] border border-border-default rounded-lg bg-surface text-text-secondary hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
