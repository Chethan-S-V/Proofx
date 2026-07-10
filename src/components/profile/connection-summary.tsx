"use client";

import { Check, Pencil, Users, X } from "lucide-react";
import { useState } from "react";
import { useSocialStore } from "../../lib/social/store";
import { demoUsers } from "../../demo/home/data";

type Visibility = "everyone" | "connections" | "only-me";

export function ConnectionSummary({ connections, editable = false, follows }: { connections: number; editable?: boolean; follows: number }) {
  const [editing, setEditing] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("everyone");
  const following = useSocialStore((state) => state.following);
  const followedUsers = demoUsers.filter((user) => following[user.id]);
  const followTotal = follows + followedUsers.length;

  return <section className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 text-white"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-cyan-300" /><h2 className="text-sm font-semibold">Network</h2></div>{editable ? <button aria-label="Edit network visibility" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-900 hover:text-white" onClick={() => setEditing((value) => !value)} type="button">{editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}</button> : null}</div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-slate-900 p-3"><p className="text-xl font-semibold text-white">{connections.toLocaleString()}</p><p className="text-xs text-slate-500">Connections</p></div><div className="rounded-lg bg-slate-900 p-3"><p className="text-xl font-semibold text-white">{followTotal.toLocaleString()}</p><p className="text-xs text-slate-500">Follows</p></div></div>{followedUsers.length ? <div className="mt-3 rounded-lg bg-slate-900 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Following from trending</p><p className="mt-2 text-xs text-slate-300">{followedUsers.map((user) => user.fullName).join(", ")}</p></div> : null}<p className="mt-3 text-[11px] text-slate-600">Visible to {visibility === "everyone" ? "everyone" : visibility === "connections" ? "connections only" : "only you"}</p>{editing ? <div className="absolute right-4 top-12 z-20 w-56 rounded-lg border border-slate-700 bg-slate-950 p-2 shadow-2xl">{(["everyone", "connections", "only-me"] as Visibility[]).map((option) => <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-900" key={option} onClick={() => { setVisibility(option); setEditing(false); }} type="button"><span>{option === "everyone" ? "Visible to others" : option === "connections" ? "Only connections" : "Only me"}</span>{visibility === option ? <Check className="h-3.5 w-3.5 text-cyan-300" /> : null}</button>)}</div> : null}</section>;
}

export function UserPublishedPosts() {
  const posts = useSocialStore((state) => state.createdPosts);
  return <section className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-white"><h2 className="font-semibold">Your posts</h2>{posts.length ? <div className="mt-4 space-y-3">{posts.map((post) => <article className="rounded-lg border border-slate-800 p-4" key={post.id}><p className="text-xs font-semibold uppercase text-cyan-300">{post.type}</p><p className="mt-2 text-sm leading-6 text-slate-300">{post.text}</p></article>)}</div> : <p className="mt-3 text-sm text-slate-500">Posts you publish will appear here.</p>}</section>;
}
