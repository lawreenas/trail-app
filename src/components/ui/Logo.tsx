/** Brand mark — two peaks. Matches public/favicon.svg. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="#c4ff00" />
      <path d="M5 23 L12.5 11 L17 18 L20 13.5 L27 23 Z" fill="#0d0d0e" />
    </svg>
  );
}

export function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <LogoMark />
      <div className="min-w-0 leading-none">
        <div className="font-display text-[22px] font-semibold tracking-wide text-white uppercase">
          Trails
        </div>
        {subtitle && (
          <div className="text-[11px] text-gray-500 mt-1 truncate">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
