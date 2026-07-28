"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, CheckCircle2, Eye, Heart, MessageCircle, Pause, Play, Repeat2, Send, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { DemoPost, DemoUser } from "../../demo/home/schemas";
import { Badge } from "../ui/badge";
import { SharePostDialog } from "./share-post-dialog";
import { useSocialStore } from "../../lib/social/store";

function compactNumber(value: number) {
  return Intl.NumberFormat("en", { compactDisplay: "short", notation: "compact" }).format(value);
}

function relativeTime(createdAt: string) {
  const elapsedMinutes = Math.max(1, Math.round((Date.parse("2026-07-04T08:00:00.000Z") - Date.parse(createdAt)) / 60000));
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}h`;
  return `${Math.floor(elapsedMinutes / 1440)}d`;
}

function formatVideoDuration(duration: number) {
  if (!Number.isFinite(duration)) return "--:--";

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function DemoPostCard({ author, post }: { author: DemoUser; post: DemoPost }) {
  const [liked, setLiked] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const savedPosts = useSocialStore((state) => state.savedPosts);
  const savePost = useSocialStore((state) => state.savePost);
  const sharePostToUser = useSocialStore((state) => state.sharePostToUser);
  const recordPostActivity = useSocialStore((state) => state.recordPostActivity);
  const isVideoMuted = useSocialStore((state) => state.videoMuted);
  const setVideoMuted = useSocialStore((state) => state.setVideoMuted);
  const bookmarked = savedPosts.some((item) => item.id === post.id);
  const [shared, setShared] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !post.videoUrl) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
          return;
        }

        video.pause();
        setIsVideoPlaying(false);
      },
      { threshold: 0.65 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [post.videoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [isVideoMuted]);

  function toggleVideoPlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
      return;
    }

    video.pause();
    setIsVideoPlaying(false);
  }

  function toggleVideoMute() {
    const video = videoRef.current;
    if (!video) return;

    setVideoMuted(!isVideoMuted);
  }

  function addComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextComment = comment.trim();
    if (!nextComment) return;
    setComments((current) => [...current, nextComment]);
    recordPostActivity({ postId: post.id, text: nextComment, type: "comment" });
    setComment("");
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950" id={post.id}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Image alt="" className="h-11 w-11 rounded-full border border-slate-700 object-cover" height={44} src={author.avatarUrl} unoptimized width={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link className="truncate text-sm font-semibold text-white hover:text-cyan-300" href={`/dashboard/profile/${author.id}`}>{author.fullName}</Link>
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

      {post.videoUrl ? (
        <div className="border-y border-slate-800 bg-slate-950">
          <div className="relative aspect-[1.9/1] overflow-hidden bg-slate-950">
            <video aria-hidden="true" autoPlay className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-2xl" loop muted playsInline preload="metadata">
              <source src={post.videoUrl} type="video/mp4" />
            </video>
            <div className="relative z-10 mx-auto h-full max-w-full overflow-hidden shadow-2xl" style={videoAspectRatio ? { aspectRatio: videoAspectRatio } : undefined}>
              <video className="h-full w-full object-contain" loop muted={isVideoMuted} onLoadedMetadata={(event) => { setVideoDuration(event.currentTarget.duration); setVideoAspectRatio(`${event.currentTarget.videoWidth} / ${event.currentTarget.videoHeight}`); }} playsInline preload="metadata" ref={videoRef}>
                <source src={post.videoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
            <span className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-semibold text-white"><Play className="h-3.5 w-3.5 fill-current" />Demo video</span>
            <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">{videoDuration === null ? "Loading" : formatVideoDuration(videoDuration)}</span>
            <div className="absolute bottom-3 right-3 z-20 flex gap-2">
              <button aria-label={isVideoMuted ? "Unmute video" : "Mute video"} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur transition hover:bg-slate-950" onClick={toggleVideoMute} type="button">
                {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button aria-label={isVideoPlaying ? "Pause video" : "Play video"} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 text-white backdrop-blur transition hover:bg-slate-950" onClick={toggleVideoPlayback} type="button">
                {isVideoPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              </button>
            </div>
          </div>
        </div>
      ) : post.imageUrl ? (
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
        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{compactNumber(post.viewCount)} views</span> · {compactNumber(post.likeCount + (liked ? 1 : 0))} likes · {compactNumber(post.commentCount + comments.length)} comments · {compactNumber(post.shareCount + (shared ? 1 : 0))} shares
      </div>
      <div className="mt-3 grid grid-cols-4 border-t border-slate-800 px-2 py-2">
        <button className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition hover:bg-slate-900 ${liked ? "text-rose-300" : "text-slate-400"}`} onClick={() => setLiked((value) => { if (!value) recordPostActivity({ postId: post.id, type: "like" }); return !value; })} type="button">
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} aria-hidden="true" /> Like
        </button>
        <button className="flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-900" onClick={() => setCommentOpen((value) => !value)} type="button">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Comment
        </button>
        <button className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition hover:bg-slate-900 ${shared ? "text-cyan-300" : "text-slate-400"}`} onClick={() => setShareOpen(true)} type="button">
          <Repeat2 className="h-4 w-4" aria-hidden="true" /> Share
        </button>
        <button className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition hover:bg-slate-900 ${bookmarked ? "text-amber-300" : "text-slate-400"}`} onClick={() => savePost({ authorId: author.id, id: post.id })} type="button">
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
      {shareOpen ? <SharePostDialog onClose={() => setShareOpen(false)} onShared={(recipientIds) => { recipientIds.forEach((recipientId) => sharePostToUser(post.id, recipientId)); setShared(true); setShareOpen(false); }} postId={post.id} /> : null}
    </article>
  );
}
