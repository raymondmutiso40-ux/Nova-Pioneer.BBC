import { prisma } from "@/lib/prisma";
import NewAssessmentForm from "./NewAssessmentForm";

export default async function NewAssessmentPage() {
  const [players, sessions] = await Promise.all([
    prisma.player.findMany({ where: { status: "Active" }, orderBy: { name: "asc" } }),
    prisma.trainingSession.findMany({ orderBy: { date: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">New Assessment</h1>
      <p className="text-sm text-gray-500 mb-6">Rate a player's skills (1–5) for a training session.</p>
      <NewAssessmentForm
        players={JSON.parse(JSON.stringify(players))}
        sessions={JSON.parse(JSON.stringify(sessions))}
      />
    </div>
  );
}
