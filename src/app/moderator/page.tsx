import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ModeratorPlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    include: { assessments: { orderBy: { week: "asc" } }, attendances: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">Player Performance</h1>
      <p className="text-sm text-gray-500 mb-6">
        View each player's progress and download their performance report. Read-only access.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
              <th className="py-2 px-4">Player</th>
              <th className="py-2 px-4">Grade</th>
              <th className="py-2 px-4">Attendance</th>
              <th className="py-2 px-4">Avg Score</th>
              <th className="py-2 px-4">Growth</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const attendancePct = p.attendances.length
                ? Math.round(
                    (p.attendances.filter((a) => a.status === "Present").length / p.attendances.length) * 100
                  )
                : 0;
              const scores = p.assessments.map((a) => a.avgScore);
              const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              const growth =
                scores.length >= 2 ? Math.round(((scores[scores.length - 1] - scores[0]) / scores[0]) * 100) : 0;

              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/moderator/players/${p.id}`} className="flex items-center gap-2 font-medium text-navy">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-gold/30 flex items-center justify-center text-xs font-bold text-navy">
                          {p.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      )}
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.grade}</td>
                  <td className="py-3 px-4 text-gray-600">{attendancePct}%</td>
                  <td className="py-3 px-4 text-gray-600">{avg}/100</td>
                  <td className="py-3 px-4 text-green-600">+{growth}%</td>
                  <td className="py-3 px-4">
                    <a
                      href={`/api/reports/${p.id}`}
                      className="text-xs bg-gold hover:bg-gold-dark text-navy font-semibold px-3 py-1.5 rounded-lg"
                    >
                      ⬇ Download
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
