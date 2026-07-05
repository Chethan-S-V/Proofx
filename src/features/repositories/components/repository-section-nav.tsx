import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Code2,
  Eye,
  File,
  FileText,
  Folder,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  Search,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";
import type { RepositoryAnalyticsSummary } from "../repository-analytics.service";
import type { RepositoryCardModel } from "../repository.service";

type RepositorySectionNavProps = {
  analytics: RepositoryAnalyticsSummary;
  repositories: RepositoryCardModel[];
};

type RepositorySectionItem = {
  count?: number;
  href: string;
  icon: typeof Code2;
  label: string;
  state?: "active" | "default";
};

function getUniqueTagCount(repositories: RepositoryCardModel[]) {
  return new Set(repositories.flatMap((repository) => repository.tags)).size;
}

export function RepositorySectionNav({ analytics, repositories }: RepositorySectionNavProps) {
  const readmeCount = repositories.filter((repository) => Boolean(repository.readme)).length;
  const tagCount = getUniqueTagCount(repositories);

  const sections: RepositorySectionItem[] = [
    { href: "#repositories", icon: Code2, label: "Code", state: "active" },
    { count: readmeCount, href: "#repositories", icon: BookOpen, label: "README" },
    { count: 0, href: "#repositories", icon: File, label: "Files" },
    { count: 0, href: "#repositories", icon: Folder, label: "Folders" },
    { count: 0, href: "#repositories", icon: GitBranch, label: "Branches" },
    { count: 0, href: "#repositories", icon: GitCommitHorizontal, label: "Commits" },
    { count: analytics.stars, href: "#repositories", icon: Star, label: "Stars" },
    { count: analytics.watchers, href: "#repositories", icon: Eye, label: "Watchers" },
    { count: analytics.forks, href: "#repositories", icon: GitFork, label: "Forks" },
    { count: analytics.contributors, href: "#repositories", icon: Users, label: "Contributors" },
    { count: 0, href: "#repositories", icon: GitBranch, label: "Releases" },
    { count: tagCount, href: "#repositories", icon: Tag, label: "Tags" },
    { href: "#repository-search", icon: Search, label: "Search" },
    { href: "#repository-insights", icon: BarChart3, label: "Insights" },
    { count: 0, href: "#repository-planning", icon: FileText, label: "Issues" },
    { count: 0, href: "#repository-planning", icon: Tag, label: "Labels" },
    { count: 0, href: "#repository-planning", icon: GitBranch, label: "Milestones" },
    { count: 0, href: "#repository-planning", icon: Users, label: "Discussions" },
    { count: 0, href: "#repository-planning", icon: Folder, label: "Projects" },
  ];

  return (
    <Card className="border-slate-800 bg-slate-950/75 p-3" id="repository-sections">
      <nav aria-label="Repository sections" className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
                section.state === "active"
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                  : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white",
              )}
              href={section.href}
              key={section.label}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{section.label}</span>
              {typeof section.count === "number" ? (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-300">{section.count}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
