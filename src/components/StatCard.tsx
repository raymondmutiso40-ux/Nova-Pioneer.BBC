export default function StatCard({
  label,
  value,
  sublabel,
  trend,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-navy mt-1">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      {trend && <p className="text-xs text-green-600 font-medium mt-1">{trend}</p>}
    </div>
  );
}
