export const DAILY_STREAK_MINIMUM_SECONDS = 10 * 60;

export const FUTURE_STREAK_ELIGIBLE_ACTIONS = [
  "repository_creation",
  "challenge_completion",
  "proof_submission",
  "profile_update",
] as const;

export type FutureStreakEligibleAction = (typeof FUTURE_STREAK_ELIGIBLE_ACTIONS)[number];

export type StreakCalculationInput = {
  activeSecondsToday: number;
  currentStreak: number;
  lastQualifiedActivityDate: string | null;
  longestStreak: number;
  now?: Date;
};

export type StreakCalculationResult = {
  activeSecondsToday: number;
  currentStreak: number;
  earnedToday: boolean;
  lastQualifiedActivityDate: string | null;
  longestStreak: number;
};

export function getUtcDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPreviousUtcDateKey(date: Date) {
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);
  return getUtcDateKey(previousDate);
}

export function calculateDailyStreak(input: StreakCalculationInput): StreakCalculationResult {
  const now = input.now ?? new Date();
  const todayKey = getUtcDateKey(now);
  const yesterdayKey = getPreviousUtcDateKey(now);
  const activeSecondsToday = Math.max(0, input.activeSecondsToday);
  const earnedToday = activeSecondsToday >= DAILY_STREAK_MINIMUM_SECONDS;

  if (!earnedToday) {
    return {
      activeSecondsToday,
      currentStreak: input.currentStreak,
      earnedToday: false,
      lastQualifiedActivityDate: input.lastQualifiedActivityDate,
      longestStreak: input.longestStreak,
    };
  }

  if (input.lastQualifiedActivityDate === todayKey) {
    return {
      activeSecondsToday,
      currentStreak: input.currentStreak,
      earnedToday: true,
      lastQualifiedActivityDate: todayKey,
      longestStreak: Math.max(input.longestStreak, input.currentStreak),
    };
  }

  const nextStreak = input.lastQualifiedActivityDate === yesterdayKey ? input.currentStreak + 1 : 1;

  return {
    activeSecondsToday,
    currentStreak: nextStreak,
    earnedToday: true,
    lastQualifiedActivityDate: todayKey,
    longestStreak: Math.max(input.longestStreak, nextStreak),
  };
}
