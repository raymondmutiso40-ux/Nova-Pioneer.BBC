import { prisma } from "@/lib/prisma";
import PlayersTable from "./PlayersTable";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">Players</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your team roster.</p>
      <PlayersTable initialPlayers={players} />
    </div>
  );
}
