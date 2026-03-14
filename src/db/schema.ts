import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Postgres enum for idea status
export const statusEnum = pgEnum("status_enum", [
  "idea",
  "in_progress",
  "launched",
  "shelved",
]);

// Main ideas table
export const ideas = pgTable(
  "ideas",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    user_id: text("user_id").notNull().default("default"),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description"),
    status: statusEnum("status").notNull().default("idea"),
    tags: text("tags").array(),
    url: text("url"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    // Supports filtered list queries (R-007) and dashboard aggregate (R-006)
    idxIdeasUserStatus: index("idx_ideas_user_status").on(
      table.user_id,
      table.status
    ),
    // Supports default sort (R-008)
    idxIdeasUserCreated: index("idx_ideas_user_created").on(
      table.user_id,
      table.created_at
    ),
    // Supports updated_at sort and dashboard recent list (R-006, R-008)
    idxIdeasUserUpdated: index("idx_ideas_user_updated").on(
      table.user_id,
      table.updated_at
    ),
  })
);

// Type exports for use across the app
export type InsertIdea = typeof ideas.$inferInsert;
export type SelectIdea = typeof ideas.$inferSelect;
