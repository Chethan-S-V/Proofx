"use client";

import { CalendarDays, CheckCircle2, Clock3, FileCheck2, Link2, ListChecks, ShieldAlert, Trophy, Upload, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { demoChallenges } from "../../demo/home/data";
import type { DemoChallenge } from "../../demo/home/schemas";
import { useSocialStore } from "../../lib/social/store";

const challengeCategories = ["Engineering", "Design", "Data & AI", "Open source", "Hackathon", "Career", "Hiring", "Client work", "Internship", "Certification", "Security", "Community"] as const;
type ChallengeCategory = (typeof challengeCategories)[number];
type ChallengeStatus = "accepted" | "in_progress" | "submitted" | "under_review" | "verified" | "not_verified";

const statusLabel: Record<ChallengeStatus, string> = { accepted: "Accepted", in_progress: "In progress", submitted: "Submitted", under_review: "Under review", verified: "Verified", not_verified: "Not verified" };

function categoryOf(challenge: DemoChallenge): ChallengeCategory {
  const index = Number(challenge.id.split("-").at(-1) ?? 0);
  return challengeCategories[index % challengeCategories.length];
}

export function ChallengeExperience() {
  const [section, setSection] = useState<"work" | "open">("work");
  const [category, setCategory] = useState<ChallengeCategory | "All">("All");
  const [selected, setSelected] = useState<DemoChallenge | null>(null);
  const [statuses, setStatuses] = useState<Record<string, ChallengeStatus>>({});
  const createdPosts = useSocialStore((state) => state.createdPosts);
  const postedChallenges = createdPosts.filter((post) => post.type === "Challenge");
  const work = Object.entries(statuses).flatMap(([id, status]) => {
    const challenge = demoChallenges.find((item) => item.id === id);
    return challenge ? [{ challenge, status }] : [];
  });
  const openChallenges = useMemo(() => demoChallenges.filter((challenge) => !statuses[challenge.id]), [statuses]);
  const visibleChallenges = category === "All" ? openChallenges : openChallenges.filter((challenge) => categoryOf(challenge) === category);

  function updateStatus(challengeId: string, status: ChallengeStatus) {
    setStatuses((current) => ({ ...current, [challengeId]: status }));
  }

  return <div className="space-y-7"><header><p className="text-sm font-medium text-cyan-300">Dashboard / Challenges</p><h1 className="mt-2 text-3xl font-semibold text-white">Challenges</h1><p className="mt-2 text-sm text-slate-400">Track your client work and discover open challenges by category.</p></header><div className="flex gap-2 border-b border-slate-800"><Tab active={section === "work"} label="Your challenge work" onClick={() => setSection("work")} /><Tab active={section === "open"} label="Open challenges" onClick={() => setSection("open")} /></div>{section === "work" ? <section><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Your challenge work</h2><p className="mt-1 text-sm text-slate-500">Only challenges you accept or post appear here.</p></div><span className="text-xs text-slate-500">{work.length + postedChallenges.length} items</span></div>{work.length || postedChallenges.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{work.map(({ challenge, status }) => <ChallengeWorkCard challenge={challenge} key={challenge.id} onUpdate={updateStatus} status={status} />)}{postedChallenges.map((post) => <article className="rounded-xl border border-slate-800 bg-slate-950 p-5" key={post.id}><p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Posted by you</p><h3 className="mt-3 font-semibold text-white">{post.text.split("\n")[0] || "Your challenge"}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{post.text}</p><span className="mt-4 inline-flex rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-200">Open for submissions</span></article>)}</div> : <EmptyWork onBrowse={() => setSection("open")} />}</section> : <section><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Open challenges</h2><p className="mt-1 text-sm text-slate-500">Choose a category to find the right challenge.</p></div><span className="text-xs text-slate-500">{visibleChallenges.length} available</span></div><div className="mt-5 flex flex-wrap gap-2"><CategoryButton active={category === "All"} label="All" onClick={() => setCategory("All")} />{challengeCategories.map((item) => <CategoryButton active={category === item} count={openChallenges.filter((challenge) => categoryOf(challenge) === item).length} key={item} label={item} onClick={() => setCategory(item)} />)}</div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleChallenges.map((challenge) => <article className="rounded-xl border border-slate-800 bg-slate-950 p-5" key={challenge.id}><div className="flex justify-between gap-3"><Trophy className="h-5 w-5 text-amber-300" /><span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] text-cyan-200">{categoryOf(challenge)}</span></div><h3 className="mt-4 font-semibold text-white">{challenge.title}</h3><p className="mt-1 text-xs text-slate-400">{challenge.sponsor}</p><p className="mt-4 flex gap-2 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Closes in {challenge.deadline}</p><p className="mt-2 flex gap-2 text-xs text-slate-500"><Users className="h-3.5 w-3.5" />{challenge.participants.toLocaleString()} participants</p><p className="mt-2 text-xs font-semibold text-amber-300">₹{challenge.prizeMoney.toLocaleString("en-IN")}</p><button className="mt-5 w-full rounded-md bg-cyan-300 py-2 text-xs font-semibold text-slate-950" onClick={() => setSelected(challenge)} type="button">View challenge</button></article>)}</div></section>}{selected ? <ChallengeDialog challenge={selected} onAccept={() => { updateStatus(selected.id, "accepted"); setSelected(null); setSection("work"); }} onClose={() => setSelected(null)} /> : null}</div>;
}

function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button className={`px-4 py-3 text-sm font-semibold ${active ? "border-b-2 border-cyan-300 text-cyan-300" : "text-slate-500 hover:text-white"}`} onClick={onClick} type="button">{label}</button>;
}

function CategoryButton({ active, count, label, onClick }: { active: boolean; count?: number; label: string; onClick: () => void }) {
  return <button className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-cyan-300 text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`} onClick={onClick} type="button">{label}{count === undefined ? "" : ` (${count})`}</button>;
}

function EmptyWork({ onBrowse }: { onBrowse: () => void }) {
  return <div className="mt-5 rounded-xl border border-dashed border-slate-800 p-10 text-center"><Trophy className="mx-auto h-7 w-7 text-slate-700" /><p className="mt-3 text-sm font-medium text-white">No challenge work yet</p><p className="mt-1 text-sm text-slate-500">Accepted and posted challenges will appear here.</p><button className="mt-4 text-sm font-semibold text-cyan-300" onClick={onBrowse} type="button">Browse open challenges</button></div>;
}

function ChallengeDialog({ challenge, onAccept, onClose }: { challenge: DemoChallenge; onAccept: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"><button aria-label="Close challenge" className="absolute inset-0" onClick={onClose} type="button" /><section aria-modal="true" className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl" role="dialog"><div className="flex justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{categoryOf(challenge)} · {challenge.difficulty}</p><h2 className="mt-2 text-2xl font-semibold text-white">{challenge.title}</h2><p className="mt-1 text-sm text-slate-400">Hosted by {challenge.sponsor}</p></div><button aria-label="Close challenge" className="p-2 text-slate-500 hover:text-white" onClick={onClose} type="button"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><InfoCard label="Prize" value={`₹${challenge.prizeMoney.toLocaleString("en-IN")}`} /><InfoCard label="Deadline" value={challenge.deadline} /><InfoCard label="Participants" value={challenge.participants.toLocaleString()} /></div><p className="mt-6 text-sm leading-7 text-slate-400">Complete the brief with working evidence, decision notes, and a deliverable ready for client review.</p><button className="mt-6 w-full rounded-md bg-cyan-300 py-2.5 text-sm font-semibold text-slate-950" onClick={onAccept} type="button">Accept challenge</button></section></div>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-900 p-4"><p className="text-sm font-semibold text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>;
}

function ChallengeWorkCard({ challenge, onUpdate, status }: { challenge: DemoChallenge; onUpdate: (id: string, status: ChallengeStatus) => void; status: ChallengeStatus }) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const canSubmit = Boolean(repositoryUrl.trim() || demoUrl.trim() || files.length);
  const statusClass = status === "verified" ? "bg-emerald-400/10 text-emerald-200" : status === "not_verified" ? "bg-rose-400/10 text-rose-200" : status === "under_review" ? "bg-orange-400/10 text-orange-200" : "bg-cyan-400/10 text-cyan-200";

  function submitToClient() {
    if (!canSubmit) { setError("Add a repository, demo link, or file before submitting to the client."); return; }
    setError("");
    onUpdate(challenge.id, "submitted");
  }

  return <article className="rounded-xl border border-slate-800 bg-slate-950 p-5"><div className="flex justify-between gap-3"><Trophy className="h-5 w-5 text-cyan-300" /><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}>{statusLabel[status]}</span></div><h3 className="mt-4 font-semibold text-white">{challenge.title}</h3><p className="mt-1 text-xs text-slate-400">{challenge.sponsor} · {categoryOf(challenge)}</p><p className="mt-4 flex gap-2 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />Deadline: {challenge.deadline}</p>{status === "accepted" ? <button className="mt-5 w-full rounded-md bg-cyan-300 py-2 text-xs font-semibold text-slate-950" onClick={() => onUpdate(challenge.id, "in_progress")} type="button">Start work</button> : null}{status === "in_progress" ? <ClientSubmission files={files} note={clientNote} onDemoChange={setDemoUrl} onFilesChange={setFiles} onNoteChange={setClientNote} onRepositoryChange={setRepositoryUrl} onSubmit={submitToClient} repositoryUrl={repositoryUrl} demoUrl={demoUrl} error={error} /> : null}{status === "submitted" ? <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-amber-300 py-2 text-xs font-semibold text-slate-950" onClick={() => onUpdate(challenge.id, "under_review")} type="button"><Link2 className="h-3.5 w-3.5" />Send for client verification</button> : null}{status === "under_review" ? <p className="mt-5 rounded-lg bg-orange-400/10 p-3 text-xs leading-5 text-orange-200">Your work and evidence are with the client for review.</p> : null}{status === "verified" ? <p className="mt-5 flex gap-2 rounded-lg bg-emerald-400/10 p-3 text-xs text-emerald-200"><CheckCircle2 className="h-4 w-4" />Client verified this challenge.</p> : null}{status === "not_verified" ? <p className="mt-5 flex gap-2 rounded-lg bg-rose-400/10 p-3 text-xs text-rose-200"><ShieldAlert className="h-4 w-4" />Client requested stronger evidence.</p> : null}</article>;
}

function ClientSubmission({ repositoryUrl, demoUrl, note, files, error, onRepositoryChange, onDemoChange, onNoteChange, onFilesChange, onSubmit }: { repositoryUrl: string; demoUrl: string; note: string; files: string[]; error: string; onRepositoryChange: (value: string) => void; onDemoChange: (value: string) => void; onNoteChange: (value: string) => void; onFilesChange: (value: string[]) => void; onSubmit: () => void }) {
  return <div className="mt-5 space-y-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><div className="flex gap-2"><ListChecks className="h-4 w-4 text-cyan-300" /><div><p className="text-sm font-semibold text-white">Client submission</p><p className="mt-1 text-xs text-slate-400">Add at least one deliverable, then send it for review.</p></div></div><label className="block text-xs text-slate-300">Repository link<input className="mt-1.5 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white" onChange={(event) => onRepositoryChange(event.target.value)} placeholder="https://github.com/you/project" type="url" value={repositoryUrl} /></label><label className="block text-xs text-slate-300">Live demo link<input className="mt-1.5 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white" onChange={(event) => onDemoChange(event.target.value)} placeholder="https://your-demo.example" type="url" value={demoUrl} /></label><label className="block text-xs text-slate-300">Note for the client<textarea className="mt-1.5 min-h-20 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-white" onChange={(event) => onNoteChange(event.target.value)} placeholder="What is complete and what should the client review?" value={note} /></label><label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-600 px-3 py-2.5 text-xs text-slate-300"><input className="sr-only" multiple onChange={(event) => onFilesChange(Array.from(event.target.files ?? []).map((file) => file.name))} type="file" /><Upload className="h-4 w-4 text-cyan-300" />Attach files, images, or documentation</label>{files.length ? <p className="text-xs text-cyan-200">{files.join(", ")}</p> : null}{error ? <p className="text-xs text-rose-300">{error}</p> : null}<button className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 py-2 text-xs font-semibold text-slate-950" onClick={onSubmit} type="button"><FileCheck2 className="h-3.5 w-3.5" />Submit work to client</button></div>;
}
