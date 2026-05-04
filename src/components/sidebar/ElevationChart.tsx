import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ElevationPoint } from '../../types';

interface Props {
  data: ElevationPoint[];
  color: string;
}

export function ElevationChart({ data, color }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="h-32 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis
            dataKey="distanceKm"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#444' }}
            tickFormatter={(v: number) => `${v}km`}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}m`}
          />
          <Tooltip
            contentStyle={{
              background: '#1c1c1e',
              border: '1px solid #444',
              borderRadius: 8,
              fontSize: 11,
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            formatter={(v) => [`${v}m`, 'Elevation']}
            labelFormatter={(v) => `${v}km`}
          />
          <Area
            type="monotone"
            dataKey="elevationM"
            stroke={color}
            strokeWidth={2}
            fill="url(#elevGradient)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
