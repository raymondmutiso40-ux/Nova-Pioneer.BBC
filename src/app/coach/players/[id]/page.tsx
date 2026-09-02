import { prisma } from "@/lib/prisma";
import TrendChart from "@/components/TrendChart";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      assessments: { orderBy: { week: "asc" } },
      attendances: true,
    },
  });

  if (!player) notFound();

  const attendancePct = player.attendances.length
    ? Math.round(
        (player.attendances.filter((a) => a.status === "Present").length / player.attendances.length) * 100
      )
    : 0;

  const trendData = player.assessments.map((a) => ({ week: `W${a.week}`, score: a.avgScore }));
  const scores = player.assessments.map((a) => a.avgScore);
  const growth =
    scores.length >= 2 ? Math.round(((scores[scores.length - 1] - scores[0]) / scores[0]) * 100) : 0;
  const bestWeek = player.assessments.reduce(
    (best, a) => (a.avgScore > (best?.avgScore ?? 0) ? a : best),
    player.assessments[0]
  );
  const avgPerWeek =
    player.assessments.length >= 2
      ? ((scores[scores.length - 1] - scores[0]) / (player.assessments.length - 1)).toFixed(1)
      : "0.0";

  return (
    <div>
      <Link href="/coach/players" className="text-xs text-gray-400 hover:text-gray-600">
        ← Back to Players
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-3 flex justify-between items-start flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold/30 flex items-center justify-center text-xl font-bold text-navy">
            {player.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">{player.name}</h1>
            <p className="text-sm text-gray-500">Grade {player.grade} • {player.position}</p>
            <div className="flex gap-2 mt-2">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Attendance: {attendancePct}%
              </span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Sessions: {player.attendances.filter((a) => a.status === "Present").length}/
                {player.attendances.length}
              </span>
              <span className="bg-gold/20 text-gold-dark text-xs px-2 py-1 rounded-full">
                Growth: +{growth}%
              </span>
            </div>
          </div>
        </div>
        <a
          href={`/api/reports/${player.id}`}
          className="bg-gold hover:bg-gold-dark text-navy text-sm font-semibold px-4 py-2 rounded-lg"
        >
          ⬇ Export PDF Report
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-navy mb-1">Performance Trend</h2>
          <p className="text-xs text-gray-400 mb-3">Average skill score over term • Upward trajectory</p>
          {trendData.length > 0 ? (
            <TrendChart data={trendData} />
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">No assessments recorded yet.</p>
          )}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Avg Growth</p>
              <p className="font-bold text-green-600">+{avgPerWeek} pts/wk</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Best Week</p>
              <p className="font-bold text-navy">{bestWeek ? `Week ${bestWeek.week}` : "-"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Term Progress</p>
              <p className="font-bold text-navy">{player.assessments.length}/9 weeks</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-navy mb-3">Assessment History</h2>
          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {player.assessments.map((a) => (
              <div key={a.id} className="border-b border-gray-100 pb-2">
                <p className="text-sm font-medium text-navy">Week {a.week} · {a.focusArea}</p>
                <p className="text-xs text-gray-500">Avg score: {a.avgScore}/100</p>
                {a.notes && <p className="text-xs text-gray-400 italic">"{a.notes}"</p>}
              </div>
            ))}
            {player.assessments.length === 0 && (
              <p className="text-sm text-gray-400">No assessments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
