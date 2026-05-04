interface Props {
  icon: string;
  label: string;
  value: string;
}

export function StatItem({ icon, label, value }: Props) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
