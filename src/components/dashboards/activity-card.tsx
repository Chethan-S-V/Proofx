"use client";

import { motion } from "framer-motion";
import { Activity, BadgeCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";

const activityIcons = {
  activity: Activity,
  badge: BadgeCheck,
  shield: ShieldCheck,
};

type ActivityItem = {
  icon: keyof typeof activityIcons;
  title: string;
  description: string;
  timestamp: string;
};

type ActivityCardProps = {
  items: ActivityItem[];
  title: string;
};

export function ActivityCard({ items, title }: ActivityCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Workspace shell activity preview</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => {
              const IconComponent = activityIcons[item.icon];

              return (
                <div className="flex gap-3" key={`${item.title}-${item.timestamp}`}>
                  <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <IconComponent className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{item.title}</p>
                      <span className="flex-none text-xs text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
