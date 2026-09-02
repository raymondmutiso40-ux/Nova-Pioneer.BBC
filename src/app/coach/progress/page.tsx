import { prisma } from "@/lib/prisma";
import ProgressView from "./ProgressView";

export default async function ProgressPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    include: { assessments: { orderBy: { week: "asc" } } },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">Progress Analysis</h1>
      <p className="text-sm text-gray-500 mb-6">Track each player's skill trend across the term.</p>
      <ProgressView players={JSON.parse(JSON.stringify(players))} />
    </div>
  );
}
