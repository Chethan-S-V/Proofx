import { NextResponse, type NextRequest } from "next/server";
import { completeOAuthSignIn } from "../../../../../../src/lib/auth/service";

const OAUTH_STATE_COOKIE = "proofx_oauth_state";
const SUPPORTED_PROVIDERS = ["google", "github"] as const;

type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isSupportedProvider(provider: string): provider is SupportedProvider {
  return SUPPORTED_PROVIDERS.includes(provider as SupportedProvider);
}

function getRedirect(request: NextRequest, path: string) {
  return new URL(path, request.url);
}

function getErrorRedirect(request: NextRequest, message: string) {
  const url = getRedirect(request, "/login");
  url.searchParams.set("oauthError", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const savedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!isSupportedProvider(provider)) {
    return getErrorRedirect(request, `${provider} sign-in is not available yet.`);
  }

  if (!code || !state || !savedState || state !== savedState) {
    return getErrorRedirect(request, "OAuth sign-in could not be verified.");
  }

  try {
    await completeOAuthSignIn(provider, code);
    const response = NextResponse.redirect(getRedirect(request, "/home"));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  } catch (error) {
    const response = getErrorRedirect(request, error instanceof Error ? error.message : "OAuth sign-in failed.");
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  }
}
