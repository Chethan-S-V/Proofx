import Link from "next/link";
import { Network } from "lucide-react";
import type { StreakSummary } from "../../lib/streaks/service";
import { StreakDisplay } from "../streaks/streak-display";
import { GlobalSearch } from "./global-search";
import { MobileNav } from "./mobile-nav";
import { NotificationDropdown } from "./notification-dropdown";
import { UserMenu } from "./user-menu";

type NavbarProps = {
  avatarUrl: string | null;
  streak: StreakSummary;
  userName: string;
  logoutAction: () => Promise<void>;
};

export function Navbar({ avatarUrl, logoutAction, streak, userName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav />
          <Link href="/home" className="hidden min-w-0 flex-col justify-center sm:flex">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">Welcome back</span>
            <span className="max-w-48 truncate text-sm font-semibold leading-5 text-white">{userName}</span>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <StreakDisplay streak={streak} />
          <GlobalSearch />
          <Link aria-label="Open network" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200" href="/dashboard/network">
            <Network className="h-4 w-4" aria-hidden="true" />
          </Link>
          <NotificationDropdown />
          <UserMenu avatarUrl={avatarUrl} logoutAction={logoutAction} userName={userName} />
        </div>
      </div>
    </header>
  );
}
