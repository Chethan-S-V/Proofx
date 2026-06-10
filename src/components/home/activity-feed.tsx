"use client";

import { motion } from "framer-motion";
import { Building2, Eye, FolderGit2, ShieldCheck, Trophy } from "lucide-react";
import type { HomeFeedSection } from "../../lib/home/service";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";

type ActivityFeedProps = {
  sections: HomeFeedSection[];
};

const feedIcons = [FolderGit2, ShieldCheck, Trophy, Building2, Eye];

export function ActivityFeed({ sections }: ActivityFeedProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <Card className="border-slate-800 bg-slate-950/70">
      <CardHeader className="border-b border-slate-800">
        <div>
          <p className="text-sm font-medium text-cyan-200">Professional activity</p>
          <h2 className="mt-2 text-xl font-semibold text-white">ProofX activity feed</h2>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="divide-y divide-slate-800">
          {sections.map((section, index) => {
            const Icon = feedIcons[index] ?? FolderGit2;

            return (
              <section className="scroll-mt-24 grid gap-4 p-5 sm:grid-cols-[2.5rem_1fr]" id={section.anchorId} key={section.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-slate-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{section.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{section.description}</p>
                    </div>
                    <Badge className="w-fit" variant="outline">No records</Badge>
                  </div>
                  <div className="mt-4 rounded-lg border border-dashed border-slate-800 bg-slate-900/35 p-4">
                    <p className="text-sm text-slate-400">{section.emptyState}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
