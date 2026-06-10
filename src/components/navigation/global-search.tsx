"use client";

import Link from "next/link";
import { Search, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SearchResult = {
  description: string;
  href: string;
  id: string;
  kind: "person" | "proof" | "organization";
  title: string;
};

type SearchResponse = {
  organizations: SearchResult[];
  people: SearchResult[];
  proofs: SearchResult[];
};

const emptyResults: SearchResponse = {
  organizations: [],
  people: [],
  proofs: [],
};

function ResultSection({ emptyText, results, title }: { emptyText: string; results: SearchResult[]; title: string }) {
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
                <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(emptyResults);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });

        if (response.ok) {
          setResults((await response.json()) as SearchResponse);
          setOpen(true);
        }
      } catch (error) {
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
        placeholder="Search proofs, people, organizations..."
        type="search"
        value={query}
      />
      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[28rem] overflow-auto rounded-md border border-slate-800 bg-slate-950 p-2 shadow-2xl">
          {loading ? <p className="px-3 py-3 text-sm text-slate-500">Searching...</p> : null}
          <ResultSection emptyText="No matching people found." results={results.people} title="People" />
          <ResultSection emptyText="No matching proof sources found." results={results.proofs} title="Proofs" />
          <ResultSection emptyText="Organization search will appear when organization records exist." results={results.organizations} title="Organizations" />
        </div>
      ) : null}
    </div>
  );
}
