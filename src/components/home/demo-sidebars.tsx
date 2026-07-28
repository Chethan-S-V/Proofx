"use client";

import { Bookmark, CalendarDays, FolderGit2, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { demoChallenges, demoEvents, technologyTrends } from "../../demo/home/data";

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
            [Bookmark, "Saved posts", "/dashboard/saved"],
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
  const [snapshot, setSnapshot] = useState<{ activity: Array<{ id: string; label: string; createdAt: string }>; challenges: Array<{ id: string; title: string | null }>; events: Array<{ id: string; title: string | null; updatedAt: string }>; snapshot: { connections: number; organizations: number; repositories: number }; trends: string[] } | null>(null);
  useEffect(() => { const load = () => fetch("/api/dashboard-snapshot", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then(setSnapshot).catch(() => undefined); void load(); const timer = window.setInterval(load, 30000); return () => window.clearInterval(timer); }, []);
  const events = snapshot?.events ?? demoEvents;
  const challenges = snapshot?.challenges ?? demoChallenges;
  const trends = snapshot?.trends.length ? snapshot.trends : technologyTrends;
  return (
    <aside className="space-y-4">
      <Panel title="Upcoming events">
        <div className="space-y-3">{events.slice(0, 3).map((event) => <div className="flex gap-2" key={event.id}><CalendarDays className="h-4 w-4 flex-none text-violet-300" /><div><p className="text-xs font-medium text-white">{event.title ?? "Untitled event"}</p><p className="text-[11px] text-slate-500">{"updatedAt" in event ? new Date(event.updatedAt).toLocaleDateString() : `${event.date} / ${event.location}`}</p></div></div>)}</div>
      </Panel>

      <Panel title="Featured challenges">
        <div className="space-y-3">{challenges.slice(0, 3).map((challenge) => <div key={challenge.id}><p className="text-xs font-medium text-white">{challenge.title ?? "Untitled challenge"}</p><p className="text-[11px] text-slate-500">{snapshot ? "Newest challenge" : `${challenge.difficulty} / ${challenge.deadline}`}</p></div>)}</div>
      </Panel>

      <Panel title="Technology trends">
        <div className="flex flex-wrap gap-2">{trends.map((trend) => <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300" key={trend}><TrendingUp className="h-3 w-3" />{trend}</span>)}</div>
      </Panel>

      <Panel title="Network snapshot">
        <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-slate-900 p-3"><Users className="mx-auto h-4 w-4 text-cyan-300" /><p className="mt-1 text-sm font-semibold text-white">{snapshot?.snapshot.connections ?? 0}</p><p className="text-[10px] text-slate-500">Follows</p></div><div className="rounded-lg bg-slate-900 p-3"><ShieldCheck className="mx-auto h-4 w-4 text-emerald-300" /><p className="mt-1 text-sm font-semibold text-white">{snapshot?.snapshot.repositories ?? 0}</p><p className="text-[10px] text-slate-500">Repositories</p></div><div className="rounded-lg bg-slate-900 p-3"><p className="mt-1 text-sm font-semibold text-white">{snapshot?.activity.length ?? 0}</p><p className="text-[10px] text-slate-500">Recent activity</p></div></div>{snapshot?.activity.length ? <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">{snapshot.activity.slice(0, 3).map((activity) => <p className="text-[11px] text-slate-400" key={activity.id}>{activity.label}</p>)}</div> : null}
      </Panel>
    </aside>
  );
}
