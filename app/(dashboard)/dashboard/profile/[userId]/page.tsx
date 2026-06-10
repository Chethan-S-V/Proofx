import { Briefcase, GraduationCap, LinkIcon, MapPin, UserRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../../../../../src/components/ui/card";
import { getServerUser } from "../../../../../src/lib/auth/service";
import { getDashboardProfileByUserId } from "../../../../../src/lib/profile/service";

type PublicProfilePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

function EmptyText({ children }: { children: string }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function formatProfileLocation(location: string | null) {
  return location?.replace(/\s+-\s+[^,]+$/, "") ?? "";
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const currentUser = await getServerUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { userId } = await params;

  if (userId === currentUser.id) {
    redirect("/dashboard/profile");
  }

  const profile = await getDashboardProfileByUserId(userId);

  if (!profile) {
    notFound();
  }

  const profileLocation = formatProfileLocation(profile.location);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="overflow-hidden border-slate-800 bg-slate-950 text-white">
        <div
          className="relative h-48 bg-[linear-gradient(135deg,#0891b2,#0f172a_55%,#111827)] bg-cover bg-center"
          style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
        </div>

        <div className="relative px-7 pb-6">
          <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border-4 border-slate-950 bg-slate-900 text-2xl font-semibold text-white shadow-xl">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={profile.displayName} className="h-full w-full rounded-sm object-cover" src={profile.avatarUrl} />
                ) : (
                  profile.initials
                )}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-3xl font-semibold leading-tight text-white">{profile.displayName}</h1>
                  <span className="inline-flex h-7 items-center rounded-md border border-cyan-300/35 bg-cyan-300/10 px-2 text-xs font-semibold text-cyan-100">
                    ProofX Member
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  {profile.headline || "This member has not added a headline yet."}
                </p>
                {profile.showLocation && profileLocation ? (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                    {profileLocation}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="w-full max-w-xs rounded-md border border-slate-700/70 bg-slate-950/75 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-sm text-slate-200">Profile strength</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full border border-slate-700/70 bg-slate-900">
                <div className="h-full rounded-full bg-cyan-300/90" style={{ width: `${profile.profileStrength}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{profile.profileStrength}% complete</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">About</h2>
            </CardHeader>
            <CardContent>
              {profile.about ? <p className="text-sm leading-7 text-slate-300">{profile.about}</p> : <EmptyText>No about section added yet.</EmptyText>}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Projects</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.projects.slice(0, 6).map((item) => (
                <div className="rounded-md border border-slate-800 p-3" key={item.id}>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <LinkIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{item.description || "No description added."}</p>
                </div>
              ))}
              {profile.projects.length === 0 ? <EmptyText>No projects added yet.</EmptyText> : null}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <UserRound className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                Public Profile
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-400">Viewing another ProofX member profile.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Recent Work</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.experience.slice(0, 3).map((item) => (
                <div className="rounded-md border border-slate-800 p-3" key={item.id}>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{item.company}</p>
                </div>
              ))}
              {profile.experience.length === 0 ? <EmptyText>No experience added yet.</EmptyText> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Education</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.education.slice(0, 3).map((item) => (
                <div className="rounded-md border border-slate-800 p-3" key={item.id}>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                    {item.school}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{item.degree || "Degree not set"}</p>
                </div>
              ))}
              {profile.education.length === 0 ? <EmptyText>No education added yet.</EmptyText> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Skills</h2>
            </CardHeader>
            <CardContent>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.slice(0, 12).map((skill) => (
                    <span className="rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyText>No skills added yet.</EmptyText>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
