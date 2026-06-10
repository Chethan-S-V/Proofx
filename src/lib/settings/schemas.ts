import { z } from "zod";

export const accountSettingsSchema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().min(1).max(80),
  language: z.string().trim().max(80),
  lastName: z.string().trim().min(1).max(80),
  timezone: z.string().trim().max(120),
});

export const passwordSettingsSchema = z
  .object({
    confirmPassword: z.string().min(8),
    password: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const preferenceSettingsSchema = z.object({
  aiSuggestions: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  privateProfile: z.boolean().default(false),
  productUpdates: z.boolean().default(false),
  recruiterVisible: z.boolean().default(false),
});

export const settingsMetadataSchema = z
  .object({
    aiSuggestions: z.boolean().optional().default(true),
    emailNotifications: z.boolean().optional().default(true),
    language: z.string().optional().default("English"),
    privateProfile: z.boolean().optional().default(false),
    productUpdates: z.boolean().optional().default(false),
    recruiterVisible: z.boolean().optional().default(true),
    timezone: z.string().optional().default("Asia/Calcutta"),
  })
  .passthrough();
