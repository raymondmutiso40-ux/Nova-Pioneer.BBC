"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Settings = {
  schoolName: string;
  programName: string;
  season: string;
  sessionTime: string;
  dateFormat: string;
  timeZone: string;
  profileName: string;
  profileEmail: string;
  teamName: string;
  ageGroup: string;
  rosterStatus: string;
  moderatorReports: boolean;
  moderatorAttendance: boolean;
  coachEditing: boolean;
};

const defaultSettings: Settings = {
  schoolName: "Nova Pioneer School",
  programName: "Basketball Program",
  season: "Term 3, 2026",
  sessionTime: "2 Hours",
  dateFormat: "YYYY-MM-DD",
  timeZone: "(GMT+03:00) Nairobi",
  profileName: "",
  profileEmail: "",
  teamName: "Nova Pioneer Basketball",
  ageGroup: "All ages",
  rosterStatus: "Active",
  moderatorReports: true,
  moderatorAttendance: true,
  coachEditing: true,
};

const fields: { key: keyof Settings; label: string }[] = [
  { key: "schoolName", label: "School Name" },
  { key: "programName", label: "Program Name" },
  { key: "season", label: "Season / Term" },
  { key: "sessionTime", label: "Default Session Time" },
  { key: "dateFormat", label: "Date Format" },
  { key: "timeZone", label: "Time Zone" },
];

type Tab = "General" | "Profile" | "Teams" | "Access";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [tab, setTab] = useState<Tab>("General");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("nova-pioneer-settings");
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        window.localStorage.removeItem("nova-pioneer-settings");
      }
    }
  }, []);

  useEffect(() => {
    setSettings((current) => ({
      ...current,
      profileName: current.profileName || session?.user?.name || "",
      profileEmail: current.profileEmail || session?.user?.email || "",
    }));
  }, [session]);

  function saveChanges() {
    window.localStorage.setItem("nova-pioneer-settings", JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function updateSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Program configuration.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
        <div className="flex gap-6 overflow-x-auto border-b border-gray-100 mb-4 pb-2 text-sm">
          {(["General", "Profile", "Teams", "Access"] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={tab === item ? "whitespace-nowrap font-semibold text-navy border-b-2 border-gold pb-2" : "whitespace-nowrap text-gray-400 hover:text-navy"}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "General" && (
          <div className="space-y-4">
            {fields.map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="mb-1 block text-xs text-gray-500">{field.label}</span>
                <input
                  value={settings[field.key] as string}
                  onChange={(event) => updateSetting(field.key, event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </label>
            ))}
          </div>
        )}

        {tab === "Profile" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Your staff details used by the coaching workspace.</p>
            <label className="block text-sm"><span className="mb-1 block text-xs text-gray-500">Display Name</span><input value={settings.profileName} onChange={(event) => updateSetting("profileName", event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy" /></label>
            <label className="block text-sm"><span className="mb-1 block text-xs text-gray-500">Email</span><input type="email" value={settings.profileEmail} onChange={(event) => updateSetting("profileEmail", event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy" /></label>
            <label className="block text-sm"><span className="mb-1 block text-xs text-gray-500">Role</span><input value="Head Coach" disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" /></label>
          </div>
        )}

        {tab === "Teams" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Set the team defaults used when managing your roster.</p>
            <label className="block text-sm"><span className="mb-1 block text-xs text-gray-500">Team Name</span><input value={settings.teamName} onChange={(event) => updateSetting("teamName", event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy" /></label>
            <label className="block text-sm"><span className="mb-1 block text-xs text-gray-500">Age Group</span><input value={settings.ageGroup} onChange={(event) => updateSetting("ageGroup", event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy" /></label>
            <label className="block text-sm"><span className="mb-1 block text-xs text-gray-500">New Player Default</span><select value={settings.rosterStatus} onChange={(event) => updateSetting("rosterStatus", event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy"><option>Active</option><option>Inactive</option></select></label>
          </div>
        )}

        {tab === "Access" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Control what staff roles can view or change.</p>
            {([ ["moderatorReports", "Allow moderators to download reports"], ["moderatorAttendance", "Allow moderators to view attendance"], ["coachEditing", "Allow coaches to edit player records"] ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3 text-sm text-navy">
                <span>{label}</span>
                <input type="checkbox" checked={settings[key]} onChange={(event) => updateSetting(key, event.target.checked)} className="h-4 w-4 accent-gold" />
              </label>
            ))}
          </div>
        )}

        <button
          onClick={saveChanges}
          className="mt-5 w-full rounded-lg bg-gold py-2.5 text-sm font-semibold text-navy hover:bg-gold-dark"
        >
          {saved ? "Changes Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
