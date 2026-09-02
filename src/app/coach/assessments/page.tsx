import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AssessmentsPage() {
  const assessments = await prisma.assessment.findMany({
    orderBy: { createdAt: "desc" },
    include: { player: true, session: true },
    take: 50,
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy mb-1">Assessments</h1>
          <p className="text-sm text-gray-500">Skill ratings logged per player, per session.</p>
        </div>
        <Link
          href="/coach/assessments/new"
          className="bg-gold hover:bg-gold-dark text-navy text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + New Assessment
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
              <th className="py-2">Player</th>
              <th className="py-2">Week</th>
              <th className="py-2">Focus Area</th>
              <th className="py-2">Avg Score</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="border-b border-gray-50">
                <td className="py-3 font-medium text-navy">
                  <Link href={`/coach/players/${a.playerId}`}>{a.player.name}</Link>
                </td>
                <td className="py-3 text-gray-600">Week {a.week}</td>
                <td className="py-3 text-gray-600">{a.focusArea}</td>
                <td className="py-3 text-gray-600">{a.avgScore}/100</td>
                <td className="py-3 text-gray-400 text-xs">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  No assessments logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
