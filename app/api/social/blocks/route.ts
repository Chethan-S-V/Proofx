import { NextResponse } from "next/server";
import { getServerUser } from "../../../../src/lib/auth/service";
import { blockUser, unblockUser } from "../../../../src/lib/social/block.service";

export async function POST(request: Request) { const user = await getServerUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const body = await request.json() as { userId?: string; reason?: string }; if (!body.userId) return NextResponse.json({ error: "User is required" }, { status: 400 }); await blockUser(user.id, body.userId, body.reason); return NextResponse.json({ ok: true }); }
export async function DELETE(request: Request) { const user = await getServerUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const body = await request.json() as { userId?: string }; if (!body.userId) return NextResponse.json({ error: "User is required" }, { status: 400 }); await unblockUser(user.id, body.userId); return NextResponse.json({ ok: true }); }
