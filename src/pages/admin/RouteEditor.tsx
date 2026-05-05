import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppStore } from '../../store/useAppStore';
import { formatDistance, formatElevation } from '../../utils/formatters';
import { ROUTE_TYPES, ROUTE_TYPE_LABEL } from '../../utils/routeMeta';
import { TagInput } from './TagInput';
import type { Difficulty, RouteType, TrailRoute } from '../../types';

type PartialUpload = Omit<TrailRoute, 'name' | 'description' | 'region' | 'tags' | 'source'>;

interface Props {
  partial: PartialUpload;
  onSaved: () => void;
  onCancel: () => void;
  existing?: TrailRoute;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'moderate', 'hard', 'expert'];

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: 'bg-difficulty-easy',
  moderate: 'bg-difficulty-moderate',
  hard: 'bg-difficulty-hard',
  expert: 'bg-difficulty-expert',
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
  expert: 'Expert',
};

const tagsEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export function RouteEditor({ partial, onSaved, onCancel, existing }: Props) {
  const upsertRoute = useAppStore((s) => s.upsertRoute);
  const isEdit = !!existing;
  const initialName = existing?.name ?? partial.gpxFileName.replace('.gpx', '');
  const initialTags = existing?.tags ?? [];
  const initialType: RouteType = existing?.type ?? partial.type ?? 'loop';
  const initialTerrain = existing?.terrain ?? '';
  const initialLink = existing?.link ?? '';

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [region, setRegion] = useState(existing?.region ?? '');
  const [terrain, setTerrain] = useState(initialTerrain);
  const [link, setLink] = useState(initialLink);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [routeType, setRouteType] = useState<RouteType>(initialType);
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? partial.difficulty);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const dirty =
    name !== initialName ||
    description !== (existing?.description ?? '') ||
    region !== (existing?.region ?? '') ||
    terrain !== initialTerrain ||
    link !== initialLink ||
    !tagsEqual(tags, initialTags) ||
    routeType !== initialType ||
    difficulty !== (existing?.difficulty ?? partial.difficulty);

  const canSave = !!name.trim() && (isEdit ? dirty : true);

  const markDirty = () => setJustSaved(false);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const trimmedTerrain = terrain.trim();
    const trimmedLink = link.trim();
    const route: TrailRoute = {
      ...partial,
      id: existing?.id ?? uuid(),
      name: name.trim(),
      description: description.trim(),
      region: region.trim(),
      tags,
      type: routeType,
      terrain: trimmedTerrain || undefined,
      link: trimmedLink || undefined,
      difficulty,
      source: 'local',
      uploadedAt: existing?.uploadedAt ?? partial.uploadedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertRoute(route);
    setSaving(false);
    setJustSaved(true);
    if (!isEdit) onSaved();
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-x-8 text-sm tabular-nums border-y border-white/[0.06] py-4">
        <Metric label="Distance" value={formatDistance(partial.metrics.distanceKm)} />
        <Metric label="Elevation gain" value={formatElevation(partial.metrics.elevationGainM)} />
      </div>

      <div className="space-y-6">
        <Field label="Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); markDirty(); }}
            className={inputClass}
            placeholder="e.g. Forest Loop Trail"
          />
        </Field>

        <Field label="Type">
          <div className="flex gap-1.5 flex-wrap">
            {ROUTE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setRouteType(t); markDirty(); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  routeType === t
                    ? 'bg-white/[0.08] border-white/20 text-white'
                    : 'bg-transparent border-white/[0.08] text-gray-400 hover:text-white hover:border-white/15'
                }`}
              >
                {ROUTE_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Difficulty">
          <div className="flex gap-1.5 flex-wrap">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setDifficulty(d); markDirty(); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                  difficulty === d
                    ? 'bg-white/[0.08] border-white/20 text-white'
                    : 'bg-transparent border-white/[0.08] text-gray-400 hover:text-white hover:border-white/15'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[d]}`} />
                {DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tags" hint="Type to search or create">
          <TagInput
            selected={tags}
            onChange={(next) => { setTags(next); markDirty(); }}
          />
        </Field>

        <Field label="Region">
          <input
            type="text"
            value={region}
            onChange={(e) => { setRegion(e.target.value); markDirty(); }}
            className={inputClass}
            placeholder="e.g. Vilnius, Trakai"
          />
        </Field>

        <Field label="Terrain" hint="Surface description, optional">
          <input
            type="text"
            value={terrain}
            onChange={(e) => { setTerrain(e.target.value); markDirty(); }}
            className={inputClass}
            placeholder="e.g. Forest singletrack"
          />
        </Field>

        <Field label="Race link" hint="External event page, optional">
          <input
            type="url"
            value={link}
            onChange={(e) => { setLink(e.target.value); markDirty(); }}
            className={inputClass}
            placeholder="https://…"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); markDirty(); }}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Describe the trail…"
          />
        </Field>

        <Field label="GPX file">
          <div className="text-xs font-mono text-gray-400">{partial.gpxFileName}</div>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
        <div className="text-xs text-gray-500 min-h-[1rem]">
          {saving && 'Saving…'}
          {!saving && justSaved && !dirty && (
            <span className="text-amber-400">
              Saved locally. Export & commit to publish.
            </span>
          )}
          {!saving && !justSaved && isEdit && !dirty && 'No unsaved changes'}
          {!saving && isEdit && dirty && 'Unsaved changes'}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="bg-white text-black text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save changes' : 'Save route'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-md px-3 py-2.5 outline-none focus:border-white/30 focus:bg-white/[0.06] transition-colors placeholder:text-gray-600';

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-1.5 gap-x-6">
      <label className="text-xs font-medium text-gray-400 sm:pt-2.5 flex items-baseline gap-2">
        {label}
        {required && <span className="text-gray-600">·</span>}
        {required && <span className="text-[10px] text-gray-500 font-normal">required</span>}
        {hint && <span className="text-[10px] text-gray-600 font-normal">{hint}</span>}
      </label>
      <div>{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{label}</div>
      <div className="text-base text-white mt-0.5">{value}</div>
    </div>
  );
}
