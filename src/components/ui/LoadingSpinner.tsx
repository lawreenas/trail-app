export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
        <div className="absolute inset-0 rounded-full border border-t-white/60 animate-spin" />
      </div>
    </div>
  );
}
