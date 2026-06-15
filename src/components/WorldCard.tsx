import { LockKeyhole, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { FogOverlay } from './FogOverlay';

type WorldCardProps = {
  title: string;
  guardian: string;
  description: string;
  lockedLabel: string;
  color: 'blue' | 'red' | 'gold' | 'green';
  unlocked: boolean;
  highlighted?: boolean;
  onInspect?: () => void;
};

const colorMap = {
  blue: {
    panel: 'from-sky-400/18 to-cyan-300/10',
    glow: 'shadow-glow-blue',
    border: 'border-sky-300/20',
    badge: 'bg-sky-300/12 text-sky-100',
  },
  red: {
    panel: 'from-rose-400/18 to-orange-300/10',
    glow: 'shadow-glow-red',
    border: 'border-rose-300/20',
    badge: 'bg-rose-300/12 text-rose-100',
  },
  gold: {
    panel: 'from-amber-300/18 to-yellow-200/10',
    glow: 'shadow-glow-gold',
    border: 'border-amber-200/20',
    badge: 'bg-amber-200/12 text-amber-100',
  },
  green: {
    panel: 'from-emerald-300/18 to-lime-200/10',
    glow: 'shadow-glow-green',
    border: 'border-emerald-200/20',
    badge: 'bg-emerald-200/12 text-emerald-100',
  },
};

export const WorldCard = ({
  title,
  guardian,
  description,
  lockedLabel,
  color,
  unlocked,
  highlighted = false,
  onInspect,
}: WorldCardProps) => {
  const style = colorMap[color];

  return (
    <button
      className={cn(
        'glass-panel relative w-full overflow-hidden rounded-3xl border bg-gradient-to-br p-5 text-left transition duration-500',
        style.panel,
        unlocked ? [style.glow, style.border] : 'border-white/10 opacity-92',
        highlighted && 'scale-[1.01] ring-2 ring-white/20',
      )}
      onClick={onInspect}
      type="button"
    >
      {!unlocked ? <FogOverlay className="opacity-85" /> : null}

      <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300/75">Guardian</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-1 text-base text-slate-200/78">{guardian}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/10 p-2 text-white/80">
          {unlocked ? <Sparkles className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
        </div>
      </div>

      <p className="relative z-10 text-base leading-7 text-slate-100/86">{description}</p>

      <div
        className={cn(
          'relative z-10 mt-5 rounded-2xl border px-4 py-3 text-base',
          unlocked ? [style.border, style.badge] : 'border-white/10 bg-slate-950/35 text-slate-100/85',
        )}
      >
        {unlocked ? 'Restored' : lockedLabel}
      </div>

      <p className="relative z-10 mt-3 text-sm text-slate-300/78">
        {unlocked ? 'Tap to inspect this restored piece.' : 'Scan the office QR to enter this stage.'}
      </p>
    </button>
  );
};
