import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, requireCoach } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAnyRole();
  if (error) return error;

  const playerId = req.nextUrl.searchParams.get("playerId");

  const assessments = await prisma.assessment.findMany({
    where: playerId ? { playerId } : undefined,
    orderBy: { week: "asc" },
    include: { session: true },
  });

  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const { error } = await requireCoach();
  if (error) return error;

  const body = await req.json();
  const { playerId, sessionId, week, focusArea, skills, notes } = body as {
    playerId: string;
    sessionId: string;
    week: number;
    focusArea: string;
    skills: Record<string, number>;
    notes?: string;
  };

  if (!playerId || !sessionId || !week || !focusArea || !skills || Object.keys(skills).length === 0) {
    return NextResponse.json(
      { error: "playerId, sessionId, week, focusArea, and skills are required" },
      { status: 400 }
    );
  }

  const values = Object.values(skills);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const avgScore = Math.round((avg / 5) * 100);

  const assessment = await prisma.assessment.create({
    data: { playerId, sessionId, week, focusArea, skills, avgScore, notes },
  });

  return NextResponse.json(assessment, { status: 201 });
}
