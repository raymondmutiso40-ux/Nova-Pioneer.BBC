import { prisma } from "@/lib/prisma";
import SessionsTable from "./SessionsTable";

export default async function SessionsPage() {
  const sessions = await prisma.trainingSession.findMany({ orderBy: { date: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">Sessions (Training Plan)</h1>
      <p className="text-sm text-gray-500 mb-6">Schedule and manage training sessions for the term.</p>
      <SessionsTable initialSessions={JSON.parse(JSON.stringify(sessions))} />
    </div>
  );
}
