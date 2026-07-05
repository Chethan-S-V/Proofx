import type { RepositoryCardModel } from "../repository.service";
import { RepositoryCard } from "./repository-card";

type RepositoryListProps = {
  bookmarkAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  forkAction: (formData: FormData) => Promise<void>;
  repositories: RepositoryCardModel[];
  starAction: (formData: FormData) => Promise<void>;
  watchAction: (formData: FormData) => Promise<void>;
};

export function RepositoryList({ bookmarkAction, deleteAction, forkAction, repositories, starAction, watchAction }: RepositoryListProps) {
  if (repositories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center">
        <h2 className="text-lg font-semibold text-white">No repositories found</h2>
        <p className="mt-2 text-sm text-slate-400">
          Create a repository or adjust search filters to build your ProofX source collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {repositories.map((repository) => (
        <RepositoryCard
          bookmarkAction={bookmarkAction}
          deleteAction={deleteAction}
          forkAction={forkAction}
          key={repository.id}
          repository={repository}
          starAction={starAction}
          watchAction={watchAction}
        />
      ))}
    </div>
  );
}
