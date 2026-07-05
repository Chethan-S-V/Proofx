"use client";

import { motion } from "framer-motion";
import { Flame, Lock, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StreakSummary } from "../../lib/streaks/service";
import { DAILY_STREAK_MINIMUM_SECONDS } from "../../lib/streaks/utils";

type StreakDisplayProps = {
  streak: StreakSummary;
};

const TIERS = [
  { label: "Diamond Systems Lead", minimumDays: 2000 },
  { label: "Platinum Architect", minimumDays: 1000 },
  { label: "Gold Engineer", minimumDays: 500 },
  { label: "Silver Builder", minimumDays: 250 },
  { label: "Bronze Coder", minimumDays: 100 },
] as const;

const BADGE_TIERS = [
  { accent: "from-slate-400 to-cyan-300", label: "Starter Coder", minimumDays: 0, shortLabel: "SC" },
  { accent: "from-amber-700 to-orange-300", label: "Bronze Coder", minimumDays: 100, shortLabel: "BC" },
  { accent: "from-slate-300 to-white", label: "Silver Builder", minimumDays: 250, shortLabel: "SB" },
  { accent: "from-yellow-300 to-amber-500", label: "Gold Engineer", minimumDays: 500, shortLabel: "GE" },
  { accent: "from-cyan-200 to-indigo-300", label: "Platinum Architect", minimumDays: 1000, shortLabel: "PA" },
  { accent: "from-cyan-300 via-white to-fuchsia-300", label: "Diamond Systems Lead", minimumDays: 2000, shortLabel: "DS" },
] as const;

function getTierLabel(currentStreak: number) {
  return TIERS.find((tier) => currentStreak >= tier.minimumDays)?.label ?? "Starter Coder";
}

function getNextLockedBadge(currentStreak: number) {
  return BADGE_TIERS.find((tier) => currentStreak < tier.minimumDays) ?? null;
}

function TierBadge({
  currentStreak,
  tier,
}: {
  currentStreak: number;
  tier: (typeof BADGE_TIERS)[number];
}) {
  const unlocked = currentStreak >= tier.minimumDays;

  return (
    <div
      className={
        unlocked
          ? "relative flex items-center gap-2 rounded-md border border-cyan-300/25 bg-slate-950 p-2"
          : "relative flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/70 p-2 opacity-60"
      }
    >
      <motion.span
        className={`relative flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br ${tier.accent} text-xs font-black text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.2)]`}
        animate={unlocked ? { rotate: [0, -4, 4, 0], scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 2.6, repeat: Infinity }}
      >
        {unlocked ? <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-white" aria-hidden="true" /> : null}
        {unlocked ? tier.shortLabel : <Lock className="h-4 w-4 text-slate-700" aria-hidden="true" />}
      </motion.span>
      <span className="min-w-0">
        <span className={unlocked ? "block truncate text-xs font-semibold text-white" : "block truncate text-xs font-semibold text-slate-500"}>
          {tier.label}
        </span>
        <span className="block text-[11px] text-slate-500">
          {unlocked ? "Unlocked" : `${tier.minimumDays} streak`}
        </span>
      </span>
    </div>
  );
}

function StreakBlast({ runId }: { runId: number }) {
  const particles = Array.from({ length: 48 }, (_, index) => {
    const angle = (index / 48) * Math.PI * 2;
    const distance = 120 + (index % 6) * 28;

    return {
      color: ["#22d3ee", "#a3e635", "#facc15", "#fb7185", "#c084fc", "#ffffff"][index % 6],
      id: `${runId}-${index}`,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });
  const bolts = Array.from({ length: 10 }, (_, index) => ({
    id: `${runId}-bolt-${index}`,
    rotate: index * 36,
  }));

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1, scale: 0.8 }}
      animate={{ opacity: 0, scale: 1.2 }}
      transition={{ delay: 1.35, duration: 0.5, ease: "easeOut" }}
      key={runId}
    >
      <motion.div
        className="absolute inset-0 bg-cyan-300/20 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.2, 0] }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      <motion.span
        className="absolute h-28 w-28 rounded-full bg-white shadow-[0_0_90px_rgba(34,211,238,0.85)]"
        initial={{ scale: 0.08, opacity: 1 }}
        animate={{ scale: [0.08, 1.4, 0.35], opacity: [1, 0.9, 0] }}
        transition={{ duration: 0.82, ease: "easeOut" }}
      />
      {bolts.map((bolt) => (
        <motion.span
          className="absolute h-3 w-44 origin-left rounded-full bg-gradient-to-r from-white via-cyan-200 to-transparent"
          initial={{ opacity: 0, rotate: bolt.rotate, scaleX: 0 }}
          animate={{ opacity: [0, 1, 0], rotate: bolt.rotate + 18, scaleX: [0, 1, 0.35] }}
          transition={{ duration: 0.62, ease: "easeOut" }}
          key={bolt.id}
        />
      ))}
      {particles.map((particle) => (
        <motion.span
          className="absolute h-3 w-3 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.9)]"
          style={{ backgroundColor: particle.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: particle.x, y: particle.y, opacity: 0, rotate: 540, scale: [1, 1.8, 0.2] }}
          transition={{ duration: 1.35, ease: "easeOut" }}
          key={particle.id}
        />
      ))}
      <motion.div
        className="relative rounded-lg border border-white/20 bg-slate-950 px-6 py-4 text-center shadow-[0_0_70px_rgba(34,211,238,0.55)]"
        initial={{ opacity: 0, scale: 0.2, rotate: -10, y: 24 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.18, 1, 0.92], rotate: [-10, 5, 0], y: [24, -8, 0] }}
        transition={{ duration: 1.45, ease: "easeOut" }}
      >
        <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Day streak</p>
        <p className="mt-1 text-3xl font-black uppercase tracking-normal text-white">Complete</p>
        <p className="mt-1 text-sm font-bold text-lime-300">+1 verified day</p>
      </motion.div>
    </motion.div>
  );
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const [liveStreak, setLiveStreak] = useState(streak);
  const [blastId, setBlastId] = useState(0);
  const previousEarnedToday = useRef(streak.earnedToday);
  const progress = Math.min(100, Math.round((liveStreak.activeSecondsToday / DAILY_STREAK_MINIMUM_SECONDS) * 100));
  const isBuilding = liveStreak.hasStarted && !liveStreak.earnedToday && progress > 0;
  const label = liveStreak.hasStarted ? getTierLabel(liveStreak.currentStreak) : "Null";
  const nextLockedBadge = getNextLockedBadge(liveStreak.currentStreak);

  useEffect(() => {
    setLiveStreak(streak);
  }, [streak]);

  useEffect(() => {
    if (!previousEarnedToday.current && liveStreak.earnedToday && liveStreak.hasStarted) {
      setBlastId((current) => current + 1);
    }

    previousEarnedToday.current = liveStreak.earnedToday;
  }, [liveStreak.earnedToday, liveStreak.hasStarted]);

  useEffect(() => {
    function handleStreakUpdate(event: Event) {
      const nextStreak = (event as CustomEvent<StreakSummary>).detail;

      if (nextStreak) {
        setLiveStreak(nextStreak);
      }
    }

    window.addEventListener("proofx:streak-updated", handleStreakUpdate);

    return () => {
      window.removeEventListener("proofx:streak-updated", handleStreakUpdate);
    };
  }, []);

  return (
    <div className="group relative">
      {blastId > 0 ? <StreakBlast runId={blastId} /> : null}
      <motion.div
        className="relative flex h-8 min-w-32 overflow-hidden rounded-md border border-slate-800 bg-slate-950 px-2.5 text-xs font-semibold text-white shadow-sm"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        title={`Current streak: ${liveStreak.currentStreak}. Longest streak: ${liveStreak.longestStreak}.`}
      >
        <motion.span
          className="absolute inset-y-0 left-0 bg-cyan-400/10"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
        <span className="relative flex items-center gap-1.5">
          <motion.span
            animate={{
              filter: liveStreak.earnedToday || isBuilding ? "drop-shadow(0 0 10px rgb(34 211 238 / 0.65))" : "none",
              scale: liveStreak.earnedToday ? [1, 1.18, 1] : isBuilding ? [1, 1.08, 1] : 1,
            }}
            transition={{
              duration: liveStreak.earnedToday ? 1 : 2.4,
              repeat: liveStreak.earnedToday || isBuilding ? Infinity : 0,
            }}
          >
            <Flame
              className={liveStreak.hasStarted ? "h-3.5 w-3.5 text-cyan-300" : "h-3.5 w-3.5 text-slate-500"}
              aria-hidden="true"
            />
          </motion.span>
          <span>{label}</span>
          {liveStreak.hasStarted ? <span className="text-xs text-slate-400">{liveStreak.currentStreak}</span> : null}
        </span>
      </motion.div>

      <div className="pointer-events-none absolute left-0 top-10 z-50 w-80 translate-y-1 rounded-lg border border-slate-800 bg-slate-950 p-3 opacity-0 shadow-2xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Streak badges</p>
          <p className="text-xs text-slate-500">{liveStreak.currentStreak} streak</p>
        </div>
        <div className="mt-3">
          {nextLockedBadge ? (
            <TierBadge currentStreak={liveStreak.currentStreak} tier={nextLockedBadge} />
          ) : (
            <div className="rounded-md border border-cyan-300/25 bg-cyan-300/10 p-3 text-xs text-cyan-100">
              All streak badges unlocked.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
