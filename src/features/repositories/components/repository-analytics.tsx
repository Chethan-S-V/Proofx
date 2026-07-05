import { BarChart3, Bookmark, Eye, GitFork, ShieldCheck, Star, Users } from "lucide-react";
import { Card } from "../../../components/ui/card";
import type { RepositoryAnalyticsSummary } from "../repository-analytics.service";

type RepositoryAnalyticsProps = {
  analytics: RepositoryAnalyticsSummary;
};

const analyticsItems = [
  {
    key: "views",
    icon: BarChart3,
    label: "Views",
  },
  {
    key: "stars",
    icon: Star,
    label: "Stars",
  },
  {
    key: "watchers",
    icon: Eye,
    label: "Watchers",
  },
  {
    key: "forks",
    icon: GitFork,
    label: "Forks",
  },
  {
    key: "bookmarks",
    icon: Bookmark,
    label: "Bookmarks",
  },
  {
    key: "contributors",
    icon: Users,
    label: "Contributors",
  },
  {
    key: "proofSubmissions",
    icon: ShieldCheck,
    label: "Proof submissions",
  },
  {
    key: "trustImpact",
    icon: ShieldCheck,
    label: "Trust impact",
  },
  {
    key: "proofImpact",
    icon: BarChart3,
    label: "Proof impact",
  },
  {
    key: "recruiterViews",
    icon: Eye,
    label: "Recruiter views",
  },
] as const;

export function RepositoryAnalytics({ analytics }: RepositoryAnalyticsProps) {
  return (
    <Card className="border-slate-800 bg-slate-950/75 p-5">
      <div>
        <p className="text-sm font-medium text-cyan-200">Repository analytics</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Signal overview</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Analytics summarize repository activity only. Proof engine metrics remain at zero until that system exists.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {analyticsItems.map((item) => {
          const Icon = item.icon;

          return (
            <div className="rounded-lg border border-slate-800 bg-slate-900/45 p-4" key={item.key}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-400">{item.label}</p>
                <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{analytics[item.key]}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
