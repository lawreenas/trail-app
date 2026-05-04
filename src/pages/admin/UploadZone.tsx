import { useRef, useState, type DragEvent } from 'react';
import { parseGpxFile } from '../../services/gpxParser';
import type { TrailRoute } from '../../types';

interface Props {
  onParsed: (partial: Omit<TrailRoute, 'name' | 'description' | 'region' | 'tags' | 'source'>) => void;
}

export function UploadZone({ onParsed }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.gpx')) {
      setError('Only .gpx files are supported');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 0)); // yield to UI
      const parsed = await parseGpxFile(file);
      onParsed(parsed);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) processFile(files[0]);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-accent bg-accent/10'
            : 'border-surface-overlay hover:border-gray-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload GPX file"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".gpx"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
        />
        <div className="text-4xl mb-3">{isProcessing ? '⏳' : '📁'}</div>
        <p className="text-sm font-medium text-white">
          {isProcessing ? 'Parsing GPX file…' : 'Drop a GPX file here'}
        </p>
        <p className="text-xs text-gray-500 mt-1">or click to browse</p>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
