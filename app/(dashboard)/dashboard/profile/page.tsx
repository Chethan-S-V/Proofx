import { BadgeCheck, Briefcase, GraduationCap, LinkIcon, MapPin, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfileContactInfo } from "../../../../src/components/profile/profile-contact-info";
import { ProfileIntroEditor } from "../../../../src/components/profile/profile-intro-editor";
import { ProfileMediaEditor } from "../../../../src/components/profile/profile-media-editor";
import { AboutEditor, DeleteProfileItemButton, DeleteSkillButton, SimpleProfileEditor, SkillsEditor } from "../../../../src/components/profile/profile-section-editors";
import { Card, CardContent, CardHeader } from "../../../../src/components/ui/card";
import { getServerUser } from "../../../../src/lib/auth/service";
import {
  addProfileEducation,
  addProfileExperience,
  addProfileProject,
  getDashboardProfile,
  updateProfileAbout,
  updateProfileContact,
  updateProfileIntro,
  updateProfileMedia,
  updateProfileSkills,
  removeProfileItemFromForm,
} from "../../../../src/lib/profile/service";
import { getUserStreakSummary } from "../../../../src/lib/streaks/service";

function EmptyText({ children }: { children: string }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function formatProfileLocation(location: string | null) {
  return location?.replace(/\s+-\s+[^,]+$/, "") ?? "";
}

const streakTierBadges = [
  { accent: "from-cyan-300 via-white to-fuchsia-300", label: "Diamond Systems Lead", minimumDays: 2000, shortLabel: "DS" },
  { accent: "from-cyan-200 to-indigo-300", label: "Platinum Architect", minimumDays: 1000, shortLabel: "PA" },
  { accent: "from-yellow-300 to-amber-500", label: "Gold Engineer", minimumDays: 500, shortLabel: "GE" },
  { accent: "from-slate-300 to-white", label: "Silver Builder", minimumDays: 250, shortLabel: "SB" },
  { accent: "from-amber-700 to-orange-300", label: "Bronze Coder", minimumDays: 100, shortLabel: "BC" },
  { accent: "from-slate-400 to-cyan-300", label: "Starter Coder", minimumDays: 0, shortLabel: "ST" },
] as const;

function getCurrentStreakTier(currentStreak: number) {
  return streakTierBadges.find((tier) => currentStreak >= tier.minimumDays) ?? streakTierBadges.at(-1)!;
}

export default async function ProfilePage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const profile = getDashboardProfile(user);
  const streak = await getUserStreakSummary(user.id);
  const streakTier = getCurrentStreakTier(streak.currentStreak);
  const profileLocation = formatProfileLocation(profile.location);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="overflow-hidden border-slate-800 bg-slate-950 text-white">
        <div
          className="group relative h-48 bg-[linear-gradient(135deg,#0891b2,#0f172a_55%,#111827)] bg-cover bg-center"
          style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
          <ProfileMediaEditor action={updateProfileMedia} mode="banner" />
        </div>

        <div className="relative px-7 pb-6">
          <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="group relative flex h-24 w-24 shrink-0 items-center justify-center rounded-md border-4 border-slate-950 bg-slate-900 text-2xl font-semibold text-white shadow-xl">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={profile.displayName} className="h-full w-full rounded-sm object-cover" src={profile.avatarUrl} />
                ) : (
                  profile.initials
                )}
                <ProfileMediaEditor action={updateProfileMedia} mode="avatar" />
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-3xl font-semibold leading-tight text-white">{profile.displayName}</h1>
                  <span
                    className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border border-cyan-300/35 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                    title="ProofX Member"
                  >
                    <span className="absolute inset-y-0 -left-8 w-8 rotate-12 bg-white/20 blur-sm" />
                    <BadgeCheck className="relative h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
                  </span>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${streakTier.accent} text-[10px] font-black text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.16)]`}
                    title={`${streakTier.label}: ${streak.currentStreak} streak`}
                  >
                    {streakTier.shortLabel}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  {profile.headline || "Add a headline that explains what you build, verify, and prove."}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                    {profileLocation || "Add location"}
                  </span>
                  <ProfileContactInfo action={updateProfileContact} profile={profile} />
                  <ProfileIntroEditor action={updateProfileIntro} contactAction={updateProfileContact} profile={profile} />
                </div>
              </div>
            </div>

            <div className="w-full max-w-xs rounded-md border border-slate-700/70 bg-slate-950/75 p-4 shadow-[0_12px_32px_rgba(2,6,23,0.28)] backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-200">Profile strength</span>
                <span className="text-cyan-300">{profile.profileStrength}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full border border-slate-700/70 bg-slate-900">
                <div className="h-full rounded-full bg-cyan-300/90" style={{ width: `${profile.profileStrength}%` }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card className="group border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">About</h2>
              <AboutEditor action={updateProfileAbout} about={profile.about} />
            </CardHeader>
            <CardContent>
              {profile.about ? <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{profile.about}</p> : <EmptyText>No about added yet.</EmptyText>}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <UserRound className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                Profile Mode
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium">User Profile</p>
              <p className="text-sm leading-6 text-slate-400">Personal profile for proof, work history, skills, and projects.</p>
            </CardContent>
          </Card>

          <Card className="group border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Recent Work</h2>
              <SimpleProfileEditor action={addProfileExperience} profile={profile} type="work" />
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.experience.slice(0, 3).map((item) => (
                <div className="group/item relative rounded-md border border-slate-800 p-3 pr-11" key={item.id}>
                  <DeleteProfileItemButton action={removeProfileItemFromForm} collection="experience" id={item.id} label={`Delete ${item.title}`} />
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

          <Card className="group border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Education</h2>
              <SimpleProfileEditor action={addProfileEducation} profile={profile} type="education" />
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.education.slice(0, 3).map((item) => (
                <div className="group/item relative rounded-md border border-slate-800 p-3 pr-11" key={item.id}>
                  <DeleteProfileItemButton action={removeProfileItemFromForm} collection="education" id={item.id} label={`Delete ${item.school}`} />
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

          <Card className="group border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Projects</h2>
              <SimpleProfileEditor action={addProfileProject} profile={profile} type="project" />
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.projects.slice(0, 3).map((item) => (
                <div className="group/item relative rounded-md border border-slate-800 p-3 pr-11" key={item.id}>
                  <DeleteProfileItemButton action={removeProfileItemFromForm} collection="projects" id={item.id} label={`Delete ${item.name}`} />
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

          <Card className="group border-slate-800 bg-slate-950 text-white">
            <CardHeader>
              <h2 className="text-base font-semibold">Skills Preview</h2>
              <SkillsEditor action={updateProfileSkills} skills={profile.skills} />
            </CardHeader>
            <CardContent>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.slice(0, 12).map((skill) => (
                    <span className="group/skill inline-flex items-center rounded-md border border-slate-800 px-2 py-1 text-xs text-slate-300" key={skill}>
                      {skill}
                      <DeleteSkillButton action={updateProfileSkills} remainingSkills={profile.skills.filter((item) => item !== skill)} skill={skill} />
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
