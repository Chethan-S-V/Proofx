"use client";

import Link from "next/link";
import { Building2, FolderGit2, Search, Trophy, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEMO_MODE_ENABLED, searchDemoContent } from "../../demo/home/data";

type SearchResult = {
  description: string;
  href: string;
  id: string;
  imageUrl?: string | null;
  kind: "person" | "organization" | "repository" | "challenge";
  title: string;
};

type SearchResponse = {
  organizations: SearchResult[];
  people: SearchResult[];
  repositories: SearchResult[];
  challenges: SearchResult[];
};

const emptyResults: SearchResponse = {
  organizations: [],
  people: [],
  repositories: [],
  challenges: [],
};

const sectionIcons = { Challenges: Trophy, Organizations: Building2, Professionals: UsersRound, Repositories: FolderGit2 };
function ResultSection({ emptyText, results, title }: { emptyText: string; results: SearchResult[]; title: keyof typeof sectionIcons }) {
  const Icon = sectionIcons[title];
  return (
    <div className="border-t border-slate-800 py-2 first:border-t-0">
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      {results.length > 0 ? (
        <div className="space-y-1">
          {results.map((result) => (
            <Link
              className="flex items-start gap-3 rounded-md px-3 py-2 transition hover:bg-slate-900"
              href={result.href}
              key={`${result.kind}-${result.id}`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-cyan-300">
                {result.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="h-full w-full rounded-md object-cover" src={result.imageUrl} />
                ) : (
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{result.title}</span>
                <span className="block truncate text-xs text-slate-500">{result.description}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="px-3 py-2 text-xs text-slate-600">{emptyText}</p>
      )}
    </div>
  );
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<"all" | "people" | "repositories" | "organizations" | "challenges">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);

      try {
        if (DEMO_MODE_ENABLED) {
          const matches = searchDemoContent(query);
          setResults({
            organizations: matches.filter((result) => result.kind === "organization"),
            people: matches.filter((result) => result.kind === "person"),
            repositories: matches.filter((result) => result.kind === "repository"),
            challenges: matches.filter((result) => result.kind === "challenge"),
          });
          setOpen(true);
          return;
        }

        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });

        if (response.ok) {
          const responseResults = (await response.json()) as Omit<SearchResponse, "challenges">;
          setResults({ ...responseResults, challenges: [] });
          setOpen(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults(emptyResults);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="relative hidden min-w-0 flex-1 md:block" ref={containerRef}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      <input
        aria-label="Search ProofX"
        className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-9 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search people, repositories, organizations, challenges..."
        type="search"
        value={query}
      />
      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[28rem] overflow-auto rounded-md border border-slate-800 bg-slate-950 p-2 shadow-2xl">
          {loading ? <p className="px-3 py-3 text-sm text-slate-500">Searching...</p> : null}
          <div className="flex gap-1 overflow-x-auto px-1 pb-2">
            {[["all", "All"], ["people", "People"], ["repositories", "Repositories"], ["organizations", "Organizations"], ["challenges", "Challenges"]].map(([value, label]) => <button className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${activeKind === value ? "bg-cyan-300 text-slate-950" : "bg-slate-900 text-slate-300"}`} key={value} onClick={() => setActiveKind(value as typeof activeKind)} type="button">{label}</button>)}
          </div>
          {(activeKind === "all" || activeKind === "people") ? <ResultSection emptyText="No matching professionals found." results={results.people} title="Professionals" /> : null}
          {(activeKind === "all" || activeKind === "repositories") ? <ResultSection emptyText="No matching repositories found." results={results.repositories} title="Repositories" /> : null}
          {(activeKind === "all" || activeKind === "organizations") ? <ResultSection emptyText="No matching organizations found." results={results.organizations} title="Organizations" /> : null}
          {(activeKind === "all" || activeKind === "challenges") ? <ResultSection emptyText="No matching challenges found." results={results.challenges} title="Challenges" /> : null}
        </div>
      ) : null}
    </div>
  );
}
