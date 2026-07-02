import React from 'react';
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface AreaChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  lines: Array<{ dataKey: string; color: string; name?: string }>;
  height?: number;
}

export function AreaChart({ data, xKey, lines, height = 260 }: AreaChartProps) {
  const { isDark } = useTheme();

  if (!data || !data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500 text-sm font-medium">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
        <defs>
          {lines.map((line) => (
            <linearGradient key={`grad-${line.dataKey}`} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0.0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} strokeDasharray="3 3" />
        <XAxis 
          dataKey={xKey} 
          tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }} 
          stroke={isDark ? '#475569' : '#e2e8f0'}
          tickLine={false}
          axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }} 
          stroke={isDark ? '#475569' : '#e2e8f0'}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '16px',
            border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a',
            padding: '10px 14px'
          }}
          itemStyle={{
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: '12px',
            fontWeight: 700
          }}
          labelStyle={{
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '11px',
            fontWeight: 600,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          formatter={(value) => (
            <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">{value}</span>
          )}
        />
        {lines.map((line) => (
          <Area
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#gradient-${line.dataKey})`}
            name={line.name || line.dataKey}
            dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0f172a' : '#fff', stroke: line.color }}
            activeDot={{ r: 6, strokeWidth: 0, fill: line.color }}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
