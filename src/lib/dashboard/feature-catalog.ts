import { z } from "zod";

const featureIconSchema = z.enum([
  "activity",
  "analytics",
  "building",
  "check",
  "clock",
  "code",
  "filter",
  "message",
  "post",
  "search",
  "shield",
  "sparkles",
  "target",
  "team",
  "trophy",
]);

const featureHubSchema = z.object({
  actions: z.array(z.object({ href: z.string().min(1), label: z.string().min(1) })).min(1).max(3),
  description: z.string().min(1),
  eyebrow: z.string().min(1),
  features: z
    .array(
      z.object({
        description: z.string().min(1),
        icon: featureIconSchema,
        status: z.string().min(1),
        title: z.string().min(1),
      }),
    )
    .min(3),
  highlights: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).length(3),
  title: z.string().min(1),
  workflow: z.array(z.object({ detail: z.string().min(1), title: z.string().min(1) })).min(2).max(4),
});

export type FeatureHubData = z.infer<typeof featureHubSchema>;
export type FeatureIcon = z.infer<typeof featureIconSchema>;

const catalogInput = {
  workspace: {
    eyebrow: "Dashboard / Workspace",
    title: "Your proof workspace",
    description: "Turn real work into trusted career signals from one focused command center.",
    highlights: [
      { label: "Workstreams", value: "Active" },
      { label: "Proof pipeline", value: "Ready" },
      { label: "Reviews", value: "Organized" },
    ],
    actions: [
      { href: "/dashboard/proofs", label: "Build a proof" },
      { href: "/dashboard/repositories", label: "Open codespace" },
    ],
    features: [
      { icon: "activity", title: "Activity timeline", description: "See repository, proof, post, and challenge signals together.", status: "Live overview" },
      { icon: "shield", title: "Proof pipeline", description: "Move evidence from draft through review to verified status.", status: "Ready" },
      { icon: "target", title: "Weekly focus", description: "Keep the highest-value proof opportunities visible.", status: "Prioritized" },
      { icon: "code", title: "Codespace signals", description: "Connect code activity to proof-ready work without exposing private files.", status: "Connected" },
      { icon: "team", title: "Collaboration queue", description: "Track reviews, mentions, and organization requests.", status: "Centralized" },
      { icon: "sparkles", title: "Suggested next steps", description: "Use verified activity to spot profile gaps and useful challenges.", status: "Personalized" },
    ],
    workflow: [
      { title: "Capture", detail: "Bring in work from codespaces, challenges, and posts." },
      { title: "Explain", detail: "Add context, ownership, and measurable outcomes." },
      { title: "Verify", detail: "Request review and publish a trusted signal." },
    ],
  },
  proofs: {
    eyebrow: "Dashboard / Proofs",
    title: "Evidence that speaks for itself",
    description: "Create, review, and organize proof records that connect claims to verifiable work.",
    highlights: [
      { label: "Draft proofs", value: "Build" },
      { label: "Review queue", value: "Track" },
      { label: "Verified proofs", value: "Share" },
    ],
    actions: [
      { href: "/dashboard/repositories", label: "Add repository evidence" },
      { href: "/dashboard/post", label: "Share an update" },
    ],
    features: [
      { icon: "post", title: "Proof builder", description: "Combine a claim, contribution, evidence, and outcome in one record.", status: "Create" },
      { icon: "check", title: "Verification queue", description: "Track reviewer decisions, requested changes, and completed checks.", status: "In review" },
      { icon: "filter", title: "Evidence library", description: "Filter proofs by skill, project, source, organization, and status.", status: "Organized" },
      { icon: "team", title: "Reviewer access", description: "Invite trusted collaborators to confirm specific contributions.", status: "Controlled" },
      { icon: "clock", title: "Version history", description: "Preserve how a proof changed and who confirmed each update.", status: "Auditable" },
      { icon: "analytics", title: "Proof impact", description: "See which verified skills attract views and opportunities.", status: "Insights" },
    ],
    workflow: [
      { title: "Describe the contribution", detail: "State what you owned and why it mattered." },
      { title: "Attach evidence", detail: "Link commits, files, outcomes, or challenge results." },
      { title: "Request verification", detail: "Choose a reviewer and publish after approval." },
    ],
  },
  post: {
    eyebrow: "Dashboard / Post",
    title: "Share progress with proof attached",
    description: "Publish useful updates that link directly to verified work, skills, and collaborators.",
    highlights: [
      { label: "Drafts", value: "Autosaved" },
      { label: "Scheduling", value: "Optional" },
      { label: "Publishing", value: "Ready" },
    ],
    actions: [
      { href: "/dashboard/proofs", label: "Choose a proof" },
      { href: "/home", label: "View activity feed" },
    ],
    features: [
      { icon: "post", title: "Rich post composer", description: "Structure an update around the problem, work, and outcome.", status: "Draft-ready" },
      { icon: "shield", title: "Attach verified proof", description: "Back important claims with a visible ProofX verification record.", status: "Trusted" },
      { icon: "team", title: "Credit collaborators", description: "Mention teammates and make contribution boundaries clear.", status: "Attribution" },
      { icon: "clock", title: "Schedule publishing", description: "Prepare updates now and publish at a more useful time.", status: "Planned" },
      { icon: "search", title: "Audience preview", description: "Review how the post appears to peers, teams, and recruiters.", status: "Preview" },
      { icon: "analytics", title: "Post performance", description: "Measure meaningful views, proof opens, and profile visits.", status: "Measured" },
    ],
    workflow: [
      { title: "Write the story", detail: "Lead with the problem and your concrete contribution." },
      { title: "Link the proof", detail: "Attach evidence and credit collaborators." },
      { title: "Preview and publish", detail: "Check visibility, then share or schedule." },
    ],
  },
  challenges: {
    eyebrow: "Dashboard / Challenges",
    title: "Prove skills by doing",
    description: "Take focused challenges, submit real artifacts, and turn results into portable proof.",
    highlights: [
      { label: "Recommended", value: "Explore" },
      { label: "In progress", value: "Resume" },
      { label: "Completed", value: "Portfolio" },
    ],
    actions: [
      { href: "/dashboard/proofs", label: "View earned proofs" },
      { href: "/dashboard/analytics", label: "See skill progress" },
    ],
    features: [
      { icon: "target", title: "Skill-matched challenges", description: "Find exercises aligned with your goals and verified gaps.", status: "Matched" },
      { icon: "code", title: "Live workspaces", description: "Complete practical tasks in a focused, evidence-friendly environment.", status: "Hands-on" },
      { icon: "clock", title: "Milestones", description: "Break longer challenges into clear checkpoints and submissions.", status: "Trackable" },
      { icon: "team", title: "Team challenges", description: "Practice collaboration while keeping individual contributions clear.", status: "Collaborative" },
      { icon: "check", title: "Transparent scoring", description: "See evaluation criteria before submitting your work.", status: "Fair review" },
      { icon: "trophy", title: "Verified outcomes", description: "Convert completed work into badges and proof records.", status: "Portable" },
    ],
    workflow: [
      { title: "Pick a target skill", detail: "Choose a challenge that strengthens a real profile gap." },
      { title: "Build and submit", detail: "Complete milestones and attach the resulting artifacts." },
      { title: "Earn proof", detail: "Receive feedback, verification, and a shareable result." },
    ],
  },
  organizations: {
    eyebrow: "Dashboard / Organizations",
    title: "Trusted work, shared clearly",
    description: "Manage teams, contribution reviews, roles, and organization-backed proof in one place.",
    highlights: [
      { label: "Organizations", value: "Browse" },
      { label: "Teams", value: "Manage" },
      { label: "Invitations", value: "Review" },
    ],
    actions: [
      { href: "/dashboard/messages", label: "Review invitations" },
      { href: "/dashboard/proofs", label: "Team proofs" },
    ],
    features: [
      { icon: "building", title: "Organization directory", description: "Switch between trusted companies, communities, and project groups.", status: "Directory" },
      { icon: "team", title: "Teams and roles", description: "Keep membership, responsibilities, and permissions understandable.", status: "Role-based" },
      { icon: "shield", title: "Organization verification", description: "Confirm employment, project work, and contributions with scoped reviews.", status: "Trusted" },
      { icon: "check", title: "Approval workflows", description: "Route proof and membership requests to the right reviewers.", status: "Routed" },
      { icon: "analytics", title: "Team signals", description: "See verified output, challenge progress, and collaboration health.", status: "Visible" },
      { icon: "message", title: "Member communication", description: "Keep proof feedback and organization discussions connected.", status: "Focused" },
    ],
    workflow: [
      { title: "Join or create", detail: "Enter a trusted workspace with a clear role." },
      { title: "Contribute", detail: "Connect work, proofs, and challenges to the team." },
      { title: "Confirm", detail: "Let authorized reviewers verify contribution records." },
    ],
  },
  analytics: {
    eyebrow: "Dashboard / Analytics",
    title: "Measure signals that matter",
    description: "Understand how verified work builds trust, demonstrates skills, and creates opportunities.",
    highlights: [
      { label: "Trust score", value: "Overview" },
      { label: "Proof signals", value: "Coverage" },
      { label: "Profile reach", value: "Trends" },
    ],
    actions: [
      { href: "/dashboard/proofs", label: "Improve proof coverage" },
      { href: "/dashboard/challenges", label: "Build a skill" },
    ],
    features: [
      { icon: "analytics", title: "Trust trend", description: "Follow how verified work changes profile confidence over time.", status: "Time series" },
      { icon: "target", title: "Skill coverage", description: "Compare claimed strengths with the evidence currently attached.", status: "Coverage" },
      { icon: "search", title: "Discovery analytics", description: "See how people find and explore your professional profile.", status: "Reach" },
      { icon: "shield", title: "Proof engagement", description: "Measure opens, saves, shares, and reviewer confidence.", status: "Engagement" },
      { icon: "building", title: "Organization impact", description: "Understand verified contribution across teams and projects.", status: "Team impact" },
      { icon: "sparkles", title: "Opportunity insights", description: "Identify the next proof or challenge with the highest value.", status: "Suggestions" },
    ],
    workflow: [
      { title: "Read the signal", detail: "Start with trust, coverage, and discovery trends." },
      { title: "Find the gap", detail: "Locate claims or skills that need stronger evidence." },
      { title: "Take action", detail: "Create a proof, complete a challenge, or request review." },
    ],
  },
  messages: {
    eyebrow: "Dashboard / Messages",
    title: "Conversations with context",
    description: "Keep proof reviews, team discussions, and professional opportunities tied to the work behind them.",
    highlights: [
      { label: "Messages", value: "Inbox" },
      { label: "Proof threads", value: "Reviews" },
      { label: "History", value: "Search" },
    ],
    actions: [
      { href: "/dashboard/organizations", label: "Open organizations" },
      { href: "/dashboard/proofs", label: "View review queue" },
    ],
    features: [
      { icon: "message", title: "Focused inbox", description: "Separate proof reviews, team messages, and opportunities.", status: "Prioritized" },
      { icon: "shield", title: "Proof-linked threads", description: "Discuss evidence beside the exact proof under review.", status: "Contextual" },
      { icon: "team", title: "Team conversations", description: "Keep organization decisions visible to the right members.", status: "Scoped" },
      { icon: "search", title: "Message search", description: "Find people, proofs, organizations, and shared files quickly.", status: "Searchable" },
      { icon: "check", title: "Requests and decisions", description: "Approve invitations and review requests without losing context.", status: "Actionable" },
      { icon: "clock", title: "Snooze and reminders", description: "Return important conversations to the inbox when needed.", status: "Organized" },
    ],
    workflow: [
      { title: "Triage", detail: "Filter unread, review, team, and opportunity messages." },
      { title: "Respond in context", detail: "Open the linked proof or organization beside the thread." },
      { title: "Resolve", detail: "Record the decision and archive completed conversations." },
    ],
  },
} satisfies Record<string, FeatureHubData>;

export type FeatureHubKey = keyof typeof catalogInput;

export const featureCatalog = Object.fromEntries(
  Object.entries(catalogInput).map(([key, value]) => [key, featureHubSchema.parse(value)]),
) as Record<FeatureHubKey, FeatureHubData>;
