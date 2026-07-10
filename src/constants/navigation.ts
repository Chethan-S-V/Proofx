import {
  FolderGit2,
  Home,
  LucideIcon,
  MessageSquare,
  Network,
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
    title: "Organizations",
    href: "/organizations",
    icon: Network,
    description: "Public organization discovery",
  },
  {
    title: "Challenges",
    href: "/dashboard/challenges",
    icon: Trophy,
    description: "Challenge attempts and completions",
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    description: "Professional platform messages",
  },
];
