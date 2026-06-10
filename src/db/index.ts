import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as userSchema from "./schema/users";
import * as profileSchema from "./schema/profiles";
import * as streakSchema from "./schema/streaks";
import * as repositorySchema from "./schema/repositories";

/**
 * Database connection configuration
 * Connects to PostgreSQL using the DATABASE_URL environment variable
 * Reuses connection in development to prevent connection pool exhaustion
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Create connection or reuse existing one
const conn =
  globalForDb.conn ||
  postgres(env.DATABASE_URL, {
    ssl: env.DATABASE_SSL === "false" ? false : "require",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

/**
 * Database client instance
 * Provides type-safe access to all database tables and queries
 */
export const db = drizzle(conn, {
  schema: {
    ...userSchema,
    ...profileSchema,
    ...streakSchema,
    ...repositorySchema,
  },
});

export * from "./schema/users";
export * from "./schema/profiles";
export * from "./schema/streaks";
export * from "./schema/repositories";
