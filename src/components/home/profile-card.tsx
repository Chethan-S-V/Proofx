"use client";

import { motion } from "framer-motion";
import { Building2, FolderGit2, ShieldCheck } from "lucide-react";
import type { HomeMetric, HomeProfileSummary } from "../../lib/home/service";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

type ProfileCardProps = {
  profile: HomeProfileSummary;
  quickStats: HomeMetric[];
};

const statIcons = [FolderGit2, ShieldCheck, Building2];

export function ProfileCard({ profile, quickStats }: ProfileCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
    <Card className="overflow-hidden border-slate-800 bg-slate-950/80 shadow-[0_18px_70px_rgba(2,6,23,0.35)]">
      <div className="h-20 bg-[linear-gradient(135deg,#0891b2,#0f172a_52%,#166534)]" />
      <div className="px-5 pb-5">
        <div className="-mt-8 flex h-16 w-16 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-xl font-semibold text-white shadow-xl">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="h-full w-full rounded-lg object-cover" src={profile.avatarUrl} alt="" />
          ) : (
            profile.initials
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold text-white">{profile.displayName}</h2>
          <p className="mt-1 truncate text-sm text-slate-400">{profile.email}</p>
          <Badge className="mt-3" variant="default">
            {profile.roleLabel}
          </Badge>
        </div>

        <div className="mt-5 grid gap-3">
          {quickStats.map((stat, index) => {
            const Icon = statIcons[index] ?? ShieldCheck;

            return (
              <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/45 p-3" key={stat.label}>
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-slate-800 text-slate-200">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-200">{stat.label}</p>
                    <p className="text-sm font-semibold text-white">{stat.value}</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{stat.helper}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
    </motion.div>
  );
}
