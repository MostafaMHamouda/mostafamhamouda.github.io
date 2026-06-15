import { ReactNode } from 'react';
import { GlowingButton } from './GlowingButton';

type SuccessModalProps = {
  open: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  onClose: () => void;
  extra?: ReactNode;
};

export const SuccessModal = ({
  open,
  title,
  description,
  actionLabel = 'Continue',
  onClose,
  extra,
}: SuccessModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6">
        <h3 className="text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-200/78">{description}</p>
        {extra ? <div className="mt-4">{extra}</div> : null}
        <div className="mt-6">
          <GlowingButton onClick={onClose}>{actionLabel}</GlowingButton>
        </div>
      </div>
    </div>
  );
};
