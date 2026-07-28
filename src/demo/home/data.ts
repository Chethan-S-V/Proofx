import {
  demoChallengeSchema,
  demoEventSchema,
  demoNotificationSchema,
  demoOrganizationSchema,
  demoPostSchema,
  demoProofSchema,
  demoRepositorySchema,
  demoUserSchema,
  type DemoPost,
} from "./schemas";

export const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_PROOFX_DEMO_MODE !== "false";

const firstNames = ["Ari", "Mira", "Nolan", "Zoya", "Ishan", "Elena", "Theo", "Nia", "Ravi", "Lina", "Owen", "Amara", "Kian", "Sana", "Eli", "Tara", "Milo", "Anika", "Noah", "Leah"];
const lastNames = ["Vale", "Soren", "Kade", "Marlow", "Sen", "Rowan", "Aster", "Voss", "Neri", "Quill", "Dale", "Ives", "Raine", "Sol", "Arden", "Briar", "Cove", "Frost", "Reed", "Wren"];
const professions = [
  "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer", "Mobile Developer",
  "AI Engineer", "Cybersecurity Engineer", "Mechanical Engineer", "Civil Engineer", "Electrical Engineer",
  "Architect", "UI/UX Designer", "Product Designer", "Photographer", "Cinematographer", "Video Editor",
  "Chef", "Hotel Manager", "Chartered Accountant", "Lawyer", "Doctor", "Nurse", "Teacher", "Professor",
  "Scientist", "Startup Founder", "Entrepreneur", "Marketing Manager", "Sales Executive", "HR Manager",
  "Data Scientist", "DevOps Engineer", "Game Developer", "Fashion Designer", "Interior Designer",
  "Music Producer", "Researcher", "Freelancer", "Chief Executive Officer", "Technical Recruiter",
];
const companies = ["Northstar Labs", "Lumen Harbor", "Cedar Works", "Orbit Foundry", "Blue Peak Studio", "Kindred Systems", "Atlas Grove", "Copper Cloud", "Juniper Collective", "Nova Loom", "Brightfield Health", "Mosaic Learning"];
const locations = [
  ["Bengaluru", "India"], ["Pune", "India"], ["Singapore", "Singapore"], ["Berlin", "Germany"],
  ["Toronto", "Canada"], ["Nairobi", "Kenya"], ["Melbourne", "Australia"], ["Lisbon", "Portugal"],
  ["Austin", "United States"], ["Amsterdam", "Netherlands"], ["Seoul", "South Korea"], ["Tokyo", "Japan"],
];
const skillGroups = [
  ["TypeScript", "System Design", "PostgreSQL", "React"], ["Product Strategy", "Research", "Prototyping", "Figma"],
  ["Python", "Machine Learning", "Data Analysis", "MLOps"], ["Photography", "Lighting", "Composition", "Editing"],
  ["Leadership", "Operations", "Communication", "Planning"], ["Engineering", "CAD", "Simulation", "Project Delivery"],
  ["Marketing", "Analytics", "Brand Strategy", "Campaigns"], ["Teaching", "Curriculum", "Research", "Mentoring"],
];
const gradients = [
  ["#0891b2", "#0f172a"], ["#7c3aed", "#111827"], ["#059669", "#052e16"], ["#e11d48", "#1f2937"],
  ["#d97706", "#172554"], ["#2563eb", "#312e81"], ["#0f766e", "#164e63"], ["#9333ea", "#3f3f46"],
];

function svgDataUrl(label: string, index: number, width: number, height: number) {
  const [start, end] = gradients[index % gradients.length];
  const initials = label.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.22));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${width * 0.78}" cy="${height * 0.22}" r="${Math.min(width, height) * 0.2}" fill="white" opacity=".08"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial" font-size="${fontSize}" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const demoOrganizations = demoOrganizationSchema.array().parse(
  companies.map((name, index) => ({
    category: ["Technology", "Design", "Education", "Healthcare", "Research", "Community"][index % 6],
    followers: 4200 + index * 1371,
    id: `org-${index + 1}`,
    location: locations[index % locations.length].join(", "),
    name,
    verified: index % 4 !== 3,
  })),
);

export const demoUsers = demoUserSchema.array().length(100).parse(
  Array.from({ length: 100 }, (_, index) => {
    const fullName = `${firstNames[index % firstNames.length]} ${lastNames[(index * 7) % lastNames.length]}`;
    const profession = professions[index % professions.length];
    const location = locations[index % locations.length];
    const skillSet = skillGroups[index % skillGroups.length];
    return {
      avatarUrl: svgDataUrl(fullName, index, 160, 160),
      bannerUrl: svgDataUrl(profession, index + 3, 900, 260),
      bio: `${profession} focused on practical work, thoughtful collaboration, and outcomes that can be independently verified.`,
      company: companies[index % companies.length],
      country: location[1],
      experienceYears: 2 + (index % 14),
      followers: 780 + index * 91,
      following: 180 + (index * 37) % 1600,
      fullName,
      headline: `${profession} building useful, measurable work at ${companies[index % companies.length]}`,
      id: `demo-user-${index + 1}`,
      location: location[0],
      organizationMemberships: [companies[index % companies.length], companies[(index + 5) % companies.length]],
      postCount: 24 + (index * 7) % 190,
      profession,
      proofCount: 6 + (index * 3) % 42,
      proofScore: 68 + (index * 5) % 31,
      repositoryCount: 3 + (index * 11) % 38,
      skills: skillSet,
      trustScore: 72 + (index * 7) % 27,
      username: `${firstNames[index % firstNames.length].toLowerCase()}_${lastNames[(index * 7) % lastNames.length].toLowerCase()}${index + 1}`,
    };
  }),
);

const postTopics = [
  ["Project update", "Shipped the first accessible workflow for our community platform. The best part was reducing a seven-step process to three clear decisions.", ["product", "accessibility", "buildinpublic"]],
  ["Career achievement", "Completed a major professional milestone today. I documented the decisions, outcomes, and peer feedback so the achievement can be evaluated beyond the headline.", ["career", "growth", "proof"]],
  ["Certificate", "Finished an advanced learning track and published the capstone evidence, notes, and assessment results for review.", ["learning", "certificate", "skills"]],
  ["Open source", "Contributed a performance fix to a community-maintained tool. Benchmarks show a meaningful improvement on large datasets.", ["opensource", "engineering", "community"]],
  ["Hackathon", "Our small team built a working prototype in 36 hours, with clear ownership for research, implementation, and presentation.", ["hackathon", "teamwork", "prototype"]],
  ["Research", "Published a short research note exploring how transparent evaluation changes professional learning outcomes.", ["research", "publication", "education"]],
  ["Photography", "A new visual story from an early-morning city walk, focused on geometry, quiet movement, and available light.", ["photography", "visualstory", "creative"]],
  ["Design portfolio", "Added a case study covering discovery, failed directions, accessibility tradeoffs, and the final interface system.", ["design", "portfolio", "ux"]],
  ["Restaurant creation", "Tested a seasonal menu that cuts kitchen waste while keeping the service experience warm and memorable.", ["hospitality", "food", "sustainability"]],
  ["Engineering project", "Validated the latest prototype under real operating constraints and documented every assumption for the next review.", ["engineering", "prototype", "testing"]],
  ["Marketing campaign", "Wrapped a campaign built around useful education rather than interruption. Retention mattered more than raw impressions.", ["marketing", "strategy", "analytics"]],
  ["Business milestone", "Reached a meaningful customer milestone by staying close to the problem and keeping the team focused on evidence.", ["business", "startup", "milestone"]],
  ["Job update", "Starting a new role where I can combine hands-on craft, mentoring, and measurable community impact.", ["newrole", "career", "community"]],
  ["Internship", "We are opening a fictional demo internship for curious builders who care about documentation and responsible collaboration.", ["internship", "opportunity", "learning"]],
  ["Event", "Shared lessons from a recent professional event: show the work, explain the tradeoffs, and make feedback easy to act on.", ["event", "learning", "networking"]],
  ["AI experiment", "Tested a small AI-assisted workflow with human review at every consequential step. The guardrails were as important as the model.", ["ai", "responsibletech", "experiment"]],
  ["Travel", "Working from a new city this week and learning how local context changes design, hospitality, and public space.", ["travel", "perspective", "design"]],
  ["Community work", "Our volunteer group completed a neighborhood skills workshop and published reusable teaching materials for the next cohort.", ["community", "volunteering", "education"]],
  ["Tutorial", "Published a practical tutorial that starts with the failure modes, then builds toward a maintainable solution.", ["tutorial", "knowledge", "craft"]],
  ["Industry discussion", "A useful professional signal should explain ownership and outcome—not just repeat a title. Curious how other teams approach this.", ["discussion", "futureofwork", "trust"]],
] as const;

const attachmentKinds = ["repository", "proof", "challenge", "organization"] as const;
const attachmentTitles = ["Signal Kit", "Verified delivery record", "Responsible AI Sprint", "Northstar Labs update"];
const demoVideoUrls = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
];
const baseTime = Date.parse("2026-07-04T08:00:00.000Z");

export const demoPosts = demoPostSchema.array().length(300).parse(
  Array.from({ length: 300 }, (_, index): DemoPost => {
    const topic = postTopics[index % postTopics.length];
    const author = demoUsers[(index * 13) % demoUsers.length];
    const hasAttachment = index % 3 === 0;
    const videoUrl = index % 7 === 0 ? demoVideoUrls[index % demoVideoUrls.length] : null;
    return {
      attachment: hasAttachment
        ? {
            description: ["A public work sample with contribution history and review notes.", "Evidence, outcome, and verification context in one record.", "A practical challenge with transparent scoring criteria.", "A verified organization announcement for the professional community."][index % 4],
            kind: attachmentKinds[index % attachmentKinds.length],
            title: attachmentTitles[index % attachmentTitles.length],
          }
        : null,
      authorId: author.id,
      bookmarkCount: 8 + (index * 13) % 380,
      commentCount: 5 + (index * 11) % 260,
      createdAt: new Date(baseTime - index * 37 * 60 * 1000).toISOString(),
      id: `demo-post-${index + 1}`,
      imageUrl: !videoUrl && index % 4 !== 1 ? svgDataUrl(topic[0], index + 11, 1200, 630) : null,
      likeCount: 72 + (index * 47) % 4200,
      mediaAspect: (["landscape", "portrait", "square"] as const)[index % 3],
      shareCount: 3 + (index * 17) % 610,
      tags: [...topic[2]],
      text: topic[1],
      type: topic[0],
      viewCount: 940 + (index * 173) % 24000,
      videoUrl,
    };
  }),
);

export const demoRepositories = demoRepositorySchema.array().parse(
  Array.from({ length: 24 }, (_, index) => ({
    description: ["Accessible workflow components for professional products.", "Open data tools for practical community research.", "A typed toolkit for evidence-aware project documentation.", "Fast visual review utilities for creative teams."][index % 4],
    id: `repo-${index + 1}`,
    language: ["TypeScript", "Python", "Rust", "Go", "Kotlin", "Swift"][index % 6],
    name: ["signal-kit", "open-atlas", "proof-notes", "frame-review", "civic-lens", "trust-graph"][index % 6] + `-${Math.floor(index / 6) + 1}`,
    owner: demoUsers[index].username,
    stars: 680 + index * 319,
  })),
);

export const demoProofs = demoProofSchema.array().parse(
  Array.from({ length: 20 }, (_, index) => ({
    category: ["Project", "Skill", "Research", "Achievement", "Experience"][index % 5],
    id: `proof-${index + 1}`,
    owner: demoUsers[index * 2].fullName,
    score: 76 + (index * 7) % 23,
    title: ["Accessible product launch", "Open source performance contribution", "Community learning program", "Engineering prototype validation", "Visual storytelling portfolio"][index % 5],
    verifier: demoOrganizations[index % demoOrganizations.length].name,
  })),
);

const challengeTitles = [
  "Accessible API Build",
  "Mobile Design System",
  "Responsible AI Evaluation",
  "Open Source Performance Fix",
  "48-hour Product Sprint",
  "Portfolio Evidence Review",
  "Frontend Hiring Exercise",
  "Client Dashboard Delivery",
  "Developer Internship Project",
  "Cloud Fundamentals Certification",
  "Secure Authentication Audit",
  "Community Learning Toolkit",
];

export const demoChallenges = demoChallengeSchema.array().parse(
  Array.from({ length: 36 }, (_, index) => ({
    deadline: `${5 + index} days`,
    difficulty: (["Beginner", "Intermediate", "Advanced"] as const)[index % 3],
    id: `challenge-${index + 1}`,
    participants: 340 + index * 187,
    prizeMoney: 15000 + (index % 6) * 10000,
    sponsor: demoOrganizations[index % demoOrganizations.length].name,
    title: `${challengeTitles[index % challengeTitles.length]} · Round ${Math.floor(index / challengeTitles.length) + 1}`,
  })),
);

export const demoEvents = demoEventSchema.array().parse(
  Array.from({ length: 8 }, (_, index) => ({
    date: ["Jul 08", "Jul 11", "Jul 16", "Jul 22"][index % 4],
    id: `event-${index + 1}`,
    location: index % 2 === 0 ? "Online" : locations[index][0],
    title: ["Proof-led portfolios", "Open source office hours", "Design evidence clinic", "Future of trusted hiring"][index % 4],
  })),
);

export const demoNotifications = demoNotificationSchema.array().parse([
  { id: "notification-1", message: "Mira Soren followed you.", time: "4 min", type: "follow", unread: true },
  { id: "notification-2", message: "Your project proof received a new like.", time: "18 min", type: "proof", unread: true },
  { id: "notification-3", message: "A recruiter viewed your professional profile.", time: "42 min", type: "recruiter", unread: true },
  { id: "notification-4", message: "signal-kit received 24 new stars.", time: "1 hr", type: "repository", unread: false },
  { id: "notification-5", message: "Responsible AI Review closes in 5 days.", time: "2 hr", type: "challenge", unread: false },
  { id: "notification-6", message: "Northstar Labs verified a contribution proof.", time: "3 hr", type: "organization", unread: false },
]);

export const technologyTrends = ["TypeScript", "Responsible AI", "Rust", "Design Systems", "PostgreSQL", "Cybersecurity"];

export type DemoSearchResult = { description: string; href: string; id: string; kind: "person" | "challenge" | "organization" | "repository"; title: string };

export function searchDemoContent(query: string): DemoSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  const people = demoUsers
    .filter((user) => `${user.fullName} ${user.username} ${user.profession} ${user.skills.join(" ")}`.toLowerCase().includes(normalized))
    .slice(0, 4)
    .map((user) => ({ description: `${user.profession} · ${user.company}`, href: `/dashboard/profile/${user.id}`, id: user.id, kind: "person" as const, title: user.fullName }));
  const challenges = demoChallenges
    .filter((challenge) => `${challenge.title} ${challenge.sponsor} ${challenge.difficulty}`.toLowerCase().includes(normalized))
    .slice(0, 4)
    .map((challenge) => ({ description: `${challenge.difficulty} · ${challenge.sponsor}`, href: "/dashboard/challenges", id: challenge.id, kind: "challenge" as const, title: challenge.title }));
  const organizations = demoOrganizations
    .filter((organization) => `${organization.name} ${organization.category}`.toLowerCase().includes(normalized))
    .slice(0, 4)
    .map((organization) => ({ description: `${organization.category} · ${organization.location}`, href: "/dashboard/organizations", id: organization.id, kind: "organization" as const, title: organization.name }));
  const repositories = demoRepositories
    .filter((repository) => `${repository.name} ${repository.description} ${repository.language}`.toLowerCase().includes(normalized))
    .slice(0, 4)
    .map((repository) => ({ description: `${repository.language} · ${repository.stars.toLocaleString()} stars`, href: "/dashboard/repositories", id: repository.id, kind: "repository" as const, title: repository.name }));

  return [...people, ...challenges, ...organizations, ...repositories];
}
