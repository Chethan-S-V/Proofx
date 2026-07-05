"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../ui/card";

type MetricCardProps = {
  caption: string;
  label: string;
  value: number;
};

export function MetricCard({ caption, label, value }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">{label}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
          </div>
          <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-sm font-semibold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
            {value}%
          </span>
        </CardHeader>
        <CardContent>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-2 rounded-full bg-cyan-500 dark:bg-cyan-300"
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
