import Link from "next/link";
import { redirect } from "next/navigation";
import { requestPasswordReset } from "../../../src/lib/auth/service";

export default async function ForgotPasswordPage({ searchParams }: { searchParams?: Promise<{ sent?: string }> }) {
  const params = await searchParams;
  async function request(formData: FormData) { "use server"; await requestPasswordReset(formData.get("email")?.toString() ?? ""); redirect("/forgot-password?sent=1"); }
  return <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#020617,#164e63)] p-5"><section className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl"><Link className="text-sm font-semibold tracking-[.18em]" href="/">PROOFX</Link><h1 className="mt-8 text-3xl font-semibold">Reset your password</h1><p className="mt-3 text-sm leading-6 text-slate-300">Enter your verified account email. We will only confirm the request, never whether that address has an account.</p>{params?.sent ? <p className="mt-5 rounded-lg bg-emerald-400/15 p-3 text-sm text-emerald-100">If the email is registered, reset instructions have been requested.</p> : <form action={request} className="mt-6 space-y-4"><input className="h-12 w-full rounded-xl border border-white/20 bg-slate-950/50 px-4 text-sm outline-none focus:border-cyan-300" name="email" placeholder="you@example.com" required type="email" /><button className="h-12 w-full rounded-xl bg-cyan-300 text-sm font-semibold text-slate-950" type="submit">Request reset link</button></form>}<Link className="mt-6 block text-center text-sm text-cyan-200" href="/login">Back to sign in</Link></section></main>;
}
