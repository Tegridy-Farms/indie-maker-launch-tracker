interface StatCardProps {
  label: string;
  count: number;
  color?: string;
  isLoading?: boolean;
  isError?: boolean;
  fullWidth?: boolean;
}

export function StatCard({
  label,
  count,
  color,
  isLoading = false,
  isError = false,
  fullWidth = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div
        className={`bg-surface rounded-xl border border-border-default p-5 ${
          color ? "border-l-4" : ""
        } ${fullWidth ? "col-span-full" : ""}`}
        style={color ? { borderLeftColor: color } : {}}
        aria-busy="true"
        aria-label="Loading stat"
      >
        <div className="shimmer h-8 w-16 rounded mb-2" />
        <div className="shimmer h-3 w-24 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`bg-surface rounded-xl border border-border-default p-5 ${
          color ? "border-l-4" : ""
        } ${fullWidth ? "col-span-full" : ""}`}
        style={color ? { borderLeftColor: color } : {}}
      >
        <p className="text-error text-[14px]">—</p>
        <p className="text-text-secondary text-[12px] mt-1">{label}</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface rounded-xl border border-border-default p-5 ${
        color ? "border-l-4" : ""
      } ${fullWidth ? "col-span-full" : ""}`}
      style={color ? { borderLeftColor: color } : {}}
    >
      <p className="text-[24px] font-bold text-text-primary leading-tight">
        {count}
      </p>
      <p className="text-text-secondary text-[12px] mt-1">{label}</p>
    </div>
  );
}
