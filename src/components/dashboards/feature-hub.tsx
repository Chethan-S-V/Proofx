import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  Filter,
  MessageSquare,
  PenSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { FeatureHubData, FeatureIcon } from "../../lib/dashboard/feature-catalog";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

const icons: Record<FeatureIcon, LucideIcon> = {
  activity: Activity,
  analytics: BarChart3,
  building: Building2,
  check: CheckCircle2,
  clock: Clock3,
  code: Code2,
  filter: Filter,
  message: MessageSquare,
  post: PenSquare,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  target: Target,
  team: Users,
  trophy: Trophy,
};

export function FeatureHub({ data }: { data: FeatureHubData }) {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
          <div>
            <p className="text-sm font-medium text-cyan-300">{data.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{data.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">{data.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {data.actions.map((action, index) => (
                <Link
                  className={
                    index === 0
                      ? "rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                      : "rounded-md border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
                  }
                  href={action.href}
                  key={action.href}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {data.highlights.map((item) => (
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4" key={item.label}>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cyan-300">Feature set</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Everything in one workflow</h2>
          </div>
          <Badge variant="outline">Built for verified work</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.features.map((feature) => {
            const Icon = icons[feature.icon];
            return (
              <Card className="border-slate-800 bg-slate-950 p-5" key={feature.title}>
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge variant="muted">{feature.status}</Badge>
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <p className="text-sm font-medium text-cyan-300">How it flows</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {data.workflow.map((step, index) => (
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/55 p-5" key={step.title}>
              <span className="text-xs font-semibold text-cyan-300">0{index + 1}</span>
              <h3 className="mt-3 text-sm font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
