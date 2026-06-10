import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, usersTable } from "../../db";
import { getServerUser, type AuthUser as User } from "../auth/service";
import {
  accountSettingsSchema,
  passwordSettingsSchema,
  preferenceSettingsSchema,
  settingsMetadataSchema,
} from "./schemas";

export type DashboardSettings = {
  aiSuggestions: boolean;
  email: string;
  emailNotifications: boolean;
  firstName: string;
  language: string;
  lastName: string;
  privateProfile: boolean;
  productUpdates: boolean;
  recruiterVisible: boolean;
  timezone: string;
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
    email: user.email ?? "",
    emailNotifications: metadata.emailNotifications,
    firstName: typeof user.user_metadata?.firstName === "string" ? user.user_metadata.firstName : "",
    language: metadata.language,
    lastName: typeof user.user_metadata?.lastName === "string" ? user.user_metadata.lastName : "",
    privateProfile: metadata.privateProfile,
    productUpdates: metadata.productUpdates,
    recruiterVisible: metadata.recruiterVisible,
    timezone: metadata.timezone,
  };
}

export async function updateAccountSettings(formData: FormData) {
  "use server";

  const input = accountSettingsSchema.parse({
    email: getText(formData.get("email")),
    firstName: getText(formData.get("firstName")),
    language: getText(formData.get("language")),
    lastName: getText(formData.get("lastName")),
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
      firstName: input.firstName,
      language: input.language,
      lastName: input.lastName,
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

export async function updatePreferenceSettings(formData: FormData) {
  "use server";

  await updateMetadata(
    preferenceSettingsSchema.parse({
      aiSuggestions: formData.get("aiSuggestions") === "on",
      emailNotifications: formData.get("emailNotifications") === "on",
      privateProfile: formData.get("privateProfile") === "on",
      productUpdates: formData.get("productUpdates") === "on",
      recruiterVisible: formData.get("recruiterVisible") === "on",
    }),
  );
}
