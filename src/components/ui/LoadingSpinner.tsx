export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-surface-overlay" />
        <div className="absolute inset-0 rounded-full border-2 border-t-accent animate-spin" />
      </div>
    </div>
  );
}
