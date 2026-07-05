import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, usersTable } from "../../db";
import { getServerUser, type AuthUser as User } from "../auth/service";
import { deleteProfileMedia, uploadProfileMedia } from "./media-storage";
import {
  addCertificationSchema,
  addEducationSchema,
  addExperienceSchema,
  addProjectSchema,
  profileMetadataSchema,
  updateProfileAboutSchema,
  updateProfileContactSchema,
  updateProfileIntroSchema,
  updateProfileMediaSchema,
  updateProfileSkillsSchema,
  type ProfileMetadata,
} from "./schemas";

export type DashboardProfile = {
  about: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  businessName: string | null;
  certifications: ProfileMetadata["certifications"];
  countryCode: string | null;
  district: string | null;
  displayName: string;
  education: ProfileMetadata["education"];
  email: string;
  experience: ProfileMetadata["experience"];
  followers: number;
  following: number;
  firstName: string;
  github: string | null;
  headline: string | null;
  initials: string;
  lastName: string;
  linkedin: string | null;
  location: string | null;
  majorSkill: string | null;
  openToWork: boolean;
  phoneNumber: string | null;
  phoneVisibility: "public" | "recruiters" | "connections" | "private";
  profileStrength: number;
  profileStrengthItems: Array<{
    complete: boolean;
    label: string;
    points: number;
  }>;
  profileKind: "user" | "business" | "recruiter";
  projects: ProfileMetadata["projects"];
  recruiterAgency: string | null;
  showLocation: boolean;
  showPhone: boolean;
  state: string | null;
  skills: string[];
  website: string | null;
  websites: string[];
  username: string | null;
};

function getText(value: FormDataEntryValue | null) {
  return value?.toString() ?? "";
}

function getLimitedText(value: FormDataEntryValue | null, maxLength: number) {
  return getText(value).slice(0, maxLength);
}

function getInitials(displayName: string, email: string) {
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join("");

  return initials || email.slice(0, 2).toUpperCase();
}

function getStringMetadata(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getDefaultUsername(profile: { displayName: string; email: string }) {
  const base = (profile.displayName || profile.email.split("@")[0] || "proofx_user")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return base.length >= 3 ? base : `user_${profile.email.slice(0, 6).replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
}

function getProfileStrengthItems(profile: Omit<DashboardProfile, "profileStrength" | "profileStrengthItems">) {
  return [
    { complete: Boolean(profile.firstName && profile.lastName), label: "Name", points: 10 },
    { complete: Boolean(profile.headline), label: "Headline", points: 10 },
    { complete: Boolean(profile.avatarUrl), label: "Profile photo", points: 10 },
    { complete: Boolean(profile.bannerUrl), label: "Banner", points: 8 },
    { complete: Boolean(profile.about), label: "About", points: 12 },
    { complete: profile.skills.length > 0, label: "Skills", points: 10 },
    { complete: profile.experience.length > 0, label: "Experience", points: 12 },
    { complete: profile.education.length > 0, label: "Education", points: 8 },
    { complete: profile.projects.length > 0, label: "Projects", points: 10 },
    { complete: profile.websites.length > 0 || Boolean(profile.website), label: "Website", points: 5 },
    { complete: Boolean(profile.location) || !profile.showLocation, label: "Location permission", points: 3 },
    { complete: Boolean(profile.phoneNumber) || !profile.showPhone, label: "Phone permission", points: 2 },
  ];
}

function getProfileStrength(items: Array<{ complete: boolean; points: number }>) {
  const totalPoints = items.reduce((total, item) => total + item.points, 0);
  const earnedPoints = items.reduce((total, item) => total + (item.complete ? item.points : 0), 0);

  return Math.round((earnedPoints / totalPoints) * 100);
}

export function getDashboardProfile(user: User): DashboardProfile {
  const metadata = profileMetadataSchema.parse(user.user_metadata ?? {});
  const email = user.email ?? "ProofX user";
  const firstName = metadata.firstName || "";
  const lastName = metadata.lastName || "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    getStringMetadata(metadata.full_name) ||
    getStringMetadata(metadata.name) ||
    email;

  const profile: DashboardProfile = {
    about: metadata.about ?? null,
    avatarUrl: metadata.avatar_url ?? null,
    bannerUrl: metadata.banner_url ?? null,
    businessName: metadata.businessName ?? null,
    certifications: metadata.certifications,
    countryCode: metadata.countryCode ?? null,
    district: metadata.district ?? null,
    displayName,
    education: metadata.education,
    email,
    experience: metadata.experience,
    followers: metadata.followers,
    following: metadata.following,
    firstName,
    github: metadata.github ?? null,
    headline: metadata.headline ?? null,
    initials: getInitials(displayName, email),
    lastName,
    linkedin: metadata.linkedin ?? null,
    location: metadata.location ?? ([metadata.district, metadata.state].filter(Boolean).join(", ") || null),
    majorSkill: metadata.majorSkill ?? null,
    openToWork: metadata.openToWork,
    phoneNumber: metadata.phoneNumber ?? null,
    phoneVisibility: metadata.phoneVisibility,
    profileStrength: 0,
    profileStrengthItems: [],
    profileKind: metadata.profileKind,
    projects: metadata.projects,
    recruiterAgency: metadata.recruiterAgency ?? null,
    showLocation: metadata.showLocation,
    showPhone: metadata.showPhone,
    state: metadata.state ?? null,
    skills: metadata.skills,
    website: metadata.website ?? null,
    websites: metadata.websites.length > 0 ? metadata.websites : metadata.website ? [metadata.website] : [],
    username: metadata.username ?? null,
  };
  const profileStrengthItems = getProfileStrengthItems(profile);

  return { ...profile, profileStrength: getProfileStrength(profileStrengthItems), profileStrengthItems };
}

export async function getDashboardProfileByUserId(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (!user) {
    return null;
  }

  return getDashboardProfile({
    email: user.email,
    id: user.id,
    user_metadata: user.metadata,
  });
}

async function updateMetadata(patch: Record<string, unknown>) {
  const user = await getServerUser();

  if (!user) {
    throw new Error("User session was not found.");
  }

  await db.update(usersTable).set({ metadata: { ...user.user_metadata, ...patch }, updatedAt: new Date() }).where(eq(usersTable.id, user.id));

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/home");
}

async function assertUsernameAvailable(username: string, userId: string) {
  const [existingUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(sql`${usersTable.id} <> ${userId} and lower(coalesce(${usersTable.metadata}->>'username', '')) = ${username.toLowerCase()}`)
    .limit(1);

  if (existingUser) {
    throw new Error("That ProofX username is already taken.");
  }
}

export async function updateProfileIntro(formData: FormData) {
  "use server";

  const input = updateProfileIntroSchema.parse({
    countryCode: getText(formData.get("countryCode")),
    firstName: getText(formData.get("firstName")),
    headline: getLimitedText(formData.get("headline"), 180),
    lastName: getText(formData.get("lastName")),
    location: getText(formData.get("location")),
    openToWork: formData.get("openToWork") === "on",
    showLocation: formData.get("showLocation") === "on",
  });

  await updateMetadata(input);
}

export async function updateProfileContact(formData: FormData) {
  "use server";

  const user = await getServerUser();

  if (!user) {
    throw new Error("User session was not found.");
  }

  const input = updateProfileContactSchema.parse({
    countryCode: getText(formData.get("countryCode")),
    phoneNumber: getText(formData.get("phoneNumber")),
    phoneVisibility: getText(formData.get("phoneVisibility")) || "private",
    showPhone: formData.get("showPhone") === "on",
    username: getText(formData.get("username")) || getDefaultUsername(getDashboardProfile(user)),
    websites: getText(formData.get("websites")),
  });

  await assertUsernameAvailable(input.username, user.id);
  await updateMetadata({
    ...input,
    showPhone: input.phoneVisibility !== "private",
    website: input.websites[0] ?? null,
  });
}

export async function updateProfileMedia(formData: FormData) {
  "use server";

  const user = await getServerUser();

  if (!user) {
    throw new Error("User session was not found.");
  }

  const input = updateProfileMediaSchema.parse({
    avatarDataUrl: getText(formData.get("avatarDataUrl")) || null,
    bannerDataUrl: getText(formData.get("bannerDataUrl")) || null,
  });
  const patch: Record<string, unknown> = {};

  if (input.avatarDataUrl) {
    if (input.avatarDataUrl === "__delete__") {
      await deleteProfileMedia(user.id, "avatar");
      patch.avatar_url = null;
    } else {
      patch.avatar_url = await uploadProfileMedia(user.id, "avatar", input.avatarDataUrl);
    }
  }

  if (input.bannerDataUrl) {
    if (input.bannerDataUrl === "__delete__") {
      await deleteProfileMedia(user.id, "banner");
      patch.banner_url = null;
    } else {
      patch.banner_url = await uploadProfileMedia(user.id, "banner", input.bannerDataUrl);
    }
  }

  await updateMetadata(patch);
}

export async function updateProfileAbout(formData: FormData) {
  "use server";

  await updateMetadata(updateProfileAboutSchema.parse({ about: getText(formData.get("about")) }));
}

export async function updateProfileSkills(formData: FormData) {
  "use server";

  await updateMetadata(
    updateProfileSkillsSchema.parse({
      majorSkill: getText(formData.get("majorSkill")),
      skills: getText(formData.get("skills")),
    }),
  );
}

export async function addProfileExperience(formData: FormData) {
  "use server";

  const user = await getServerUser();
  const profile = getDashboardProfile(user as User);
  const item = addExperienceSchema.parse({
    company: getText(formData.get("company")),
    current: formData.get("current") === "on",
    description: getText(formData.get("description")),
    endDate: getText(formData.get("endDate")),
    location: getText(formData.get("location")),
    startDate: getText(formData.get("startDate")),
    title: getText(formData.get("title")),
  });

  await updateMetadata({ experience: [{ ...item, id: crypto.randomUUID() }, ...profile.experience] });
}

export async function addProfileEducation(formData: FormData) {
  "use server";

  const user = await getServerUser();
  const profile = getDashboardProfile(user as User);
  const item = addEducationSchema.parse({
    degree: getText(formData.get("degree")),
    endDate: getText(formData.get("endDate")),
    school: getText(formData.get("school")),
    startDate: getText(formData.get("startDate")),
  });

  await updateMetadata({ education: [{ ...item, id: crypto.randomUUID() }, ...profile.education] });
}

export async function addProfileProject(formData: FormData) {
  "use server";

  const user = await getServerUser();
  const profile = getDashboardProfile(user as User);
  const item = addProjectSchema.parse({
    description: getText(formData.get("description")),
    link: getText(formData.get("link")),
    name: getText(formData.get("name")),
  });

  await updateMetadata({ projects: [{ ...item, id: crypto.randomUUID() }, ...profile.projects] });
}

export async function addProfileCertification(formData: FormData) {
  "use server";

  const user = await getServerUser();
  const profile = getDashboardProfile(user as User);
  const item = addCertificationSchema.parse({
    issuer: getText(formData.get("issuer")),
    name: getText(formData.get("name")),
    year: getText(formData.get("year")),
  });

  await updateMetadata({ certifications: [{ ...item, id: crypto.randomUUID() }, ...profile.certifications] });
}

export async function removeProfileItem(collection: "certifications" | "education" | "experience" | "projects", id: string) {
  "use server";

  const user = await getServerUser();
  const profile = getDashboardProfile(user as User);

  await updateMetadata({
    [collection]: profile[collection].filter((item) => item.id !== id),
  });
}

export async function removeProfileItemFromForm(formData: FormData) {
  "use server";

  const collection = getText(formData.get("collection"));
  const id = getText(formData.get("id"));

  if (!["certifications", "education", "experience", "projects"].includes(collection)) {
    throw new Error("Unsupported profile section.");
  }

  await removeProfileItem(collection as "certifications" | "education" | "experience" | "projects", id);
}
