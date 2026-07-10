"use client";

import { CalendarDays, Check, Search, Share2, Trophy, Users, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { demoChallenges, demoUsers } from "../../demo/home/data";
import type { DemoChallenge } from "../../demo/home/schemas";

type ChallengeCategory = "Prize challenge" | "Hiring challenge" | "Hackathon" | "Client challenge" | "Recruiter screen";

const challengeCategories: ChallengeCategory[] = ["Prize challenge", "Hiring challenge", "Hackathon", "Client challenge", "Recruiter screen"];

function getChallengeCategory(challenge: DemoChallenge) {
  const index = Number(challenge.id.split("-").at(-1) ?? 0);
  return challengeCategories[index % challengeCategories.length];
}

function ChallengeDialog({
  category,
  challenge,
  joined,
  onClose,
  onJoin,
}: {
  category: ChallengeCategory;
  challenge: DemoChallenge;
  joined: boolean;
  onClose: () => void;
  onJoin: () => void;
}) {
  const [query, setQuery] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const [shared, setShared] = useState(false);
  const hasPrize = category === "Prize challenge" || category === "Hackathon";
  const people = useMemo(() => demoUsers.filter((user) => !query || `${user.fullName} ${user.profession}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <button aria-label="Close challenge" className="absolute inset-0" onClick={onClose} type="button" />
      <section aria-modal="true" className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl" role="dialog">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{category} · {challenge.difficulty}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{challenge.title}</h2>
            <p className="mt-1 text-sm text-cyan-300">Issued by {challenge.sponsor}</p>
          </div>
          <button className="rounded-md p-2 text-slate-500 hover:bg-slate-900" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            [hasPrize ? `₹${challenge.prizeMoney.toLocaleString("en-IN")}` : "No prize", hasPrize ? "Prize" : "Opportunity"],
            [category === "Hiring challenge" || category === "Hackathon" ? `${challenge.deadline} · 6:00 PM` : challenge.deadline, "Date and time"],
            [String(challenge.participants), "Participants"],
          ].map(([value, label]) => (
            <div className="rounded-xl bg-slate-900 p-4" key={label}>
              <p className="text-lg font-semibold text-white">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-white">In-depth brief</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">Deliver a production-ready solution with accessible workflows, measurable performance, tests, a repository, and a decision log that clearly separates every teammate&apos;s contribution.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {["Implementation quality · 35%", "User outcome · 25%", "Evidence and testing · 25%", "Contribution clarity · 15%"].map((item) => <p className="rounded-lg border border-slate-800 p-3 text-sm text-slate-400" key={item}>{item}</p>)}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-white">Invite teammates</h3>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 pl-9 pr-3 text-sm text-white" onChange={(event) => setQuery(event.target.value)} placeholder="Search any ProofX user" value={query} />
          </div>
          <div className="mt-2 space-y-1">
            {people.map((user) => (
              <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-900" key={user.id}>
                <Image alt="" className="h-9 w-9 rounded-full" height={36} src={user.avatarUrl} unoptimized width={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white">{user.fullName}</p>
                  <p className="truncate text-[11px] text-slate-500">{user.profession}</p>
                </div>
                <button className="rounded-md border border-slate-700 px-2 py-1 text-[11px] text-cyan-300" onClick={() => setInvited((current) => [...new Set([...current, user.id])])} type="button">
                  {invited.includes(user.id) ? <span className="flex gap-1"><Check className="h-3 w-3" />Request sent</span> : "Invite"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-800 pt-5">
          <button className="flex items-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-sm text-white" onClick={() => setShared(true)} type="button"><Share2 className="h-4 w-4" />{shared ? "Shared" : "Share"}</button>
          <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" onClick={onJoin} type="button">{joined ? "Accepted" : "Accept challenge"}</button>
        </div>
      </section>
    </div>
  );
}

export function ChallengeExperience() {
  const [selected, setSelected] = useState<DemoChallenge | null>(null);
  const [joined, setJoined] = useState<string[]>([]);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-medium text-cyan-300">Dashboard / Challenges</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Professional challenges</h1>
        <p className="mt-2 text-sm text-slate-400">Prize work, hiring rounds, hackathons, client briefs, and recruiter screens from verified organizations.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[["124", "Company"], ["68", "Client"], ["42", "Recruiter"]].map(([value, label]) => (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4" key={label}>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="text-xs text-slate-500">{label} challenges given till now</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-5">
        {challengeCategories.map((category) => (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4" key={category}>
            <p className="text-sm font-semibold text-white">{category}</p>
            <p className="mt-1 text-xs text-slate-500">{demoChallenges.filter((challenge) => getChallengeCategory(challenge) === category).length} open</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Your challenge work</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"><Trophy className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-sm font-medium text-white">Accessible City Services</p><p className="mt-1 text-xs text-slate-500">Completed with Mira Soren and Nolan Kade · Accepted by Northstar Labs</p></div>
          <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4"><CalendarDays className="h-5 w-5 text-violet-300" /><p className="mt-3 text-sm font-medium text-white">API Reliability Review</p><p className="mt-1 text-xs text-slate-500">Given by you · 18 submissions</p></div>
        </div>
      </section>

      <section>
        <div className="flex justify-between"><h2 className="text-lg font-semibold text-white">Open challenges</h2><span className="text-xs text-slate-500">{demoChallenges.length} available</span></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoChallenges.map((challenge) => {
            const category = getChallengeCategory(challenge);
            const hasPrize = category === "Prize challenge" || category === "Hackathon";
            return (
              <article className="rounded-xl border border-slate-800 bg-slate-950 p-5" key={challenge.id}>
                <div className="flex justify-between"><Trophy className="h-5 w-5 text-amber-300" /><span className="text-xs text-slate-500">{category}</span></div>
                <h3 className="mt-4 font-semibold text-white">{challenge.title}</h3>
                <p className="mt-1 text-xs text-cyan-300">{challenge.sponsor}</p>
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <p className="flex gap-2"><CalendarDays className="h-3.5 w-3.5" />{category === "Hiring challenge" || category === "Hackathon" ? `${challenge.deadline} · 6:00 PM` : challenge.deadline}</p>
                  <p className="flex gap-2"><Users className="h-3.5 w-3.5" />{challenge.participants} participants</p>
                  <p className={hasPrize ? "font-semibold text-amber-300" : "font-semibold text-cyan-300"}>{hasPrize ? `₹${challenge.prizeMoney.toLocaleString("en-IN")}` : "No prize · proof/opportunity based"}</p>
                </div>
                <button className={`mt-5 w-full rounded-md py-2 text-xs font-semibold ${joined.includes(challenge.id) ? "bg-emerald-400/10 text-emerald-300" : "bg-cyan-300 text-slate-950"}`} onClick={() => setSelected(challenge)} type="button">{joined.includes(challenge.id) ? "View accepted challenge" : "View and accept"}</button>
              </article>
            );
          })}
        </div>
      </section>

      {selected ? <ChallengeDialog category={getChallengeCategory(selected)} challenge={selected} joined={joined.includes(selected.id)} onClose={() => setSelected(null)} onJoin={() => setJoined((current) => current.includes(selected.id) ? current : [...current, selected.id])} /> : null}
    </div>
  );
}
