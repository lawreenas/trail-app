#!/usr/bin/env node
// Reads all .gpx files from public/gpx/, computes metrics, writes public/routes-data.json.
// Merges with the existing data file: metadata edited in admin (name, tags, type…) and
// manually overridden elevation gain/loss are kept; GPX-derived fields are refreshed.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeTrack } from '../src/utils/elevation.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const GPX_DIR = join(ROOT, 'public', 'gpx');
const OUT_DATA = join(ROOT, 'public', 'routes-data.json');
const OUT_TRACKS = join(ROOT, 'public', 'routes-tracks.json');
const TRACK_SIMPLIFY_TOLERANCE = 0.00006; // ~6m at this latitude — keeps shape, drops detail

// ─── minimal GPX parser ──────────────────────────────────────────────────────

function parseGpx(xml) {
  // Name: prefer track name, fall back to top-level name
  const trkName = xml.match(/<trk[\s>][\s\S]*?<name[^>]*>([\s\S]*?)<\/name>/i);
  const topName = xml.match(/<gpx[\s\S]*?<name[^>]*>([\s\S]*?)<\/name>/i);
  const rawName = (trkName?.[1] ?? topName?.[1] ?? '').trim();
  const name = rawName.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
                       .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

  // Collect all trkpt / rtept coordinates [lng, lat, ele?]
  const ptRe = /<(?:trkpt|rtept)\s[^>]*\blat="([^"]+)"[^>]*\blon="([^"]+)"[^>]*>([\s\S]*?)<\/(?:trkpt|rtept)>/gi;
  const coords = [];
  let m;
  while ((m = ptRe.exec(xml)) !== null) {
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    const eleMatch = m[3].match(/<ele[^>]*>([\s\S]*?)<\/ele>/i);
    const ele = eleMatch ? parseFloat(eleMatch[1]) : undefined;
    if (!isNaN(lat) && !isNaN(lon)) {
      coords.push(ele !== undefined && !isNaN(ele) ? [lon, lat, ele] : [lon, lat]);
    }
  }

  return { name, coords };
}

// ─── geometry simplification (Douglas-Peucker) ───────────────────────────────

function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(x - x1, y - y1);
  let t = ((x - x1) * dx + (y - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

// Iterative Douglas-Peucker (avoids stack overflow on long tracks)
function douglasPeucker(points, tolerance) {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let maxIdx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpendicularDistance(points[i], points[first], points[last]);
      if (d > maxDist) { maxDist = d; maxIdx = i; }
    }
    if (maxDist > tolerance && maxIdx !== -1) {
      keep[maxIdx] = 1;
      stack.push([first, maxIdx], [maxIdx, last]);
    }
  }
  const out = [];
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]);
  return out;
}

function simplifyTrack(coords, tolerance) {
  // Strip elevation (not needed for the overview track) and run DP on [lng, lat]
  const flat = coords.map(([lng, lat]) => [lng, lat]);
  return douglasPeucker(flat, tolerance);
}

// ─── filename → fallback display name ────────────────────────────────────────

function filenameFallback(filename) {
  return basename(filename, '.gpx')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── main ─────────────────────────────────────────────────────────────────────

const files = (await readdir(GPX_DIR)).filter((f) => f.toLowerCase().endsWith('.gpx')).sort();
console.log(`Processing ${files.length} GPX files…\n`);

let previous = { routes: [] };
try {
  previous = JSON.parse(await readFile(OUT_DATA, 'utf8'));
} catch {
  // first import — nothing to merge
}
const previousById = new Map(previous.routes.map((r) => [r.id, r]));

const routes = [];
const tracks = {};
const now = new Date().toISOString();
let totalRawPoints = 0;
let totalKeptPoints = 0;

for (const file of files) {
  const xml = await readFile(join(GPX_DIR, file), 'utf8');
  const { name, coords } = parseGpx(xml);

  if (coords.length < 2) {
    console.warn(`  SKIP ${file} — fewer than 2 trackpoints`);
    continue;
  }

  const { metrics, elevationProfile } = analyzeTrack(coords);
  const [startLng, startLat] = coords[0];
  const displayName = name || filenameFallback(file);

  // Stable id derived from filename so re-imports don't break share links or
  // metadata edits that key off the route id.
  const id = basename(file, '.gpx');
  const prev = previousById.get(id);

  const route = prev
    ? {
        ...prev,
        startPoint: { lat: startLat, lng: startLng },
        metrics: prev.elevationManual
          ? { ...metrics, elevationGainM: prev.metrics.elevationGainM, elevationLossM: prev.metrics.elevationLossM }
          : metrics,
        elevationProfile,
      }
    : {
        id,
        name: displayName,
        description: '',
        type: 'loop',
        region: 'Vilnius',
        tags: [],
        startPoint: { lat: startLat, lng: startLng },
        metrics,
        elevationProfile,
        // Note: full geometry is intentionally NOT embedded here — it's lazy-loaded
        // from /gpx/<filename> at the moment a route is selected.
        gpxFileName: file,
        uploadedAt: now,
        updatedAt: now,
      };

  // Simplified track for the overview map (one record per route)
  const simplified = simplifyTrack(coords, TRACK_SIMPLIFY_TOLERANCE);
  tracks[route.id] = simplified;
  totalRawPoints += coords.length;
  totalKeptPoints += simplified.length;

  routes.push(route);
  console.log(
    `  ${prev ? '↻' : '+'} ${route.name.padEnd(45)} ${route.metrics.distanceKm}km  ↑${route.metrics.elevationGainM}m${route.elevationManual ? ' (manual)' : ''}  pts ${coords.length}→${simplified.length}`
  );
}

const dataOut = {
  version: 1,
  exportedAt: now,
  routes: routes.sort((a, b) => a.name.localeCompare(b.name)),
  ...(previous.tags ? { tags: previous.tags } : {}),
};

const tracksOut = {
  version: 1,
  exportedAt: now,
  tracks,
};

await writeFile(OUT_DATA, JSON.stringify(dataOut, null, 2));
await writeFile(OUT_TRACKS, JSON.stringify(tracksOut)); // no pretty-print → smaller
console.log(`\nWrote ${routes.length} routes → public/routes-data.json`);
console.log(`Wrote ${Object.keys(tracks).length} tracks → public/routes-tracks.json (${totalRawPoints} → ${totalKeptPoints} points, ${Math.round(100 * (1 - totalKeptPoints / totalRawPoints))}% reduction)`);
