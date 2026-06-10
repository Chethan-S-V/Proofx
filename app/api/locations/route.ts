import { NextResponse } from "next/server";
import { getServerUser } from "../../../src/lib/auth/service";
import { searchLocations } from "../../../src/lib/locations/service";

export async function GET(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const countryCode = url.searchParams.get("country") ?? "";
  const query = url.searchParams.get("q") ?? "";

  return NextResponse.json({ locations: await searchLocations(countryCode, query) });
}
