import Link from "next/link";
import { Building2, CheckCircle2, Globe2, Mail, MapPin, MessageSquare, MoreHorizontal, UsersRound } from "lucide-react";
import { getOrganizationTypeLabel, organizationVerificationLabels } from "../organization.constants";
import { toggleOrganizationFollowAction, type getPublicOrganizationBySlug } from "../organization.service";

type PublicOrganizationProfileProps = {
  canFollow: boolean;
  data: NonNullable<Awaited<ReturnType<typeof getPublicOrganizationBySlug>>>;
};

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-dashed border-slate-800 p-5 text-sm text-slate-500">{children}</p>;
}

function Section({ children, id, title }: { children: React.ReactNode; id: string; title: string }) {
  return (
    <section className="scroll-mt-24" id={id}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function locationText(organization: PublicOrganizationProfileProps["data"]["organization"]) {
  return organization.headquarters || [organization.city, organization.state, organization.country].filter(Boolean).join(", ") || "Headquarters not set";
}

export function PublicOrganizationProfile({ canFollow, data }: PublicOrganizationProfileProps) {
  const { organization } = data;
  const publishedPosts = data.posts.filter((post) => post.status === "published");
  const publishedJobs = data.jobs.filter((job) => job.status === "published");
  const verifiedProofs = data.proofRequests.filter((request) => request.status === "verified");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800">
        <div className="relative h-56 bg-slate-900 bg-cover bg-center" style={organization.coverUrl ? { backgroundImage: `url(${organization.coverUrl})` } : undefined}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6">
          <div className="-mt-16 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border-4 border-slate-950 bg-slate-900 text-2xl font-semibold text-cyan-100 shadow-xl">
                {organization.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="h-full w-full rounded-md object-cover" src={organization.logoUrl} />
                ) : (
                  <Building2 className="h-10 w-10" />
                )}
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-white">{organization.name}</h1>
                  {organization.verificationStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{organization.tagline || "This organization is building its ProofX public identity."}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{organization.industry || getOrganizationTypeLabel(organization.type)}</span>
                  <span>{getOrganizationTypeLabel(organization.type)}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {locationText(organization)}
                  </span>
                  <span>{data.followerCount} followers</span>
                  <span>{data.memberCount} public members</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canFollow ? (
                <form action={toggleOrganizationFollowAction}>
                  <input name="organizationId" type="hidden" value={organization.id} />
                  <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" type="submit">
                    {data.isFollowing ? "Following" : "Follow"}
                  </button>
                </form>
              ) : (
                <Link className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" href="/login">
                  Sign in to follow
                </Link>
              )}
              {organization.website ? (
                <a className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200" href={organization.website} rel="noreferrer" target="_blank">
                  <Globe2 className="h-4 w-4" />
                  Visit Website
                </a>
              ) : null}
              {organization.allowMessages ? (
                <Link className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200" href="/dashboard/messages">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Link>
              ) : null}
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 text-slate-300" type="button" aria-label="More organization actions">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6">
          {["overview", "posts", "people", "proofs", "challenges", "jobs", "about"].map((item) => (
            <a className="rounded-md px-3 py-2 text-sm font-medium capitalize text-slate-400 hover:bg-slate-900 hover:text-white" href={`#${item}`} key={item}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-10">
          <Section id="overview" title="Overview">
            <p className="text-sm leading-7 text-slate-300">{organization.description || "This organization has not published an overview yet."}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-2xl font-semibold">{data.followerCount}</p>
                <p className="mt-1 text-xs text-slate-500">Followers</p>
              </div>
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-2xl font-semibold">{data.memberCount}</p>
                <p className="mt-1 text-xs text-slate-500">Public members</p>
              </div>
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-2xl font-semibold">{verifiedProofs.length}</p>
                <p className="mt-1 text-xs text-slate-500">Verified proofs</p>
              </div>
            </div>
          </Section>

          <Section id="posts" title="Posts">
            <div className="space-y-3">
              {publishedPosts.map((post) => (
                <article className="rounded-lg border border-slate-800 p-4" key={post.id}>
                  <h3 className="font-semibold text-white">{post.title || post.type.replace(/_/g, " ")}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{post.body}</p>
                </article>
              ))}
              {publishedPosts.length === 0 ? <EmptyState>No public organization posts have been published yet.</EmptyState> : null}
            </div>
          </Section>

          <Section id="people" title="People">
            <EmptyState>Public member profiles will appear when members choose to show their organization affiliation.</EmptyState>
          </Section>

          <Section id="proofs" title="Proofs">
            {verifiedProofs.length > 0 ? <p className="text-sm text-slate-300">{verifiedProofs.length} proof verification records are marked verified by this organization.</p> : <EmptyState>No public proofs have been verified by this organization yet.</EmptyState>}
          </Section>

          <Section id="challenges" title="Challenges">
            <EmptyState>No public challenges are connected to this organization yet.</EmptyState>
          </Section>

          <Section id="jobs" title="Jobs">
            <div className="grid gap-3 md:grid-cols-2">
              {publishedJobs.map((job) => (
                <article className="rounded-lg border border-slate-800 p-4" key={job.id}>
                  <h3 className="font-semibold text-white">{job.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{[job.location, job.remotePolicy.replace(/_/g, " "), job.employmentType.replace(/_/g, " ")].filter(Boolean).join(" · ")}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{job.description || "No public job description yet."}</p>
                </article>
              ))}
            </div>
            {publishedJobs.length === 0 ? <EmptyState>No public jobs have been posted yet.</EmptyState> : null}
          </Section>
        </div>

        <aside className="space-y-5">
          <Section id="about" title="About">
            <dl className="space-y-4">
              {[
                ["Website", organization.website],
                ["Industry", organization.industry],
                ["Type", getOrganizationTypeLabel(organization.type)],
                ["Size", organization.size],
                ["Headquarters", locationText(organization)],
                ["Founded", organization.foundedYear?.toString()],
                ["Verification", organizationVerificationLabels[organization.verificationStatus]],
                ["Email", organization.primaryEmail],
                ["Phone", organization.publicPhone ? organization.phone : null],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm text-slate-200">{value || "Not public"}</dd>
                </div>
              ))}
            </dl>
            {organization.primaryEmail ? (
              <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300" href={`mailto:${organization.primaryEmail}`}>
                <Mail className="h-4 w-4" />
                Contact
              </a>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {organization.specialties.map((specialty) => (
                <span className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300" key={specialty}>
                  {specialty}
                </span>
              ))}
            </div>
          </Section>

          <section className="rounded-lg border border-slate-800 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <UsersRound className="h-4 w-4 text-cyan-300" />
              Trust Signals
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">ProofX shows verified status only after an organization passes a review workflow. Domain ownership alone is not treated as verification.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
