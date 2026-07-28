"use client";
import Image from "next/image";
import Link from "next/link";
import { Building2, ChevronDown, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { demoOrganizations as demoOrganizationSource, demoUsers as demoUserSource } from "../../demo/home/data";
import { useSocialStore } from "../../lib/social/store";

const NETWORK_ROTATION_STORAGE_KEY = "proofx-network-rotation-offset";
const NETWORK_PAGE_SIZE = 6;

function rotateItems<T>(items: T[], offset: number) {
  const normalizedOffset = offset % items.length;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

function getNextNetworkOffset() {
  try {
    const storedOffset = Number.parseInt(window.sessionStorage.getItem(NETWORK_ROTATION_STORAGE_KEY) ?? "0", 10);
    const networkOffset = Number.isInteger(storedOffset) && storedOffset >= 0 ? storedOffset % demoUserSource.length : 0;
    window.sessionStorage.setItem(NETWORK_ROTATION_STORAGE_KEY, String((networkOffset + NETWORK_PAGE_SIZE) % demoUserSource.length));
    return networkOffset;
  } catch {
    return 0;
  }
}

export function NetworkCenter() {
  const [limit, setLimit] = useState(6); const [networkOffset, setNetworkOffset] = useState(0); const [networkReady, setNetworkReady] = useState(false); const connections = useSocialStore((state) => state.connections); const following = useSocialStore((state) => state.following); const sendRequest = useSocialStore((state) => state.sendRequest); const followUser = useSocialStore((state) => state.followUser);
  useEffect(() => { setNetworkOffset(getNextNetworkOffset()); setNetworkReady(true); }, []);
  const people = useMemo(() => networkReady ? rotateItems(demoUserSource.filter((user) => !["connected", "blocked"].includes(connections[user.id] ?? "none")), networkOffset) : [], [connections, networkOffset, networkReady]);
  const demoUsers = useMemo(() => networkReady ? rotateItems(demoUserSource, networkOffset + 31) : [], [networkOffset, networkReady]);
  const demoOrganizations = useMemo(() => networkReady ? rotateItems(demoOrganizationSource, networkOffset + 5) : [], [networkOffset, networkReady]);
  const more = () => setLimit((value) => value + 6);
  const expand = <button className="mx-auto mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-300" onClick={more} type="button">Load more <ChevronDown className="h-4 w-4" /></button>;
  return <div className="mx-auto max-w-7xl space-y-8"><header><p className="text-sm font-medium text-cyan-300">Your professional network</p><h1 className="mt-2 text-3xl font-semibold text-white">Build meaningful professional connections.</h1></header><section><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><UsersRound className="h-5 w-5 text-cyan-300" />People to connect with</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{people.slice(0, limit).map((person) => <article className="rounded-xl border border-slate-800 bg-slate-950 p-4" key={person.id}><div className="flex gap-3"><Image alt="" className="h-12 w-12 rounded-full" height={48} src={person.avatarUrl} unoptimized width={48} /><div className="min-w-0"><Link className="block truncate text-sm font-semibold text-white hover:text-cyan-300" href={`/dashboard/profile/${person.id}`}>{person.fullName}</Link><p className="truncate text-xs text-slate-500">{person.profession} · {person.company}</p></div></div><button className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200" onClick={() => sendRequest(person.id, person.fullName)} type="button"><UserPlus className="h-3.5 w-3.5" />{connections[person.id] === "pending" ? "Request sent" : "Connect"}</button></article>)}</div>{limit < people.length ? expand : null}</section><section><h2 className="mb-4 text-lg font-semibold text-white">Professionals to follow</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{demoUsers.slice(12, 12 + limit).map((person) => <article className="rounded-xl border border-slate-800 bg-slate-950 p-4" key={person.id}><Link className="text-sm font-semibold text-white hover:text-cyan-300" href={`/dashboard/profile/${person.id}`}>{person.fullName}</Link><p className="mt-1 truncate text-xs text-slate-500">{person.headline}</p><button className="mt-4 w-full rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200" onClick={() => followUser(person.id, person.fullName)} type="button">{following[person.id] ? "Unfollow" : "Follow"}</button></article>)}</div>{limit < 20 ? expand : null}</section><section><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><Building2 className="h-5 w-5 text-cyan-300" />Organizations</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{demoOrganizations.slice(0, limit).map((organization) => { const key = `organization-${organization.id}`; return <article className="rounded-xl border border-slate-800 bg-slate-950 p-4" key={organization.id}><Link className="text-sm font-semibold text-white hover:text-cyan-300" href="/organizations">{organization.name}</Link><p className="mt-1 text-xs text-slate-500">{organization.category} · {organization.followers.toLocaleString()} followers</p><button className="mt-4 w-full rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200" onClick={() => followUser(key, organization.name)} type="button">{following[key] ? "Unfollow" : "Follow"}</button></article>; })}</div>{limit < demoOrganizations.length ? expand : null}</section></div>;
}
