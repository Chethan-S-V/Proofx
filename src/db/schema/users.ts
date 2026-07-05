import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profilesTable } from "./profiles";

/**
 * Users table schema
 *
 * Stores core user authentication and account data
 * - id: Unique identifier (UUID, auto-generated)
 * - email: User email (unique constraint for login)
 * - passwordHash: Bcrypt-hashed password (never store plain text)
 * - isEmailVerified: Email verification status flag
 * - createdAt: Account creation timestamp
 * - updatedAt: Last modification timestamp
 *
 * Relationships:
 * - One-to-one with profiles table (each user has one profile)
 *
 * Indexes:
 * - email: For fast email lookups during login
 */
export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

/**
 * User relations
 * Links users table to profiles table for querying related data
 */
export const usersRelations = relations(usersTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [usersTable.id],
    references: [profilesTable.userId],
  }),
}));

/**
 * Type definitions for users table
 */
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
