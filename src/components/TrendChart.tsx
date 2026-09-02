"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";

export default function TrendChart({
  data,
}: {
  data: { week: string; score: number }[];
}) {
  const peak = Math.max(...data.map((d) => d.score));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis domain={[40, 100]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#d4a83f"
          strokeWidth={3}
          dot={(props: any) =>
            props.value === peak ? (
              <Dot {...props} r={5} fill="#d4a83f" stroke="#0b1e3d" strokeWidth={2} />
            ) : (
              <Dot {...props} r={3} fill="#d4a83f" />
            )
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
