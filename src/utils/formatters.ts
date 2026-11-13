export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatElevation(m: number): string {
  return `${Math.round(m).toLocaleString()} m`;
}

/** Value + unit split, so the UI can typeset the unit smaller than the number. */
export function distanceParts(km: number): [string, string] {
  return km < 1 ? [String(Math.round(km * 1000)), 'm'] : [km.toFixed(1), 'km'];
}

export function elevationParts(m: number): [string, string] {
  return [Math.round(m).toLocaleString(), 'm'];
}
