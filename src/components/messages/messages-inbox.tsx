"use client";

import { CalendarDays, File, Image as ImageIcon, Link as LinkIcon, Plus, Search, Send, Trash2, UserRound, Video, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { demoUsers } from "../../demo/home/data";
import { meetingInviteSchema, messageSchema } from "../../lib/social/schemas";
import { useSocialStore } from "../../lib/social/store";

type MessageCategory = "all" | "network" | "organization" | "recruiter" | "client" | "team";
type MeetingInvite = { dateTime: string; meetingUrl: string; title: string };
type ChatMessage = { fromMe: boolean; id: string; meeting?: MeetingInvite; text: string; time: string };
type Contact = { category: Exclude<MessageCategory, "all">; connectedSince: string; user: (typeof demoUsers)[number] };

const categories: Array<{ id: MessageCategory; label: string }> = [
  { id: "all", label: "All" }, { id: "network", label: "Network" }, { id: "organization", label: "Organizations" },
  { id: "recruiter", label: "Recruiters" }, { id: "client", label: "Clients" }, { id: "team", label: "Teams" },
];
const contactCategories: Contact["category"][] = ["network", "organization", "recruiter", "client", "team"];
const contacts: Contact[] = demoUsers.slice(3, 15).map((user, index) => ({ category: contactCategories[index % contactCategories.length], connectedSince: `${index + 2} months`, user }));
const initialMessages = (userId: string): ChatMessage[] => [
  { fromMe: false, id: `${userId}-intro`, text: "I reviewed your verified work. Can we discuss the repository decisions and challenge outcome?", time: "1h" },
  { fromMe: true, id: `${userId}-reply`, text: "Of course. I can share the proof and walk through my contribution.", time: "58m" },
];

function categoryLabel(category: Contact["category"]) { return category === "organization" ? "Organization" : category; }

export function AdvancedMessagesInbox() {
  const [category, setCategory] = useState<MessageCategory>("all");
  const [activeUserId, setActiveUserId] = useState(contacts[0]?.user.id ?? "");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [attachment, setAttachment] = useState("");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDateTime, setMeetingDateTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingError, setMeetingError] = useState("");
  const [contextMessageId, setContextMessageId] = useState<string | null>(null);
  const connections = useSocialStore((state) => state.connections);
  const blockUser = useSocialStore((state) => state.blockUser);
  const unblockUser = useSocialStore((state) => state.unblockUser);

  const visibleContacts = useMemo(() => contacts.filter((contact) => {
    const searchMatches = `${contact.user.fullName} ${contact.user.profession} ${contact.category}`.toLowerCase().includes(query.toLowerCase());
    return connections[contact.user.id] !== "blocked" && searchMatches && (category === "all" || contact.category === category);
  }), [category, connections, query]);
  const active = contacts.find((contact) => contact.user.id === activeUserId) ?? visibleContacts[0] ?? contacts[0];
  const activeMessages = active ? messages[active.user.id] ?? initialMessages(active.user.id) : [];
  const isBlocked = active ? connections[active.user.id] === "blocked" : false;

  function addMessage(message: ChatMessage) {
    if (!active) return;
    setMessages((current) => ({ ...current, [active.user.id]: [...(current[active.user.id] ?? initialMessages(active.user.id)), message] }));
  }

  function sendMessage() {
    if (!active || isBlocked) return;
    const content = draft.trim() || (attachment ? `Shared ${attachment}` : "");
    const parsed = messageSchema.safeParse({ conversationId: active.user.id, text: content });
    if (!parsed.success) return;
    addMessage({ fromMe: true, id: crypto.randomUUID(), text: parsed.data.text, time: "now" });
    setAttachment("");
    setDraft("");
  }

  function deleteMessage(messageId: string) {
    if (!active) return;
    setMessages((current) => ({ ...current, [active.user.id]: (current[active.user.id] ?? initialMessages(active.user.id)).filter((message) => message.id !== messageId) }));
    setContextMessageId(null);
  }

  function submitMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = meetingInviteSchema.safeParse({ dateTime: meetingDateTime, meetingUrl, title: meetingTitle });
    if (!parsed.success) { setMeetingError(parsed.error.issues[0]?.message ?? "Check the meeting details."); return; }
    addMessage({ fromMe: true, id: crypto.randomUUID(), meeting: parsed.data, text: `Meeting invitation: ${parsed.data.title}`, time: "now" });
    setMeetingTitle(""); setMeetingDateTime(""); setMeetingUrl(""); setMeetingError(""); setMeetingOpen(false); setAttachmentMenuOpen(false);
  }

  if (!active) return <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-400">No contacts are available.</div>;

  return <div className="space-y-3 overflow-hidden">
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((item) => <button className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${category === item.id ? "bg-cyan-400/10 text-cyan-300" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"}`} key={item.id} onClick={() => { setCategory(item.id); const next = contacts.find((contact) => item.id === "all" || contact.category === item.id); if (next) setActiveUserId(next.user.id); }} type="button">{item.label}</button>)}
    </div>
    <div className="flex h-[calc(100dvh-11.5rem)] min-h-[38rem] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <aside className="flex w-72 flex-none flex-col border-r border-slate-800 max-md:w-64">
        <div className="relative m-3"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" value={query} /></div>
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleContacts.map((contact) => <button className={`flex w-full gap-3 border-t border-slate-900 p-3 text-left ${active.user.id === contact.user.id ? "bg-cyan-400/10" : "hover:bg-slate-900"}`} key={contact.user.id} onClick={() => { setActiveUserId(contact.user.id); setProfileOpen(false); setContextMessageId(null); }} type="button"><Image alt="" className="h-10 w-10 rounded-full" height={40} src={contact.user.avatarUrl} unoptimized width={40} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{contact.user.fullName}</span><span className="block truncate text-xs capitalize text-slate-500">{categoryLabel(contact.category)}</span></span></button>)}
          {!visibleContacts.length ? <p className="p-4 text-sm text-slate-500">No contacts match this filter.</p> : null}
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-800 p-4"><Image alt="" className="h-10 w-10 rounded-full" height={40} src={active.user.avatarUrl} unoptimized width={40} /><div className="min-w-0 flex-1"><button className="block max-w-full truncate text-left text-sm font-semibold text-white hover:text-cyan-300" onClick={() => setProfileOpen((open) => !open)} type="button">{active.user.fullName}</button><p className="truncate text-xs text-slate-500">{active.user.profession} · {categoryLabel(active.category)} · Connected {active.connectedSince}</p></div></header>
        {profileOpen ? <section className="grid gap-3 border-b border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-[1fr_auto]"><div><p className="text-sm font-semibold text-white">{active.user.fullName}</p><p className="mt-1 text-xs text-slate-400">{active.user.headline}</p><p className="mt-2 text-xs text-slate-500">{active.user.location} · {active.user.skills.slice(0, 3).join(" · ")}</p></div><div className="flex flex-wrap gap-2"><Link className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-white hover:border-cyan-400" href={`/dashboard/profile/${active.user.id}`}><UserRound className="h-4 w-4 text-cyan-300" />Open profile</Link><button className={`rounded-lg border px-3 py-2 text-xs ${isBlocked ? "border-emerald-400/50 text-emerald-300" : "border-rose-400/50 text-rose-300"}`} onClick={() => isBlocked ? unblockUser(active.user.id) : blockUser(active.user.id)} type="button">{isBlocked ? "Unblock" : "Block"}</button></div></section> : null}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onClick={() => setContextMessageId(null)}>
          {activeMessages.map((message) => <div className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`} key={message.id}><div className={`relative max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.fromMe ? "bg-cyan-300 text-slate-950" : "bg-slate-900 text-slate-200"}`} onContextMenu={(event) => { event.preventDefault(); setContextMessageId(message.id); }}><p>{message.text}</p>{message.meeting ? <div className={`mt-3 rounded-lg border p-3 ${message.fromMe ? "border-slate-700/30 bg-white/20" : "border-slate-700 bg-slate-950"}`}><p className="font-semibold">{message.meeting.title}</p><p className="mt-1 text-xs opacity-75">{new Date(message.meeting.dateTime).toLocaleString()}</p>{message.meeting.meetingUrl ? <a className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline" href={message.meeting.meetingUrl} rel="noreferrer" target="_blank"><Video className="h-3.5 w-3.5" />Join meeting</a> : <p className="mt-2 text-xs opacity-75">A meeting link will be shared before the call.</p>}</div> : null}<p className="mt-1 text-right text-[10px] opacity-60">{message.time}</p>{contextMessageId === message.id ? <button className="absolute -bottom-9 right-0 z-10 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-rose-300 shadow-lg" onClick={() => deleteMessage(message.id)} type="button"><Trash2 className="h-3.5 w-3.5" />Delete</button> : null}</div></div>)}
        </div>
        {isBlocked ? <div className="border-t border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-200">You blocked this account. Unblock them from their username to send a message.</div> : <form className="border-t border-slate-800 p-3" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><div className="flex items-center gap-2"><div className="relative"><button aria-expanded={attachmentMenuOpen} aria-label="Add attachment or meeting" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" onClick={() => setAttachmentMenuOpen((open) => !open)} type="button"><Plus className={`h-5 w-5 transition-transform ${attachmentMenuOpen ? "rotate-45" : ""}`} /></button>{attachmentMenuOpen ? <div className="absolute bottom-12 left-0 z-20 w-48 rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-xl"><label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-900"><ImageIcon className="h-4 w-4 text-cyan-300" />Photo<input accept="image/*" className="sr-only" onChange={(event) => { setAttachment(event.target.files?.[0]?.name ?? ""); setAttachmentMenuOpen(false); }} type="file" /></label><label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-900"><Video className="h-4 w-4 text-violet-300" />Video<input accept="video/*" className="sr-only" onChange={(event) => { setAttachment(event.target.files?.[0]?.name ?? ""); setAttachmentMenuOpen(false); }} type="file" /></label><label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-900"><File className="h-4 w-4 text-amber-300" />File<input className="sr-only" onChange={(event) => { setAttachment(event.target.files?.[0]?.name ?? ""); setAttachmentMenuOpen(false); }} type="file" /></label><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900" onClick={() => { setMeetingOpen(true); setAttachmentMenuOpen(false); }} type="button"><CalendarDays className="h-4 w-4 text-emerald-300" />Schedule meeting</button></div> : null}</div><input className="h-11 min-w-0 flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setDraft(event.target.value)} placeholder={attachment ? `Send ${attachment}` : `Message ${active.user.fullName}`} value={draft} /><button aria-label="Send message" className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-300 text-slate-950 disabled:opacity-40" disabled={!draft.trim() && !attachment} type="submit"><Send className="h-4 w-4" /></button></div>{attachment ? <div className="mt-2 flex items-center gap-1 text-xs text-cyan-300"><LinkIcon className="h-3.5 w-3.5" />{attachment}<button aria-label="Remove attachment" className="ml-1" onClick={() => setAttachment("")} type="button"><X className="h-3.5 w-3.5" /></button></div> : null}</form>}
      </main>
    </div>
    {meetingOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4"><form className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl" onSubmit={submitMeeting}><div className="flex items-center justify-between"><h2 className="text-base font-semibold text-white">Schedule a meeting</h2><button aria-label="Close meeting form" className="text-slate-400 hover:text-white" onClick={() => setMeetingOpen(false)} type="button"><X className="h-5 w-5" /></button></div><p className="mt-2 text-xs leading-5 text-slate-400">Add a Google Meet, Zoom, or other meeting link to let the recipient join from the chat.</p><label className="mt-4 block text-xs text-slate-300">Title<input className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" onChange={(event) => setMeetingTitle(event.target.value)} placeholder="Project review" value={meetingTitle} /></label><label className="mt-3 block text-xs text-slate-300">Date and time<input className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" onChange={(event) => setMeetingDateTime(event.target.value)} type="datetime-local" value={meetingDateTime} /></label><label className="mt-3 block text-xs text-slate-300">Meeting link (optional)<input className="mt-1 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" onChange={(event) => setMeetingUrl(event.target.value)} placeholder="https://meet.google.com/..." type="url" value={meetingUrl} /></label>{meetingError ? <p className="mt-3 text-xs text-rose-300">{meetingError}</p> : null}<button className="mt-4 w-full rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" type="submit">Send meeting invitation</button></form></div> : null}
  </div>;
}
