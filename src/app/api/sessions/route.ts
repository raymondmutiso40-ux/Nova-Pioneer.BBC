import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, requireCoach } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAnyRole();
  if (error) return error;

  const sessions = await prisma.trainingSession.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { error } = await requireCoach();
  if (error) return error;

  const body = await req.json();
  const { date, day, focusArea, time, court, coach } = body;

  if (!date || !day || !focusArea || !time || !court || !coach) {
    return NextResponse.json(
      { error: "date, day, focusArea, time, court, and coach are all required" },
      { status: 400 }
    );
  }

  const session = await prisma.trainingSession.create({
    data: { date: new Date(date), day, focusArea, time, court, coach },
  });

  return NextResponse.json(session, { status: 201 });
}
