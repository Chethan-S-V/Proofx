import { z } from "zod";

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => value ?? "",
    z
      .string()
      .trim()
      .max(maxLength)
      .transform((value) => value || null),
  );

const nullableUrlText = z.preprocess(
  (value) => value ?? "",
  z
    .string()
    .trim()
    .transform((value) => value || null)
    .pipe(z.string().url().nullable()),
);

const usernameText = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,30}$/, "Use 3-30 lowercase letters, numbers, or underscores.");

const websiteList = z
  .string()
  .max(2000)
  .transform((value) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (/^https?:\/\//i.test(item) ? item : `https://${item}`))
      .slice(0, 8),
  )
  .pipe(z.array(z.string().url()).max(8));

export const profileExperienceSchema = z.object({
  company: z.string().trim().min(1).max(120),
  current: z.boolean().default(false),
  description: optionalText(1200),
  endDate: optionalText(40),
  id: z.string().trim().min(1),
  location: optionalText(120),
  startDate: optionalText(40),
  title: z.string().trim().min(1).max(120),
});

export const profileEducationSchema = z.object({
  degree: optionalText(120),
  endDate: optionalText(40),
  id: z.string().trim().min(1),
  school: z.string().trim().min(1).max(140),
  startDate: optionalText(40),
});

export const profileProjectSchema = z.object({
  description: optionalText(1000),
  id: z.string().trim().min(1),
  link: nullableUrlText,
  name: z.string().trim().min(1).max(140),
});

export const profileCertificationSchema = z.object({
  id: z.string().trim().min(1),
  issuer: optionalText(120),
  name: z.string().trim().min(1).max(140),
  year: optionalText(20),
});

export const profileMetadataSchema = z
  .object({
    about: z.string().trim().max(2000).optional().nullable(),
    avatar_url: z.string().optional().nullable(),
    banner_url: z.string().optional().nullable(),
    businessName: z.string().trim().optional().nullable(),
    certifications: z.array(profileCertificationSchema).optional().default([]),
    countryCode: z.string().trim().optional().nullable(),
    district: z.string().trim().optional().nullable(),
    education: z.array(profileEducationSchema).optional().default([]),
    experience: z.array(profileExperienceSchema).optional().default([]),
    followers: z.number().int().nonnegative().optional().default(0),
    following: z.number().int().nonnegative().optional().default(0),
    firstName: z.string().trim().optional().nullable(),
    github: z.string().url().optional().nullable(),
    headline: z.string().trim().optional().nullable(),
    lastName: z.string().trim().optional().nullable(),
    linkedin: z.string().url().optional().nullable(),
    location: z.string().trim().optional().nullable(),
    majorSkill: z.string().trim().optional().nullable(),
    openToWork: z.boolean().optional().default(false),
    phoneNumber: z.string().trim().optional().nullable(),
    phoneVisibility: z.enum(["public", "recruiters", "connections", "private"]).optional().default("private"),
    profileKind: z.enum(["user", "business", "recruiter"]).optional().default("user"),
    projects: z.array(profileProjectSchema).optional().default([]),
    recruiterAgency: z.string().trim().optional().nullable(),
    showLocation: z.boolean().optional().default(false),
    showPhone: z.boolean().optional().default(false),
    state: z.string().trim().optional().nullable(),
    skills: z.array(z.string().trim().min(1).max(60)).optional().default([]),
    website: z.string().url().optional().nullable(),
    websites: z.array(z.string().url()).optional().default([]),
    username: z.string().trim().optional().nullable(),
  })
  .passthrough();

export const updateProfileIntroSchema = z.object({
  countryCode: optionalText(8),
  firstName: z.string().trim().min(1).max(80),
  headline: optionalText(180),
  lastName: z.string().trim().min(1).max(80),
  location: optionalText(120),
  openToWork: z.boolean().default(false),
  showLocation: z.boolean().default(false),
});

export const updateProfileContactSchema = z.object({
  countryCode: optionalText(8),
  phoneNumber: z
    .string()
    .trim()
    .max(24)
    .optional()
    .transform((value) => value || null),
  phoneVisibility: z.enum(["public", "recruiters", "connections", "private"]).default("private"),
  showPhone: z.boolean().default(false),
  username: usernameText,
  websites: websiteList,
});

export const updateProfileMediaSchema = z.object({
  avatarDataUrl: z.union([z.string().startsWith("data:image/"), z.literal("__delete__")]).optional().nullable(),
  bannerDataUrl: z.union([z.string().startsWith("data:image/"), z.literal("__delete__")]).optional().nullable(),
});

export const updateProfileAboutSchema = z.object({
  about: optionalText(2000),
});

export const updateProfileSkillsSchema = z.object({
  majorSkill: optionalText(80),
  skills: z
    .string()
    .max(4000)
    .transform((value) => {
      const seenSkills = new Set<string>();

      return value
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .filter((skill) => {
          const key = skill.toLowerCase();

          if (seenSkills.has(key)) {
            return false;
          }

          seenSkills.add(key);
          return true;
        })
        .slice(0, 120);
    }),
});

export const addExperienceSchema = profileExperienceSchema.omit({ id: true });
export const addEducationSchema = profileEducationSchema.omit({ id: true });
export const addProjectSchema = profileProjectSchema.omit({ id: true });
export const addCertificationSchema = profileCertificationSchema.omit({ id: true });

export type ProfileMetadata = z.infer<typeof profileMetadataSchema>;
