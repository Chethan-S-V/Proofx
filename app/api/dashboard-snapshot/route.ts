import { NextResponse } from "next/server";
import { getServerUser } from "../../../src/lib/auth/service";
import { getDashboardSnapshot } from "../../../src/lib/home/dashboard-snapshot.service";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getDashboardSnapshot(user.id), { headers: { "Cache-Control": "no-store" } });
}
