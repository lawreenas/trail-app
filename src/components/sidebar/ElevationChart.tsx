import { useEffect, useId, useMemo } from 'react';
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
  /** Reports the hovered point so the parent can show a readout; null when the cursor leaves. */
  onActiveChange?: (point: ElevationPoint | null) => void;
  height?: number;
}

const TICK_CANDIDATES = [0.5, 1, 2, 5, 10, 20, 50, 100];

function buildTicks(totalKm: number): number[] {
  if (totalKm <= 0) return [0];
  // Aim for ~5 ticks; pick the smallest candidate step that gives ≤ 5 intervals
  const step = TICK_CANDIDATES.find((c) => totalKm / c <= 5) ?? TICK_CANDIDATES[TICK_CANDIDATES.length - 1];
  const ticks: number[] = [];
  for (let i = 0; i * step <= totalKm + 0.001; i++) ticks.push(i * step);
  return ticks;
}

export function ElevationChart({ data, color, trackCoords, onActiveChange, height = 150 }: Props) {
  const setChartHoverPoint = useAppStore((s) => s.setChartHoverPoint);
  const gradientId = useId();
  const totalKm = data.length ? data[data.length - 1].distanceKm : 0;
  const ticks = useMemo(() => buildTicks(totalKm), [totalKm]);
  const cumKm = useMemo(
    () => (trackCoords ? buildDistanceIndex(trackCoords) : null),
    [trackCoords]
  );
  // Pad the Y domain so flat routes don't get stretched into dramatic profiles.
  const yDomain = useMemo<[number, number]>(() => {
    if (!data.length) return [0, 100];
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of data) {
      if (p.elevationM < lo) lo = p.elevationM;
      if (p.elevationM > hi) hi = p.elevationM;
    }
    const span = Math.max(hi - lo, 60);
    const mid = (hi + lo) / 2;
    const floor = Math.max(0, Math.floor((mid - span * 0.65) / 10) * 10);
    return [floor, Math.ceil((floor + span * 1.3) / 10) * 10];
  }, [data]);

  // Clear the map marker when this chart unmounts (e.g., user closes detail view)
  useEffect(() => {
    return () => setChartHoverPoint(null);
  }, [setChartHoverPoint]);

  if (data.length === 0) return null;

  // Recharts v3 passes MouseHandlerDataParam — activeLabel is the X value
  // (our distanceKm). isTooltipActive tells us whether the cursor is over a
  // data point. activePayload no longer exists at this level in v3.
  const handleMouseMove = (state: unknown) => {
    const s = state as { activeLabel?: number | string; activeIndex?: number | string; isTooltipActive?: boolean } | null;
    if (!s || !s.isTooltipActive || s.activeLabel == null) return;
    const km = typeof s.activeLabel === 'number' ? s.activeLabel : Number(s.activeLabel);
    if (!Number.isFinite(km)) return;
    if (onActiveChange) {
      const idx = Number(s.activeIndex);
      const point = Number.isInteger(idx) ? data[idx] : data.find((p) => p.distanceKm === km);
      if (point) onActiveChange(point);
    }
    if (!trackCoords || !cumKm) return;
    const coord = coordAtDistance(trackCoords, cumKm, km);
    if (coord) setChartHoverPoint(coord);
  };

  const handleMouseLeave = () => {
    setChartHoverPoint(null);
    onActiveChange?.(null);
  };

  return (
    <div className="w-full select-none" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 6, right: 4, left: 0, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            type="number"
            dataKey="distanceKm"
            domain={[0, totalKm]}
            ticks={ticks}
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tickFormatter={(v: number) => `${v} km`}
          />
          <YAxis
            domain={yDomain}
            tickCount={4}
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => `${v} m`}
          />
          {/* Tooltip drives hover state; the readout is rendered by the parent. */}
          <Tooltip
            content={() => null}
            cursor={{ stroke: 'rgba(255,255,255,0.45)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="elevationM"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#0d0d0e', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
