import { prisma } from "@/lib/prisma";
import TrendChart from "@/components/TrendChart";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ModeratorPlayerDetail({ params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { assessments: { orderBy: { week: "asc" } }, attendances: true },
  });

  if (!player) notFound();

  const attendancePct = player.attendances.length
    ? Math.round(
        (player.attendances.filter((a) => a.status === "Present").length / player.attendances.length) * 100
      )
    : 0;
  const trendData = player.assessments.map((a) => ({ week: `W${a.week}`, score: a.avgScore }));
  const scores = trendData.map((d) => d.score);
  const growth = scores.length >= 2 ? Math.round(((scores[scores.length - 1] - scores[0]) / scores[0]) * 100) : 0;

  return (
    <div>
      <Link href="/moderator" className="text-xs text-gray-400 hover:text-gray-600">
        ← Back to All Players
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
          ⬇ Download Report
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
        <h2 className="font-semibold text-navy mb-1">Performance Trend</h2>
        <p className="text-xs text-gray-400 mb-3">Average skill score over term</p>
        {trendData.length > 0 ? (
          <TrendChart data={trendData} />
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center">No assessments recorded yet.</p>
        )}
      </div>
    </div>
  );
}
