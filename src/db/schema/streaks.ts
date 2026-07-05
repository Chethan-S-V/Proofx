import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userStreaksTable = pgTable(
  "user_streaks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    activeSecondsToday: integer("active_seconds_today").default(0).notNull(),
    lastActivityDate: date("last_activity_date"),
    lastQualifiedActivityDate: date("last_qualified_activity_date"),
    streakEarnedToday: boolean("streak_earned_today").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdUniqueIdx: uniqueIndex("user_streaks_user_id_unique_idx").on(table.userId),
    userIdIdx: index("user_streaks_user_id_idx").on(table.userId),
  })
);

export const userActivityLogsTable = pgTable(
  "user_activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    activityType: text("activity_type").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    eligibleForStreak: boolean("eligible_for_streak").default(false).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_activity_logs_user_id_idx").on(table.userId),
    userActivityDateIdx: index("user_activity_logs_user_started_at_idx").on(table.userId, table.startedAt),
  })
);

export type UserStreak = typeof userStreaksTable.$inferSelect;
export type NewUserStreak = typeof userStreaksTable.$inferInsert;
export type UserActivityLog = typeof userActivityLogsTable.$inferSelect;
export type NewUserActivityLog = typeof userActivityLogsTable.$inferInsert;
