import { prisma } from "@/lib/prisma";
import TrendChart from "@/components/TrendChart";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ModeratorPlayerDetail({ params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      assessments: { orderBy: { week: "asc" } },
      attendances: { include: { session: true }, orderBy: { createdAt: "desc" } },
    },
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
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={player.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gold/30 flex items-center justify-center text-xl font-bold text-navy">
              {player.name.split(" ").map((n) => n[0]).join("")}
            </div>
          )}
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
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Sessions: {player.attendances.filter((a) => a.status === "Present").length}/{player.attendances.length}
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
        <h2 className="font-semibold text-navy mb-3">Attendance History</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {player.attendances.map((attendance) => (
            <div key={attendance.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm">
              <span className="text-gray-600">{new Date(attendance.session.date).toLocaleDateString()}</span>
              <span className={attendance.status === "Present" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {attendance.status}
              </span>
            </div>
          ))}
          {player.attendances.length === 0 && <p className="text-sm text-gray-400">No attendance records yet.</p>}
        </div>
      </div>
    </div>
  );
}
