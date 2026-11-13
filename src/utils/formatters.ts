export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatElevation(m: number): string {
  return `${Math.round(m).toLocaleString()} m`;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/** Compact duration for dense UI: "45m", "2h 05m". */
export function formatDurationShort(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** Value + unit split, so the UI can typeset the unit smaller than the number. */
export function distanceParts(km: number): [string, string] {
  return km < 1 ? [String(Math.round(km * 1000)), 'm'] : [km.toFixed(1), 'km'];
}

export function elevationParts(m: number): [string, string] {
  return [Math.round(m).toLocaleString(), 'm'];
}

export function durationParts(minutes: number): [string, string] {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return [String(m), 'min'];
  return [`${h}:${String(m).padStart(2, '0')}`, 'h'];
}
