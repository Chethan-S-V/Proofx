import { eq } from "drizzle-orm";
import { resolveMx } from "dns/promises";
import bcrypt from "bcryptjs";
import { db, usersTable, type User } from "../../db";
import { env } from "../env";
import { clearSessionCookie, getSessionUserId, setSessionCookie } from "./session";
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "./schemas";

export enum Role {
  USER = "USER",
  RECRUITER = "RECRUITER",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export const DEFAULT_ROLE = Role.USER;

export type AuthUser = {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
};

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.metadata ?? {},
  };
}

function authError(message: string) {
  return { error: new Error(message), data: { session: null, user: null } };
}

async function canReceiveEmail(email: string) {
  const domain = email.split("@").at(1);

  if (!domain || domain === "localhost") {
    return false;
  }

  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function loginWithEmail(input: LoginInput) {
  loginSchema.parse(input);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, input.email.toLowerCase())).limit(1);

  if (!user) {
    return authError("Invalid email.");
  }

  if (!(await bcrypt.compare(input.password, user.passwordHash))) {
    return authError("Invalid password.");
  }

  await setSessionCookie(user.id);

  return { error: null, data: { session: { user: toAuthUser(user) }, user: toAuthUser(user) } };
}

export async function signupWithEmail(input: SignupInput) {
  signupSchema.parse(input);

  const email = input.email.toLowerCase();

  if (!(await canReceiveEmail(email))) {
    return authError("Enter a real email address that can receive mail.");
  }

  const [existingUser] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (existingUser) {
    return authError("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const metadata = {
    role: Role.USER,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
  };
  const userId = crypto.randomUUID();

  await db.insert(usersTable).values({
    id: userId,
    email,
    passwordHash,
    metadata,
  });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  await setSessionCookie(userId);

  return { error: null, data: { session: { user: toAuthUser(user) }, user: toAuthUser(user) } };
}

export async function logoutCurrentUser() {
  await clearSessionCookie();
  return { error: null };
}

export async function getServerSession() {
  const userId = await getSessionUserId();

  if (!userId) {
    return { data: { session: null }, error: null };
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (!user) {
    await clearSessionCookie();
    return { data: { session: null }, error: null };
  }

  return { data: { session: { user: toAuthUser(user) } }, error: null };
}

export async function getServerUser() {
  const session = await getServerSession();
  return session.data.session?.user ?? null;
}

export function getUserRole(user: { user_metadata?: Record<string, unknown> } | null) {
  return (user?.user_metadata?.role as Role | undefined) ?? Role.USER;
}

export async function signInWithOAuth(provider: "google" | "github" | "apple") {
  return { error: null, url: `${getAppUrl()}/api/auth/oauth/${provider}` };
}

type OAuthProvider = "google" | "github";

type OAuthProfile = {
  avatarUrl: string | null;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  fullName: string | null;
  lastName: string | null;
  providerAccountId: string;
};

function getAppUrl() {
  return env.APP_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function getRedirectUri(provider: OAuthProvider) {
  return `${getAppUrl()}/api/auth/oauth/${provider}/callback`;
}

function requireOAuthConfig(provider: OAuthProvider) {
  const config =
    provider === "google"
      ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
      : { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET };

  if (!config.clientId || !config.clientSecret) {
    throw new Error(`${provider} OAuth credentials are not configured.`);
  }

  return { clientId: config.clientId, clientSecret: config.clientSecret };
}

export function getOAuthAuthorizationUrl(provider: OAuthProvider, state: string) {
  const { clientId } = requireOAuthConfig(provider);

  if (provider === "google") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", getRedirectUri("google"));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return url.toString();
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getRedirectUri("github"));
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}

async function fetchGoogleProfile(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret } = requireOAuthConfig("google");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getRedirectUri("google"),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Google sign-in token exchange failed.");
  }

  const token = (await tokenResponse.json()) as { access_token?: string };

  if (!token.access_token) {
    throw new Error("Google sign-in did not return an access token.");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${token.access_token}` },
  });

  if (!profileResponse.ok) {
    throw new Error("Google profile request failed.");
  }

  const profile = (await profileResponse.json()) as {
    email?: string;
    email_verified?: boolean;
    family_name?: string;
    given_name?: string;
    name?: string;
    picture?: string;
    sub?: string;
  };

  if (!profile.email || !profile.sub) {
    throw new Error("Google profile did not include an email address.");
  }

  return {
    avatarUrl: profile.picture ?? null,
    email: profile.email.toLowerCase(),
    emailVerified: Boolean(profile.email_verified),
    firstName: profile.given_name ?? null,
    fullName: profile.name ?? null,
    lastName: profile.family_name ?? null,
    providerAccountId: profile.sub,
  };
}

async function fetchGithubProfile(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret } = requireOAuthConfig("github");
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getRedirectUri("github"),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("GitHub sign-in token exchange failed.");
  }

  const token = (await tokenResponse.json()) as { access_token?: string };

  if (!token.access_token) {
    throw new Error("GitHub sign-in did not return an access token.");
  }

  const [profileResponse, emailsResponse] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token.access_token}` },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token.access_token}` },
    }),
  ]);

  if (!profileResponse.ok || !emailsResponse.ok) {
    throw new Error("GitHub profile request failed.");
  }

  const profile = (await profileResponse.json()) as { avatar_url?: string; id?: number; login?: string; name?: string | null };
  const emails = (await emailsResponse.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
  const primaryEmail = emails.find((item) => item.primary && item.verified) ?? emails.find((item) => item.verified);

  if (!profile.id || !primaryEmail) {
    throw new Error("GitHub profile did not include a verified email address.");
  }

  const [firstName, ...lastNameParts] = (profile.name ?? "").split(" ").filter(Boolean);

  return {
    avatarUrl: profile.avatar_url ?? null,
    email: primaryEmail.email.toLowerCase(),
    emailVerified: primaryEmail.verified,
    firstName: firstName || null,
    fullName: profile.name ?? profile.login ?? null,
    lastName: lastNameParts.join(" ") || null,
    providerAccountId: profile.id.toString(),
  };
}

export async function completeOAuthSignIn(provider: OAuthProvider, code: string) {
  const oauthProfile = provider === "google" ? await fetchGoogleProfile(code) : await fetchGithubProfile(code);
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, oauthProfile.email)).limit(1);
  const metadataPatch = {
    avatar_url: oauthProfile.avatarUrl,
    firstName: oauthProfile.firstName,
    full_name: oauthProfile.fullName,
    lastName: oauthProfile.lastName,
    name: oauthProfile.fullName,
    oauth: {
      provider,
      providerAccountId: oauthProfile.providerAccountId,
    },
    role: Role.USER,
  };

  if (existingUser) {
    await db
      .update(usersTable)
      .set({
        isEmailVerified: existingUser.isEmailVerified || oauthProfile.emailVerified,
        metadata: { ...existingUser.metadata, ...metadataPatch },
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, existingUser.id));
    await setSessionCookie(existingUser.id);
    return;
  }

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 12);

  await db.insert(usersTable).values({
    email: oauthProfile.email,
    id: userId,
    isEmailVerified: oauthProfile.emailVerified,
    metadata: metadataPatch,
    passwordHash,
  });

  await setSessionCookie(userId);
}
