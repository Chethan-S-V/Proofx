"use client";

import { AtSign, BriefcaseBusiness, CalendarDays, Clock, Crown, FileText, Hash, Image as ImageIcon, IndianRupee, Plus, Send, Trophy, Type, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { demoUsers } from "../../demo/home/data";
import { createPostSchema } from "../../lib/social/schemas";
import { useSocialStore } from "../../lib/social/store";

type ComposerMode = "post" | "challenge";

const postPurposes = ["Project update", "Job update", "Hackathon", "Open source", "Achievement", "Announcement", "Portfolio", "Certification", "Course completion", "Product launch", "Team update", "Milestone", "Event", "Research", "Volunteer work", "Behind the scenes", "Career update", "New role", "Promotion", "Speaking", "Workshop", "Community", "Collaboration", "Client work", "Case study", "Design update", "Engineering update", "Release notes", "Launch day", "Learning", "Mentoring", "Award", "Press", "Fundraising", "Partnership", "Hiring", "Internship", "Travel", "Personal update"];
const hashtagSuggestions = ["projectupdate", "hiring", "hackathon", "opensource", "typescript", "buildinpublic"];

export function PostComposer() {
  const router = useRouter();
  const [mode, setMode] = useState<ComposerMode>("post");
  const [purpose, setPurpose] = useState("");
  const [purposePickerOpen, setPurposePickerOpen] = useState(false);
  const [text, setText] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengePrize, setChallengePrize] = useState(0);
  const [challengeDate, setChallengeDate] = useState("");
  const [challengeTime, setChallengeTime] = useState("");
  const [notice, setNotice] = useState("");
  const addCreatedPost = useSocialStore((state) => state.addCreatedPost);
  const premiumPlan = useSocialStore((state) => state.premiumPlan);
  const activeToken = text.split(/\s/).at(-1) ?? "";
  const mentionResults = useMemo(() => activeToken.startsWith("@") ? demoUsers.filter((user) => `${user.fullName} ${user.company} ${user.username}`.toLowerCase().includes(activeToken.slice(1).toLowerCase())).slice(0, 5) : [], [activeToken]);
  const tagResults = useMemo(() => activeToken.startsWith("#") ? hashtagSuggestions.filter((tag) => tag.includes(activeToken.slice(1).toLowerCase())) : [], [activeToken]);

  function selectMode(nextMode: ComposerMode) {
    setMode(nextMode);
    setAttachmentMenuOpen(false);
    setNotice("");
  }

  function insertMention(username: string) {
    setText((current) => `${current.replace(/@\S*$/, `@${username}`)} `);
  }

  function insertHashtag(tag: string) {
    setText((current) => `${current.replace(/#\S*$/, `#${tag}`)} `);
  }

  function publish() {
    const postType = mode === "challenge" ? "challenge" : "text";
    const content = mode === "challenge" ? `${challengeTitle.trim()}\n${text}`.trim() : text;
    const parsed = createPostSchema.safeParse({ attachmentName, challengePrize, postType, text: content });

    if (!parsed.success) {
      setNotice(parsed.error.issues[0]?.message ?? "Check the post details.");
      return;
    }

    addCreatedPost({ text: parsed.data.text, type: mode === "post" ? purpose.trim() || "Post" : "Challenge" });
    setNotice("Your post has been published and appears on your profile.");
    setText("");
    setAttachmentName("");
    setAttachmentMenuOpen(false);
    setChallengeTitle("");
    setChallengePrize(0);
    setChallengeDate("");
    setChallengeTime("");
  }

  if (mode === "challenge" && premiumPlan === "basic") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <ComposerHeader mode={mode} onModeChange={selectMode} />
        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 text-center">
          <Crown className="mx-auto h-9 w-9 text-amber-300" />
          <h2 className="mt-4 text-xl font-semibold text-white">Challenge publishing is a Premium feature</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">Upgrade to Pro or Pro+ to create challenges, set prizes, and collect proof-ready submissions.</p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-md bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950" onClick={() => router.push("/dashboard/settings#upgrade")} type="button"><Crown className="h-4 w-4" />Upgrade to Premium</button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ComposerHeader mode={mode} onModeChange={selectMode} />
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="p-5">
          {mode === "post" ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-white">Share an update</p>
              <label className="relative flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition focus-within:border-cyan-400 focus-within:bg-cyan-400/5">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-cyan-300" />
                <input aria-label="Post purpose" className="w-28 bg-transparent outline-none placeholder:text-slate-500" maxLength={40} onBlur={() => window.setTimeout(() => setPurposePickerOpen(false), 150)} onChange={(event) => setPurpose(event.target.value)} onFocus={() => setPurposePickerOpen(true)} placeholder="Add a type" value={purpose} />
                <div className={`absolute right-0 top-[calc(100%+0.5rem)] z-30 w-64 origin-top-right rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl transition-all duration-200 ${purposePickerOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}>
                  <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Update types</p>
                  <div className="flex max-h-64 flex-col gap-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{postPurposes.filter((option) => option.toLowerCase().includes(purpose.toLowerCase())).map((option) => <button className="rounded-md px-2 py-2 text-left text-xs text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-200" key={option} onMouseDown={() => { setPurpose(option); setPurposePickerOpen(false); }} type="button">{option}</button>)}</div>
                </div>
              </label>
            </div>
          ) : (
            <label className="block"><span className="text-sm font-medium text-white">Challenge title</span><input className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setChallengeTitle(event.target.value)} placeholder="Build a proof-ready onboarding flow" value={challengeTitle} /></label>
          )}

          <textarea className="mt-4 min-h-52 w-full resize-none rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-white outline-none focus:border-cyan-400" maxLength={3000} onChange={(event) => setText(event.target.value)} placeholder={mode === "challenge" ? "Describe deliverables, judging criteria, proof requirements, and who should apply..." : "Write your update. Use @ to mention people and # to add hashtags."} value={text} />
          <div className="mt-2 flex items-center justify-between gap-3"><p className="text-xs text-slate-600">{text.length}/3000</p>{attachmentName ? <span className="max-w-[70%] truncate text-xs text-cyan-300">Attached: {attachmentName}</span> : null}</div>

          {mentionResults.length ? <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">{mentionResults.map((user) => <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white hover:bg-slate-800" key={user.id} onClick={() => insertMention(user.username)} type="button"><AtSign className="h-3.5 w-3.5 text-cyan-300" />{user.fullName}<span className="text-slate-500">{user.company}</span></button>)}</div> : null}
          {tagResults.length ? <div className="mt-3 flex flex-wrap gap-2">{tagResults.map((tag) => <button className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs text-cyan-300" key={tag} onClick={() => insertHashtag(tag)} type="button"><Hash className="h-3 w-3" />{tag}</button>)}</div> : null}

          {mode === "challenge" ? <div className="mt-4 grid gap-4 sm:grid-cols-3"><label><span className="text-sm font-medium text-white">Prize</span><span className="relative mt-2 block"><IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400" min="1" onChange={(event) => setChallengePrize(Number(event.target.value))} type="number" value={challengePrize || ""} /></span></label><label><span className="flex items-center gap-1 text-sm font-medium text-white"><CalendarDays className="h-4 w-4 text-slate-500" />Last date</span><input className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setChallengeDate(event.target.value)} type="date" value={challengeDate} /></label><label><span className="flex items-center gap-1 text-sm font-medium text-white"><Clock className="h-4 w-4 text-slate-500" />Last time</span><input className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setChallengeTime(event.target.value)} type="time" value={challengeTime} /></label></div> : null}

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="relative">
              <button aria-expanded={attachmentMenuOpen} aria-label="Add attachment" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-400/10" onClick={() => setAttachmentMenuOpen((open) => !open)} type="button"><Plus className={`h-5 w-5 transition-transform duration-200 ${attachmentMenuOpen ? "rotate-45" : ""}`} /></button>
              <div className={`absolute bottom-12 left-0 z-20 flex w-48 origin-bottom-left flex-col gap-1 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl transition-all duration-200 ${attachmentMenuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}>
                <AttachmentOption accept="image/*" icon={ImageIcon} label="Photo" onSelect={setAttachmentName} />
                <AttachmentOption accept="video/*" icon={Video} label="Video" onSelect={setAttachmentName} />
                <AttachmentOption accept=".pdf,.doc,.docx,.zip,.txt" icon={FileText} label="File" onSelect={setAttachmentName} />
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-md bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-40" disabled={!text.trim() || (mode === "challenge" && !challengeTitle.trim())} onClick={publish} type="button"><Send className="h-4 w-4" />Publish {mode === "challenge" ? "challenge" : "post"}</button>
          </div>
          {notice ? <p className={`mt-4 text-sm ${notice.startsWith("Your") ? "text-emerald-300" : "text-rose-300"}`}>{notice}</p> : null}
        </div>
      </section>
    </div>
  );
}

function ComposerHeader({ mode, onModeChange }: { mode: ComposerMode; onModeChange: (mode: ComposerMode) => void }) {
  return <><header><p className="text-sm font-medium text-cyan-300">Dashboard / Post</p><h1 className="mt-2 text-3xl font-semibold text-white">Create a post</h1><p className="mt-2 text-sm text-slate-400">Share an update, or create a proof-ready challenge with Premium.</p></header><div className="grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950 p-1"><button className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "post" ? "bg-cyan-400/10 text-cyan-300" : "text-slate-500 hover:text-white"}`} onClick={() => onModeChange("post")} type="button"><Type className="h-4 w-4" />Post</button><button className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "challenge" ? "bg-cyan-400/10 text-cyan-300" : "text-slate-500 hover:text-white"}`} onClick={() => onModeChange("challenge")} type="button"><Trophy className="h-4 w-4" />Challenge</button></div></>;
}

function AttachmentOption({ accept, icon: Icon, label, onSelect }: { accept: string; icon: typeof ImageIcon; label: string; onSelect: (fileName: string) => void }) {
  return <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900"><input accept={accept} className="sr-only" onChange={(event) => onSelect(event.target.files?.[0]?.name ?? "")} type="file" /><Icon className="h-4 w-4 text-cyan-300" />{label}</label>;
}
