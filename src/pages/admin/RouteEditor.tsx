import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppStore } from '../../store/useAppStore';
import { DifficultyBadge } from '../../components/ui/DifficultyBadge';
import type { Difficulty, TrailRoute } from '../../types';

interface Props {
  partial: Omit<TrailRoute, 'name' | 'description' | 'region' | 'tags' | 'source'>;
  onSaved: () => void;
  onCancel: () => void;
  existing?: TrailRoute;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'moderate', 'hard', 'expert'];

export function RouteEditor({ partial, onSaved, onCancel, existing }: Props) {
  const upsertRoute = useAppStore((s) => s.upsertRoute);
  const [name, setName] = useState(existing?.name ?? partial.gpxFileName.replace('.gpx', ''));
  const [description, setDescription] = useState(existing?.description ?? '');
  const [region, setRegion] = useState(existing?.region ?? '');
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? partial.difficulty);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const route: TrailRoute = {
      ...partial,
      id: existing?.id ?? uuid(),
      name: name.trim(),
      description: description.trim(),
      region: region.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      difficulty,
      source: 'local',
      updatedAt: new Date().toISOString(),
    };
    await upsertRoute(route);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Route name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-overlay text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-accent/50"
          placeholder="e.g. Forest Loop Trail"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`transition-opacity ${difficulty === d ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            >
              <DifficultyBadge difficulty={d} size="md" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region</label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full bg-surface-overlay text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-accent/50"
          placeholder="e.g. Vilnius, Trakai"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-surface-overlay text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-accent/50 resize-none"
          placeholder="Describe the trail…"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-surface-overlay text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-accent/50"
          placeholder="forest, loop, technical"
        />
      </div>

      <div className="text-xs text-gray-500 bg-surface-raised rounded-lg px-3 py-2 space-y-0.5">
        <div>📏 {partial.metrics.distanceKm} km</div>
        <div>⬆ {partial.metrics.elevationGainM} m gain</div>
        <div>⏱ ~{partial.metrics.estimatedTimeMin} min</div>
        <div>📁 {partial.gpxFileName}</div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="flex-1 bg-accent text-white text-sm font-semibold rounded-lg py-2 hover:bg-accent-muted transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save route'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
