#!/usr/bin/env node
// Reads all .gpx files from data/gpx/, computes metrics, writes public/routes-data.json

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const GPX_DIR = join(ROOT, 'public', 'gpx');
const OUT_DATA = join(ROOT, 'public', 'routes-data.json');
const OUT_TRACKS = join(ROOT, 'public', 'routes-tracks.json');
const PROFILE_TARGET_POINTS = 120; // downsample elevation profile
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

// ─── metrics (mirrors src/utils/gpxMetrics.ts) ───────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Smooth a numeric array using a centered moving average
function smooth(values, window = 15) {
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - half), Math.min(values.length, i + half + 1));
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
}

function computeMetrics(coords) {
  // Separate elevation for smoothing
  const rawEles = coords.map(c => c[2]);
  const hasEle = rawEles.some(e => e !== undefined);
  const smoothedEles = hasEle
    ? smooth(rawEles.map(e => e ?? 0))
    : rawEles;

  let distanceKm = 0, gainM = 0, lossM = 0;
  let maxEle = -Infinity, minEle = Infinity;
  const profile = [];

  for (let i = 0; i < coords.length; i++) {
    const [lon, lat] = coords[i];
    const ele = hasEle ? smoothedEles[i] : undefined;

    if (i > 0) {
      const [pLon, pLat] = coords[i - 1];
      distanceKm += haversineKm(pLat, pLon, lat, lon);
      if (ele !== undefined) {
        const d = ele - smoothedEles[i - 1];
        if (d > 0) gainM += d; else lossM += Math.abs(d);
      }
    }
    if (ele !== undefined) {
      maxEle = Math.max(maxEle, ele);
      minEle = Math.min(minEle, ele);
      profile.push({ distanceKm: Math.round(distanceKm * 100) / 100, elevationM: Math.round(ele) });
    }
  }

  return {
    metrics: {
      distanceKm: Math.round(distanceKm * 10) / 10,
      elevationGainM: Math.round(gainM),
      elevationLossM: Math.round(lossM),
      elevationMaxM: maxEle === -Infinity ? 0 : Math.round(maxEle),
      elevationMinM: minEle === Infinity ? 0 : Math.round(minEle),
      estimatedTimeMin: Math.round((distanceKm / 5 + gainM / 600) * 60),
    },
    elevationProfile: profile,
  };
}

// ─── elevation profile downsampling ──────────────────────────────────────────

function downsampleProfile(profile, target) {
  if (profile.length <= target) return profile;
  const step = (profile.length - 1) / (target - 1);
  const out = [];
  for (let i = 0; i < target; i++) {
    out.push(profile[Math.round(i * step)]);
  }
  return out;
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

// ─── difficulty (mirrors src/utils/difficultyClassifier.ts) ──────────────────

function classify(metrics) {
  const score = metrics.distanceKm * 2 + metrics.elevationGainM / 100;
  if (score < 10) return 'easy';
  if (score < 25) return 'moderate';
  if (score < 50) return 'hard';
  return 'expert';
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

  const { metrics, elevationProfile } = computeMetrics(coords);
  const difficulty = classify(metrics);
  const [startLng, startLat] = coords[0];
  const displayName = name || filenameFallback(file);

  // Downsample elevation profile so the chart is fast and the JSON stays small
  const downsampled = downsampleProfile(elevationProfile, PROFILE_TARGET_POINTS);

  // Stable id derived from filename so re-imports don't break share links or
  // metadata edits that key off the route id.
  const id = basename(file, '.gpx');

  const route = {
    id,
    name: displayName,
    description: '',
    difficulty,
    type: 'loop',
    region: 'Vilnius',
    tags: [],
    startPoint: { lat: startLat, lng: startLng },
    metrics,
    elevationProfile: downsampled,
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
    `  ✓ ${displayName.padEnd(45)} ${metrics.distanceKm}km  ↑${metrics.elevationGainM}m  [${difficulty}]  pts ${coords.length}→${simplified.length}`
  );
}

const dataOut = {
  version: 1,
  exportedAt: now,
  routes: routes.sort((a, b) => a.name.localeCompare(b.name)),
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
