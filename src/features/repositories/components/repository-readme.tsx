import { BookOpen } from "lucide-react";

type RepositoryReadmeProps = {
  readme: string | null;
};

export function RepositoryReadme({ readme }: RepositoryReadmeProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/35">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <BookOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-white">README</h3>
      </div>
      <div className="p-4">
        {readme ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-300">{readme}</pre>
        ) : (
          <p className="text-sm leading-6 text-slate-500">No README has been added yet.</p>
        )}
      </div>
    </div>
  );
}
