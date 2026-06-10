import { BarChart3, BookOpen, Eye, GitBranch, Lock, MoreHorizontal, ShieldCheck, Trash2, Users } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import type { RepositoryCardModel } from "../repository.service";
import { BookmarkButton } from "./bookmark-button";
import { ForkButton } from "./fork-button";
import { RepositoryCollaboration } from "./repository-collaboration";
import { RepositoryReadme } from "./repository-readme";
import { StarButton } from "./star-button";
import { WatchButton } from "./watch-button";

type RepositoryCardProps = {
  bookmarkAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  forkAction: (formData: FormData) => Promise<void>;
  repository: RepositoryCardModel;
  starAction: (formData: FormData) => Promise<void>;
  watchAction: (formData: FormData) => Promise<void>;
};

const visibilityIcons = {
  private: Lock,
  public: Eye,
  unlisted: MoreHorizontal,
};

export function RepositoryCard({ bookmarkAction, deleteAction, forkAction, repository, starAction, watchAction }: RepositoryCardProps) {
  const VisibilityIcon = visibilityIcons[repository.visibility];

  return (
    <Card className="border-slate-800 bg-slate-950/75 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <GitBranch className="h-4 w-4 text-cyan-200" aria-hidden="true" />
            <h2 className="truncate text-lg font-semibold text-white">{repository.name}</h2>
            <Badge variant="outline">
              <VisibilityIcon className="mr-1 h-3 w-3" aria-hidden="true" />
              {repository.visibility}
            </Badge>
            {repository.recruiterVisible ? <Badge>Recruiter visible</Badge> : <Badge variant="outline">Recruiter hidden</Badge>}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {repository.description || "No repository description yet."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {repository.tags.length > 0 ? (
              repository.tags.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No tags</Badge>
            )}
          </div>

          {repository.verifiedSkills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {repository.verifiedSkills.map((skill) => (
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-100" key={skill}>
                  <ShieldCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                  {skill}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StarButton
            action={starAction}
            count={repository.analytics.stars}
            isStarred={repository.isStarred}
            repositoryId={repository.id}
          />
          <WatchButton
            action={watchAction}
            count={repository.analytics.watchers}
            isWatching={repository.isWatching}
            repositoryId={repository.id}
          />
          <ForkButton action={forkAction} count={repository.analytics.forks} repositoryId={repository.id} />
          <BookmarkButton
            action={bookmarkAction}
            count={repository.analytics.bookmarks}
            isBookmarked={repository.isBookmarked}
            repositoryId={repository.id}
          />
          <form action={deleteAction}>
            <input name="repositoryId" type="hidden" value={repository.id} />
            <Button size="sm" type="submit" variant="outline">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slate-800 pt-4 text-sm text-slate-400 sm:grid-cols-3 lg:grid-cols-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {repository.readme ? "README ready" : "No README"}
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" aria-hidden="true" />
          {repository.analytics.contributors} contributors
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" aria-hidden="true" />
          {repository.analytics.views} views
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          +{repository.analytics.trustImpact} trust
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          +{repository.analytics.proofImpact} proof
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          {repository.analytics.recruiterViews} recruiter views
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <RepositoryReadme readme={repository.readme} />
        <RepositoryCollaboration repository={repository} />
      </div>
    </Card>
  );
}
