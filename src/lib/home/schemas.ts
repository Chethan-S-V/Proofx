import { z } from "zod";

const avatarUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/(?!\/)(?!.*\/\.\.(?:\/|$))\S+$/, "Invalid local asset path"),
]);

export const homeUserMetadataSchema = z
  .object({
    avatar_url: avatarUrlSchema.optional().nullable(),
    full_name: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
  })
  .passthrough();

export type HomeUserMetadata = z.infer<typeof homeUserMetadataSchema>;
