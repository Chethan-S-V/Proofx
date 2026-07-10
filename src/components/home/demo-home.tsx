"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BriefcaseBusiness, ChevronRight, Filter, Sparkles, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { demoPosts, demoUsers } from "../../demo/home/data";
import { DemoPostCard } from "./demo-post-card";
import { DemoLeftSidebar, DemoRightSidebar } from "./demo-sidebars";
import { NetworkActionButton } from "./network-action-button";

type FeedMode = "recent" | "trending" | "following";

function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-950 p-5" aria-label="Loading more demo posts">
      <div className="flex gap-3"><div className="h-11 w-11 rounded-full bg-slate-800" /><div className="flex-1 space-y-2"><div className="h-3 w-40 rounded bg-slate-800" /><div className="h-3 w-64 rounded bg-slate-900" /></div></div>
      <div className="mt-5 space-y-2"><div className="h-3 rounded bg-slate-800" /><div className="h-3 w-5/6 rounded bg-slate-800" /></div>
      <div className="mt-5 aspect-[1.9/1] rounded-lg bg-slate-900" />
    </div>
  );
}

export function DemoHome({ avatarUrl, displayName }: { avatarUrl: string | null; displayName: string }) {
  const [feedMode, setFeedMode] = useState<FeedMode>("recent");
  const [networkPage, setNetworkPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const orderedPosts = useMemo(() => {
    if (feedMode === "trending") return [...demoPosts].sort((left, right) => right.likeCount + right.shareCount * 2 - (left.likeCount + left.shareCount * 2));
    if (feedMode === "following") return demoPosts.filter((post) => Number(post.authorId.split("-").at(-1)) <= 24);
    return demoPosts;
  }, [feedMode]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || loadingMore || visibleCount >= orderedPosts.length) return;
      setLoadingMore(true);
      window.setTimeout(() => {
        setVisibleCount((count) => Math.min(count + 8, orderedPosts.length));
        setLoadingMore(false);
      }, 450);
    }, { rootMargin: "400px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadingMore, orderedPosts.length, visibleCount]);

  function changeFeed(mode: FeedMode) {
    setFeedMode(mode);
    setVisibleCount(8);
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="grid items-start gap-5 xl:grid-cols-[16rem_minmax(0,1fr)_19rem]">
        <div className="hidden xl:block"><div className="sticky top-20"><DemoLeftSidebar avatarUrl={avatarUrl} displayName={displayName} /></div></div>

        <main className="min-w-0 space-y-4">
          <section className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-sm font-semibold text-white">
                {avatarUrl ? <Image alt="" className="h-full w-full object-cover" height={40} src={avatarUrl} unoptimized width={40} /> : displayName.slice(0, 2).toUpperCase()}
              </div>
              <Link className="flex h-11 flex-1 items-center rounded-full border border-slate-700 bg-slate-900 px-4 text-sm text-slate-400 transition hover:border-slate-600 hover:text-white" href="/dashboard/post">Share a project, proof, or professional update...</Link>
            </div>
            <div className="mt-3 grid grid-cols-3 border-t border-slate-800 pt-3">
              <Link className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 hover:bg-slate-900" href="/dashboard/post"><Sparkles className="h-4 w-4 text-cyan-300" />Create post</Link>
              <Link className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 hover:bg-slate-900" href="/dashboard/proofs"><BriefcaseBusiness className="h-4 w-4 text-emerald-300" />Share proof</Link>
              <Link className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 hover:bg-slate-900" href="/dashboard/repositories"><UsersRound className="h-4 w-4 text-violet-300" />Repository</Link>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-cyan-300">Grow your network</p><h2 className="mt-1 text-sm font-semibold text-white">Professionals worth discovering</h2></div><button aria-label="Show other professionals" className="rounded-full p-2 text-slate-500 hover:bg-slate-900 hover:text-cyan-300" onClick={() => setNetworkPage((page) => (page + 1) % 4)} type="button"><ChevronRight className="h-4 w-4" /></button></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {demoUsers.slice(8 + networkPage * 3, 11 + networkPage * 3).map((user) => <div className="rounded-lg border border-slate-800 bg-slate-900/45 p-3 text-center" key={user.id}><Link href={`/dashboard/profile/${user.id}`}><Image alt="" className="mx-auto h-12 w-12 rounded-full" height={48} src={user.avatarUrl} unoptimized width={48} /><p className="mt-2 truncate text-xs font-semibold text-white hover:text-cyan-300">{user.fullName}</p></Link><p className="mt-1 truncate text-[11px] text-slate-500">{user.profession}</p><NetworkActionButton className="mt-3 w-full rounded-md border border-cyan-400/30 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/10" mode="connect" userId={user.id} userName={user.fullName} /></div>)}
            </div>
          </section>

          <section className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <div className="flex gap-3"><BriefcaseBusiness className="mt-0.5 h-5 w-5 flex-none text-amber-300" /><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">Recruiter announcement</p><p className="mt-1 text-sm font-medium text-white">Portfolio review sessions are open this week</p><p className="mt-1 text-xs leading-5 text-slate-400">Fictional recruiters are reviewing verified project, design, research, and community-work proofs across the demo network.</p></div></div>
          </section>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2">
            <div className="flex gap-1">{(["recent", "trending", "following"] as FeedMode[]).map((mode) => <button className={`rounded-md px-3 py-2 text-xs font-semibold capitalize transition ${feedMode === mode ? "bg-slate-800 text-white" : "text-slate-500 hover:text-white"}`} key={mode} onClick={() => changeFeed(mode)} type="button">{mode}</button>)}</div>
            <button className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-500 hover:bg-slate-900 hover:text-white" type="button"><Filter className="h-3.5 w-3.5" />Filters</button>
          </div>

          {orderedPosts.slice(0, visibleCount).map((post) => {
            const author = demoUsers.find((user) => user.id === post.authorId) ?? demoUsers[0];
            return <DemoPostCard author={author} key={post.id} post={post} />;
          })}
          {loadingMore ? <><PostSkeleton /><PostSkeleton /></> : null}
          <div className="h-8" ref={loadMoreRef} />
        </main>

        <div className="hidden lg:block"><div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1"><DemoRightSidebar /></div></div>
      </div>

      <section className="mt-5 grid gap-4 lg:hidden sm:grid-cols-2">
        <DemoLeftSidebar avatarUrl={avatarUrl} displayName={displayName} />
        <DemoRightSidebar />
      </section>

      <p className="mt-6 text-center text-xs text-slate-600">All people, companies, posts, metrics, and events on this page are fictional demo content.</p>
    </div>
  );
}
