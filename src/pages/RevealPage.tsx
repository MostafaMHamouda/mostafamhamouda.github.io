import { Navigate, useNavigate } from 'react-router-dom';
import { CoreVisual } from '../components/CoreVisual';
import { EnergyStream } from '../components/EnergyStream';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { worldConfigs } from '../data/game-config';
import { getTeamState, resetTeamState } from '../lib/team-state';
import { cn } from '../lib/utils';

const bonusLabels: Record<string, string> = {
  'badge-constellation': 'Badge Constellation',
  'wonder-log': 'Wonder Log',
  'prototype-flame': 'Prototype Flame',
  'anti-dimness-oath': 'Anti-Dimness Oath',
};

const revealDelays = ['0ms', '500ms', '1000ms', '1500ms'] as const;

const revealPieces = {
  education: {
    src: 'piece-education.png',
    frame: 'left-2 top-4 border-sky-300/30 text-sky-100 shadow-glow-blue',
  },
  entrepreneurship: {
    src: 'piece-entrepreneurship.png',
    frame: 'right-2 top-4 border-rose-300/30 text-rose-100 shadow-glow-red',
  },
  entertainment: {
    src: 'piece-entertainment.png',
    frame: 'left-2 bottom-4 border-amber-200/30 text-amber-100 shadow-glow-gold',
  },
  exploration: {
    src: 'piece-exploration.png',
    frame: 'right-2 bottom-4 border-emerald-200/30 text-emerald-100 shadow-glow-green',
  },
} as const;

export const RevealPage = () => {
  const navigate = useNavigate();
  const teamState = getTeamState();

  if (!teamState) return null;
  if (!teamState.finalGateCompleted) return <Navigate to="/final-gate" replace />;

  const worlds = worldConfigs.filter((world) => teamState[world.key]);
  const bonuses = teamState.bonusCompleted.map((id) => bonusLabels[id] ?? id);

  return (
    <Layout className="justify-center gap-5 py-5">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] border border-sky-300/20 p-6">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 animate-revealFade bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_32%)]" />
          <div className="absolute inset-0 animate-drift bg-[radial-gradient(circle_at_left,rgba(148,163,184,0.18),transparent_22%),radial-gradient(circle_at_right,rgba(148,163,184,0.12),transparent_18%)]" />
        </div>

        <div className="relative z-10">
          <QuestHeader
            align="center"
            eyebrow="Reveal"
            title="The Living Map is Restored"
            subtitle="The Dimness fades. The Core glows again. The Living Map is restored."
          />

          <div className="mt-8 space-y-2 text-center">
            <p className="text-base text-slate-100/82 animate-revealRise">The Dimness fades.</p>
            <p className="text-base text-slate-100/82 animate-revealRise [animation-delay:700ms] [animation-fill-mode:both]">
              The Core glows again.
            </p>
            <p className="text-base text-slate-100/82 animate-revealRise [animation-delay:1400ms] [animation-fill-mode:both]">
              The Living Map is restored.
            </p>
          </div>

          <div className="relative mx-auto mt-8 flex h-80 w-full max-w-md items-center justify-center">
            {worldConfigs.map((world, index) => {
              const primaryTitle = world.title.replace(' World', '');

              return (
                <div
                  key={world.slug}
                  className={`absolute w-[7.35rem] overflow-hidden rounded-3xl border bg-slate-950/65 text-center shadow-xl animate-revealRise [animation-fill-mode:both] ${
                    revealPieces[world.slug].frame
                  }`}
                  style={{ animationDelay: revealDelays[index] }}
                >
                  <img
                    alt={`${world.title} restored piece`}
                    className="h-28 w-full object-cover object-top"
                    src={`${import.meta.env.BASE_URL}assets/${revealPieces[world.slug].src}`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,15,0.04),rgba(5,7,15,0.38)_55%,rgba(5,7,15,0.86)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 z-10 px-2 py-2 text-center text-[0.68rem] font-medium leading-3">
                    <span
                      className={cn(
                        'block',
                        world.slug === 'entrepreneurship' && 'text-[0.62rem] tracking-[-0.02em]',
                      )}
                    >
                      {primaryTitle}
                    </span>
                    <span
                      className={cn(
                        'mt-1 block',
                        world.slug === 'entrepreneurship' && 'text-[0.62rem]',
                      )}
                    >
                      World
                    </span>
                  </div>
                </div>
              );
            })}

            <EnergyStream active className="left-[24%] top-[32%] w-[22%] rotate-[28deg]" color="blue" fromWorld="Education World" />
            <EnergyStream active className="right-[24%] top-[32%] w-[22%] rotate-[-28deg]" color="red" fromWorld="Entrepreneurship World" />
            <EnergyStream active className="left-[24%] bottom-[30%] w-[22%] rotate-[-28deg]" color="gold" fromWorld="Entertainment World" />
            <EnergyStream active className="right-[24%] bottom-[30%] w-[22%] rotate-[28deg]" color="green" fromWorld="Exploration World" />

            <CoreVisual
              boosted
              className="h-36 w-36 animate-revealRise [animation-delay:1800ms] [animation-fill-mode:both] md:h-44 md:w-44"
              showReadyText={false}
              unlockedCount={4}
            />
          </div>

          <div className="mt-8 space-y-4 text-center animate-revealRise [animation-delay:2000ms] [animation-fill-mode:both]">
            <p className="text-base leading-7 text-slate-100/88">
              Welcome to Learnova - Where Questions Become Doors, Stories Become Bridges, Ideas Become Courage, and Exploration Becomes Growth.
            </p>
            <p className="text-base leading-8 text-slate-100/88" dir="rtl">
              أهلًا بكم في Learnova - حيث تتحول الأسئلة إلى أبواب، والقصص إلى جسور، والأفكار إلى شجاعة، والاستكشاف إلى نمو.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-[2rem] p-5">
          <h2 className="text-lg font-semibold text-sky-100">Quest Summary</h2>
          <div className="mt-4 space-y-3 text-base text-slate-100/86">
            <p>Team: {teamState.teamName}</p>
            <p>Final score: {teamState.score}</p>
            <p>Completed worlds: {worlds.length}/4</p>
            <p>Completed bonuses: {bonuses.length}</p>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-5">
          <h2 className="text-lg font-semibold text-sky-100">Restored Worlds</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {worlds.map((world) => (
              <span
                key={world.slug}
                className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-slate-100"
              >
                {world.title}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-5 md:col-span-2">
          <h2 className="text-lg font-semibold text-sky-100">Bonus Echoes</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {bonuses.length > 0 ? (
              bonuses.map((bonus) => (
                <span
                  key={bonus}
                  className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-sm text-slate-100"
                >
                  {bonus}
                </span>
              ))
            ) : (
              <p className="text-base text-slate-200/76">No bonus quests were completed.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <GlowingButton onClick={() => navigate('/map')}>Back to Map</GlowingButton>
        <GlowingButton
          className="bg-gradient-to-r from-rose-400 to-orange-300"
          onClick={() => {
            resetTeamState();
            navigate('/team-register', { replace: true });
          }}
        >
          Restart Quest
        </GlowingButton>
      </section>
    </Layout>
  );
};
