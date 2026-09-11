export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

export function formatElevation(m: number): string {
  return `${m.toLocaleString()}m`;
}
