import { z } from "zod";

export const homeUserMetadataSchema = z
  .object({
    avatar_url: z.string().url().optional().nullable(),
    full_name: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
  })
  .passthrough();

export type HomeUserMetadata = z.infer<typeof homeUserMetadataSchema>;
