import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout as DashboardShell } from "../../src/components/layouts/dashboard-layout";
import { getServerSession, logoutCurrentUser } from "../../src/lib/auth/service";
import { getUserStreakSummary } from "../../src/lib/streaks/service";

function getDisplayName(user: { email?: string; user_metadata?: Record<string, unknown> }) {
  const firstName = typeof user.user_metadata?.firstName === "string" ? user.user_metadata.firstName : "";
  const lastName = typeof user.user_metadata?.lastName === "string" ? user.user_metadata.lastName : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const providerName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  return fullName || providerName || user.email?.split("@")[0] || "ProofX user";
}

function getAvatarUrl(user: { user_metadata?: Record<string, unknown> }) {
  return typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session.data.session) {
    redirect("/login");
  }

  const user = session.data.session.user;
  const streak = await getUserStreakSummary(user.id);
  const userName = getDisplayName(user);
  const avatarUrl = getAvatarUrl(user);

  async function logoutAction() {
    "use server";

    await logoutCurrentUser();
    redirect("/login");
  }

  return (
    <DashboardShell avatarUrl={avatarUrl} logoutAction={logoutAction} streak={streak} userName={userName}>
      {children}
    </DashboardShell>
  );
}
