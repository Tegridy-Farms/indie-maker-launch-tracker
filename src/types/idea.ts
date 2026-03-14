import type { SelectIdea } from "@/db/schema";

/**
 * The main Idea type used across the application.
 * Inferred directly from the Drizzle schema to keep in sync with the database.
 */
export type Idea = SelectIdea;

/**
 * Status type for convenience.
 */
export type { Status } from "@/lib/validators";

/**
 * Status counts returned by the stats aggregate query.
 */
export type StatusCounts = {
  idea: number;
  in_progress: number;
  launched: number;
  shelved: number;
  total: number;
};

/**
 * Paginated response from GET /api/ideas.
 */
export type IdeasListResponse = {
  ideas: Idea[];
  total: number;
  stats?: StatusCounts;
};

/**
 * Sort options for the ideas list.
 */
export type SortField = "created_at" | "updated_at" | "title";
export type SortOrder = "asc" | "desc";

/**
 * Filter state for the SearchFilterBar.
 */
export type FilterState = {
  search: string;
  status: string[];
  sort: SortField;
  order: SortOrder;
  page: number;
};
