import { PropsWithChildren } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { qrAccessCodes, type QrAccessKey } from '../data/qr-access';
import { getTeamState } from '../lib/team-state';
import { GlowingButton } from './GlowingButton';
import { Layout } from './Layout';
import { QuestHeader } from './QuestHeader';

type QrAccessGuardProps = PropsWithChildren<{
  qrKey: QrAccessKey;
  title: string;
}>;

const normalize = (value: string | null) => (value ?? '').trim().toLowerCase();

export const QrAccessGuard = ({ children, qrKey, title }: QrAccessGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const teamState = getTeamState();

  if (!teamState) {
    return <Navigate to="/team-register" replace />;
  }

  const searchParams = new URLSearchParams(location.search);
  const qrValue = normalize(searchParams.get('qr'));
  const expected = normalize(qrAccessCodes[qrKey]);

  if (qrValue !== expected) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-amber-200/20 p-6">
          <QuestHeader
            eyebrow="QR Required"
            title={title}
            subtitle="This stage opens only from its printed QR code."
          />
          <div className="mt-6 rounded-2xl border border-amber-200/15 bg-amber-200/10 p-4 text-base leading-7 text-slate-100/86">
            امسح رمز QR الخاص بهذه المرحلة للدخول. شاشة الخريطة مخصصة للمتابعة فقط، والدخول إلى هذا
            التحدي يتم من الرمز الخاص به.
          </div>
          <div className="mt-6">
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => navigate('/map')}
            >
              Back to Map
            </GlowingButton>
          </div>
        </section>
      </Layout>
    );
  }

  return <>{children}</>;
};
