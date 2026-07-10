import Link from "next/link";
import { Building2, CheckCircle2, Filter, MapPin, Search } from "lucide-react";
import { getOrganizationTypeLabel, organizationTypeLabels, organizationTypeValues } from "../organization.constants";
import { toggleOrganizationFollowAction, type listOrganizationsForDiscovery } from "../organization.service";

type OrganizationDiscoveryProps = {
  canFollow: boolean;
  data: Awaited<ReturnType<typeof listOrganizationsForDiscovery>>;
  filters: {
    industry?: string;
    location?: string;
    query?: string;
    type?: string;
    verified?: string;
  };
  followedOrganizationIds: string[];
};

function locationText(organization: OrganizationDiscoveryProps["data"]["organizations"][number]) {
  return organization.headquarters || [organization.city, organization.state, organization.country].filter(Boolean).join(", ") || "Location not set";
}

export function OrganizationDiscovery({ canFollow, data, filters, followedOrganizationIds }: OrganizationDiscoveryProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-300">ProofX Organizations</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Discover organizations by proof, identity, and real activity.</h1>
            </div>
            <Link className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" href="/organizations/create">
              Create organization
            </Link>
          </div>

          <form className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-[minmax(0,1fr)_12rem_12rem_12rem_8rem]" role="search">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 pl-9 pr-3 text-sm outline-none focus:border-cyan-400" defaultValue={filters.query} name="q" placeholder="Search name, tagline, industry" />
            </label>
            <select className="h-11 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-cyan-400" defaultValue={filters.type ?? ""} name="type">
              <option value="">All types</option>
              {organizationTypeValues.map((value) => (
                <option key={value} value={value}>
                  {organizationTypeLabels[value]}
                </option>
              ))}
            </select>
            <input className="h-11 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-cyan-400" defaultValue={filters.industry} name="industry" placeholder="Industry" />
            <input className="h-11 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-cyan-400" defaultValue={filters.location} name="location" placeholder="Location" />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-400/30 px-3 text-sm font-semibold text-cyan-200" type="submit">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Showing <span className="font-semibold text-white">{data.stats.total}</span> organizations. <span className="text-emerald-300">{data.stats.verified}</span> verified.
          </p>
          <Link className="text-sm font-semibold text-cyan-300 hover:text-cyan-200" href="/organizations?verified=true">
            Verified organizations
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.organizations.map((organization) => {
            const following = followedOrganizationIds.includes(organization.id);

            return (
              <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-5" key={organization.id}>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-sm font-semibold text-cyan-200">
                    {organization.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full rounded-md object-cover" src={organization.logoUrl} />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link className="truncate font-semibold text-white hover:text-cyan-300" href={`/organizations/${organization.slug}`}>
                        {organization.name}
                      </Link>
                      {organization.verificationStatus === "verified" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /> : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{organization.industry || getOrganizationTypeLabel(organization.type)}</p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-400">{organization.tagline || organization.description || "This organization is still building its public ProofX identity."}</p>
                <p className="mt-4 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {locationText(organization)}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{organization.followerCount} followers</span>
                  {canFollow ? (
                    <form action={toggleOrganizationFollowAction}>
                      <input name="organizationId" type="hidden" value={organization.id} />
                      <button className="rounded-md border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200" type="submit">
                        {following ? "Following" : "Follow"}
                      </button>
                    </form>
                  ) : (
                    <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300" href="/login">
                      Sign in to follow
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {data.organizations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 p-10 text-center">
            <p className="font-semibold text-white">No organizations match those filters.</p>
            <p className="mt-2 text-sm text-slate-500">Try a broader search or create the first organization in this area.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
