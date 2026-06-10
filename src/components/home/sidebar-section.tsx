"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Sparkles } from "lucide-react";
import type { HomeCollection } from "../../lib/home/service";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

type SidebarSectionProps = {
  collection: HomeCollection;
  icon: "badges" | "skills";
};

const sectionIcons = {
  badges: BadgeCheck,
  skills: Sparkles,
};

export function SidebarSection({ collection, icon }: SidebarSectionProps) {
  const hasItems = collection.items.length > 0;
  const Icon = sectionIcons[icon];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="border-slate-800 bg-slate-950/75 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-slate-300">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-white">{collection.title}</h2>
        </div>

        <div className="mt-4">
          {hasItems ? (
            <div className="flex flex-wrap gap-2">
              {collection.items.map((item) => (
                <Badge key={item} variant="muted">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/35 p-4">
              <p className="text-sm leading-6 text-slate-400">{collection.emptyState}</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
