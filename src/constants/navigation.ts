import {
  BarChart3,
  Building2,
  FolderGit2,
  Gauge,
  Home,
  LucideIcon,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trophy,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/home",
    icon: Home,
    description: "Professional activity and proof overview",
  },
  {
    title: "Workspace",
    href: "/dashboard",
    icon: Gauge,
    description: "Foundation workspace overview",
  },
  {
    title: "Codespace",
    href: "/dashboard/repositories",
    icon: FolderGit2,
    description: "Proof source collections",
  },
  {
    title: "Proofs",
    href: "/dashboard/proofs",
    icon: ShieldCheck,
    description: "Verified proof records",
  },
  {
    title: "Post",
    href: "/dashboard/post",
    icon: Plus,
    description: "Create a ProofX post",
  },
  {
    title: "Challenges",
    href: "/home#challenge-activity",
    icon: Trophy,
    description: "Challenge attempts and completions",
  },
  {
    title: "Organizations",
    href: "/dashboard/organizations",
    icon: Building2,
    description: "Teams and trusted organizations",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Workspace signal trends",
  },
  {
    title: "Messages",
    href: "/home#messages",
    icon: MessageSquare,
    description: "Professional platform messages",
  },
];
