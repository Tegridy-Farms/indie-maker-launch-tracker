import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazily initialise the DB client so that importing this module at build time
// (e.g. during `next build` route-tree analysis) does not throw when
// DATABASE_URL is absent.  Vercel injects DATABASE_URL at runtime; it is NOT
// available during the build step.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(url);
  _db = drizzle(sql, { schema });
  return _db;
}

// Proxy that forwards every property access to the lazily-created client.
// Route handlers call `db.select(...)`, `db.insert(...)`, etc. at runtime
// (not at import time), so the proxy is safe to export at module level.
export const db = new Proxy(
  {} as ReturnType<typeof drizzle<typeof schema>>,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getDb(), prop, receiver);
    },
  }
);

export type Database = typeof db;
