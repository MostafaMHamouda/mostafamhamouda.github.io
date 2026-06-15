type ProgressBarProps = {
  current: number;
  total: number;
};

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
        <span>Map Restoration</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/10 p-0.5">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#53b8ff_0%,#8dd7ff_50%,#53b8ff_100%)] bg-[length:200%_100%] shadow-glow-blue animate-shimmer"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
