import { BriefcaseBusiness, Building2, CheckCircle2, Globe2, LockKeyhole, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import {
  addCandidateToPipelineAction,
  createDepartmentAction,
  createOrganizationJobAction,
  createOrganizationPostAction,
  createProofVerificationRequestAction,
  createTeamAction,
  decideProofVerificationAction,
  inviteOrganizationMemberAction,
  requestOrganizationMembershipAction,
  toggleOrganizationFollowAction,
  updateOrganizationOnboardingAction,
  type getOrganizationBySlug,
} from "../organization.service";
import { rolesHavePermission } from "../organization-permissions.service";

type OrganizationProfileProps = {
  data: NonNullable<Awaited<ReturnType<typeof getOrganizationBySlug>>>;
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{value || "Not set"}</dd>
    </div>
  );
}

function Section({ children, id, title }: { children: React.ReactNode; id: string; title: string }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950 p-5" id={id}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function can(data: OrganizationProfileProps["data"], permission: Parameters<typeof rolesHavePermission>[1]) {
  return rolesHavePermission(data.memberRoles, permission);
}

export function OrganizationProfile({ data }: OrganizationProfileProps) {
  const { organization } = data;
  const canManage = can(data, "organization.update");
  const canPublish = can(data, "post.create");
  const canVerify = can(data, "proof.review");
  const canHire = can(data, "candidate.pipeline.manage");
  const canCreateJobs = can(data, "job.create");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <div
          className="relative h-52 bg-[linear-gradient(135deg,#0e7490,#0f172a_60%,#111827)] bg-cover bg-center"
          style={organization.coverUrl ? { backgroundImage: `url(${organization.coverUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        <div className="px-5 pb-5 md:px-7">
          <div className="-mt-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border-4 border-slate-950 bg-slate-900 text-2xl font-semibold text-cyan-100 shadow-xl">
                {organization.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="h-full w-full rounded-md object-cover" src={organization.logoUrl} />
                ) : (
                  organization.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-3xl font-semibold text-white">{organization.name}</h1>
                  {organization.verificationStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-200">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {organization.verificationStatus.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{organization.tagline || "A ProofX organization workspace."}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 capitalize">
                    <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {organization.type.replace(/_/g, " ")}
                  </span>
                  <span>{organization.industry || "Industry not set"}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {[organization.city, organization.country].filter(Boolean).join(", ") || "Headquarters not set"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={toggleOrganizationFollowAction}>
                <input name="organizationId" type="hidden" value={organization.id} />
                <button className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950" type="submit">
                  {data.isFollowing ? "Following" : "Follow"}
                </button>
              </form>
              {organization.website ? (
                <a className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200" href={organization.website} rel="noreferrer" target="_blank">
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                  Visit website
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-16 z-20 flex gap-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/95 p-2 backdrop-blur">
        {["overview", "posts", "people", "proofs", "challenges", "jobs", "about", "admin"].map((item) => (
          <a className="rounded-md px-3 py-2 text-sm font-medium capitalize text-slate-400 hover:bg-slate-900 hover:text-white" href={`#${item}`} key={item}>
            {item}
          </a>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <Section id="overview" title="Overview">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Followers", data.followerCount],
                ["Employees", data.memberCount],
                ["Proof requests", data.proofRequests.length],
                ["Open jobs", data.jobs.filter((job) => job.status === "published").length],
              ].map(([label, value]) => (
                <div className="rounded-md border border-slate-800 p-4" key={label}>
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">{organization.description || "This organization has not completed its introduction yet."}</p>
          </Section>

          <Section id="posts" title="Posts">
            <div className="space-y-3">
              {data.posts.map((post) => (
                <article className="rounded-md border border-slate-800 p-4" key={post.id}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">{post.title || post.type.replace(/_/g, " ")}</h3>
                    <span className="rounded-md bg-slate-900 px-2 py-1 text-xs capitalize text-slate-500">{post.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{post.body}</p>
                </article>
              ))}
              {data.posts.length === 0 ? <p className="text-sm text-slate-500">No organization posts yet.</p> : null}
            </div>
          </Section>

          <Section id="people" title="People">
            <div className="grid gap-3 md:grid-cols-2">
              {data.departments.map((department) => (
                <div className="rounded-md border border-slate-800 p-4" key={department.id}>
                  <p className="font-semibold text-white">{department.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{department.description || "No department description."}</p>
                </div>
              ))}
              {data.departments.length === 0 ? <p className="text-sm text-slate-500">Departments will appear after setup.</p> : null}
            </div>
          </Section>

          <Section id="proofs" title="Proof Verification">
            <div className="space-y-3">
              {data.proofRequests.map((request) => (
                <div className="rounded-md border border-slate-800 p-4" key={request.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-white">Request {request.id.slice(0, 8)}</p>
                    <span className="rounded-md bg-slate-900 px-2 py-1 text-xs capitalize text-slate-400">{request.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{request.requestMessage || "No request message."}</p>
                  {canVerify ? (
                    <form action={decideProofVerificationAction} className="mt-3 flex flex-wrap gap-2">
                      <input name="requestId" type="hidden" value={request.id} />
                      <input className="h-9 min-w-56 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-white" name="reason" placeholder="Decision note" />
                      <button className="rounded-md bg-emerald-300 px-3 py-2 text-xs font-semibold text-slate-950" name="decision" type="submit" value="verified">
                        Verify
                      </button>
                      <button className="rounded-md border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-300" name="decision" type="submit" value="rejected">
                        Reject
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
              {data.proofRequests.length === 0 ? <p className="text-sm text-slate-500">No proof verification requests yet.</p> : null}
            </div>
          </Section>

          <Section id="challenges" title="Challenges">
            <p className="text-sm leading-6 text-slate-400">Challenge ownership is ready through organization permissions. The existing Challenges module can now attach sponsored challenges to this organization in a later route-level integration.</p>
          </Section>

          <Section id="jobs" title="Jobs">
            <div className="grid gap-3 md:grid-cols-2">
              {data.jobs.map((job) => (
                <article className="rounded-md border border-slate-800 p-4" key={job.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{[job.location, job.remotePolicy.replace(/_/g, " "), job.employmentType.replace(/_/g, " ")].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className="rounded-md bg-slate-900 px-2 py-1 text-xs capitalize text-slate-500">{job.status}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{job.description || "No job description yet."}</p>
                </article>
              ))}
              {data.jobs.length === 0 ? <p className="text-sm text-slate-500">No jobs published yet.</p> : null}
            </div>
          </Section>

          <Section id="about" title="About">
            <dl className="grid gap-4 md:grid-cols-2">
              <Field label="Website" value={organization.website} />
              <Field label="Industry" value={organization.industry} />
              <Field label="Size" value={organization.size} />
              <Field label="Founded" value={organization.foundedYear?.toString()} />
              <Field label="Email" value={organization.primaryEmail} />
              <Field label="Phone" value={organization.phone} />
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {organization.specialties.map((specialty) => (
                <span className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300" key={specialty}>
                  {specialty}
                </span>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-6" id="admin">
          <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <UsersRound className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              Membership
            </h2>
            <form action={requestOrganizationMembershipAction} className="mt-4 space-y-3">
              <input name="organizationId" type="hidden" value={organization.id} />
              <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="jobTitle" placeholder="Public title" />
              <button className="w-full rounded-md border border-cyan-400/30 px-3 py-2 text-sm font-semibold text-cyan-300" type="submit">
                Request membership
              </button>
            </form>
          </section>

          {canManage ? (
            <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <LockKeyhole className="h-4 w-4 text-amber-300" aria-hidden="true" />
                Onboarding
              </h2>
              <form action={updateOrganizationOnboardingAction} className="mt-4 space-y-3">
                <input name="organizationId" type="hidden" value={organization.id} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="name" defaultValue={organization.name} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="slug" defaultValue={organization.slug} />
                <input name="type" type="hidden" value={organization.type} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="industry" defaultValue={organization.industry ?? ""} placeholder="Industry" />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="website" defaultValue={organization.website ?? ""} placeholder="Website" />
                <textarea className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="description" defaultValue={organization.description ?? ""} placeholder="Description" />
                <textarea className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="specialties" defaultValue={organization.specialties.join(", ")} placeholder="Specialties" />
                <input name="onboardingStep" type="hidden" value="6" />
                <button className="w-full rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950" type="submit">
                  Save onboarding
                </button>
              </form>
            </section>
          ) : null}

          {canManage ? (
            <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <h2 className="font-semibold text-white">Departments and teams</h2>
              <form action={createDepartmentAction} className="mt-4 space-y-3">
                <input name="organizationId" type="hidden" value={organization.id} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="name" placeholder="Department name" />
                <textarea className="min-h-16 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="description" placeholder="Description" />
                <button className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200" type="submit">
                  Create department
                </button>
              </form>
              <form action={createTeamAction} className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                <input name="organizationId" type="hidden" value={organization.id} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="name" placeholder="Team name" />
                <textarea className="min-h-16 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="description" placeholder="Description" />
                <button className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200" type="submit">
                  Create team
                </button>
              </form>
            </section>
          ) : null}

          {canPublish ? (
            <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <h2 className="font-semibold text-white">Publish content</h2>
              <form action={createOrganizationPostAction} className="mt-4 space-y-3">
                <input name="organizationId" type="hidden" value={organization.id} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="title" placeholder="Title" />
                <textarea className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="body" placeholder="Update" />
                <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="status" defaultValue="published">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <button className="w-full rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950" type="submit">
                  Save post
                </button>
              </form>
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
            <h2 className="font-semibold text-white">Request proof verification</h2>
            <form action={createProofVerificationRequestAction} className="mt-4 space-y-3">
              <input name="organizationId" type="hidden" value={organization.id} />
              <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="proofId" placeholder="Optional proof UUID" />
              <textarea className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="requestMessage" placeholder="What should be verified?" />
              <textarea className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="evidence" placeholder="Evidence labels, one per line" />
              <button className="w-full rounded-md border border-emerald-400/30 px-3 py-2 text-sm font-semibold text-emerald-300" type="submit">
                Submit request
              </button>
            </form>
          </section>

          {canCreateJobs ? (
            <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <BriefcaseBusiness className="h-4 w-4 text-violet-300" aria-hidden="true" />
                Create job
              </h2>
              <form action={createOrganizationJobAction} className="mt-4 space-y-3">
                <input name="organizationId" type="hidden" value={organization.id} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="title" placeholder="Job title" />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="location" placeholder="Location" />
                <textarea className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="description" placeholder="Description" />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="skills" placeholder="Skills" />
                <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="status" defaultValue="published">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <button className="w-full rounded-md bg-violet-300 px-3 py-2 text-sm font-semibold text-slate-950" type="submit">
                  Save job
                </button>
              </form>
            </section>
          ) : null}

          {canHire ? (
            <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <h2 className="font-semibold text-white">Candidate pipeline</h2>
              <form action={addCandidateToPipelineAction} className="mt-4 space-y-3">
                <input name="organizationId" type="hidden" value={organization.id} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="candidateId" placeholder="Candidate user UUID" />
                <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="stage" defaultValue="sourced">
                  <option value="sourced">Sourced</option>
                  <option value="contacted">Contacted</option>
                  <option value="screening">Screening</option>
                  <option value="technical_evaluation">Technical evaluation</option>
                </select>
                <textarea className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" name="internalNote" placeholder="Private recruiter note" />
                <button className="w-full rounded-md border border-violet-400/30 px-3 py-2 text-sm font-semibold text-violet-300" type="submit">
                  Add candidate
                </button>
              </form>
            </section>
          ) : null}

          {can(data, "member.invite") ? (
            <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <h2 className="font-semibold text-white">Invite member</h2>
              <form action={inviteOrganizationMemberAction} className="mt-4 space-y-3">
                <input name="organizationId" type="hidden" value={organization.id} />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="userId" placeholder="User UUID" />
                <input className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="jobTitle" placeholder="Job title" />
                <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" name="roleKey" defaultValue="MEMBER">
                  {["MEMBER", "ADMIN", "HR_MANAGER", "RECRUITER", "TEAM_MANAGER", "PROOF_VERIFIER", "CHALLENGE_MANAGER", "CONTENT_MANAGER", "ANALYST"].map((role) => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <button className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200" type="submit">
                  Invite
                </button>
              </form>
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-800 bg-slate-950 p-5">
            <h2 className="font-semibold text-white">Audit log</h2>
            <div className="mt-4 space-y-3">
              {data.auditLogs.map((event) => (
                <div className="rounded-md border border-slate-800 p-3" key={event.id}>
                  <p className="text-sm font-medium text-white">{event.action}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.createdAt.toLocaleString()}</p>
                </div>
              ))}
              {data.auditLogs.length === 0 ? <p className="text-sm text-slate-500">No sensitive actions recorded yet.</p> : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
