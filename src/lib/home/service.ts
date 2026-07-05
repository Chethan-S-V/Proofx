import type { AuthUser as User } from "../auth/service";
import { homeUserMetadataSchema } from "./schemas";

export type HomeProfileSummary = {
  avatarUrl: string | null;
  displayName: string;
  email: string;
  initials: string;
  roleLabel: string;
};

export type HomeMetric = {
  label: string;
  value: string;
  helper: string;
};

export type HomeFeedSection = {
  anchorId: string;
  description: string;
  emptyState: string;
  title: string;
};

export type HomeInsight = {
  anchorId: string;
  label: string;
  value: string;
  helper: string;
};

export type HomeCollection = {
  emptyState: string;
  items: string[];
  title: string;
};

export type HomeData = {
  badges: HomeCollection;
  feedSections: HomeFeedSection[];
  insights: HomeInsight[];
  profile: HomeProfileSummary;
  quickStats: HomeMetric[];
  skills: HomeCollection;
  trustScore: HomeMetric;
};

function getInitials(displayName: string, email: string) {
  const nameInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join("");

  return nameInitials || email.slice(0, 2).toUpperCase();
}

function formatRole(role: string | null | undefined) {
  if (!role) {
    return "Professional profile";
  }

  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getProfessionalHomeData(user: User): HomeData {
  const metadata = homeUserMetadataSchema.parse(user.user_metadata ?? {});
  const email = user.email ?? "ProofX user";
  const displayName =
    metadata.full_name ||
    [metadata.firstName, metadata.lastName].filter(Boolean).join(" ") ||
    metadata.name ||
    email;

  return {
    profile: {
      avatarUrl: metadata.avatar_url ?? null,
      displayName,
      email,
      initials: getInitials(displayName, email),
      roleLabel: formatRole(metadata.role),
    },
    skills: {
      title: "Skills",
      items: [],
      emptyState: "No skills have been verified yet.",
    },
    badges: {
      title: "Badges",
      items: [],
      emptyState: "No badges have been earned yet.",
    },
    trustScore: {
      label: "Trust score",
      value: "Pending",
      helper: "Connect proofs to calculate a verified score.",
    },
    quickStats: [
      {
        label: "Repositories",
        value: "0",
        helper: "No connected repositories yet.",
      },
      {
        label: "Proofs",
        value: "0",
        helper: "No proof completions recorded yet.",
      },
      {
        label: "Organizations",
        value: "0",
        helper: "No organization memberships found.",
      },
    ],
    feedSections: [
      {
        anchorId: "repository-activity",
        title: "Repository Activity",
        description: "Code sources, repository connections, and proof-linked development updates.",
        emptyState: "No repository activity has been recorded for this account.",
      },
      {
        anchorId: "proof-activity",
        title: "Proof Activity",
        description: "Submitted proofs, verification outcomes, and evidence review events.",
        emptyState: "No proof activity has been recorded yet.",
      },
      {
        anchorId: "challenge-activity",
        title: "Challenge Activity",
        description: "Challenge attempts, completions, and verified skill demonstrations.",
        emptyState: "No challenge activity is available yet.",
      },
      {
        anchorId: "organization-activity",
        title: "Organization Activity",
        description: "Team and organization events tied to your verified profile.",
        emptyState: "No organization activity is available.",
      },
      {
        anchorId: "recruiter-activity",
        title: "Recruiter Activity",
        description: "Recruiter views, profile shares, and opportunity signals.",
        emptyState: "No recruiter activity has been measured yet.",
      },
    ],
    insights: [
      {
        anchorId: "trust-score",
        label: "Trust Score",
        value: "Pending",
        helper: "Verified proofs are required before a score can be calculated.",
      },
      {
        anchorId: "rankings",
        label: "Rankings",
        value: "Unavailable",
        helper: "Rankings begin after comparable verified activity exists.",
      },
      {
        anchorId: "analytics",
        label: "Analytics",
        value: "Unavailable",
        helper: "Analytics begin after verified activity is recorded.",
      },
      {
        anchorId: "recruiter-visibility",
        label: "Recruiter Visibility",
        value: "Not measured",
        helper: "Visibility metrics start after profile sharing is enabled.",
      },
      {
        anchorId: "suggested-challenges",
        label: "Suggested challenges",
        value: "Unavailable",
        helper: "Challenge suggestions need proof history first.",
      },
    ],
  };
}
