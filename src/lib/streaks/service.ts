import { eq } from "drizzle-orm";
import { db, userActivityLogsTable, userStreaksTable } from "../../db";
import { calculateDailyStreak, getUtcDateKey } from "./utils";

export type StreakSummary = {
  activeSecondsToday: number;
  currentStreak: number;
  earnedToday: boolean;
  hasStarted: boolean;
  longestStreak: number;
  nextMilestone: number;
};

type RecordActivityInput = {
  activityType: "active_session" | "repository_creation" | "challenge_completion" | "proof_submission" | "profile_update";
  endedAt: Date;
  metadata?: Record<string, unknown>;
  startedAt: Date;
  userId: string;
};

export const EMPTY_STREAK_SUMMARY: StreakSummary = {
  activeSecondsToday: 0,
  currentStreak: 0,
  earnedToday: false,
  hasStarted: false,
  longestStreak: 0,
  nextMilestone: 7,
};

function getNextMilestone(currentStreak: number) {
  if (currentStreak < 7) {
    return 7;
  }

  if (currentStreak < 21) {
    return 21;
  }

  if (currentStreak < 30) {
    return 30;
  }

  return Math.ceil((currentStreak + 1) / 10) * 10;
}

function getPreviousUtcDateKey(date: Date) {
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);
  return getUtcDateKey(previousDate);
}

export async function getUserStreakSummary(userId: string): Promise<StreakSummary> {
  try {
    const [streak] = await db
      .select()
      .from(userStreaksTable)
      .where(eq(userStreaksTable.userId, userId))
      .limit(1);

    if (!streak) {
      return EMPTY_STREAK_SUMMARY;
    }

    const now = new Date();
    const todayKey = getUtcDateKey(now);
    const yesterdayKey = getPreviousUtcDateKey(now);
    const activeSecondsToday = streak.lastActivityDate === todayKey ? streak.activeSecondsToday : 0;
    const earnedToday = streak.lastQualifiedActivityDate === todayKey;
    const currentStreak =
      streak.lastQualifiedActivityDate === todayKey || streak.lastQualifiedActivityDate === yesterdayKey
        ? streak.currentStreak
        : 0;

    return {
      activeSecondsToday,
      currentStreak,
      earnedToday,
      hasStarted: true,
      longestStreak: streak.longestStreak,
      nextMilestone: getNextMilestone(currentStreak),
    };
  } catch {
    return EMPTY_STREAK_SUMMARY;
  }
}

export async function recordUserActivityForStreak(input: RecordActivityInput): Promise<StreakSummary> {
  const durationSeconds = Math.max(0, Math.floor((input.endedAt.getTime() - input.startedAt.getTime()) / 1000));
  const todayKey = getUtcDateKey(input.endedAt);

  try {
    const [existingStreak] = await db
      .select()
      .from(userStreaksTable)
      .where(eq(userStreaksTable.userId, input.userId))
      .limit(1);

    const activeSecondsToday =
      existingStreak?.lastActivityDate === todayKey
        ? existingStreak.activeSecondsToday + durationSeconds
        : durationSeconds;

    const calculated = calculateDailyStreak({
      activeSecondsToday,
      currentStreak: existingStreak?.currentStreak ?? 0,
      lastQualifiedActivityDate: existingStreak?.lastQualifiedActivityDate ?? null,
      longestStreak: existingStreak?.longestStreak ?? 0,
      now: input.endedAt,
    });

    await db.insert(userActivityLogsTable).values({
      activityType: input.activityType,
      durationSeconds,
      eligibleForStreak: calculated.earnedToday,
      endedAt: input.endedAt,
      metadata: input.metadata ?? null,
      startedAt: input.startedAt,
      userId: input.userId,
    });

    await db
      .insert(userStreaksTable)
      .values({
        activeSecondsToday: calculated.activeSecondsToday,
        currentStreak: calculated.currentStreak,
        lastActivityDate: todayKey,
        lastQualifiedActivityDate: calculated.lastQualifiedActivityDate,
        longestStreak: calculated.longestStreak,
        streakEarnedToday: calculated.earnedToday,
        updatedAt: new Date(),
        userId: input.userId,
      })
      .onConflictDoUpdate({
        target: userStreaksTable.userId,
        set: {
          activeSecondsToday: calculated.activeSecondsToday,
          currentStreak: calculated.currentStreak,
          lastActivityDate: todayKey,
          lastQualifiedActivityDate: calculated.lastQualifiedActivityDate,
          longestStreak: calculated.longestStreak,
          streakEarnedToday: calculated.earnedToday,
          updatedAt: new Date(),
        },
      });

    const [updatedStreak] = await db
      .select()
      .from(userStreaksTable)
      .where(eq(userStreaksTable.userId, input.userId))
      .limit(1);

    return {
      activeSecondsToday: updatedStreak.activeSecondsToday,
      currentStreak: updatedStreak.currentStreak,
      earnedToday: updatedStreak.lastQualifiedActivityDate === todayKey,
      hasStarted: true,
      longestStreak: updatedStreak.longestStreak,
      nextMilestone: getNextMilestone(updatedStreak.currentStreak),
    };
  } catch {
    return EMPTY_STREAK_SUMMARY;
  }
}
