"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Trophy, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { demoPosts, demoUsers } from "../../demo/home/data";
import { DemoPostCard } from "./demo-post-card";
import { DemoLeftSidebar, DemoRightSidebar } from "./demo-sidebars";
import { useSocialStore } from "../../lib/social/store";

const POSTS_PER_REFRESH = 8;
const FEED_OFFSET_STORAGE_KEY = "proofx-demo-feed-offset";

function getNextFeedOffset() {
  try {
    const storedOffset = Number.parseInt(window.sessionStorage.getItem(FEED_OFFSET_STORAGE_KEY) ?? "0", 10);
    const feedOffset = Number.isInteger(storedOffset) && storedOffset >= 0 ? storedOffset % demoPosts.length : 0;
    window.sessionStorage.setItem(FEED_OFFSET_STORAGE_KEY, String((feedOffset + POSTS_PER_REFRESH) % demoPosts.length));
    return feedOffset;
  } catch {
    return 0;
  }
}

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
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedOffset, setFeedOffset] = useState(0);
  const [feedReady, setFeedReady] = useState(false);
  const codebaseEnabled = useSocialStore((state) => state.codebaseEnabled);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const orderedPosts = useMemo(() => [...demoPosts].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)), []);
  const rotatedPosts = useMemo(() => [...orderedPosts.slice(feedOffset), ...orderedPosts.slice(0, feedOffset)], [feedOffset, orderedPosts]);

  useEffect(() => {
    setFeedOffset(getNextFeedOffset());
    setFeedReady(true);
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !feedReady) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || loadingMore || visibleCount >= rotatedPosts.length) return;
      setLoadingMore(true);
      window.setTimeout(() => {
        setVisibleCount((count) => Math.min(count + 8, rotatedPosts.length));
        setLoadingMore(false);
      }, 450);
    }, { rootMargin: "400px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [feedReady, loadingMore, rotatedPosts.length, visibleCount]);

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
            <div className={`mt-3 grid border-t border-slate-800 pt-3 ${codebaseEnabled ? "grid-cols-3" : "grid-cols-2"}`}>
              <Link className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 hover:bg-slate-900" href="/dashboard/post"><Sparkles className="h-4 w-4 text-cyan-300" />Create post</Link>
              <Link className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 hover:bg-slate-900" href="/dashboard/challenges"><Trophy className="h-4 w-4 text-emerald-300" />Challenges</Link>
              {codebaseEnabled ? <Link className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 hover:bg-slate-900" href="/dashboard/repositories"><UsersRound className="h-4 w-4 text-violet-300" />Repository</Link> : null}
            </div>
          </section>

          {!feedReady ? <><PostSkeleton /><PostSkeleton /></> : rotatedPosts.slice(0, visibleCount).map((post) => {
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
