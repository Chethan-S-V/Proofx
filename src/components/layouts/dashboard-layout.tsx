import type { ReactNode } from "react";
import type { StreakSummary } from "../../lib/streaks/service";
import { Navbar } from "../navigation/navbar";
import { Sidebar } from "../navigation/sidebar";
import { StreakActivityTracker } from "../streaks/streak-activity-tracker";

type DashboardLayoutProps = {
  avatarUrl: string | null;
  children: ReactNode;
  logoutAction: () => Promise<void>;
  streak: StreakSummary;
  userName: string;
};

export function DashboardLayout({ avatarUrl, children, logoutAction, streak, userName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <StreakActivityTracker />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar avatarUrl={avatarUrl} logoutAction={logoutAction} streak={streak} userName={userName} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
