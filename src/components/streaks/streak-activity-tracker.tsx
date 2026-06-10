"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_MS = 30_000;
const MIN_HEARTBEAT_MS = 5_000;
const MIDNIGHT_REFRESH_DELAY_MS = 1_000;

function getMsUntilNextMidnight() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);

  return Math.max(0, nextMidnight.getTime() - now.getTime()) + MIDNIGHT_REFRESH_DELAY_MS;
}

async function postActivity(startedAt: Date, endedAt: Date) {
  if (endedAt.getTime() - startedAt.getTime() < MIN_HEARTBEAT_MS) {
    return false;
  }

  try {
    const response = await fetch("/api/streaks/activity", {
      body: JSON.stringify({
        endedAt: endedAt.toISOString(),
        startedAt: startedAt.toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
    });

    if (!response.ok) {
      return false;
    }

    window.dispatchEvent(new CustomEvent("proofx:streak-updated", { detail: await response.json() }));
    return true;
  } catch {
    return false;
  }
}

export function StreakActivityTracker() {
  const isPosting = useRef(false);
  const segmentStartedAt = useRef<Date | null>(null);

  useEffect(() => {
    segmentStartedAt.current = new Date();

    async function refreshStreak() {
      try {
        const response = await fetch("/api/streaks/activity");

        if (response.ok) {
          window.dispatchEvent(new CustomEvent("proofx:streak-updated", { detail: await response.json() }));
        }
      } catch {
        return;
      }
    }

    function flushActivity(options: { force?: boolean } = {}) {
      const startedAt = segmentStartedAt.current;

      if (isPosting.current || !startedAt || (!options.force && document.visibilityState !== "visible")) {
        return;
      }

      const endedAt = new Date();
      isPosting.current = true;
      void postActivity(startedAt, endedAt).then((saved) => {
        if (saved) {
          segmentStartedAt.current = endedAt;
        }
        isPosting.current = false;
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        segmentStartedAt.current = new Date();
        return;
      }

      flushActivity({ force: true });
      segmentStartedAt.current = null;
    }

    function handlePageHide() {
      flushActivity({ force: true });
    }

    const heartbeatId = window.setInterval(flushActivity, HEARTBEAT_MS);
    let midnightTimeoutId: number | undefined;

    function scheduleMidnightRefresh() {
      midnightTimeoutId = window.setTimeout(() => {
        flushActivity({ force: true });
        segmentStartedAt.current = new Date();
        void refreshStreak();
        scheduleMidnightRefresh();
      }, getMsUntilNextMidnight());
    }

    void refreshStreak();
    scheduleMidnightRefresh();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(heartbeatId);
      if (midnightTimeoutId) {
        window.clearTimeout(midnightTimeoutId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      flushActivity({ force: true });
    };
  }, []);

  return null;
}
