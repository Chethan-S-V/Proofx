"use client";

import { useState } from "react";
import { Bookmark, CheckCircle2, Heart, MessageCircle, Repeat2, Send, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { DemoPost, DemoUser } from "../../demo/home/schemas";
import { Badge } from "../ui/badge";

function compactNumber(value: number) {
  return Intl.NumberFormat("en", { compactDisplay: "short", notation: "compact" }).format(value);
}

function relativeTime(createdAt: string) {
  const elapsedMinutes = Math.max(1, Math.round((Date.parse("2026-07-04T08:00:00.000Z") - Date.parse(createdAt)) / 60000));
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}h`;
  return `${Math.floor(elapsedMinutes / 1440)}d`;
}

export function DemoPostCard({ author, post }: { author: DemoUser; post: DemoPost }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shared, setShared] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  function addComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextComment = comment.trim();
    if (!nextComment) return;
    setComments((current) => [...current, nextComment]);
    setComment("");
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950" id={post.id}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Image alt="" className="h-11 w-11 rounded-full border border-slate-700 object-cover" height={44} src={author.avatarUrl} unoptimized width={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-white">{author.fullName}</p>
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" aria-label="Demo verified profile" />
            </div>
            <p className="truncate text-xs text-slate-400">{author.headline}</p>
            <p className="mt-1 text-xs text-slate-600">{relativeTime(post.createdAt)} · Demo</p>
          </div>
          <Badge variant="outline">{post.type}</Badge>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-200">{post.text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => <span className="text-xs font-medium text-cyan-300" key={tag}>#{tag}</span>)}
        </div>
      </div>

      {post.imageUrl ? (
        <div className="relative aspect-[1.9/1] border-y border-slate-800 bg-slate-900">
          <Image alt={`${post.type} demo artwork`} className="object-cover" fill sizes="(max-width: 768px) 100vw, 680px" src={post.imageUrl} unoptimized />
        </div>
      ) : null}

      {post.attachment ? (
        <div className="mx-4 mt-4 rounded-lg border border-slate-800 bg-slate-900/55 p-4 sm:mx-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-300">{post.attachment.kind} preview</p>
              <h3 className="mt-1 text-sm font-semibold text-white">{post.attachment.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{post.attachment.description}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-4 pt-4 text-xs text-slate-500 sm:px-5">
        {compactNumber(post.likeCount + (liked ? 1 : 0))} likes · {compactNumber(post.commentCount + comments.length)} comments · {compactNumber(post.shareCount + (shared ? 1 : 0))} shares
      </div>
      <div className="mt-3 grid grid-cols-4 border-t border-slate-800 px-2 py-2">
        <button className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition hover:bg-slate-900 ${liked ? "text-rose-300" : "text-slate-400"}`} onClick={() => setLiked((value) => !value)} type="button">
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} aria-hidden="true" /> Like
        </button>
        <button className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-900" onClick={() => setCommentOpen((value) => !value)} type="button">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Comment
        </button>
        <button className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition hover:bg-slate-900 ${shared ? "text-cyan-300" : "text-slate-400"}`} onClick={() => setShared(true)} type="button">
          <Repeat2 className="h-4 w-4" aria-hidden="true" /> Share
        </button>
        <button className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition hover:bg-slate-900 ${bookmarked ? "text-amber-300" : "text-slate-400"}`} onClick={() => setBookmarked((value) => !value)} type="button">
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} aria-hidden="true" /> Save
        </button>
      </div>

      {commentOpen ? (
        <div className="border-t border-slate-800 p-4 sm:p-5">
          {comments.map((item, index) => (
            <div className="mb-3 rounded-lg bg-slate-900 p-3 text-sm text-slate-300" key={`${item}-${index}`}>
              <span className="font-semibold text-white">You</span> {item}
            </div>
          ))}
          <form className="flex gap-2" onSubmit={addComment}>
            <input aria-label="Add a demo comment" className="h-10 min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" onChange={(event) => setComment(event.target.value)} placeholder="Add a comment..." value={comment} />
            <button aria-label="Post comment" className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300 text-slate-950 disabled:opacity-40" disabled={!comment.trim()} type="submit">
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
