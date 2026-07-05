import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getOAuthAuthorizationUrl } from "../../../../../src/lib/auth/service";

const OAUTH_STATE_COOKIE = "proofx_oauth_state";
const SUPPORTED_PROVIDERS = ["google", "github"] as const;

type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isSupportedProvider(provider: string): provider is SupportedProvider {
  return SUPPORTED_PROVIDERS.includes(provider as SupportedProvider);
}

function getErrorRedirect(request: NextRequest, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("oauthError", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;

  if (!isSupportedProvider(provider)) {
    return getErrorRedirect(request, `${provider} sign-in is not available yet.`);
  }

  try {
    const state = randomBytes(24).toString("base64url");
    const response = NextResponse.redirect(getOAuthAuthorizationUrl(provider, state));

    response.cookies.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth sign-in could not start.";
    return getErrorRedirect(request, message);
  }
}
