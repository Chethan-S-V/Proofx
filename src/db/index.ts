import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as userSchema from "./schema/users";
import * as profileSchema from "./schema/profiles";
import * as streakSchema from "./schema/streaks";
import * as repositorySchema from "./schema/repositories";
import * as organizationSchema from "./schema/organizations";
import * as socialSchema from "./schema/social";
import * as authSchema from "./schema/auth";

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
    ...organizationSchema,
    ...socialSchema,
    ...authSchema,
  },
});

export * from "./schema/users";
export * from "./schema/profiles";
export * from "./schema/streaks";
export * from "./schema/repositories";
export * from "./schema/organizations";
export * from "./schema/social";
export * from "./schema/auth";
