import { z } from "zod";

export const repositoryVisibilitySchema = z.enum(["public", "private", "unlisted"]);

export const repositoryTagListSchema = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8)
  );

export const repositoryVerifiedSkillListSchema = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 12)
  );

export const repositoryCreateSchema = z.object({
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  name: z.string().min(2, "Repository name must be at least 2 characters").max(80),
  readme: z.string().max(20000, "README must be 20,000 characters or less").optional(),
  recruiterVisible: z.coerce.boolean().default(true),
  sourceUrl: z.string().url("Enter a valid source URL").optional().or(z.literal("")),
  tags: repositoryTagListSchema,
  verifiedSkills: repositoryVerifiedSkillListSchema,
  visibility: repositoryVisibilitySchema.default("private"),
});

export const repositoryUpdateSchema = repositoryCreateSchema.extend({
  id: z.string().uuid(),
});

export const repositoryIdSchema = z.object({
  id: z.string().uuid(),
});

export const repositorySearchSchema = z.object({
  query: z.string().max(120).optional(),
  visibility: repositoryVisibilitySchema.optional(),
});

export const repositoryContributorSchema = z.object({
  repositoryId: z.string().uuid(),
  role: z.enum(["maintainer", "contributor", "viewer"]).default("contributor"),
  userId: z.string().uuid(),
});

export const repositoryMemberSchema = z.object({
  repositoryId: z.string().uuid(),
  role: z.enum(["maintainer", "contributor", "viewer"]).default("contributor"),
  userId: z.string().uuid(),
});

export const branchNameSchema = z
  .string()
  .min(1, "Branch name is required")
  .max(120)
  .regex(/^[a-zA-Z0-9._/-]+$/, "Branch names can contain letters, numbers, dots, slashes, underscores, and dashes");

export const repositoryBranchSchema = z.object({
  name: branchNameSchema,
  repositoryId: z.string().uuid(),
  sourceBranchId: z.string().uuid().optional(),
});

export const repositoryFilePathSchema = z
  .string()
  .min(1, "Path is required")
  .max(500)
  .transform((path) =>
    path
      .replace(/\\/g, "/")
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)
      .join("/")
  )
  .refine((path) => !path.includes(".."), "Path cannot include parent directory traversal");

export const repositoryFolderSchema = z.object({
  name: repositoryFilePathSchema,
  repositoryId: z.string().uuid(),
});

export const repositoryFileCreateSchema = z.object({
  branchId: z.string().uuid(),
  content: z.string().max(500000, "Text file content must be 500 KB or less").default(""),
  message: z.string().max(200).optional(),
  path: repositoryFilePathSchema,
  repositoryId: z.string().uuid(),
});

export const repositoryFileSaveSchema = repositoryFileCreateSchema.extend({
  fileId: z.string().uuid(),
});

export const repositoryFileRenameSchema = z.object({
  fileId: z.string().uuid(),
  message: z.string().max(200).optional(),
  path: repositoryFilePathSchema,
  repositoryId: z.string().uuid(),
});

export const repositoryFileDeleteSchema = z.object({
  fileId: z.string().uuid(),
  message: z.string().max(200).optional(),
  repositoryId: z.string().uuid(),
});

export const repositoryUploadSchema = z.object({
  branchId: z.string().uuid(),
  message: z.string().max(200).optional(),
  path: repositoryFilePathSchema.optional(),
  repositoryId: z.string().uuid(),
});

export const repositorySettingsSchema = repositoryUpdateSchema;

export type RepositoryCreateInput = z.input<typeof repositoryCreateSchema>;
export type RepositoryUpdateInput = z.input<typeof repositoryUpdateSchema>;
export type RepositorySearchInput = z.input<typeof repositorySearchSchema>;
export type RepositoryContributorInput = z.input<typeof repositoryContributorSchema>;
export type RepositoryMemberInput = z.input<typeof repositoryMemberSchema>;
export type RepositoryBranchInput = z.input<typeof repositoryBranchSchema>;
export type RepositoryFolderInput = z.input<typeof repositoryFolderSchema>;
export type RepositoryFileCreateInput = z.input<typeof repositoryFileCreateSchema>;
export type RepositoryFileSaveInput = z.input<typeof repositoryFileSaveSchema>;
export type RepositoryFileRenameInput = z.input<typeof repositoryFileRenameSchema>;
export type RepositoryFileDeleteInput = z.input<typeof repositoryFileDeleteSchema>;
export type RepositoryUploadInput = z.input<typeof repositoryUploadSchema>;
