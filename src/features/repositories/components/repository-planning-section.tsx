import { FileText, Folder, GitBranch, Tag, Users } from "lucide-react";
import { Card } from "../../../components/ui/card";

const planningItems = [
  {
    description: "Track repository work once issue records are introduced.",
    icon: FileText,
    label: "Issues",
  },
  {
    description: "Group repository work with reusable classification tags.",
    icon: Tag,
    label: "Labels",
  },
  {
    description: "Collect related issues and proof work into delivery goals.",
    icon: GitBranch,
    label: "Milestones",
  },
  {
    description: "Host repository-level decisions and technical context.",
    icon: Users,
    label: "Discussions",
  },
  {
    description: "Organize repository roadmaps and planning boards.",
    icon: Folder,
    label: "Projects",
  },
] as const;

export function RepositoryPlanningSection() {
  return (
    <Card className="border-slate-800 bg-slate-950/75 p-5" id="repository-planning">
      <div>
        <p className="text-sm font-medium text-cyan-200">Repository planning</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Issues, labels, milestones, discussions, and projects</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Planning modules are reserved in the repository platform and ready for their dedicated data model.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {planningItems.map((item) => {
          const Icon = item.icon;

          return (
            <div className="rounded-lg border border-slate-800 bg-slate-900/45 p-4" key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">0 active</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
