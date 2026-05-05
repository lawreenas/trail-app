import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TAG_COLORS, defaultTagColor, tagColor } from '../../utils/routeMeta';

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ selected, onChange }: Props) {
  const tagLibrary = useAppStore((s) => s.tagLibrary);
  const upsertTag = useAppStore((s) => s.upsertTag);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const matches = useMemo(() => {
    const q = trimmed.toLowerCase();
    return tagLibrary
      .filter((t) => !selected.includes(t.name))
      .filter((t) => !q || t.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [tagLibrary, selected, trimmed]);

  const exact = tagLibrary.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  const canCreate = !!trimmed && !exact && !selected.some((s) => s.toLowerCase() === trimmed.toLowerCase());

  const optionsLength = matches.length + (canCreate ? 1 : 0);

  useEffect(() => {
    setHighlight(0);
  }, [query, optionsLength]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const addTag = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (!tagLibrary.some((t) => t.name === trimmedName)) {
      await upsertTag({ name: trimmedName, color: defaultTagColor(trimmedName) });
    }
    if (!selected.includes(trimmedName)) {
      onChange([...selected, trimmedName]);
    }
    setQuery('');
    setHighlight(0);
    inputRef.current?.focus();
  };

  const removeTag = (name: string) => {
    onChange(selected.filter((t) => t !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, optionsLength - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matches[highlight]) {
        addTag(matches[highlight].name);
      } else if (canCreate) {
        addTag(trimmed);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && !query && selected.length > 0) {
      removeTag(selected[selected.length - 1]);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1.5 focus-within:border-white/30 focus-within:bg-white/[0.06] transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((name) => (
          <SelectedChip
            key={name}
            name={name}
            color={tagColor(name, tagLibrary)}
            onRemove={() => removeTag(name)}
            onColorChange={(color) => upsertTag({ name, color })}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? 'Add tags…' : ''}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-white placeholder:text-gray-600 py-0.5"
        />
      </div>

      {open && (matches.length > 0 || canCreate) && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#26262a] border border-white/[0.08] rounded-md shadow-xl py-1 max-h-64 overflow-y-auto">
          {matches.map((tag, i) => (
            <button
              key={tag.name}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onClick={() => addTag(tag.name)}
              className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                i === highlight ? 'bg-white/[0.06]' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
              <span className="text-gray-200">{tag.name}</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseEnter={() => setHighlight(matches.length)}
              onClick={() => addTag(trimmed)}
              className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                highlight === matches.length ? 'bg-white/[0.06]' : ''
              }`}
            >
              <span className="text-gray-500">+</span>
              <span className="text-gray-200">
                Create <span className="text-white font-medium">"{trimmed}"</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ChipProps {
  name: string;
  color: string;
  onRemove: () => void;
  onColorChange: (color: string) => void;
}

function SelectedChip({ name, color, onRemove, onColorChange }: ChipProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  return (
    <span ref={ref} className="relative inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.08] rounded pl-1 pr-1.5 py-0.5 text-xs text-gray-200">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setPickerOpen((v) => !v); }}
        className="w-3 h-3 rounded-full ring-1 ring-white/10 hover:ring-white/40 transition-shadow"
        style={{ background: color }}
        aria-label={`Change color for ${name}`}
      />
      <span>{name}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="text-gray-500 hover:text-white text-xs leading-none"
        aria-label={`Remove ${name}`}
      >
        ×
      </button>

      {pickerOpen && (
        <span
          className="absolute top-full left-0 mt-1 z-40 bg-[#26262a] border border-white/[0.08] rounded-md shadow-xl p-2 grid grid-cols-6 gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { onColorChange(c); setPickerOpen(false); }}
              className={`w-5 h-5 rounded-full ring-1 transition-shadow ${
                c === color ? 'ring-white' : 'ring-white/10 hover:ring-white/40'
              }`}
              style={{ background: c }}
              aria-label={`Set color ${c}`}
            />
          ))}
        </span>
      )}
    </span>
  );
}
