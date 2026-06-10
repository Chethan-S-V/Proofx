import { redirect } from "next/navigation";
import { ActivityCard } from "../../../src/components/dashboards/activity-card";
import { MetricCard } from "../../../src/components/dashboards/metric-card";
import { StatCard } from "../../../src/components/dashboards/stat-card";
import { getServerUser } from "../../../src/lib/auth/service";

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Dashboard foundation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Welcome back, {user.email}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            This shell establishes ProofX navigation, responsive layout, cards, dark mode, and auth-aware account controls.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          UI shell only
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="shield" label="Proofs" value="0" helper="Foundation placeholder" tone="cyan" />
        <StatCard icon="folder" label="Repositories" value="0" helper="No repository logic added" tone="slate" />
        <StatCard icon="building" label="Organizations" value="0" helper="No organization logic added" tone="emerald" />
        <StatCard icon="user" label="Profile" value="Ready" helper="Auth session detected" trend="Active" tone="cyan" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ActivityCard
          title="Recent activity"
          items={[
            {
              icon: "badge",
              title: "Dashboard shell initialized",
              description: "Reusable cards, navigation, and layouts are available for future modules.",
              timestamp: "Now",
            },
            {
              icon: "activity",
              title: "Command palette foundation",
              description: "Keyboard launcher and route shortcuts are ready for expansion.",
              timestamp: "Shell",
            },
            {
              icon: "shield",
              title: "Notification foundation",
              description: "Dropdown structure is in place without event or proof-engine logic.",
              timestamp: "UI",
            },
          ]}
        />
        <div className="grid gap-4">
          <MetricCard caption="Placeholder readiness for future profile completion." label="Profile readiness" value={72} />
          <MetricCard caption="Navigation and layout coverage across dashboard surfaces." label="Shell coverage" value={88} />
        </div>
      </section>
    </div>
  );
}
