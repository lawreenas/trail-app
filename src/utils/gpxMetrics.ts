import type { ElevationPoint, RouteMetrics } from '../types';

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GeoJSON coordinates are [lng, lat, ele?]
export function computeMetrics(
  coordinates: number[][]
): { metrics: RouteMetrics; elevationProfile: ElevationPoint[] } {
  let distanceKm = 0;
  let elevationGainM = 0;
  let elevationLossM = 0;
  let elevationMaxM = -Infinity;
  let elevationMinM = Infinity;
  const elevationProfile: ElevationPoint[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const [lon, lat, ele] = coordinates[i];

    if (i > 0) {
      const [prevLon, prevLat, prevEle] = coordinates[i - 1];
      distanceKm += haversineKm(prevLat, prevLon, lat, lon);

      if (ele !== undefined && prevEle !== undefined) {
        const diff = ele - prevEle;
        if (diff > 0) elevationGainM += diff;
        else elevationLossM += Math.abs(diff);
      }
    }

    if (ele !== undefined) {
      elevationMaxM = Math.max(elevationMaxM, ele);
      elevationMinM = Math.min(elevationMinM, ele);
      elevationProfile.push({ distanceKm: Math.round(distanceKm * 100) / 100, elevationM: Math.round(ele) });
    }
  }

  // Naismith's rule: 1hr per 5km + 1hr per 600m gain
  const estimatedTimeMin = Math.round((distanceKm / 5 + elevationGainM / 600) * 60);

  return {
    metrics: {
      distanceKm: Math.round(distanceKm * 10) / 10,
      elevationGainM: Math.round(elevationGainM),
      elevationLossM: Math.round(elevationLossM),
      elevationMaxM: elevationMaxM === -Infinity ? 0 : Math.round(elevationMaxM),
      elevationMinM: elevationMinM === Infinity ? 0 : Math.round(elevationMinM),
      estimatedTimeMin,
    },
    elevationProfile,
  };
}
