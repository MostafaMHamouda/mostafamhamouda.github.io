import { cn } from '../lib/utils';

type EnergyStreamProps = {
  fromWorld: string;
  color: 'blue' | 'red' | 'gold' | 'green';
  active: boolean;
  className?: string;
};

const colorClasses = {
  blue: 'from-sky-300/0 via-sky-300/85 to-sky-100/0 shadow-glow-blue',
  red: 'from-rose-300/0 via-rose-300/85 to-amber-200/0 shadow-glow-red',
  gold: 'from-amber-200/0 via-amber-200/85 to-yellow-100/0 shadow-glow-gold',
  green: 'from-emerald-200/0 via-emerald-200/85 to-lime-100/0 shadow-glow-green',
};

export const EnergyStream = ({
  fromWorld,
  color,
  active,
  className,
}: EnergyStreamProps) => (
  <div
    aria-hidden="true"
    data-world={fromWorld}
    className={cn(
      'pointer-events-none absolute h-1.5 rounded-full transition duration-700',
      active
        ? `bg-gradient-to-r ${colorClasses[color]} bg-[length:200%_100%] animate-energyFlow opacity-100`
        : 'bg-white/8 opacity-20',
      className,
    )}
  >
    {active ? (
      <>
        <span className="absolute left-[18%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/90 blur-[1px] animate-converge" />
        <span className="absolute left-[62%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/80 blur-[1px] animate-converge [animation-delay:0.45s]" />
      </>
    ) : null}
  </div>
);
