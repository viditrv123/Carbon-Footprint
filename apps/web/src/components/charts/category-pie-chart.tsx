'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ActivityCategory } from '@carbon/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils';

interface CategoryData {
  category: ActivityCategory;
  carbonKg: number;
  percentage: number;
}
interface Props { data: CategoryData[] }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategoryData & { name: string } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-white border border-forest-100 p-3 shadow-eco text-sm">
      <p className="font-medium text-forest-800">{CATEGORY_LABELS[d.category as ActivityCategory] || d.category}</p>
      <p className="text-forest-600">{d.carbonKg.toFixed(1)} kg CO₂e ({d.percentage}%)</p>
    </div>
  );
}

export function CategoryPieChart({ data }: Props) {
  if (!data.length) {
    return <div className="flex h-48 items-center justify-center text-gray-400 text-sm">No data yet</div>;
  }

  const chartData = data.map(d => ({
    ...d,
    name: CATEGORY_LABELS[d.category] || d.category,
    color: CATEGORY_COLORS[d.category] || '#95D5B2',
  }));

  const total = data.reduce((s, d) => s + d.carbonKg, 0).toFixed(1);

  return (
    <div
      role="img"
      aria-label={`Carbon breakdown by category. Total: ${total} kg CO₂e`}
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="carbonKg"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-xs text-forest-700">{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Visually-hidden data table for screen readers */}
      <table className="sr-only">
        <caption>Carbon emissions by category this month</caption>
        <thead><tr><th scope="col">Category</th><th scope="col">kg CO₂e</th><th scope="col">Percentage</th></tr></thead>
        <tbody>
          {data.map(d => (
            <tr key={d.category}>
              <td>{CATEGORY_LABELS[d.category] || d.category}</td>
              <td>{d.carbonKg.toFixed(2)}</td>
              <td>{d.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
