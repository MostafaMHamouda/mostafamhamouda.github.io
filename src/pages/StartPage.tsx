import { useNavigate } from 'react-router-dom';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';

export const StartPage = () => {
  const navigate = useNavigate();
  const livingMapSrc = `${import.meta.env.BASE_URL}assets/living-map-reference.png`;

  return (
    <Layout className="justify-center gap-6">
      <section className="glass-panel overflow-hidden rounded-[2rem] border border-amber-200/15">
        <div className="relative">
          <img
            alt="The Living Map of Learno"
            className="h-64 w-full object-cover object-center opacity-70"
            src={livingMapSrc}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,15,0.12),rgba(5,7,15,0.84))]" />
          <div className="absolute inset-x-4 bottom-4 rounded-[1.6rem] border border-white/10 bg-slate-950/62 p-5 backdrop-blur-xl">
            <QuestHeader
              eyebrow="Quest Onboarding"
              title="The Learnova Lost Map"
              subtitle="الخريطة المفقودة لليرنوفا"
              align="center"
            />
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-[1.5rem] border border-sky-200/10 bg-[linear-gradient(135deg,rgba(83,184,255,0.08),rgba(255,203,92,0.05))] p-4">
            <p className="text-center text-base leading-7 text-slate-100/88">
              The Living Map has been stolen. The Core of Learno is dimming. Four worlds are covered
              in Fog, and your team has been chosen to restore the light.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-sky-300/16 bg-sky-300/10 px-3 py-3 text-sky-100">
              Education
            </div>
            <div className="rounded-2xl border border-rose-300/16 bg-rose-300/10 px-3 py-3 text-rose-100">
              Entrepreneurship
            </div>
            <div className="rounded-2xl border border-amber-200/16 bg-amber-200/10 px-3 py-3 text-amber-100">
              Entertainment
            </div>
            <div className="rounded-2xl border border-emerald-200/16 bg-emerald-200/10 px-3 py-3 text-emerald-100">
              Exploration
            </div>
          </div>

          <GlowingButton onClick={() => navigate('/team-register')}>Start the Quest</GlowingButton>
        </div>
      </section>
    </Layout>
  );
};
