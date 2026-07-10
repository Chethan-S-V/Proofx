import { Award, BriefcaseBusiness, CheckCircle2, Eye, FolderGit2, MapPin, MessageCircle, Star, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { demoChallenges, demoPosts, demoRepositories } from "../../demo/home/data";
import type { DemoUser } from "../../demo/home/schemas";
import { NetworkActionButton } from "../home/network-action-button";

function formatNumber(value: number) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export function DemoPublicProfile({ user }: { user: DemoUser }) {
  const userNumber = Number(user.id.split("-").at(-1) ?? 1);
  const repositories = demoRepositories.filter((repository) => repository.owner === user.username);
  const visibleRepositories = repositories.length > 0 ? repositories : demoRepositories.slice(userNumber % 8, userNumber % 8 + 3);
  const completedChallenges = userNumber % 4 === 0 ? [] : demoChallenges.slice(userNumber % 6, userNumber % 6 + 2);
  const posts = demoPosts.filter((post) => post.authorId === user.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="relative h-44"><Image alt="" className="object-cover" fill priority sizes="100vw" src={user.bannerUrl} unoptimized /><div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" /></div>
        <div className="relative px-6 pb-6">
          <div className="-mt-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end"><Image alt={user.fullName} className="h-28 w-28 rounded-xl border-4 border-slate-950" height={112} src={user.avatarUrl} unoptimized width={112} /><div className="pb-1"><div className="flex items-center gap-2"><h1 className="text-3xl font-semibold text-white">{user.fullName}</h1><CheckCircle2 className="h-5 w-5 text-cyan-300" /></div><p className="mt-1 text-sm text-slate-300">@{user.username} · {user.headline}</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{user.location}, {user.country}</p></div></div>
            <div className="flex gap-2"><NetworkActionButton className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" mode="connect" userId={user.id} userName={user.fullName} /><Link className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:border-cyan-400" href="/dashboard/messages">Message</Link></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-800 pt-5 sm:grid-cols-4">{[[formatNumber(user.followers), "Followers"], [formatNumber(user.following), "Following"], [String(user.trustScore), "Trust score"], [String(user.proofScore), "Proof score"]].map(([value, label]) => <div key={label}><p className="text-xl font-semibold text-white">{value}</p><p className="text-xs text-slate-500">{label}</p></div>)}</div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="space-y-6">
          <section className="rounded-xl border border-slate-800 bg-slate-950 p-5"><h2 className="font-semibold text-white">About</h2><p className="mt-3 text-sm leading-7 text-slate-300">{user.bio}</p><div className="mt-4 flex flex-wrap gap-2">{user.skills.map((skill) => <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200" key={skill}>{skill}</span>)}</div></section>

          <section className="rounded-xl border border-slate-800 bg-slate-950 p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-cyan-300">Proofs</p><h2 className="mt-1 font-semibold text-white">Codebase files and challenge evidence</h2></div><FolderGit2 className="h-5 w-5 text-slate-600" /></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{visibleRepositories.map((repository, index) => <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-4" key={repository.id}><p className="text-sm font-semibold text-white">{repository.owner}/{repository.name}</p><p className="mt-2 text-xs leading-5 text-slate-400">{repository.description}</p><div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-400"><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{formatNumber(repository.stars)}</span><span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatNumber(1800 + index * 947)}</span><span className="font-semibold text-emerald-300">Score {78 + (index * 7) % 20}</span></div><button className="mt-4 rounded-md border border-cyan-400/30 px-3 py-1.5 text-xs font-semibold text-cyan-300" type="button">Post this proof</button></article>)}</div></section>

          <section className="rounded-xl border border-slate-800 bg-slate-950 p-5"><h2 className="font-semibold text-white">Completed challenges</h2>{completedChallenges.length > 0 ? <div className="mt-4 space-y-3">{completedChallenges.map((challenge, index) => <div className="flex items-center gap-3 rounded-lg border border-slate-800 p-4" key={challenge.id}><Trophy className="h-5 w-5 text-amber-300" /><div className="flex-1"><p className="text-sm font-medium text-white">{challenge.title}</p><p className="text-xs text-slate-500">{challenge.sponsor} · Completed with {88 + index * 5}%</p></div><span className="text-xs font-semibold text-amber-300">₹{challenge.prizeMoney.toLocaleString("en-IN")}</span></div>)}</div> : <div className="mt-4 rounded-lg border border-dashed border-slate-800 p-6 text-center"><Award className="mx-auto h-6 w-6 text-slate-700" /><p className="mt-2 text-sm font-medium text-white">No proofs</p><p className="mt-1 text-xs text-slate-500">This professional has not completed a challenge yet.</p></div>}</section>

          <section className="rounded-xl border border-slate-800 bg-slate-950 p-5"><h2 className="font-semibold text-white">Recent posts</h2><div className="mt-4 space-y-3">{posts.map((post) => <article className="overflow-hidden rounded-lg border border-slate-800" key={post.id}>{post.imageUrl ? <div className="relative h-52"><Image alt="" className="object-cover" fill sizes="(min-width: 1024px) 650px, 100vw" src={post.imageUrl} unoptimized /></div> : post.type.toLowerCase().includes("video") ? <div className="flex h-44 items-center justify-center bg-slate-900 text-sm font-semibold text-cyan-300">Video preview</div> : null}<div className="p-4"><p className="text-sm leading-6 text-slate-300">{post.text}</p><p className="mt-3 flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{formatNumber(post.viewCount)}</span><span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.commentCount}</span></p></div></article>)}</div></section>
        </main>
        <aside className="space-y-4"><section className="rounded-xl border border-slate-800 bg-slate-950 p-5"><h2 className="flex items-center gap-2 font-semibold text-white"><BriefcaseBusiness className="h-4 w-4 text-cyan-300" />Professional details</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-xs text-slate-500">Company</dt><dd className="mt-1 text-white">{user.company}</dd></div><div><dt className="text-xs text-slate-500">Profession</dt><dd className="mt-1 text-white">{user.profession}</dd></div><div><dt className="text-xs text-slate-500">Experience</dt><dd className="mt-1 text-white">{user.experienceYears} years</dd></div><div><dt className="text-xs text-slate-500">Repositories</dt><dd className="mt-1 text-white">{user.repositoryCount}</dd></div><div><dt className="text-xs text-slate-500">Proofs</dt><dd className="mt-1 text-white">{user.proofCount}</dd></div></dl></section><section className="rounded-xl border border-slate-800 bg-slate-950 p-5"><h2 className="flex items-center gap-2 font-semibold text-white"><Users className="h-4 w-4 text-violet-300" />Organizations</h2><div className="mt-3 space-y-2">{user.organizationMemberships.map((organization) => <p className="rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-300" key={organization}>{organization}</p>)}</div></section></aside>
      </div>
    </div>
  );
}
