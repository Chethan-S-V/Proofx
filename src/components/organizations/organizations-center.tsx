"use client";

import { Building2, CheckCircle2, Clock3, KeyRound, Lock, Mail, ShieldCheck, Sparkles, UsersRound, XCircle } from "lucide-react";
import { useState } from "react";
import { demoOrganizations } from "../../demo/home/data";

const organizationRequests = [
  { company: "Northstar Labs", domain: "northstar.example", risk: "Low", status: "Ready for approval", teams: 8 },
  { company: "GreenGrid Systems", domain: "greengrid.example", risk: "Medium", status: "Needs proof review", teams: 4 },
  { company: "CivicStack Studio", domain: "civicstack.example", risk: "Low", status: "Ready for approval", teams: 3 },
];

export function OrganizationsCenter() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [email, setEmail] = useState("chethan@gmail.com");
  const [password, setPassword] = useState("Chetu@2004");
  const [authenticated, setAuthenticated] = useState(false);
  const [approved, setApproved] = useState<string[]>(["Northstar Labs"]);

  function login() {
    setAuthenticated(email === "chethan@gmail.com" && password === "Chetu@2004");
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-300">Dashboard / Organizations</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Organizations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Companies create organization workspaces, then ProofX company approval verifies the company before it can issue challenges, recruit, or verify employee proof.</p>
        </div>
        <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" onClick={() => setPanelOpen(true)} type="button">Open ProofX company panel</button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[["Verified organizations", "128"], ["Pending company requests", "17"], ["Credentialed company admins", "42"]].map(([label, value]) => (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5" key={label}>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-cyan-300" /><h2 className="font-semibold text-white">Company-created organization directory</h2></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {demoOrganizations.slice(0, 8).map((organization, index) => (
              <article className="rounded-xl border border-slate-800 bg-slate-900/45 p-4" key={organization.id}>
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-semibold text-white">{organization.name}</h3><p className="mt-1 text-xs text-slate-500">{organization.category} · {organization.location}</p></div>
                  {organization.verified ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Clock3 className="h-5 w-5 text-amber-300" />}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-950 p-2"><p className="font-semibold text-white">{organization.followers.toLocaleString("en-IN")}</p><p className="text-slate-600">Followers</p></div>
                  <div className="rounded-lg bg-slate-950 p-2"><p className="font-semibold text-white">{index + 4}</p><p className="text-slate-600">Teams</p></div>
                  <div className="rounded-lg bg-slate-950 p-2"><p className="font-semibold text-white">{12 + index}</p><p className="text-slate-600">Proofs</p></div>
                </div>
                <button className="mt-4 w-full rounded-md border border-cyan-400/30 py-2 text-xs font-semibold text-cyan-300" type="button">Request to join</button>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white"><ShieldCheck className="h-4 w-4 text-emerald-300" />Approval rules</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <p>Only verified companies can create official organization workspaces.</p>
              <p>ProofX company admins approve or reject organization requests.</p>
              <p>No public user can create a company-panel profile; credentials are issued by ProofX company only.</p>
            </div>
          </section>
          <section className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white"><Sparkles className="h-4 w-4 text-cyan-300" />Advanced organization features</h2>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              {["Company proof verification", "Role-based admin access", "Recruiter challenge publishing", "Hiring pipeline analytics", "Team contribution review", "Employee credential invites"].map((feature) => <p className="rounded-md bg-slate-900 px-3 py-2" key={feature}>{feature}</p>)}
            </div>
          </section>
        </aside>
      </section>

      {panelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <button aria-label="Close ProofX panel" className="absolute inset-0" onClick={() => setPanelOpen(false)} type="button" />
          <section className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">ProofX company only</p><h2 className="mt-2 text-2xl font-semibold text-white">Organization approval panel</h2><p className="mt-1 text-sm text-slate-500">Demo login: chethan@gmail.com / Chetu@2004</p></div>
              <button className="rounded-md p-2 text-slate-500 hover:bg-slate-900" onClick={() => setPanelOpen(false)} type="button"><XCircle className="h-5 w-5" /></button>
            </div>

            {!authenticated ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label><span className="flex items-center gap-1 text-xs text-slate-400"><Mail className="h-3.5 w-3.5" />Company email</span><input className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" onChange={(event) => setEmail(event.target.value)} value={email} /></label>
                <label><span className="flex items-center gap-1 text-xs text-slate-400"><KeyRound className="h-3.5 w-3.5" />Password</span><input className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" onChange={(event) => setPassword(event.target.value)} type="password" value={password} /></label>
                <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 md:col-span-2" onClick={login} type="button">Login to company panel</button>
                <p className="flex items-center gap-2 text-xs text-slate-500 md:col-span-2"><Lock className="h-3.5 w-3.5" />In production this must be server-authenticated. This screen is a local product demo.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[["9", "Requests today"], ["3", "Needs manual review"], ["99.1%", "Verified domain match"]].map(([value, label]) => <div className="rounded-xl bg-slate-900 p-4" key={label}><p className="text-xl font-semibold text-white">{value}</p><p className="text-xs text-slate-500">{label}</p></div>)}
                </div>
                {organizationRequests.map((request) => (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 p-4" key={request.company}>
                    <UsersRound className="h-5 w-5 text-cyan-300" />
                    <div className="min-w-0 flex-1"><p className="font-semibold text-white">{request.company}</p><p className="text-xs text-slate-500">{request.domain} · {request.teams} teams · Risk {request.risk}</p></div>
                    <span className="text-xs text-slate-500">{approved.includes(request.company) ? "Approved" : request.status}</span>
                    <button className="rounded-md bg-emerald-300 px-3 py-2 text-xs font-semibold text-slate-950" onClick={() => setApproved((current) => [...new Set([...current, request.company])])} type="button">Approve</button>
                    <button className="rounded-md border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-300" type="button">Reject</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
