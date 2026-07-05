import { z } from "zod";

export const demoUserSchema = z.object({
  avatarUrl: z.string().min(1),
  bannerUrl: z.string().min(1),
  bio: z.string().min(1),
  company: z.string().min(1),
  country: z.string().min(1),
  experienceYears: z.number().int().min(1),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  fullName: z.string().min(1),
  headline: z.string().min(1),
  id: z.string().min(1),
  location: z.string().min(1),
  organizationMemberships: z.array(z.string()).min(1),
  postCount: z.number().int().nonnegative(),
  profession: z.string().min(1),
  proofCount: z.number().int().nonnegative(),
  proofScore: z.number().int().min(0).max(100),
  repositoryCount: z.number().int().nonnegative(),
  skills: z.array(z.string()).min(2),
  trustScore: z.number().int().min(0).max(100),
  username: z.string().regex(/^[a-z0-9_]+$/),
});

export const demoPostSchema = z.object({
  attachment: z
    .object({
      description: z.string().min(1),
      kind: z.enum(["repository", "proof", "challenge", "organization"]),
      title: z.string().min(1),
    })
    .nullable(),
  authorId: z.string().min(1),
  bookmarkCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  imageUrl: z.string().min(1).nullable(),
  likeCount: z.number().int().nonnegative(),
  shareCount: z.number().int().nonnegative(),
  tags: z.array(z.string()).min(1),
  text: z.string().min(1),
  type: z.string().min(1),
});

export const demoOrganizationSchema = z.object({
  category: z.string().min(1),
  followers: z.number().int().nonnegative(),
  id: z.string().min(1),
  location: z.string().min(1),
  name: z.string().min(1),
  verified: z.boolean(),
});

export const demoRepositorySchema = z.object({
  description: z.string().min(1),
  id: z.string().min(1),
  language: z.string().min(1),
  name: z.string().min(1),
  owner: z.string().min(1),
  stars: z.number().int().nonnegative(),
});

export const demoProofSchema = z.object({
  category: z.string().min(1),
  id: z.string().min(1),
  owner: z.string().min(1),
  score: z.number().int().min(0).max(100),
  title: z.string().min(1),
  verifier: z.string().min(1),
});

export const demoChallengeSchema = z.object({
  deadline: z.string().min(1),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  id: z.string().min(1),
  participants: z.number().int().nonnegative(),
  sponsor: z.string().min(1),
  title: z.string().min(1),
});

export const demoEventSchema = z.object({
  date: z.string().min(1),
  id: z.string().min(1),
  location: z.string().min(1),
  title: z.string().min(1),
});

export const demoNotificationSchema = z.object({
  id: z.string().min(1),
  message: z.string().min(1),
  time: z.string().min(1),
  type: z.enum(["follow", "proof", "recruiter", "repository", "challenge", "organization"]),
  unread: z.boolean(),
});

export type DemoUser = z.infer<typeof demoUserSchema>;
export type DemoPost = z.infer<typeof demoPostSchema>;
export type DemoOrganization = z.infer<typeof demoOrganizationSchema>;
export type DemoRepository = z.infer<typeof demoRepositorySchema>;
export type DemoProof = z.infer<typeof demoProofSchema>;
export type DemoChallenge = z.infer<typeof demoChallengeSchema>;
export type DemoEvent = z.infer<typeof demoEventSchema>;
export type DemoNotification = z.infer<typeof demoNotificationSchema>;
