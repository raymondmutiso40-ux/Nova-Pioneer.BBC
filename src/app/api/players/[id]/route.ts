import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, requireCoach } from "@/lib/apiAuth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAnyRole();
  if (error) return error;

  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      assessments: { orderBy: { week: "asc" } },
      attendances: { include: { session: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(player);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireCoach();
  if (error) return error;

  const body = await req.json();
  const player = await prisma.player.update({
    where: { id: params.id },
    data: {
      name: body.name,
      grade: body.grade,
      position: body.position,
      status: body.status,
      dob: body.dob ? new Date(body.dob) : undefined,
    },
  });

  return NextResponse.json(player);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireCoach();
  if (error) return error;

  await prisma.player.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
