import { TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export const TextareaPrompt = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      'min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/30',
      className,
    )}
    {...props}
  />
);
