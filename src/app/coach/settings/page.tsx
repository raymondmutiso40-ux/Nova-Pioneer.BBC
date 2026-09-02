export default function SettingsPage() {
  const settings = [
    { label: "School Name", value: "Nova Pioneer Girls School" },
    { label: "Program Name", value: "Girls Basketball Program" },
    { label: "Season / Term", value: "Term 3, 2026" },
    { label: "Default Session Time", value: "2 Hours" },
    { label: "Date Format", value: "YYYY-MM-DD" },
    { label: "Time Zone", value: "(GMT+03:00) Nairobi" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Program configuration.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
        <div className="flex gap-6 text-sm border-b border-gray-100 mb-4 pb-2">
          <span className="font-semibold text-navy border-b-2 border-gold pb-2">General</span>
          <span className="text-gray-400">Profile</span>
          <span className="text-gray-400">Teams</span>
          <span className="text-gray-400">Access</span>
        </div>

        <div className="divide-y divide-gray-100">
          {settings.map((s) => (
            <div key={s.label} className="flex justify-between py-3 text-sm">
              <span className="text-gray-500">{s.label}</span>
              <span className="font-medium text-navy">{s.value}</span>
            </div>
          ))}
        </div>

        <button className="w-full mt-5 bg-gold hover:bg-gold-dark text-navy font-semibold py-2.5 rounded-lg text-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
}
