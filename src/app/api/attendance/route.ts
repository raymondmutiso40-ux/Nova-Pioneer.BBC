import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, requireCoach } from "@/lib/apiAuth";

// GET /api/attendance?sessionId=xxx  -> players + their attendance status for that session
export async function GET(req: NextRequest) {
  const { error } = await requireAnyRole();
  if (error) return error;

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

  const players = await prisma.player.findMany({
    where: { status: "Active" },
    orderBy: { name: "asc" },
    include: { attendances: { where: { sessionId } } },
  });

  const result = players.map((p) => ({
    id: p.id,
    name: p.name,
    grade: p.grade,
    position: p.position,
    status: p.attendances[0]?.status || "Present",
  }));

  return NextResponse.json(result);
}

// POST /api/attendance  { sessionId, records: [{ playerId, status }] }
export async function POST(req: NextRequest) {
  const { error } = await requireCoach();
  if (error) return error;

  const body = await req.json();
  const { sessionId, records } = body as {
    sessionId: string;
    records: { playerId: string; status: "Present" | "Absent" }[];
  };

  if (!sessionId || !Array.isArray(records)) {
    return NextResponse.json({ error: "sessionId and records[] are required" }, { status: 400 });
  }

  await Promise.all(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { playerId_sessionId: { playerId: r.playerId, sessionId } },
        update: { status: r.status },
        create: { playerId: r.playerId, sessionId, status: r.status },
      })
    )
  );

  return NextResponse.json({ success: true, saved: records.length });
}
