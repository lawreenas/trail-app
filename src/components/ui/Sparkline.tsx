import { memo, useMemo } from 'react';
import type { ElevationPoint } from '../../types';

interface Props {
  data: ElevationPoint[];
  width?: number;
  height?: number;
  color: string;
  /** Fill opacity under the line. */
  fillOpacity?: number;
}

/**
 * Tiny elevation silhouette for list rows. Pure SVG — cheap enough to render
 * for every card. The vertical scale is clamped to at least 40 m so flat
 * routes read as flat instead of being stretched into dramatic mountains.
 */
function SparklineImpl({ data, width = 72, height = 28, color, fillOpacity = 0.14 }: Props) {
  const paths = useMemo(() => {
    if (data.length < 2) return null;
    const maxKm = data[data.length - 1].distanceKm || 1;
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of data) {
      if (p.elevationM < lo) lo = p.elevationM;
      if (p.elevationM > hi) hi = p.elevationM;
    }
    const span = Math.max(hi - lo, 40);
    const pad = 1.5;
    const pts = data.map((p) => {
      const x = (p.distanceKm / maxKm) * width;
      const y = pad + (1 - (p.elevationM - lo) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const line = `M${pts.join('L')}`;
    const area = `${line}L${width},${height}L0,${height}Z`;
    return { line, area };
  }, [data, width, height]);

  if (!paths) {
    return <div style={{ width, height }} aria-hidden="true" />;
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block overflow-visible">
      <path d={paths.area} fill={color} fillOpacity={fillOpacity} />
      <path d={paths.line} fill="none" stroke={color} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export const Sparkline = memo(SparklineImpl);
