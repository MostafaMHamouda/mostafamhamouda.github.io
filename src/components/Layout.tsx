import { PropsWithChildren } from 'react';
import { cn } from '../lib/utils';
import { FogOverlay } from './FogOverlay';

type LayoutProps = PropsWithChildren<{
  className?: string;
}>;

export const Layout = ({ children, className }: LayoutProps) => (
  <div className="relative min-h-screen overflow-hidden bg-stars text-slate-50">
    <FogOverlay />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%)]" />
    <main className={cn('relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6', className)}>
      {children}
    </main>
  </div>
);
