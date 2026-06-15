import { useNavigate } from 'react-router-dom';
import { CoreVisual } from '../components/CoreVisual';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';

export const StartPage = () => {
  const navigate = useNavigate();

  return (
    <Layout className="justify-center gap-8">
      <div className="glass-panel rounded-[2rem] p-6">
        <QuestHeader
          eyebrow="Quest Onboarding"
          title="The Learnova Lost Map"
          subtitle="الخريطة المفقودة لليرنوفا"
          align="center"
        />
        <div className="my-8">
          <CoreVisual />
        </div>
        <div className="space-y-3 text-center text-sm leading-7 text-slate-200/84">
          <p>The Living Map has been stolen.</p>
          <p>The Core of Learno is dimming.</p>
          <p>Four worlds are covered in Fog.</p>
          <p>Your team has been chosen to restore the map.</p>
        </div>
        <div className="mt-8">
          <GlowingButton onClick={() => navigate('/team-register')}>Start the Quest</GlowingButton>
        </div>
      </div>
    </Layout>
  );
};
