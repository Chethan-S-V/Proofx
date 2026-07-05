import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, usersTable } from "../../db";
import { getServerUser, type AuthUser as User } from "../auth/service";
import {
  accountSettingsSchema,
  appearanceSettingsSchema,
  passwordSettingsSchema,
  preferenceSettingsSchema,
  settingsMetadataSchema,
} from "./schemas";

export type DashboardSettings = {
  aiSuggestions: boolean;
  autoSaveDrafts: boolean;
  codeActivityTracking: boolean;
  compactMode: boolean;
  dataExportReady: boolean;
  email: string;
  emailNotifications: boolean;
  highContrast: boolean;
  language: string;
  loginAlerts: boolean;
  privateProfile: boolean;
  productUpdates: boolean;
  proofReminders: boolean;
  reduceMotion: boolean;
  recruiterVisible: boolean;
  theme: string;
  timezone: string;
  weeklyDigest: boolean;
};

function getText(value: FormDataEntryValue | null) {
  return value?.toString() ?? "";
}

async function updateMetadata(patch: Record<string, unknown>) {
  const user = await getServerUser();

  if (!user) {
    throw new Error("User session was not found.");
  }

  await db.update(usersTable).set({ metadata: { ...user.user_metadata, ...patch }, updatedAt: new Date() }).where(eq(usersTable.id, user.id));

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile");
  revalidatePath("/home");
}

export function getDashboardSettings(user: User): DashboardSettings {
  const metadata = settingsMetadataSchema.parse(user.user_metadata ?? {});

  return {
    aiSuggestions: metadata.aiSuggestions,
    autoSaveDrafts: metadata.autoSaveDrafts,
    codeActivityTracking: metadata.codeActivityTracking,
    compactMode: metadata.compactMode,
    dataExportReady: metadata.dataExportReady,
    email: user.email ?? "",
    emailNotifications: metadata.emailNotifications,
    highContrast: metadata.highContrast,
    language: metadata.language,
    loginAlerts: metadata.loginAlerts,
    privateProfile: metadata.privateProfile,
    productUpdates: metadata.productUpdates,
    proofReminders: metadata.proofReminders,
    reduceMotion: metadata.reduceMotion,
    recruiterVisible: metadata.recruiterVisible,
    theme: metadata.theme,
    timezone: metadata.timezone,
    weeklyDigest: metadata.weeklyDigest,
  };
}

export async function updateAccountSettings(formData: FormData) {
  "use server";

  const input = accountSettingsSchema.parse({
    email: getText(formData.get("email")),
    language: getText(formData.get("language")),
    timezone: getText(formData.get("timezone")),
  });
  const user = await getServerUser();

  if (!user) {
    throw new Error("User session was not found.");
  }

  await db
    .update(usersTable)
    .set({
      email: input.email === user.email ? user.email : input.email.toLowerCase(),
      metadata: {
        ...user.user_metadata,
        language: input.language,
        timezone: input.timezone,
      },
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id));

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile");
  revalidatePath("/home");
}

export async function updatePasswordSettings(formData: FormData) {
  "use server";

  const input = passwordSettingsSchema.parse({
    confirmPassword: getText(formData.get("confirmPassword")),
    password: getText(formData.get("password")),
  });
  const bcrypt = await import("bcryptjs");
  const user = await getServerUser();

  if (!user) {
    throw new Error("User session was not found.");
  }

  await db
    .update(usersTable)
    .set({ passwordHash: await bcrypt.hash(input.password, 12), updatedAt: new Date() })
    .where(eq(usersTable.id, user.id));
  revalidatePath("/dashboard/settings");
}

export async function updateAppearanceSettings(formData: FormData) {
  "use server";

  await updateMetadata(
    appearanceSettingsSchema.parse({
      compactMode: formData.get("compactMode") === "on",
      highContrast: formData.get("highContrast") === "on",
      reduceMotion: formData.get("reduceMotion") === "on",
      theme: getText(formData.get("theme")),
    }),
  );
}

export async function updatePreferenceSettings(formData: FormData) {
  "use server";

  await updateMetadata(
    preferenceSettingsSchema.parse({
      aiSuggestions: formData.get("aiSuggestions") === "on",
      autoSaveDrafts: formData.get("autoSaveDrafts") === "on",
      codeActivityTracking: formData.get("codeActivityTracking") === "on",
      dataExportReady: formData.get("dataExportReady") === "on",
      emailNotifications: formData.get("emailNotifications") === "on",
      loginAlerts: formData.get("loginAlerts") === "on",
      privateProfile: formData.get("privateProfile") === "on",
      productUpdates: formData.get("productUpdates") === "on",
      proofReminders: formData.get("proofReminders") === "on",
      recruiterVisible: formData.get("recruiterVisible") === "on",
      weeklyDigest: formData.get("weeklyDigest") === "on",
    }),
  );
}
