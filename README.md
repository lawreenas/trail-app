# Trail Routes

Static trail running app with an interactive dark map showing every route at once. Built with React 19, Vite, Leaflet (canvas renderer) and Zustand. Deployed to GitHub Pages.

Live: https://lawreenas.github.io/trail-app/

---

## Managing GPX files

GPX files live in **`public/gpx/`** — they're served directly by the static host (so users can download them) and they're the source of truth for everything shown on the map.

### Adding routes

1. Drop one or more `.gpx` files into `public/gpx/`.
2. Run the import script:
   ```bash
   npm run import-gpx
   ```
   This regenerates two files:
   - `public/routes-data.json` — per-route metadata (name, difficulty, distance, elevation profile, …)
   - `public/routes-tracks.json` — Douglas-Peucker–simplified geometry for the overview map (≈90% point reduction, ~300KB total)
3. Commit the new GPX files **plus** both regenerated JSON files, then push. GitHub Actions deploys to Pages automatically.

The script auto-derives:
- **Name** from the GPX `<name>` tag, falling back to the filename
- **Distance, elevation gain/loss, max/min, est. time** (Naismith's rule: 1h per 5km + 1h per 600m gain)
- **Difficulty** from `distanceKm × 2 + elevationGainM / 100`: `<10` easy · `<25` moderate · `<50` hard · `≥50` expert

Default `region` is `Vilnius` and `tags` is empty. Override these via the admin panel (see below).

### Removing or replacing routes

1. Delete or replace the `.gpx` file in `public/gpx/`.
2. Re-run `npm run import-gpx`.
3. Commit and push.

Route ids are regenerated on every import run, so a deleted file is fully removed from both JSON files (and from the live map after redeploy).

### Editing metadata that should survive re-imports

The import script regenerates from the GPX every time — manual edits to `routes-data.json` will be overwritten. For per-route metadata that should persist (region, description, tags, custom name), use the admin panel:

1. Visit `/#/admin` (locally: http://localhost:5173/#/admin)
2. Sign in (any password works in dev; production checks against the `ADMIN_PASSWORD_HASH` repo secret)
3. Edit fields, then go to **Export & Manage** → **Export routes-data.json**
4. Replace `public/routes-data.json` with the downloaded file, commit, push

Admin uploads are kept in IndexedDB until you export — they don't auto-publish.

### Data quality notes

- Tracks without `<ele>` elevation tags will show **0m gain**.
- Very noisy GPS elevation gets smoothed with a 15-point moving average. Extreme cases (raw points jumping ±50m every step) may still report inflated gain — that's a source data issue and the value can be corrected via the admin panel.
- Files with fewer than 2 trackpoints are skipped with a warning.
- Filenames are preserved verbatim (used as the download filename) — rename the file *before* importing if you want a clean download name.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:5173/
```

## Deployment

See [SETUP.md](./SETUP.md) for GitHub Pages setup, admin password hashing, and the deploy workflow.
