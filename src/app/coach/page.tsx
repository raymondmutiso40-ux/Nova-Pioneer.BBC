import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import Link from "next/link";

export default async function CoachOverview() {
  const [players, sessions, attendances, assessments] = await Promise.all([
    prisma.player.findMany(),
    prisma.trainingSession.findMany({ orderBy: { date: "asc" } }),
    prisma.attendance.findMany(),
    prisma.assessment.findMany(),
  ]);

  const activePlayers = players.filter((p) => p.status === "Active").length;
  const attendancePct = attendances.length
    ? Math.round((attendances.filter((a) => a.status === "Present").length / attendances.length) * 100)
    : 0;
  const avgScore = assessments.length
    ? (assessments.reduce((a, b) => a + b.avgScore, 0) / assessments.length / 20).toFixed(1)
    : "0.0";

  const upcoming = sessions.filter((s) => new Date(s.date) >= new Date()).slice(0, 3);

  const byPlayer: Record<string, typeof assessments> = {};
  for (const a of assessments) {
    byPlayer[a.playerId] = byPlayer[a.playerId] || [];
    byPlayer[a.playerId].push(a);
  }
  let totalGrowth = 0;
  let growthCount = 0;
  for (const pid in byPlayer) {
    const list = byPlayer[pid].sort((a, b) => a.week - b.week);
    if (list.length >= 2) {
      totalGrowth += ((list[list.length - 1].avgScore - list[0].avgScore) / list[0].avgScore) * 100;
      growthCount++;
    }
  }
  const avgGrowth = growthCount ? Math.round(totalGrowth / growthCount) : 0;

  const recent = players
    .map((p) => {
      const pa = attendances.filter((a) => a.playerId === p.id);
      const pAssess = (byPlayer[p.id] || []).sort((a, b) => a.week - b.week);
      const pct = pa.length ? Math.round((pa.filter((a) => a.status === "Present").length / pa.length) * 100) : 0;
      const growth =
        pAssess.length >= 2
          ? Math.round(((pAssess[pAssess.length - 1].avgScore - pAssess[0].avgScore) / pAssess[0].avgScore) * 100)
          : 0;
      const latestAvg = pAssess.length ? (pAssess[pAssess.length - 1].avgScore / 20).toFixed(1) : "-";
      return { ...p, pct, growth, latestAvg };
    })
    .slice(0, 4);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy">Welcome back, Coach 👋</h1>
      <p className="text-sm text-gray-500 mb-6">Here's what's happening with your team.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Players Active" value={activePlayers} />
        <StatCard label="Sessions This Term" value={sessions.length} />
        <StatCard label="Avg Attendance" value={`${attendancePct}%`} />
        <StatCard label="Avg Skill Score" value={`${avgScore} / 5`} trend={`+${avgGrowth}% growth`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-navy mb-3">Upcoming Sessions</h2>
          <div className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-gray-400">No upcoming sessions.</p>}
            {upcoming.map((s) => (
              <div key={s.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                <p className="font-medium text-navy">
                  {new Date(s.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
                  • {s.time}
                </p>
                <p className="text-gray-500">{s.focusArea} · {s.court}</p>
              </div>
            ))}
          </div>
          <Link href="/coach/sessions" className="text-xs text-gold-dark font-medium mt-3 inline-block">
            View Full Schedule →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-navy mb-3">Recent Player Activity</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs text-left">
                <th className="pb-2">Player</th>
                <th className="pb-2">Attendance</th>
                <th className="pb-2">Avg Score</th>
                <th className="pb-2">Growth</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-2 font-medium text-navy">{p.name}</td>
                  <td className="py-2">{p.pct}%</td>
                  <td className="py-2">{p.latestAvg} / 5</td>
                  <td className="py-2 text-green-600">+{p.growth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/coach/players" className="text-xs text-gold-dark font-medium mt-3 inline-block">
            View All Players →
          </Link>
        </div>
      </div>
    </div>
  );
}
