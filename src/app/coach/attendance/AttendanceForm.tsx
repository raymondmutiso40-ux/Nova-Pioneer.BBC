"use client";

import { useEffect, useState } from "react";

type TrainingSession = {
  id: string;
  date: string;
  focusArea: string;
};

type PlayerRow = {
  id: string;
  name: string;
  grade: string;
  position: string;
  status: "Present" | "Absent";
};

export default function AttendanceForm({ sessions }: { sessions: TrainingSession[] }) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id || "");
  const [rows, setRows] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetch(`/api/attendance?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(data);
        setLoading(false);
        setSaved(false);
      });
  }, [sessionId]);

  function toggle(playerId: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === playerId ? { ...r, status: r.status === "Present" ? "Absent" : "Present" } : r))
    );
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        records: rows.map((r) => ({ playerId: r.id, status: r.status })),
      }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
      <label className="text-xs text-gray-500">Select Session</label>
      <select
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 mb-5"
      >
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} —{" "}
            {s.focusArea}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="text-sm text-gray-400">Loading players...</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gold/30 flex items-center justify-center text-xs font-bold text-navy">
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span className="text-sm font-medium text-navy">{r.name}</span>
              </div>
              <button
                onClick={() => toggle(r.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  r.status === "Present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {r.status}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || rows.length === 0}
        className="w-full mt-5 bg-navy hover:bg-navy-light text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-60"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Attendance"}
      </button>
    </div>
  );
}
