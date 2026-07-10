import Link from "next/link";
import { redirect } from "next/navigation";
import { OrganizationCreateForm } from "../../../src/features/organizations/components/organization-create-form";
import { getServerUser } from "../../../src/lib/auth/service";

export default async function CreateOrganizationPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cyan-300">Create Organization</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build a public ProofX identity for your organization.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Every claim here should support a future proof, verification, or review trail.</p>
          </div>
          <Link className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300" href="/organizations">
            Back to discovery
          </Link>
        </div>
        <OrganizationCreateForm />
      </div>
    </main>
  );
}
