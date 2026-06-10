import { FileText, Plus, Save, UserPlus } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import type { RepositoryCardModel } from "../repository.service";

type RepositoryProfileProps = {
  addContributorAction: (formData: FormData) => Promise<void>;
  createAction: (formData: FormData) => Promise<void>;
  repositories: RepositoryCardModel[];
  updateAction: (formData: FormData) => Promise<void>;
};

export function RepositoryProfile({ addContributorAction, createAction, repositories, updateAction }: RepositoryProfileProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <Card className="border-slate-800 bg-slate-950/75 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-200">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Create Repository</h2>
            <p className="mt-1 text-sm text-slate-400">Start a proof source collection without building the proof engine.</p>
          </div>
        </div>

        <form action={createAction} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Name</span>
            <input
              className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
              name="name"
              placeholder="proofx-api"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
              name="description"
              placeholder="What this repository proves"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Visibility</span>
              <select
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                name="visibility"
                defaultValue="private"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Tags</span>
              <input
                className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                name="tags"
                placeholder="typescript, backend"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Source URL</span>
            <input
              className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
              name="sourceUrl"
              placeholder="https://github.com/org/repo"
              type="url"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Verified Skills</span>
            <input
              className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
              name="verifiedSkills"
              placeholder="React, Next.js, PostgreSQL"
            />
          </label>
          <label className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
            <input className="h-4 w-4 accent-cyan-400" defaultChecked name="recruiterVisible" type="checkbox" />
            Recruiter visible
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">README</span>
            <textarea
              className="min-h-32 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
              name="readme"
              placeholder="# Repository README"
            />
          </label>
          <Button className="w-full" type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create repository
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {repositories.map((repository) => (
          <Card className="border-slate-800 bg-slate-950/75 p-5" key={repository.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Edit {repository.name}</h2>
                <p className="mt-1 text-sm text-slate-400">Update metadata, visibility, README, and contributor access.</p>
              </div>
              <Badge variant="outline">{repository.visibility}</Badge>
            </div>

            <form action={updateAction} className="mt-5 space-y-4">
              <input name="repositoryId" type="hidden" value={repository.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Name</span>
                  <input className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="name" defaultValue={repository.name} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Visibility</span>
                  <select className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="visibility" defaultValue={repository.visibility}>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
                <textarea className="min-h-20 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none" name="description" defaultValue={repository.description ?? ""} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Tags</span>
                <input className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="tags" defaultValue={repository.tags.join(", ")} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Verified Skills</span>
                <input
                  className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                  name="verifiedSkills"
                  defaultValue={repository.verifiedSkills.join(", ")}
                />
              </label>
              <label className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                <input className="h-4 w-4 accent-cyan-400" defaultChecked={repository.recruiterVisible} name="recruiterVisible" type="checkbox" />
                Recruiter visible
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Source URL</span>
                <input className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="sourceUrl" defaultValue={repository.sourceUrl ?? ""} type="url" />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  README
                </span>
                <textarea className="min-h-32 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none" name="readme" defaultValue={repository.readme ?? ""} />
              </label>
              <Button type="submit">
                <Save className="h-4 w-4" aria-hidden="true" />
                Save repository
              </Button>
            </form>

            <form action={addContributorAction} className="mt-5 grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-[1fr_10rem_auto]">
              <input name="repositoryId" type="hidden" value={repository.id} />
              <input className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="userId" placeholder="Contributor user UUID" />
              <select className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none" name="role" defaultValue="contributor">
                <option value="maintainer">Maintainer</option>
                <option value="contributor">Contributor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button type="submit" variant="outline">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
