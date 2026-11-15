---
name: export-routes
description: Publish exported trail route data — copy routes-data.json, routes-tracks.json and dist/gpx/*.gpx from dist/ into public/ (overwriting), verify, then commit and push. Use when the user asks to export, publish or sync routes, or says they put an admin export into dist/.
---

# Export routes (dist/ → public/)

Moves route data from `dist/` into `public/`, where the app and the GitHub Pages deploy read it from.

| Source | Destination |
|---|---|
| `dist/routes-data.json` | `public/routes-data.json` (overwrite) |
| `dist/routes-tracks.json` | `public/routes-tracks.json` (overwrite) |
| `dist/gpx/*.gpx` | `public/gpx/` (overwrite same names, add new ones) |

GPX files that exist in `public/gpx/` but not in `dist/gpx/` are left alone. Removing GPX files for deleted routes is a separate, explicit step (see 5).

## Watch out

`npm run build` rebuilds `dist/` from `public/` and **overwrites any export placed in dist/**. If `dist/` was built after the export was dropped in, the data there is just a copy of `public/` — step 2 will catch that (no changes).

## Steps

Run everything from the repo root.

### 1. Check the sources exist and parse

```bash
test -f dist/routes-data.json && test -f dist/routes-tracks.json && test -d dist/gpx || echo "MISSING SOURCE"
node -e '
const d = require("./dist/routes-data.json"), t = require("./dist/routes-tracks.json");
if (!Array.isArray(d.routes) || typeof t.tracks !== "object") throw new Error("unexpected shape");
console.log(d.routes.length + " routes, " + Object.keys(t.tracks).length + " tracks");
'
```

Stop and tell the user if anything is missing or fails to parse. Do not copy partial data.

### 2. Preview what will change

```bash
for f in routes-data.json routes-tracks.json; do cmp -s dist/$f public/$f && echo "$f: unchanged" || echo "$f: CHANGED"; done
for f in dist/gpx/*.gpx; do b=$(basename "$f"); if [ ! -f "public/gpx/$b" ]; then echo "gpx new: $b"; elif ! cmp -s "$f" "public/gpx/$b"; then echo "gpx changed: $b"; fi; done
node -e '
const a = require("./public/routes-data.json").routes, b = require("./dist/routes-data.json").routes;
const ia = new Set(a.map(r => r.id)), ib = new Set(b.map(r => r.id));
console.log("added:",   b.filter(r => !ia.has(r.id)).map(r => r.name));
console.log("removed:", a.filter(r => !ib.has(r.id)).map(r => r.name));
console.log("edited:",  b.filter(r => ia.has(r.id) && JSON.stringify(r) !== JSON.stringify(a.find(x => x.id === r.id))).map(r => r.name));
'
```

If nothing changed, say so and stop — there is nothing to commit.

### 3. Copy into public/

```bash
cp dist/routes-data.json dist/routes-tracks.json public/
mkdir -p public/gpx && cp dist/gpx/*.gpx public/gpx/
```

Copy rather than move: `dist/` stays a working build and the result in `public/` is the same.

### 4. Verify

```bash
npm run build
git status --short public/
```

The build must pass. `npm run build` overwrites `dist/` — that's fine now that the data is in `public/`.

### 5. Removed routes (only if step 2 listed any)

Routes deleted in admin disappear from `routes-data.json`, but their GPX stays in `public/gpx/`. List the orphans and **ask the user** before deleting them:

```bash
node -e '
const ids = new Set(require("./public/routes-data.json").routes.map(r => r.gpxFileName));
for (const f of require("fs").readdirSync("public/gpx")) if (f.endsWith(".gpx") && !ids.has(f)) console.log(f);
'
```

### 6. Commit and push

Stage only the route data — never unrelated working-tree changes:

```bash
git add public/routes-data.json public/routes-tracks.json public/gpx
git commit -m "Routes: <summary from step 2, e.g. add 2, edit 5, remove 1>"
git push origin main
```

If `git push` is rejected because `origin/main` moved, `git pull --rebase origin main` and push again; if the rebase conflicts on the data files, stop and ask.

Report the commit hash, the route changes from step 2, and that the GitHub Pages deploy runs on push.
