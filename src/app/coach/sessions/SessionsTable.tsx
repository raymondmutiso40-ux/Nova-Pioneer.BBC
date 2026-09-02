"use client";

import { useState } from "react";

type TrainingSession = {
  id: string;
  date: string;
  day: string;
  focusArea: string;
  time: string;
  court: string;
  coach: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SessionsTable({ initialSessions }: { initialSessions: TrainingSession[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
    day: "Tue",
    focusArea: "",
    time: "",
    court: "Court 1",
    coach: "Maya",
  });

  async function addSession(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const newSession = await res.json();
      setSessions([...sessions, newSession].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setShowForm(false);
      setForm({ date: "", day: "Tue", focusArea: "", time: "", court: "Court 1", coach: "Maya" });
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold hover:bg-gold-dark text-navy text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + New Session
        </button>
      </div>

      {showForm && (
        <form onSubmit={addSession} className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5 bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Day</label>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-500 mb-1">Focus Area</label>
            <input
              required
              placeholder="e.g. Shooting & Offence"
              value={form.focusArea}
              onChange={(e) => setForm({ ...form, focusArea: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Time</label>
            <input
              required
              placeholder="3:30 - 5:30 PM"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Court</label>
            <input
              required
              placeholder="Court 1"
              value={form.court}
              onChange={(e) => setForm({ ...form, court: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Coach</label>
            <input
              required
              value={form.coach}
              onChange={(e) => setForm({ ...form, coach: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 md:col-span-6 bg-navy text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Session"}
          </button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
            <th className="py-2">Date</th>
            <th className="py-2">Day</th>
            <th className="py-2">Focus Area</th>
            <th className="py-2">Time</th>
            <th className="py-2">Court</th>
            <th className="py-2">Coach</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-gray-50">
              <td className="py-3 font-medium text-navy">
                {new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="py-3 text-gray-600">{s.day}</td>
              <td className="py-3 text-gray-600">{s.focusArea}</td>
              <td className="py-3 text-gray-600">{s.time}</td>
              <td className="py-3 text-gray-600">{s.court}</td>
              <td className="py-3 text-gray-600">{s.coach}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
