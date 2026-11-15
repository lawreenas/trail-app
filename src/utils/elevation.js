// Track analysis shared by the browser (admin uploads) and scripts/import-gpx.mjs.
// Plain JS so Node can import it without a TypeScript build step; types live in
// elevation.d.ts.
//
// Elevation gain/loss pipeline — tuned against a known reference (the 109.8 km
// "Takas aplink Vilnių" loop: published 2,324 m, this gives 2,349 m):
//   1. Median filter over 5 points        → drops single-point spikes
//   2. Resample every 10 m along the track → same behaviour for dense and sparse files
//   3. Moving average over 150 m           → removes DEM tree-canopy bumps and GPS jitter
//   4. Count climbs/descents only once they exceed 3 m (hysteresis)

const MEDIAN_WINDOW_POINTS = 5;
const RESAMPLE_STEP_M = 10;
const SMOOTH_WINDOW_M = 150;
const HYSTERESIS_M = 3;
const PROFILE_TARGET_POINTS = 150;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function medianFilter(values, window) {
  const half = Math.floor(window / 2);
  const out = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const slice = values.slice(Math.max(0, i - half), i + half + 1).sort((a, b) => a - b);
    out[i] = slice[slice.length >> 1];
  }
  return out;
}

/** Centred moving average in O(n) via prefix sums. */
function movingAverage(values, window) {
  if (window <= 1) return values.slice();
  const half = Math.floor(window / 2);
  const prefix = [0];
  for (const v of values) prefix.push(prefix[prefix.length - 1] + v);
  return values.map((_, i) => {
    const a = Math.max(0, i - half);
    const b = Math.min(values.length, i + half + 1);
    return (prefix[b] - prefix[a]) / (b - a);
  });
}

/** Linear interpolation of `values` (at distances `dist`) every `step` metres, starting at dist[0]. */
function resample(dist, values, step) {
  const out = [values[0]];
  let j = 1;
  for (let d = dist[0] + step; d <= dist[dist.length - 1]; d += step) {
    while (j < dist.length - 1 && dist[j] < d) j++;
    const span = dist[j] - dist[j - 1];
    const t = span > 0 ? (d - dist[j - 1]) / span : 0;
    out.push(values[j - 1] + t * (values[j] - values[j - 1]));
  }
  return out;
}

function gainLoss(values, threshold) {
  let gain = 0;
  let loss = 0;
  let anchor = values[0];
  for (const v of values) {
    if (v - anchor >= threshold) {
      gain += v - anchor;
      anchor = v;
    } else if (anchor - v >= threshold) {
      loss += anchor - v;
      anchor = v;
    }
  }
  return { gain, loss };
}

function downsample(points, target) {
  if (points.length <= target) return points;
  const step = (points.length - 1) / (target - 1);
  const out = [];
  for (let i = 0; i < target; i++) out.push(points[Math.round(i * step)]);
  return out;
}

/**
 * @param {number[][]} coordinates GeoJSON-order points: [lng, lat, ele?]
 */
export function analyzeTrack(coordinates) {
  // Cumulative distance over every point, so distance doesn't depend on elevation coverage.
  const cumM = [0];
  for (let i = 1; i < coordinates.length; i++) {
    const [lon0, lat0] = coordinates[i - 1];
    const [lon1, lat1] = coordinates[i];
    cumM.push(cumM[i - 1] + haversineM(lat0, lon0, lat1, lon1));
  }
  const totalM = cumM[cumM.length - 1] ?? 0;
  const distanceKm = Math.round((totalM / 1000) * 10) / 10;

  const dist = [];
  const raw = [];
  for (let i = 0; i < coordinates.length; i++) {
    const ele = coordinates[i][2];
    if (typeof ele === 'number' && Number.isFinite(ele)) {
      dist.push(cumM[i]);
      raw.push(ele);
    }
  }

  if (raw.length < 2) {
    return {
      metrics: { distanceKm, elevationGainM: 0, elevationLossM: 0, elevationMaxM: 0, elevationMinM: 0 },
      elevationProfile: [],
    };
  }

  const despiked = resample(dist, medianFilter(raw, MEDIAN_WINDOW_POINTS), RESAMPLE_STEP_M);
  const smoothed = movingAverage(despiked, Math.round(SMOOTH_WINDOW_M / RESAMPLE_STEP_M));
  const { gain, loss } = gainLoss(smoothed, HYSTERESIS_M);

  // High/low points come from the despiked (not averaged) series so real summits aren't shaved off.
  let max = -Infinity;
  let min = Infinity;
  for (const v of despiked) {
    if (v > max) max = v;
    if (v < min) min = v;
  }

  const profile = smoothed.map((elevationM, i) => ({
    distanceKm: Math.round(((dist[0] + i * RESAMPLE_STEP_M) / 1000) * 100) / 100,
    elevationM: Math.round(elevationM),
  }));

  return {
    metrics: {
      distanceKm,
      elevationGainM: Math.round(gain),
      elevationLossM: Math.round(loss),
      elevationMaxM: Math.round(max),
      elevationMinM: Math.round(min),
    },
    elevationProfile: downsample(profile, PROFILE_TARGET_POINTS),
  };
}
