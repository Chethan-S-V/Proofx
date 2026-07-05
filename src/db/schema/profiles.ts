import {
  pgTable,
  timestamp,
  text,
  uuid,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Profiles table schema
 *
 * Stores user profile information and metadata
 * - id: Unique identifier (UUID, auto-generated)
 * - userId: Foreign key reference to users table (one-to-one)
 * - firstName: User's first name
 * - lastName: User's last name
 * - avatar: URL to user's profile avatar image
 * - bio: User biography or description
 * - createdAt: Profile creation timestamp
 * - updatedAt: Last modification timestamp
 *
 * Relationships:
 * - One-to-one with users table (each profile belongs to one user)
 *
 * Indexes:
 * - userId: For fast user lookup and data loading
 *
 * Constraints:
 * - Foreign key on userId ensures referential integrity
 * - ON DELETE CASCADE: Deleting a user also deletes their profile
 */
export const profilesTable = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    avatar: text("avatar"),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("profiles_user_id_idx").on(table.userId),
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: "profiles_user_id_fk",
    }).onDelete("cascade"),
  })
);

/**
 * Profile relations
 * Links profiles table to users table for querying related data
 */
export const profilesRelations = relations(profilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
  }),
}));

/**
 * Type definitions for profiles table
 */
export type Profile = typeof profilesTable.$inferSelect;
export type NewProfile = typeof profilesTable.$inferInsert;
