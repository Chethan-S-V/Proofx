import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AuthLayout as AuthShell } from "../../src/components/layouts/auth-layout";
import { getServerSession } from "../../src/lib/auth/service";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (session.data.session) {
    redirect("/home");
  }

  return <AuthShell>{children}</AuthShell>;
}
