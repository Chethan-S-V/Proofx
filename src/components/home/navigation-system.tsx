import Link from "next/link";
import { BarChart3, Building2, FolderGit2, Home, MessageSquare, Settings, ShieldCheck, Trophy, UserRound } from "lucide-react";

const homeNavigationItems = [
  {
    href: "/home",
    icon: Home,
    label: "Home",
  },
  {
    href: "/dashboard/profile",
    icon: UserRound,
    label: "Profile",
  },
  {
    href: "/dashboard/repositories",
    icon: FolderGit2,
    label: "Repositories",
  },
  {
    href: "/dashboard/proofs",
    icon: ShieldCheck,
    label: "Proofs",
  },
  {
    href: "#challenge-activity",
    icon: Trophy,
    label: "Challenges",
  },
  {
    href: "/dashboard/organizations",
    icon: Building2,
    label: "Organizations",
  },
  {
    href: "/dashboard/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
  {
    href: "#messages",
    icon: MessageSquare,
    label: "Messages",
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    label: "Settings",
  },
];

export function NavigationSystem() {
  return (
    <nav className="rounded-lg border border-slate-800 bg-slate-950/70 p-2" aria-label="Home navigation">
      {homeNavigationItems.map((item) => (
        <Link
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
          href={item.href}
          key={item.href}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
