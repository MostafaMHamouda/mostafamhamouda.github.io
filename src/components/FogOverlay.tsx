import { cn } from '../lib/utils';

type FogOverlayProps = {
  active?: boolean;
  fading?: boolean;
  className?: string;
};

export const FogOverlay = ({ active = true, fading = false, className }: FogOverlayProps) => (
  <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', !active && 'hidden', className)}>
    <div
      className={cn(
        'absolute -left-12 top-12 h-40 w-64 animate-drift rounded-full bg-fog-500 blur-3xl',
        fading && 'animate-fogFadeOut',
      )}
    />
    <div
      className={cn(
        'absolute right-0 top-1/3 h-52 w-72 animate-drift animate-fogPulse rounded-full bg-fog-700 blur-3xl [animation-delay:-4s]',
        fading && 'animate-fogFadeOut',
      )}
    />
    <div
      className={cn(
        'absolute bottom-8 left-1/4 h-44 w-56 animate-drift rounded-full bg-fog-500 blur-3xl [animation-delay:-7s]',
        fading && 'animate-fogFadeOut',
      )}
    />
  </div>
);
