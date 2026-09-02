"use client";

import { useState } from "react";
import TrendChart from "@/components/TrendChart";

type Assessment = { week: number; avgScore: number; focusArea: string };
type Player = { id: string; name: string; grade: string; position: string; assessments: Assessment[] };

export default function ProgressView({ players }: { players: Player[] }) {
  const [playerId, setPlayerId] = useState(players[0]?.id || "");
  const player = players.find((p) => p.id === playerId);

  const trendData = (player?.assessments || []).map((a) => ({ week: `W${a.week}`, score: a.avgScore }));
  const scores = trendData.map((d) => d.score);
  const growth = scores.length >= 2 ? Math.round(((scores[scores.length - 1] - scores[0]) / scores[0]) * 100) : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const bestWeek = trendData.find((d) => d.score === bestScore)?.week || "-";
  const avgPerWeek =
    scores.length >= 2 ? ((scores[scores.length - 1] - scores[0]) / (scores.length - 1)).toFixed(1) : "0.0";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 text-sm border-b border-gray-100 pb-2 w-full">
          <span className="font-semibold text-navy border-b-2 border-gold pb-2">Trend</span>
        </div>
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <h2 className="font-semibold text-navy mb-3">Average Skill Score Over Time</h2>
      {trendData.length > 0 ? (
        <TrendChart data={trendData} />
      ) : (
        <p className="text-sm text-gray-400 py-10 text-center">No assessments recorded for this player yet.</p>
      )}

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Avg Growth</p>
          <p className="font-bold text-green-600">+{avgPerWeek} pts/wk</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Best Week</p>
          <p className="font-bold text-navy">{bestWeek}</p>
        </div>
        <div className="bg-gold/10 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Growth</p>
          <p className="font-bold text-navy">+{growth}%</p>
        </div>
      </div>
    </div>
  );
}
