import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

type GlowingButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    fullWidth?: boolean;
  }
>;

export const GlowingButton = ({
  children,
  className,
  disabled,
  fullWidth = true,
  ...props
}: GlowingButtonProps) => (
  <button
    className={cn(
      'rounded-2xl border border-sky-200/20 bg-gradient-to-r from-sky-400/90 via-indigo-400/90 to-cyan-300/90 px-5 py-4 text-base font-semibold text-slate-950 shadow-glow transition duration-200 hover:scale-[1.01] hover:shadow-glow-blue focus:outline-none focus:ring-2 focus:ring-sky-300/70 disabled:cursor-not-allowed disabled:opacity-45',
      fullWidth && 'w-full',
      className,
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
