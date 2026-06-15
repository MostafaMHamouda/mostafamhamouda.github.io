import { cn } from '../lib/utils';

type CoreVisualProps = {
  unlockedCount?: number;
  boosted?: boolean;
  showReadyText?: boolean;
  className?: string;
};

const glowByProgress = [
  'bg-slate-300/12',
  'bg-sky-300/18',
  'bg-sky-300/28',
  'bg-sky-300/36',
  'bg-amber-200/40',
];

const crystalByProgress = [
  'from-slate-200/80 via-sky-200/25 to-slate-100/80',
  'from-sky-200 via-sky-400/50 to-indigo-200',
  'from-sky-200 via-cyan-300 to-indigo-200',
  'from-sky-100 via-cyan-300 to-violet-200',
  'from-amber-100 via-sky-300 to-white',
];

export const CoreVisual = ({
  unlockedCount = 0,
  boosted = false,
  showReadyText = false,
  className,
}: CoreVisualProps) => {
  const progressIndex = Math.max(0, Math.min(4, unlockedCount));

  return (
    <div className={cn('relative mx-auto h-40 w-40 animate-float md:h-48 md:w-48', className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-3xl transition duration-700',
          glowByProgress[progressIndex],
          boosted && 'scale-110 animate-pulseHalo',
        )}
      />
      <div className="absolute inset-4 rounded-full border border-white/10 bg-slate-950/38" />
      <div className="absolute inset-2 rounded-full border border-sky-200/15 opacity-80" />
      <div className="absolute inset-2 animate-coreRotate rounded-full border border-sky-300/20 border-t-sky-200/70 border-r-transparent border-b-sky-300/20 border-l-transparent" />
      <div className="absolute inset-8 animate-coreRotate rounded-full border border-white/8 border-t-transparent [animation-direction:reverse] [animation-duration:22s]" />

      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85 shadow-glow-blue animate-particleOrbit"
          style={{
            animationDelay: `${index * -2.1}s`,
            animationDuration: `${8 + index * 2}s`,
          }}
        />
      ))}

      <div className="glass-panel absolute inset-[2.4rem] flex items-center justify-center rounded-full border-sky-200/15 bg-slate-950/68 md:inset-[3rem]">
        <div
          className={cn(
            'relative h-16 w-12 rotate-45 rounded-2xl bg-gradient-to-br shadow-glow-blue transition duration-700 md:h-20 md:w-16',
            crystalByProgress[progressIndex],
            boosted && 'scale-110',
          )}
        >
          <div className="absolute inset-2 rounded-xl border border-white/35" />
          <div className="absolute -left-2 top-1/2 h-5 w-5 -translate-y-1/2 rotate-45 rounded-md bg-sky-200/55 blur-[2px]" />
          <div className="absolute -right-2 top-1/2 h-5 w-5 -translate-y-1/2 rotate-45 rounded-md bg-amber-100/45 blur-[2px]" />
        </div>
      </div>

      {showReadyText && unlockedCount >= 4 ? (
        <div className="absolute -bottom-12 left-1/2 w-56 -translate-x-1/2 text-center text-xs leading-5 text-amber-100/92 animate-revealFade md:text-sm md:leading-6">
          The Core is ready for the Fourfold Spark.
        </div>
      ) : null}
    </div>
  );
};
