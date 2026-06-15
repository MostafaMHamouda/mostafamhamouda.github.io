import { useNavigate } from 'react-router-dom';
import { GuardianCard } from '../components/GuardianCard';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { TextareaPrompt } from '../components/TextareaPrompt';

type ChallengePlaceholderPageProps = {
  title: string;
  subtitle: string;
  guardian: string;
  world: string;
  message: string;
};

export const ChallengePlaceholderPage = ({
  title,
  subtitle,
  guardian,
  world,
  message,
}: ChallengePlaceholderPageProps) => {
  const navigate = useNavigate();

  return (
    <Layout className="justify-center gap-5">
      <section className="glass-panel rounded-[2rem] p-6">
        <QuestHeader eyebrow={world} title={title} subtitle={subtitle} />
        <div className="mt-6">
          <GuardianCard guardian={guardian} world={world} message={message} />
        </div>
        <div className="mt-6">
          <TextareaPrompt placeholder="Challenge interaction scaffold for the next build phase." />
        </div>
        <div className="mt-6">
          <GlowingButton onClick={() => navigate('/map')}>Return to Map</GlowingButton>
        </div>
      </section>
    </Layout>
  );
};
