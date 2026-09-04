"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { skillsForFocusArea, weekForFocusArea } from "@/lib/curriculum";

type Player = { id: string; name: string };
type TrainingSession = { id: string; date: string; focusArea: string };

export default function NewAssessmentForm({
  players,
  sessions,
}: {
  players: Player[];
  sessions: TrainingSession[];
}) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState(players[0]?.id || "");
  const [sessionId, setSessionId] = useState(sessions[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const session = sessions.find((s) => s.id === sessionId);
  const focusArea = session?.focusArea || "";
  const skillList = skillsForFocusArea(focusArea);
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(skillList.map((s) => [s, 4]))
  );

  function onSessionChange(id: string) {
    setSessionId(id);
    const s = sessions.find((x) => x.id === id);
    const skills = skillsForFocusArea(s?.focusArea || "");
    setRatings(Object.fromEntries(skills.map((sk) => [sk, 4])));
    setCustomSkill("");
  }

  function addSkill() {
    const skill = customSkill.trim();
    if (!skill || skill in ratings) return;
    setRatings({ ...ratings, [skill]: 4 });
    setCustomSkill("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId,
        sessionId,
        week: weekForFocusArea(focusArea),
        focusArea,
        skills: ratings,
        notes: notes || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) router.push("/coach/assessments");
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-5 max-w-lg space-y-4">
      <div>
        <label className="text-xs text-gray-500">Player</label>
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500">Session</label>
        <select
          value={sessionId}
          onChange={(e) => onSessionChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {s.focusArea}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500">Focus Area</label>
        <input
          disabled
          value={focusArea}
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm mt-1 text-gray-500"
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Skill Ratings (1–5)</p>
        <div className="space-y-3">
          {skillList.map((skill) => (
            <div key={skill} className="flex items-center justify-between">
              <span className="text-sm text-navy">{skill}</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatings({ ...ratings, [skill]: star })}
                      className={`text-lg ${star <= ratings[skill] ? "text-gold" : "text-gray-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={ratings[skill]}
                  onChange={(e) =>
                    setRatings({ ...ratings, [skill]: Math.min(5, Math.max(1, Number(e.target.value))) })
                  }
                  className="w-12 border border-gray-300 rounded px-1 py-0.5 text-xs text-center"
                />
              </div>
            </div>
          ))}
          {Object.keys(ratings).filter((skill) => !skillList.includes(skill)).map((skill) => (
            <div key={skill} className="flex items-center justify-between">
              <span className="text-sm text-navy">{skill} <span className="text-xs text-gray-400">(custom)</span></span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRatings({ ...ratings, [skill]: star })} className={`text-lg ${star <= ratings[skill] ? "text-gold" : "text-gray-200"}`}>★</button>
                  ))}
                </div>
                <button type="button" onClick={() => { const next = { ...ratings }; delete next[skill]; setRatings(next); }} className="text-xs text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="Add another skill"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button type="button" onClick={addSkill} className="border border-navy text-navy text-sm font-semibold px-3 rounded-lg">Add</button>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">Coach Note (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
          placeholder="e.g. Strong communication."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Assessment"}
      </button>
    </form>
  );
}
