import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnyRole, requireCoach } from "@/lib/apiAuth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAnyRole();
  if (error) return error;

  const session = await prisma.trainingSession.findUnique({
    where: { id: params.id },
    include: { attendances: { include: { player: true } } },
  });

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireCoach();
  if (error) return error;

  await prisma.trainingSession.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
