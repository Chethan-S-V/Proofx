import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FolderGit2, ShieldCheck, Trophy } from "lucide-react";
import { ActivityFeed } from "../../../src/components/home/activity-feed";
import { InsightsPanel } from "../../../src/components/home/insights-panel";
import { NavigationSystem } from "../../../src/components/home/navigation-system";
import { ProfileCard } from "../../../src/components/home/profile-card";
import { SidebarSection } from "../../../src/components/home/sidebar-section";
import { DemoHome } from "../../../src/components/home/demo-home";
import { DEMO_MODE_ENABLED } from "../../../src/demo/home/data";
import { getServerUser } from "../../../src/lib/auth/service";
import { getProfessionalHomeData } from "../../../src/lib/home/service";

export default async function HomePage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const data = getProfessionalHomeData(user);

  if (DEMO_MODE_ENABLED) {
    return <DemoHome avatarUrl={data.profile.avatarUrl} displayName={data.profile.displayName} />;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-300">Professional home</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Make your work visible, credible, and useful.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Follow your verified activity, close evidence gaps, and choose the next step that strengthens your profile.
            </p>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-200">{data.trustScore.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{data.trustScore.value}</p>
            <p className="mt-1 max-w-56 text-xs leading-5 text-slate-400">{data.trustScore.helper}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { description: "Connect meaningful code activity to a proof.", href: "/dashboard/repositories", icon: FolderGit2, label: "Connect your work" },
          { description: "Package evidence, ownership, and outcomes.", href: "/dashboard/proofs", icon: ShieldCheck, label: "Create a proof" },
          { description: "Demonstrate a skill with a practical task.", href: "/dashboard/challenges", icon: Trophy, label: "Take a challenge" },
        ].map((action) => (
          <Link className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-cyan-400" href={action.href} key={action.href}>
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-cyan-200">
                <action.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-sm font-semibold text-white">{action.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <aside className="space-y-4">
          <ProfileCard profile={data.profile} quickStats={data.quickStats} />
          <NavigationSystem />
          <SidebarSection collection={data.skills} icon="skills" />
          <SidebarSection collection={data.badges} icon="badges" />
        </aside>
        <ActivityFeed sections={data.feedSections} />
        <InsightsPanel insights={data.insights} />
      </div>
    </div>
  );
}
