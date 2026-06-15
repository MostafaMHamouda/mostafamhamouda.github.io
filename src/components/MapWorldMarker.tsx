import { LockKeyhole, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

type MapWorldMarkerProps = {
  title: string;
  guardian: string;
  color: 'blue' | 'red' | 'gold' | 'green';
  unlocked: boolean;
  highlighted?: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClick: () => void;
};

const positionMap = {
  'top-left': 'left-[24%] top-[22%]',
  'top-right': 'left-[76%] top-[22%]',
  'bottom-left': 'left-[24%] top-[76%]',
  'bottom-right': 'left-[76%] top-[76%]',
};

const colorMap = {
  blue: 'border-sky-300/30 bg-sky-300/15 shadow-glow-blue',
  red: 'border-rose-300/30 bg-rose-300/15 shadow-glow-red',
  gold: 'border-amber-200/30 bg-amber-200/15 shadow-glow-gold',
  green: 'border-emerald-200/30 bg-emerald-200/15 shadow-glow-green',
};

export const MapWorldMarker = ({
  title,
  guardian,
  color,
  unlocked,
  highlighted = false,
  position,
  onClick,
}: MapWorldMarkerProps) => (
  <button
    className={cn(
      'absolute z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-white backdrop-blur-md transition duration-500 md:h-16 md:w-16',
      positionMap[position],
      unlocked ? colorMap[color] : 'border-white/10 bg-slate-950/55',
      highlighted && 'scale-110 ring-2 ring-white/20',
    )}
    onClick={onClick}
    type="button"
  >
    <span className="sr-only">{title}</span>
    {unlocked ? <Sparkles className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
    <span className="absolute -bottom-8 left-1/2 w-24 -translate-x-1/2 text-center text-[11px] leading-4 text-slate-100/82 md:text-xs">
      {title.replace(' World', '')}
    </span>
  </button>
);
