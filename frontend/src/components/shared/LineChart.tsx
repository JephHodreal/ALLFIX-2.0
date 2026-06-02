import React from 'react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface LineChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  lines: Array<{ dataKey: string; color: string; name?: string }>;
  height?: number;
}

export function LineChart({ data, xKey, lines, height = 300 }: LineChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500 text-sm">
        No chart data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} className="text-slate-500" />
        <YAxis tick={{ fontSize: 12 }} className="text-slate-500" />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Legend />
        {lines.map((line) => (
          <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.color} name={line.name || line.dataKey} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
