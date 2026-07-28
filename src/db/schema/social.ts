import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userBlocksTable = pgTable("user_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockerId: uuid("blocker_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  blockedId: uuid("blocked_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ blockerIdx: index("user_blocks_blocker_idx").on(table.blockerId, table.createdAt), pairUnique: uniqueIndex("user_blocks_pair_unique").on(table.blockerId, table.blockedId) }));
