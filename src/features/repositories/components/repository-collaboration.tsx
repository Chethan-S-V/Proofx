import { Activity, Users } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import type { RepositoryCardModel } from "../repository.service";

type RepositoryCollaborationProps = {
  repository: RepositoryCardModel;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function RepositoryCollaboration({ repository }: RepositoryCollaborationProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-800 bg-slate-900/35 p-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-white">Contributors</h3>
        </div>
        <div className="mt-4 space-y-3">
          {repository.contributors.map((contributor) => (
            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/35 px-3 py-2" key={contributor.userId}>
              <span className="truncate font-mono text-xs text-slate-300">{contributor.userId}</span>
              <Badge variant="outline">{contributor.role}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/35 p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-white">Activity</h3>
        </div>
        <div className="mt-4 space-y-3">
          {repository.activity.length > 0 ? (
            repository.activity.map((event) => (
              <div className="grid grid-cols-[4rem_1fr] gap-3 text-sm" key={event.id}>
                <span className="text-xs text-slate-500">{formatDate(event.createdAt)}</span>
                <p className="text-slate-300">{event.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-slate-500">No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
