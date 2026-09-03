import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, requireCoach } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAnyRole();
  if (error) return error;

  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const { error } = await requireCoach();
  if (error) return error;

  const body = await req.json();
  const { name, grade, position, status, dob, photoUrl } = body;

  if (!name || !grade || !position) {
    return NextResponse.json({ error: "name, grade, and position are required" }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      name,
      grade,
      position,
      status: status || "Active",
      dob: dob ? new Date(dob) : undefined,
      photoUrl: typeof photoUrl === "string" ? photoUrl : undefined,
    },
  });

  return NextResponse.json(player, { status: 201 });
}
