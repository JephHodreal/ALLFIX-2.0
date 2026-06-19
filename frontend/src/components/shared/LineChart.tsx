import React from 'react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface LineChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  lines: Array<{ dataKey: string; color: string; name?: string }>;
  height?: number;
}

export function LineChart({ data, xKey, lines, height = 300 }: LineChartProps) {
  const { isDark } = useTheme();

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
        <CartesianGrid vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} stroke={isDark ? '#475569' : '#cbd5e1'} />
        <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} stroke={isDark ? '#475569' : '#cbd5e1'} padding={{ bottom: 15, top: 15 }} />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a'
          }}
          itemStyle={{
            color: isDark ? '#f8fafc' : '#0f172a'
          }}
          labelStyle={{
            color: isDark ? '#94a3b8' : '#64748b',
            fontWeight: 'bold'
          }}
        />
        <Legend 
          formatter={(value) => {
            console.log("[CAVEMAN] LineChart Legend value formatted in dark mode:", isDark, "val:", value);
            return <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">{value}</span>;
          }}
        />
        {lines.map((line) => (
          <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.color} name={line.name || line.dataKey} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
