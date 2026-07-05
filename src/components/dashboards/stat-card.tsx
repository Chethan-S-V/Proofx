"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Building2, FolderGit2, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

const statIcons = {
  building: Building2,
  folder: FolderGit2,
  shield: ShieldCheck,
  user: UserRound,
};

type StatCardProps = {
  icon: keyof typeof statIcons;
  label: string;
  value: string;
  helper: string;
  trend?: string;
  tone?: "cyan" | "emerald" | "slate";
};

const toneClasses = {
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function StatCard({ helper, icon: Icon, label, tone = "slate", trend, value }: StatCardProps) {
  const IconComponent = statIcons[Icon];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", toneClasses[tone])}>
            <IconComponent className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <p className="text-slate-500 dark:text-slate-400">{helper}</p>
          {trend ? (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-300">
              {trend}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
