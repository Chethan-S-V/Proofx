import { NextResponse } from "next/server";
import { getServerUser } from "../../../src/lib/auth/service";
import { searchGlobal } from "../../../src/lib/search/service";

export async function GET(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";

  return NextResponse.json(await searchGlobal(query, user.id));
}
