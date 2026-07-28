"use client";

import { Check, Search, Send, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { demoUsers } from "../../demo/home/data";
import { sharePostSchema } from "../../lib/social/schemas";

export function SharePostDialog({ onClose, onShared, postId }: { onClose: () => void; onShared: (recipientIds: string[]) => void; postId: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return demoUsers.filter((user) => !normalized || `${user.fullName} ${user.username} ${user.profession}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query]);

  function toggleRecipient(userId: string) {
    setSelected((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]);
    setError("");
  }

  function share() {
    const parsed = sharePostSchema.safeParse({ postId, recipientIds: selected });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Choose a recipient.");
      return;
    }
    onShared(parsed.data.recipientIds);
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div><h2 className="font-semibold text-white">Share this post</h2><p className="mt-1 text-xs text-slate-500">Search anyone on ProofX—not only your connections.</p></div>
          <button aria-label="Close share dialog" className="rounded-md p-2 text-slate-500 hover:bg-slate-900 hover:text-white" onClick={onClose} type="button"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input autoFocus className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setQuery(event.target.value)} placeholder="Search name, username, or profession" value={query} /></div>
          <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
            {results.map((user) => {
              const isSelected = selected.includes(user.id);
              return <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-900" key={user.id} onClick={() => toggleRecipient(user.id)} type="button"><Image alt="" className="h-10 w-10 rounded-full" height={40} src={user.avatarUrl} unoptimized width={40} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{user.fullName}</span><span className="block truncate text-xs text-slate-500">@{user.username} · {user.profession}</span></span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-slate-700"}`}>{isSelected ? <Check className="h-3.5 w-3.5" /> : null}</span></button>;
            })}
          </div>
          {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
          <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 text-sm font-semibold text-slate-950 disabled:opacity-40" disabled={selected.length === 0} onClick={share} type="button"><Send className="h-4 w-4" />Send to {selected.length || "selected people"}</button>
        </div>
      </div>
    </div>
  );
}
