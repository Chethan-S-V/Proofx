import { loginSchema } from "../../../src/lib/auth/schemas";
import { loginWithEmail, signInWithOAuth } from "../../../src/lib/auth/service";
import Link from "next/link";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    authError?: string;
    emailError?: string;
    oauthError?: string;
    passwordError?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const emailError = params?.emailError;
  const passwordError = params?.passwordError;
  const authError = params?.authError ?? params?.oauthError;

  async function loginAction(formData: FormData) {
    "use server";

    const parsedInput = loginSchema.safeParse({
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
    });

    if (!parsedInput.success) {
      const redirectParams = new URLSearchParams();
      const hasEmailError = parsedInput.error.issues.some((issue) => issue.path.includes("email"));
      const hasPasswordError = parsedInput.error.issues.some((issue) => issue.path.includes("password"));

      if (hasEmailError) {
        redirectParams.set("emailError", "Invalid email.");
      }

      if (hasPasswordError) {
        redirectParams.set("passwordError", "Invalid password.");
      }

      redirect(`/login?${redirectParams.toString()}`);
    }

    const input = parsedInput.data;

    const { error } = await loginWithEmail(input);

    if (error) {
      const redirectParams = new URLSearchParams();
      const isPasswordError = error.message.toLowerCase().includes("password");

      redirectParams.set(isPasswordError ? "passwordError" : "emailError", error.message);

      redirect(`/login?${redirectParams.toString()}`);
    }

    redirect("/home");
  }

  async function oauthLogin(formData: FormData) {
    "use server";

    const provider = formData.get("provider") as "google" | "github" | "apple";
    const { url, error } = await signInWithOAuth(provider);

    if (error) {
      throw error;
    }

    if (url) {
      redirect(url);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f9] text-slate-950">
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .oauth-btn {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .oauth-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 35px rgba(15, 23, 42, 0.1);
        }
        .wet-footer-layer-light {
          display: none;
        }
        .wet-footer-layer-dark {
          color: #0f172a;
        }
        .wet-footer-layer-dark img {
          filter: brightness(0) saturate(100%);
        }
        @media (min-width: 1024px) {
          .wet-footer-layer-light,
          .wet-footer-layer-dark {
            display: flex;
            inset: 0;
            position: absolute;
          }
          .wet-footer-layer-dark {
            color: #0f172a;
            clip-path: inset(0 50% 0 0);
          }
          .wet-footer-layer-light {
            color: #ffffff;
            clip-path: inset(0 0 0 50%);
          }
        }
      `}</style>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="relative grid w-full grid-cols-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="animate-slide-in-left flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-[34rem]">
              <Link href="/" className="text-base font-semibold tracking-[0.18em] text-slate-950">
                PROOFX
              </Link>

              <div className="mt-12 mb-8">
                <p className="text-sm font-medium text-slate-500">Welcome back</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">Sign in to ProofX</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Continue managing your verified records and professional proof profile.
                </p>
                {authError ? (
                  <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <form action={oauthLogin}>
                  <input type="hidden" name="provider" value="google" />
                  <button
                    type="submit"
                    className="oauth-btn flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                </form>

                <form action={oauthLogin}>
                  <input type="hidden" name="provider" value="github" />
                  <button
                    type="submit"
                    className="oauth-btn flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </form>

                <form action={oauthLogin}>
                  <input type="hidden" name="provider" value="apple" />
                  <button
                    type="submit"
                    className="oauth-btn flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M16.37 1.43c0 1.14-.49 2.27-1.18 3.08-.74.89-1.97 1.57-3.16 1.48-.13-1.1.36-2.25 1.04-3.01.78-.86 2.1-1.52 3.3-1.55z" />
                      <path d="M20.94 17.19c-.55 1.27-.82 1.84-1.53 2.96-1 1.54-2.4 3.45-4.14 3.47-1.54.01-1.94-1.01-4.03-1-2.1.01-2.54 1.01-4.08 1-1.73-.02-3.05-1.74-4.05-3.28C.34 16.07.05 11.07 1.76 8.41c1.21-1.89 3.14-3 4.94-3 1.83 0 2.99 1.01 4.5 1.01 1.47 0 2.37-1.01 4.49-1.01 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.31 7.85.74 9.4z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </form>
              </div>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <form action={loginAction} className="space-y-5">
                <label className="block">
                  {emailError ? (
                    <span className="mb-2 block rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {emailError}
                    </span>
                  ) : null}
                  <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    placeholder="john@example.com"
                  />
                </label>
                <label className="block">
                  {passwordError ? (
                    <span className="mb-2 block rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {passwordError}
                    </span>
                  ) : null}
                  <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    placeholder="Your password"
                  />
                </label>
                <button
                  type="submit"
                  className="h-12 w-full rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                New to ProofX?{" "}
                <Link href="/signup" className="font-semibold text-slate-950 hover:text-slate-700">
                  Create account
                </Link>
              </p>
            </div>
          </section>

          <section className="animate-slide-in-right flex flex-col justify-between bg-slate-950 p-6 text-white sm:p-10 lg:min-h-[44rem] lg:p-12">
            <div className="max-w-xl">
              <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Proof workspace
              </p>
              <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Your verified record stays ready.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-300">
                Return to reviewed proofs, identity signals, and the credentials you can share with confidence.
              </p>
            </div>

            <div className="mt-12 grid gap-3">
              <div className="animate-fade-in-up rounded-lg border border-white/10 bg-white/[0.04] p-4" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-300">Profile trust</span>
                  <span className="text-sm font-semibold text-cyan-200">Active</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[86%] rounded-full bg-cyan-300" />
                </div>
              </div>

              <div className="animate-fade-in-up grid gap-3 sm:grid-cols-3" style={{ animationDelay: "0.3s" }}>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-2xl font-semibold text-white">12</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Proofs</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-2xl font-semibold text-white">4</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Reviews</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-2xl font-semibold text-white">1</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Profile</p>
                </div>
              </div>
            </div>
          </section>

          <Link aria-label="Open Wild En Tree" className="absolute bottom-0 left-1/2 z-20 h-16 w-36 -translate-x-1/2 lg:left-[52.5%]" href="/wet" rel="noreferrer" target="_blank">
            <div className="wet-footer-layer-dark flex h-full flex-col items-center justify-center gap-1 text-xs font-semibold tracking-[0.08em]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="h-6 w-10 object-contain" src="/wet-infinity-logo-white.png" />
              <span>Made with WET</span>
            </div>
            <div className="wet-footer-layer-light h-full flex-col items-center justify-center gap-1 text-xs font-semibold tracking-[0.08em]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="h-6 w-10 object-contain" src="/wet-infinity-logo-white.png" />
              <span>Made with WET</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
