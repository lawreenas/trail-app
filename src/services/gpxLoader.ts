/** Build the URL to a GPX file served from /public/gpx/. */
export function gpxUrl(filename: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}gpx/${filename}`;
}
