import { z } from "zod";
import { organizationSizeOptions, organizationTypeValues } from "./organization.constants";

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

const csvList = (maxItems: number, maxItemLength = 80) =>
  z
    .string()
    .max(4000)
    .optional()
    .transform((value) => {
      const seen = new Set<string>();

      return (value ?? "")
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => {
          const key = item.toLowerCase();

          if (seen.has(key)) {
            return false;
          }

          seen.add(key);
          return true;
        })
        .map((item) => item.slice(0, maxItemLength))
        .slice(0, maxItems);
    });

export const organizationTypeSchema = z.enum(organizationTypeValues);
export const organizationSizeSchema = z.enum(organizationSizeOptions);

export const organizationSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters.")
  .max(64, "Slug must be 64 characters or less.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens.");

export const organizationCreateSchema = z.object({
  city: optionalText(120),
  country: optionalText(120),
  description: optionalText(4000),
  foundedYear: z.preprocess((value) => value || null, z.coerce.number().int().min(1700).max(new Date().getFullYear()).nullable()),
  industry: optionalText(120),
  name: z.string().trim().min(2, "Organization name is required.").max(140),
  phone: optionalText(40),
  postalCode: optionalText(40),
  headquarters: optionalText(180),
  primaryEmail: z.preprocess((value) => value ?? "", z.string().trim().email().or(z.literal(""))).transform((value) => value || null),
  publicPhone: z.boolean().default(false),
  size: z.preprocess((value) => value || null, organizationSizeSchema.nullable()),
  slug: organizationSlugSchema,
  specialties: csvList(24),
  state: optionalText(120),
  tagline: optionalText(180),
  type: organizationTypeSchema,
  website: nullableUrlText,
  careerPageUrl: nullableUrlText,
  coverUrl: nullableUrlText,
  logoUrl: nullableUrlText,
  professionalCategories: csvList(24),
  services: csvList(24),
  socialLinks: z
    .string()
    .max(2000)
    .optional()
    .transform((value) =>
      (value ?? "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [label, ...urlParts] = item.split(":");
          const url = urlParts.join(":").trim();

          return { label: label.trim().slice(0, 40), url };
        })
        .filter((item) => item.label && /^https?:\/\//i.test(item.url))
        .slice(0, 8),
    ),
  technologies: csvList(24),
});

export const organizationOnboardingSchema = organizationCreateSchema.extend({
  onboardingStep: z.coerce.number().int().min(1).max(6).default(1),
});

export const organizationIdSchema = z.object({
  organizationId: z.string().uuid(),
});

export const organizationFollowSchema = organizationIdSchema.extend({
  preference: z.enum(["all_updates", "important_updates", "challenges", "jobs", "proof_activity", "off"]).default("important_updates"),
});

export const organizationMembershipRequestSchema = organizationIdSchema.extend({
  jobTitle: optionalText(120),
  membershipType: optionalText(80),
  publicVisibility: z.boolean().default(true),
});

export const organizationInviteSchema = organizationIdSchema.extend({
  jobTitle: optionalText(120),
  roleKey: z.enum(["ADMIN", "HR_MANAGER", "RECRUITER", "TEAM_MANAGER", "PROOF_VERIFIER", "CHALLENGE_MANAGER", "CONTENT_MANAGER", "ANALYST", "MEMBER"]).default("MEMBER"),
  userId: z.string().uuid(),
});

export const organizationDepartmentSchema = organizationIdSchema.extend({
  description: optionalText(1000),
  isPublic: z.boolean().default(true),
  name: z.string().trim().min(2).max(120),
  parentDepartmentId: z.string().uuid().optional().nullable(),
});

export const organizationTeamSchema = organizationIdSchema.extend({
  departmentId: z.string().uuid().optional().nullable(),
  description: optionalText(1000),
  name: z.string().trim().min(2).max(120),
});

export const organizationPostSchema = organizationIdSchema.extend({
  body: z.string().trim().min(1).max(5000),
  status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
  title: optionalText(160),
  type: z.enum(["text", "image", "video", "document", "announcement", "article", "event_announcement", "job_announcement", "challenge_announcement", "proof_showcase", "member_achievement"]).default("text"),
});

export const proofVerificationRequestSchema = organizationIdSchema.extend({
  evidence: csvList(12, 240).transform((items) => items.map((item) => ({ label: item }))),
  proofId: z.string().uuid().optional().nullable(),
  requestMessage: optionalText(2000),
});

export const proofVerificationDecisionSchema = z.object({
  decision: z.enum(["under_review", "more_information_required", "verified", "rejected", "revoked", "expired"]),
  publicVerificationNote: optionalText(1000),
  reason: optionalText(1000),
  requestId: z.string().uuid(),
});

export const organizationJobSchema = organizationIdSchema.extend({
  applicationDeadline: z.preprocess(
    (value) => value || null,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
  ),
  departmentId: z.string().uuid().optional().nullable(),
  description: optionalText(5000),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship", "temporary", "volunteer"]).default("full_time"),
  experienceLevel: optionalText(80),
  location: optionalText(160),
  remotePolicy: z.enum(["onsite", "hybrid", "remote", "flexible"]).default("onsite"),
  requirements: optionalText(5000),
  responsibilities: optionalText(5000),
  salaryRange: optionalText(120),
  salaryVisible: z.boolean().default(false),
  skills: csvList(24),
  status: z.enum(["draft", "published", "paused", "closed", "archived"]).default("draft"),
  title: z.string().trim().min(2).max(160),
});

export const candidatePipelineSchema = organizationIdSchema.extend({
  candidateId: z.string().uuid(),
  internalNote: optionalText(2000),
  stage: z.enum(["sourced", "contacted", "interested", "screening", "interview", "technical_evaluation", "offer", "hired", "rejected", "withdrawn"]).default("sourced"),
});

export const talentSearchSchema = z.object({
  query: z.string().trim().max(120).optional().default(""),
});

export type OrganizationCreateInput = z.input<typeof organizationCreateSchema>;
export type OrganizationOnboardingInput = z.input<typeof organizationOnboardingSchema>;
