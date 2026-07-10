"use client";

import { useMemo, useState } from "react";
import { Bookmark, CalendarDays, CheckCircle2, FolderGit2, Search, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NetworkActionButton } from "./network-action-button";
import {
  demoChallenges,
  demoEvents,
  demoOrganizations,
  demoProofs,
  demoRepositories,
  demoUsers,
  searchDemoContent,
  technologyTrends,
} from "../../demo/home/data";

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DemoLeftSidebar({ avatarUrl, displayName }: { avatarUrl: string | null; displayName: string }) {
  return (
    <aside className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <div className="h-16 bg-[linear-gradient(135deg,#0891b2,#172554,#166534)]" />
        <div className="px-4 pb-4 text-center">
          <div className="mx-auto -mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-slate-950 bg-slate-800 text-lg font-semibold text-white">
            {avatarUrl ? <Image alt="" className="h-full w-full object-cover" height={64} src={avatarUrl} unoptimized width={64} /> : displayName.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="mt-3 text-sm font-semibold text-white">{displayName}</h2>
          <p className="mt-1 text-xs text-slate-500">Your professional demo preview</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-900 p-3"><p className="text-lg font-semibold text-cyan-300">84</p><p className="text-[10px] uppercase tracking-wide text-slate-500">Trust score</p></div>
            <div className="rounded-lg bg-slate-900 p-3"><p className="text-lg font-semibold text-emerald-300">78</p><p className="text-[10px] uppercase tracking-wide text-slate-500">Proof score</p></div>
          </div>
          <div className="mt-4 text-left">
            <div className="flex justify-between text-xs"><span className="text-slate-400">Profile completion</span><span className="text-white">76%</span></div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-800"><div className="h-1.5 w-[76%] rounded-full bg-cyan-300" /></div>
          </div>
        </div>
      </section>

      <Panel title="Quick actions">
        <div className="space-y-1">
          {[
            [ShieldCheck, "Create a proof", "/dashboard/proofs"],
            [FolderGit2, "Open codespace", "/dashboard/repositories"],
            [Sparkles, "Take a challenge", "/dashboard/challenges"],
            [Bookmark, "Saved posts", "/home#saved"],
          ].map(([Icon, label, href]) => (
            <Link className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white" href={href as string} key={label as string}>
              <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" /> {label as string}
            </Link>
          ))}
        </div>
      </Panel>

      <Panel title="Recent activity">
        <div className="space-y-3 text-xs leading-5 text-slate-400">
          <p>Viewed a verified product design proof.</p>
          <p>Saved a responsible AI discussion.</p>
          <p>Followed a community engineering topic.</p>
        </div>
      </Panel>
    </aside>
  );
}

export function DemoRightSidebar() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchDemoContent(query).slice(0, 6), [query]);
  const leaders = demoUsers.filter((user) => /ceo|chief executive|founder|hr|manager|recruiter/i.test(user.profession)).slice(0, 4);

  return (
    <aside className="space-y-4">
      <Panel title="Search the demo network">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" aria-hidden="true" />
          <input aria-label="Search demo network" className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setQuery(event.target.value)} placeholder="People, posts, organizations..." value={query} />
        </div>
        {query.trim().length >= 2 ? (
          <div className="mt-2 space-y-1">
            {results.map((result) => <Link className="block rounded-md px-2 py-2 hover:bg-slate-900" href={result.href} key={`${result.kind}-${result.id}`}><span className="block truncate text-xs font-medium text-white">{result.title}</span><span className="block truncate text-[11px] text-slate-500">{result.kind} · {result.description}</span></Link>)}
          </div>
        ) : null}
      </Panel>

      <Panel title="Trending professionals">
        <div className="space-y-4">
          {leaders.map((user) => (
            <div className="flex items-center gap-3" key={user.id}>
              <Link href={`/dashboard/profile/${user.id}`}><Image alt="" className="h-9 w-9 rounded-full" height={36} src={user.avatarUrl} unoptimized width={36} /></Link>
              <div className="min-w-0 flex-1"><Link className="block truncate text-xs font-semibold text-white hover:text-cyan-300" href={`/dashboard/profile/${user.id}`}>{user.fullName}</Link><p className="truncate text-[11px] text-slate-500">{user.profession}</p></div>
              <NetworkActionButton className="text-xs font-semibold text-cyan-300" mode="follow" userId={user.id} userName={user.fullName} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Featured repositories">
        <div className="space-y-3">{demoRepositories.slice(0, 3).map((repo) => <div key={repo.id}><p className="text-xs font-semibold text-white">{repo.owner}/{repo.name}</p><p className="mt-1 text-[11px] text-slate-500">{repo.language} · {repo.stars.toLocaleString()} stars</p></div>)}</div>
      </Panel>

      <Panel title="Trending proofs">
        <div className="space-y-3">{demoProofs.slice(0, 3).map((proof) => <div className="flex items-start gap-2" key={proof.id}><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald-300" /><div><p className="text-xs font-medium text-white">{proof.title}</p><p className="text-[11px] text-slate-500">Score {proof.score} · {proof.owner}</p></div></div>)}</div>
      </Panel>

      <Panel title="Suggested organizations">
        <div className="space-y-3">{demoOrganizations.slice(0, 3).map((org) => <div className="flex items-center justify-between gap-3" key={org.id}><div><p className="text-xs font-medium text-white">{org.name}</p><p className="text-[11px] text-slate-500">{org.category}</p></div><button className="text-xs text-cyan-300" type="button">Follow</button></div>)}</div>
      </Panel>

      <Panel title="Upcoming events">
        <div className="space-y-3">{demoEvents.slice(0, 3).map((event) => <div className="flex gap-2" key={event.id}><CalendarDays className="h-4 w-4 flex-none text-violet-300" /><div><p className="text-xs font-medium text-white">{event.title}</p><p className="text-[11px] text-slate-500">{event.date} · {event.location}</p></div></div>)}</div>
      </Panel>

      <Panel title="Featured challenges">
        <div className="space-y-3">{demoChallenges.slice(0, 3).map((challenge) => <div key={challenge.id}><p className="text-xs font-medium text-white">{challenge.title}</p><p className="text-[11px] text-slate-500">{challenge.difficulty} · {challenge.deadline}</p></div>)}</div>
      </Panel>

      <Panel title="Technology trends">
        <div className="flex flex-wrap gap-2">{technologyTrends.map((trend) => <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300" key={trend}><TrendingUp className="h-3 w-3" />{trend}</span>)}</div>
      </Panel>

      <Panel title="Network snapshot">
        <div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-lg bg-slate-900 p-3"><Users className="mx-auto h-4 w-4 text-cyan-300" /><p className="mt-1 text-sm font-semibold text-white">12.8k</p><p className="text-[10px] text-slate-500">Active now</p></div><div className="rounded-lg bg-slate-900 p-3"><ShieldCheck className="mx-auto h-4 w-4 text-emerald-300" /><p className="mt-1 text-sm font-semibold text-white">48.2k</p><p className="text-[10px] text-slate-500">Verified proofs</p></div></div>
      </Panel>
    </aside>
  );
}
