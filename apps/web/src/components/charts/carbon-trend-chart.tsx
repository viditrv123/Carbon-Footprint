'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface TrendPoint { date: string; carbonKg: number }
interface Props { data: TrendPoint[] }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white border border-forest-100 p-3 shadow-eco text-sm">
      <p className="font-medium text-forest-800">{label}</p>
      <p className="text-forest-600">{payload[0].value.toFixed(1)} kg CO₂e</p>
    </div>
  );
}

export function CarbonTrendChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    label: format(parseISO(d.date), 'EEE'),
  }));

  const totalKg = data.reduce((s, d) => s + d.carbonKg, 0).toFixed(1);

  return (
    <div
      role="img"
      aria-label={`7-day carbon trend. Total: ${totalKg} kg CO₂e`}
    >
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#40916C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#40916C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#D8F3DC" />
          <XAxis dataKey="label" tick={{ fill: '#2D6A4F', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#2D6A4F', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="carbonKg"
            stroke="#40916C"
            strokeWidth={2.5}
            fill="url(#carbonGradient)"
            dot={{ fill: '#40916C', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#2D6A4F' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* Visually-hidden data table for screen readers */}
      <table className="sr-only">
        <caption>7-day carbon emissions trend</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">kg CO₂e</th></tr></thead>
        <tbody>
          {data.map(d => (
            <tr key={d.date}>
              <td>{format(parseISO(d.date), 'EEE, MMM d')}</td>
              <td>{d.carbonKg.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
