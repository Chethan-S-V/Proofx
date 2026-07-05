import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

type SectionPlaceholderProps = {
  description: string;
  icon: LucideIcon;
  label: string;
  title: string;
};

export function SectionPlaceholder({ description, icon: Icon, label, title }: SectionPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{label}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      <Card className="p-8">
        <div className="flex max-w-2xl flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Foundation route is ready</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              This page exists to complete dashboard navigation and responsive shell behavior. Feature logic and data
              implementation are intentionally not included yet.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
