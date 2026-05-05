import { useState } from 'react';
import JSZip from 'jszip';
import { useAppStore } from '../../store/useAppStore';
import type { RoutesDataFile, TracksDataFile } from '../../types';

export function ExportPanel() {
  const routes = useAppStore((s) => s.routes);
  const tracks = useAppStore((s) => s.tracks);
  const tagLibrary = useAppStore((s) => s.tagLibrary);
  const [exporting, setExporting] = useState(false);
  const [justExported, setJustExported] = useState(false);

  const localRoutes = routes.filter((r) => r.source === 'local');
  const localCount = localRoutes.length;
  const publicCount = routes.filter((r) => r.source === 'public').length;
  const gpxBundleCount = localRoutes.filter((r) => !!r.gpxText).length;
  const inSync = localCount === 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportedAt = new Date().toISOString();

      const dataFile: RoutesDataFile = {
        version: 1,
        exportedAt,
        routes: routes.map(({ source: _s, gpxText: _g, geoJson: _gj, ...rest }) => rest),
        tags: tagLibrary.length ? tagLibrary : undefined,
      };

      const tracksFile: TracksDataFile = {
        version: 1,
        exportedAt,
        tracks,
      };

      const zip = new JSZip();
      zip.file('routes-data.json', JSON.stringify(dataFile, null, 2));
      zip.file('routes-tracks.json', JSON.stringify(tracksFile));

      const gpxFolder = zip.folder('gpx');
      if (gpxFolder) {
        for (const route of localRoutes) {
          if (route.gpxText) {
            gpxFolder.file(route.gpxFileName, route.gpxText);
          }
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trail-app-export-${exportedAt.slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setJustExported(true);
      setTimeout(() => setJustExported(false), 4000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Export</h2>
        <p className="text-xs text-gray-500 mt-1">
          Bundles all route metadata, simplified tracks, and any newly-uploaded GPX files into a single ZIP.
        </p>
      </div>

      <div className="grid grid-cols-3 border-y border-white/[0.06] py-5 tabular-nums">
        <Metric label="Total" value={routes.length} />
        <Metric label="Published" value={publicCount} />
        <Metric label="Unpublished" value={localCount} amber={localCount > 0} />
      </div>

      <div className="space-y-3">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          ZIP contents
        </div>
        <ul className="text-sm text-gray-300 space-y-1.5 font-mono">
          <ContentRow
            path="routes-data.json"
            detail={`${routes.length} routes · ${tagLibrary.length} tag${tagLibrary.length === 1 ? '' : 's'}`}
          />
          <ContentRow path="routes-tracks.json" detail={`${Object.keys(tracks).length} tracks`} />
          <ContentRow
            path="gpx/"
            detail={
              gpxBundleCount > 0
                ? `${gpxBundleCount} new GPX file${gpxBundleCount === 1 ? '' : 's'}`
                : 'empty (no new uploads)'
            }
            dim={gpxBundleCount === 0}
          />
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-xs">
          {inSync ? (
            <span className="text-gray-500">In sync with the published file.</span>
          ) : (
            <span className="text-amber-400">
              {localCount} route{localCount === 1 ? '' : 's'} not yet committed.
            </span>
          )}
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || routes.length === 0}
          className="bg-white text-black text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {exporting ? 'Bundling…' : justExported ? 'Downloaded' : 'Download ZIP'}
        </button>
      </div>

      <div className="border-t border-white/[0.06] pt-8">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
          How publishing works
        </h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <Step n={1}>
            Click <span className="text-white">Download ZIP</span> — your browser saves the bundle.
          </Step>
          <Step n={2}>
            Unzip and copy the contents into <Code>public/</Code> in the project, replacing existing files. New <Code>.gpx</Code> files land in <Code>public/gpx/</Code>.
          </Step>
          <Step n={3}>
            Commit and push. GitHub Pages redeploys automatically.
          </Step>
        </ol>
      </div>
    </div>
  );
}

function Metric({ label, value, amber }: { label: string; value: number; amber?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${amber ? 'text-amber-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-gray-600 font-mono tabular-nums shrink-0">{String(n).padStart(2, '0')}</span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-xs text-gray-200 bg-white/5 px-1.5 py-0.5 rounded">{children}</code>;
}

function ContentRow({ path, detail, dim }: { path: string; detail: string; dim?: boolean }) {
  return (
    <li className={`flex items-baseline gap-3 ${dim ? 'text-gray-600' : ''}`}>
      <span className="text-xs text-gray-600">─</span>
      <span className={dim ? 'text-gray-600' : 'text-gray-200'}>{path}</span>
      <span className="text-xs text-gray-500 ml-auto">{detail}</span>
    </li>
  );
}
