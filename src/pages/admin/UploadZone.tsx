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
      await new Promise((r) => setTimeout(r, 0));
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full border border-dashed rounded-lg py-16 px-6 text-center transition-colors ${
          isDragging
            ? 'border-white/40 bg-white/[0.04]'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
        }`}
        aria-label="Upload GPX file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".gpx"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
        />
        <p className="text-sm text-white">
          {isProcessing ? 'Parsing…' : isDragging ? 'Drop to upload' : 'Drop a GPX file or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1.5">.gpx only</p>
      </button>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
