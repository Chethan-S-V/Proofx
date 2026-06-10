import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "../../../../src/lib/auth/service";
import { getUserStreakSummary, recordUserActivityForStreak } from "../../../../src/lib/streaks/service";

const activitySchema = z.object({
  endedAt: z.coerce.date(),
  startedAt: z.coerce.date(),
});

export async function POST(request: Request) {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = activitySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid activity payload" }, { status: 400 });
  }

  const summary = await recordUserActivityForStreak({
    activityType: "active_session",
    endedAt: parsed.data.endedAt,
    metadata: { source: "dashboard_activity_tracker" },
    startedAt: parsed.data.startedAt,
    userId: user.id,
  });

  return NextResponse.json(summary);
}

export async function GET() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getUserStreakSummary(user.id));
}
