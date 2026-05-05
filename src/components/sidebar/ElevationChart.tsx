import { useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { buildDistanceIndex, coordAtDistance } from '../../utils/coordAtDistance';
import type { ElevationPoint, LngLat } from '../../types';

interface Props {
  data: ElevationPoint[];
  color: string;
  /** Track coordinates for the same route — used to map chart hover to a map position. */
  trackCoords?: LngLat[];
}

const TICK_CANDIDATES = [0.5, 1, 2, 5, 10, 20, 50, 100];

function buildTicks(totalKm: number): number[] {
  if (totalKm <= 0) return [0];
  // Aim for ~5 ticks; pick the smallest candidate step that gives ≤ 6 intervals
  const step = TICK_CANDIDATES.find((c) => totalKm / c <= 6) ?? TICK_CANDIDATES[TICK_CANDIDATES.length - 1];
  const ticks: number[] = [];
  for (let i = 0; i * step <= totalKm + 0.001; i++) ticks.push(i * step);
  return ticks;
}

export function ElevationChart({ data, color, trackCoords }: Props) {
  const setChartHoverPoint = useAppStore((s) => s.setChartHoverPoint);
  const totalKm = data.length ? data[data.length - 1].distanceKm : 0;
  const ticks = useMemo(() => buildTicks(totalKm), [totalKm]);
  const cumKm = useMemo(
    () => (trackCoords ? buildDistanceIndex(trackCoords) : null),
    [trackCoords]
  );

  // Clear the map marker when this chart unmounts (e.g., user closes detail view)
  useEffect(() => {
    return () => setChartHoverPoint(null);
  }, [setChartHoverPoint]);

  if (data.length === 0) return null;

  // Recharts v3 passes MouseHandlerDataParam — activeLabel is the X value
  // (our distanceKm). isTooltipActive tells us whether the cursor is over a
  // data point. activePayload no longer exists at this level in v3.
  const handleMouseMove = (state: unknown) => {
    const s = state as { activeLabel?: number | string; isTooltipActive?: boolean } | null;
    if (!s || !s.isTooltipActive || s.activeLabel == null) return;
    const km = typeof s.activeLabel === 'number' ? s.activeLabel : Number(s.activeLabel);
    if (!Number.isFinite(km) || !trackCoords || !cumKm) return;
    const point = coordAtDistance(trackCoords, cumKm, km);
    if (point) setChartHoverPoint(point);
  };

  const handleMouseLeave = () => setChartHoverPoint(null);

  return (
    <div className="h-32 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            type="number"
            dataKey="distanceKm"
            domain={[0, totalKm]}
            ticks={ticks}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}km`}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}m`}
          />
          <Tooltip
            contentStyle={{
              background: '#1c1c1e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              fontSize: 11,
              color: '#fff',
              padding: '6px 10px',
            }}
            itemStyle={{ color: '#fff' }}
            formatter={(v) => [`${v}m`, 'Elevation']}
            labelFormatter={(v) => `${(+v).toFixed(2)}km`}
            cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1, strokeDasharray: '2 3' }}
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
