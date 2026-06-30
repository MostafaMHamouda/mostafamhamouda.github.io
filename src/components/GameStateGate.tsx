import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSettings } from '../hooks/useGameSettings';
import { GlowingButton } from './GlowingButton';
import { Layout } from './Layout';
import { QuestHeader } from './QuestHeader';

type GameStateGateMode = 'register' | 'play' | 'final-gate';

type GameStateGateProps = {
  children: ReactNode;
  mode: GameStateGateMode;
};

export const GameStateGate = ({ children, mode }: GameStateGateProps) => {
  const navigate = useNavigate();
  const { settings, loading, error } = useGameSettings();

  if (loading) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] p-6 text-base text-slate-100/86">
          Loading game settings...
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-rose-300/20 p-6">
          <QuestHeader eyebrow="Game Settings" title="Connection issue" subtitle={error} />
        </section>
      </Layout>
    );
  }

  if (mode === 'register' && !settings.registrations_open) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-amber-200/20 p-6">
          <QuestHeader
            eyebrow="Team Registry"
            title="Registration is closed"
            subtitle="Team registration is currently closed. Please contact the facilitator."
          />
        </section>
      </Layout>
    );
  }

  if (mode !== 'register' && !settings.game_started) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-sky-300/20 p-6">
          <QuestHeader
            eyebrow="Game Status"
            title="The quest has not started yet"
            subtitle="Please wait for the facilitator to start the game."
          />
          <div className="mt-6">
            <GlowingButton onClick={() => navigate('/map')}>Back to Map</GlowingButton>
          </div>
        </section>
      </Layout>
    );
  }

  if (mode !== 'register' && settings.game_paused) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-amber-200/20 p-6">
          <QuestHeader
            eyebrow="Game Status"
            title="The quest is paused"
            subtitle="Please wait for the facilitator to resume the game."
          />
          <div className="mt-6">
            <GlowingButton onClick={() => navigate('/map')}>Back to Map</GlowingButton>
          </div>
        </section>
      </Layout>
    );
  }

  if (mode === 'final-gate' && !settings.final_gate_open) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-amber-200/20 p-6">
          <QuestHeader
            eyebrow="Endgame"
            title="Final Gate is closed"
            subtitle="The facilitator has not opened the Final Gate globally yet."
          />
          <div className="mt-6">
            <GlowingButton onClick={() => navigate('/map')}>Back to Map</GlowingButton>
          </div>
        </section>
      </Layout>
    );
  }

  return <>{children}</>;
};
