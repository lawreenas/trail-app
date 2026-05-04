#!/usr/bin/env node
// Reads all .gpx files from data/gpx/, computes metrics, writes public/routes-data.json

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const GPX_DIR = join(ROOT, 'public', 'gpx');
const OUT = join(ROOT, 'public', 'routes-data.json');
const PROFILE_TARGET_POINTS = 120; // downsample elevation profile

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
const now = new Date().toISOString();

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

  const route = {
    id: randomUUID(),
    name: displayName,
    description: '',
    difficulty,
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

  routes.push(route);
  console.log(`  ✓ ${displayName.padEnd(45)} ${metrics.distanceKm}km  ↑${metrics.elevationGainM}m  [${difficulty}]`);
}

const output = {
  version: 1,
  exportedAt: now,
  routes: routes.sort((a, b) => a.name.localeCompare(b.name)),
};

await writeFile(OUT, JSON.stringify(output, null, 2));
console.log(`\nWrote ${routes.length} routes → public/routes-data.json`);
