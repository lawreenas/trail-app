# Trail App — Setup Guide

## Running Locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## GitHub Pages Deployment

### 1. Create the GitHub repository

Create a new repo (e.g. `trail-app`) on GitHub.

### 2. Push the code

```bash
git init
git add .
git commit -m "Initial trail app"
git remote add origin https://github.com/<your-username>/trail-app.git
git push -u origin main
```

### 3. Enable GitHub Pages

In your repo settings → Pages → Source → select **"GitHub Actions"**.

### 4. Add repository secrets (optional — for admin password protection)

Generate a SHA-256 hash of your admin password:

```bash
echo -n "your-admin-password" | shasum -a 256
```

In your repo settings → Secrets and variables → Actions → add:
- `ADMIN_PASSWORD_HASH` = the hex hash from the command above (no space before the `-`)

If you skip this, the admin panel accepts any password in development mode.

### 5. Push to deploy

Every push to `main` triggers the GitHub Actions workflow and deploys to:

```
https://<your-username>.github.io/trail-app/
```

---

## Admin Panel

Access the admin panel at `/#/admin` (locally: http://localhost:5173/#/admin).

### Uploading routes

1. Log in with your admin password
2. Drop a `.gpx` file onto the upload zone
3. Fill in the route name, region, description, and tags
4. Click **Save route** — it appears on the map immediately

### Publishing routes

Routes saved via the admin panel are stored in your browser's IndexedDB (local only). To publish them to the live site:

1. Go to the **Export & Manage** tab
2. Click **Export routes-data.json**
3. Replace `public/routes-data.json` in your repo with the downloaded file
4. Commit and push → GitHub Actions deploys automatically

---

## Difficulty auto-classification

When a GPX file is uploaded, difficulty is auto-classified using this formula:

```
score = distanceKm × 2 + elevationGainM / 100
```

| Score | Difficulty |
|-------|-----------|
| < 10  | Easy      |
| < 25  | Moderate  |
| < 50  | Hard      |
| ≥ 50  | Expert    |

You can override this in the editor after upload.

---

## Project structure

```
public/
  routes-data.json    ← committed route data (export from admin panel)
src/
  components/
    map/              ← Leaflet map, markers, route polyline
    sidebar/          ← Route list, filters, detail view, elevation chart
    mobile/           ← Bottom sheet for mobile
    ui/               ← Shared UI components
  pages/
    MapPage.tsx       ← Main view
    admin/            ← Admin upload, edit, export
  services/           ← GPX parsing, IndexedDB, data loading
  store/              ← Zustand global state
  types/              ← TypeScript interfaces
```
