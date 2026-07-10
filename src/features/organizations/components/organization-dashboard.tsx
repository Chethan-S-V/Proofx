import Link from "next/link";
import { Building2, CheckCircle2, Clock3, Plus, Search, ShieldCheck, UsersRound } from "lucide-react";
import { createOrganizationAction, toggleOrganizationFollowAction, type listOrganizationsForDashboard } from "../organization.service";
import { organizationTypeLabels, organizationTypeValues } from "../organization.constants";

type OrganizationDashboardProps = {
  data: Awaited<ReturnType<typeof listOrganizationsForDashboard>>;
};

function isFollowing(data: OrganizationDashboardProps["data"], organizationId: string) {
  return data.follows.some((follow) => follow.organizationId === organizationId);
}

function membershipStatus(data: OrganizationDashboardProps["data"], organizationId: string) {
  return data.memberships.find((membership) => membership.organizationId === organizationId)?.status ?? null;
}

export function OrganizationDashboard({ data }: OrganizationDashboardProps) {
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-300">Dashboard / Organizations</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Organization Operating System</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Build public identity, workforce operations, proof verification, hiring, challenges, and governance around real evidence.
          </p>
        </div>
        <a className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950" href="#create-organization">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create organization
        </a>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Organizations", data.stats.total.toString()],
          ["Verified", data.stats.verifiedCount.toString()],
          ["In review", data.stats.pendingCount.toString()],
          ["Your memberships", data.stats.activeMemberCount.toString()],
        ].map(([label, value]) => (
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-5" key={label}>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <Building2 className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                Organization directory
              </h2>
              <p className="mt-1 text-xs text-slate-500">Real database-backed organizations. Follow, inspect, and manage if you have membership permissions.</p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-xs text-slate-500">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Global search enabled
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {data.organizations.map((organization) => {
              const status = membershipStatus(data, organization.id);
              const following = isFollowing(data, organization.id);

              return (
                <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-4" key={organization.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-sm font-semibold text-cyan-200">
                      {organization.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" className="h-full w-full rounded-md object-cover" src={organization.logoUrl} />
                      ) : (
                        organization.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link className="truncate font-semibold text-white hover:text-cyan-300" href={`/organizations/${organization.slug}`}>
                          {organization.name}
                        </Link>
                        {organization.verificationStatus === "verified" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-label="Verified organization" />
                        ) : (
                          <Clock3 className="h-4 w-4 text-amber-300" aria-label="Verification pending" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {organization.industry || organizationTypeLabels[organization.type]} · {organization.headquarters || [organization.city, organization.country].filter(Boolean).join(", ") || "Location not set"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">{organization.tagline || organization.description || "This organization is still building its ProofX presence."}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-slate-950 p-2">
                      <p className="font-semibold text-white">{organization.followerCount}</p>
                      <p className="text-slate-600">Followers</p>
                    </div>
                    <div className="rounded-md bg-slate-950 p-2">
                      <p className="font-semibold text-white">{organization.memberCount}</p>
                      <p className="text-slate-600">Members</p>
                    </div>
                    <div className="rounded-md bg-slate-950 p-2">
                      <p className="font-semibold capitalize text-white">{organization.status.replace(/_/g, " ")}</p>
                      <p className="text-slate-600">Status</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={toggleOrganizationFollowAction}>
                      <input name="organizationId" type="hidden" value={organization.id} />
                      <button className="rounded-md border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-300" type="submit">
                        {following ? "Following" : "Follow"}
                      </button>
                    </form>
                    <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300" href={`/organizations/${organization.slug}`}>
                      Public page
                    </Link>
                    <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300" href={`/dashboard/organizations/${organization.slug}`}>
                      Manage
                    </Link>
                    {status ? <span className="rounded-md bg-slate-950 px-3 py-2 text-xs capitalize text-slate-500">Membership: {status}</span> : null}
                  </div>
                </article>
              );
            })}

            {data.organizations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center lg:col-span-2">
                <p className="font-semibold text-white">No organizations yet</p>
                <p className="mt-1 text-sm text-slate-500">Create the first ProofX organization workspace to start verification, teams, jobs, and governance.</p>
              </div>
            ) : null}
          </div>
        </div>

        <aside id="create-organization" className="rounded-lg border border-slate-800 bg-slate-950 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            Create organization
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Creates a draft organization, assigns you the OWNER role, and opens onboarding.</p>

          <form action={createOrganizationAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Organization name</span>
              <input className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="name" required />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Unique slug</span>
              <input className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="slug" placeholder="northstar-labs" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Type</span>
              <select className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="type" defaultValue="company">
                {organizationTypeValues.map((value) => (
                  <option key={value} value={value}>
                    {organizationTypeLabels[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Industry</span>
              <input className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="industry" placeholder="Developer tools" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Website</span>
              <input className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="website" type="url" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Tagline</span>
              <input className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400" name="tagline" maxLength={180} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Specialties</span>
              <textarea className="mt-2 min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" name="specialties" placeholder="TypeScript, AI safety, verification" />
            </label>
            <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 text-sm font-semibold text-slate-950" type="submit">
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              Create and onboard
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
