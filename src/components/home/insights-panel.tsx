"use client";

import { motion } from "framer-motion";
import { BarChart3, Eye, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import type { HomeInsight } from "../../lib/home/service";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

type InsightsPanelProps = {
  insights: HomeInsight[];
};

const insightIcons = [ShieldCheck, Trophy, BarChart3, Eye, Sparkles];

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <aside className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="border-slate-800 bg-slate-950/80 p-5">
        <p className="text-sm font-medium text-cyan-200">Insights</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Career signal board</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Metrics appear here only after ProofX has verified activity to measure.
        </p>
      </Card>
      </motion.div>

      <div className="grid gap-3">
        {insights.map((insight, index) => {
          const Icon = insightIcons[index] ?? BarChart3;

          return (
            <motion.div
              id={insight.anchorId}
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              key={insight.label}
            >
            <Card className="border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-slate-900 text-slate-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{insight.label}</p>
                    <Badge variant="outline">{insight.value}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{insight.helper}</p>
                </div>
              </div>
            </Card>
            </motion.div>
          );
        })}
      </div>
    </aside>
  );
}
