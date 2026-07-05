import { z } from "zod";

export const accountSettingsSchema = z.object({
  email: z.string().email(),
  language: z.string().trim().max(80),
  timezone: z.string().trim().max(120),
});

export const themeSchema = z.enum([
  "dark-midnight",
  "dark-graphite",
  "dark-emerald",
  "dark-crimson",
  "dark-violet",
  "light-paper",
  "light-sky",
  "light-mint",
  "light-rose",
  "light-sand",
]);

export const appearanceSettingsSchema = z.object({
  compactMode: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  reduceMotion: z.boolean().default(false),
  theme: themeSchema.default("dark-midnight"),
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
  autoSaveDrafts: z.boolean().default(false),
  codeActivityTracking: z.boolean().default(false),
  dataExportReady: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  loginAlerts: z.boolean().default(false),
  proofReminders: z.boolean().default(false),
  privateProfile: z.boolean().default(false),
  productUpdates: z.boolean().default(false),
  recruiterVisible: z.boolean().default(false),
  weeklyDigest: z.boolean().default(false),
});

export const settingsMetadataSchema = z
  .object({
    aiSuggestions: z.boolean().optional().default(true),
    autoSaveDrafts: z.boolean().optional().default(true),
    codeActivityTracking: z.boolean().optional().default(true),
    compactMode: z.boolean().optional().default(false),
    dataExportReady: z.boolean().optional().default(false),
    emailNotifications: z.boolean().optional().default(true),
    highContrast: z.boolean().optional().default(false),
    language: z.string().optional().default("English"),
    loginAlerts: z.boolean().optional().default(true),
    privateProfile: z.boolean().optional().default(false),
    productUpdates: z.boolean().optional().default(false),
    proofReminders: z.boolean().optional().default(true),
    reduceMotion: z.boolean().optional().default(false),
    recruiterVisible: z.boolean().optional().default(true),
    theme: themeSchema.optional().default("dark-midnight"),
    timezone: z.string().optional().default("Asia/Calcutta"),
    weeklyDigest: z.boolean().optional().default(false),
  })
  .passthrough();
