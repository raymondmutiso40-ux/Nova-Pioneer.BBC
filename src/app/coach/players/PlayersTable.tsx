"use client";

import { useState } from "react";
import Link from "next/link";

type Player = {
  id: string;
  name: string;
  grade: string;
  position: string;
  status: string;
  photoUrl?: string | null;
};

export default function PlayersTable({ initialPlayers }: { initialPlayers: Player[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", position: "", status: "Active", photoUrl: "" });
  const [photoName, setPhotoName] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const newPlayer = await res.json();
      setPlayers([...players, newPlayer]);
      setShowForm(false);
      setForm({ name: "", grade: "", position: "", status: "Active", photoUrl: "" });
      setPhotoName("");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold hover:bg-gold-dark text-navy text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Add Player
        </button>
      </div>

      {showForm && (
        <form onSubmit={addPlayer} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 bg-gray-50 p-4 rounded-lg">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Grade (e.g. 7A)"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Position"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <label className="col-span-2 md:col-span-4 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-pointer">
            Student photo {photoName && `— ${photoName}`}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPhotoName(file.name);
                const reader = new FileReader();
                reader.onload = () => setForm((current) => ({ ...current, photoUrl: String(reader.result) }));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 md:col-span-4 bg-navy text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Player"}
          </button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
            <th className="py-2">Player</th>
            <th className="py-2">Grade</th>
            <th className="py-2">Position</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3">
                <Link href={`/coach/players/${p.id}`} className="flex items-center gap-2 font-medium text-navy">
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
              <td className="py-3 text-gray-600">{p.grade}</td>
              <td className="py-3 text-gray-600">{p.position}</td>
              <td className="py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
