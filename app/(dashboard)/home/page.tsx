import { redirect } from "next/navigation";
import { getServerUser } from "../../../src/lib/auth/service";

export default async function HomePage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="-mx-4 -my-6 min-h-[calc(100vh-4rem)] bg-slate-950 sm:-mx-6 lg:-mx-8" />;
}
