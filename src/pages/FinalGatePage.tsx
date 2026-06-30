import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CoreVisual } from '../components/CoreVisual';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { ScoreBadge } from '../components/ScoreBadge';
import { isAllWorldsUnlocked } from '../data/gameConfig';
import { useCurrentTeam } from '../hooks/useCurrentTeam';
import { completeFinalGate, logTeamEvent } from '../services/gameService';

const options = [
  { key: 'A', text: 'Speed and ready-made answers.' },
  { key: 'B', text: 'Working alone and arriving first.' },
  {
    key: 'C',
    text: 'Understanding, initiative, imagination, discovery, and collaboration.',
  },
  { key: 'D', text: 'Following instructions without questions.' },
] as const;

const beamClasses = [
  'left-[18%] top-[48%] h-1 w-28 rotate-[18deg] bg-gradient-to-r from-sky-300/10 via-sky-300 to-white/10 shadow-glow-blue',
  'right-[18%] top-[48%] h-1 w-28 rotate-[-18deg] bg-gradient-to-l from-rose-300/10 via-rose-300 to-white/10 shadow-glow-red',
  'left-[22%] bottom-[28%] h-1 w-28 rotate-[-18deg] bg-gradient-to-r from-amber-200/10 via-amber-200 to-white/10 shadow-glow-gold',
  'right-[22%] bottom-[28%] h-1 w-28 rotate-[18deg] bg-gradient-to-l from-emerald-200/10 via-emerald-200 to-white/10 shadow-glow-green',
];

const worldPieces = [
  { alt: 'Education piece', className: 'left-2 top-3 border-sky-300/24 shadow-glow-blue', src: 'piece-education.png' },
  { alt: 'Entrepreneurship piece', className: 'right-2 top-3 border-rose-300/24 shadow-glow-red', src: 'piece-entrepreneurship.png' },
  { alt: 'Entertainment piece', className: 'left-3 bottom-3 border-amber-200/24 shadow-glow-gold', src: 'piece-entertainment.png' },
  { alt: 'Exploration piece', className: 'right-3 bottom-3 border-emerald-200/24 shadow-glow-green', src: 'piece-exploration.png' },
] as const;

export const FinalGatePage = () => {
  const navigate = useNavigate();
  const { team, teamId, loading, error, refreshTeam } = useCurrentTeam();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sparkActive, setSparkActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSparkActive(Boolean(team?.final_gate_completed));
  }, [team?.final_gate_completed]);

  if (!teamId) return <Navigate to="/team-register" replace />;

  if (loading) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] p-6 text-base text-slate-100/86">
          Loading your team data...
        </section>
      </Layout>
    );
  }

  if (error || !team) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] p-6">
          <QuestHeader eyebrow="Endgame" title="Final Gate" subtitle={error ?? 'Team session was not found.'} />
        </section>
      </Layout>
    );
  }

  const allWorldsUnlocked = isAllWorldsUnlocked(team);

  const onSubmit = async () => {
    if (!selectedOption || team.final_gate_completed) return;

    if (selectedOption !== 'C') {
      setFeedback('Fog is still listening. Think about what connected the four worlds.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await completeFinalGate(team.id);
      if (!result.alreadyCompleted) {
        await logTeamEvent(team.id, 'final_gate_completed', 'Final Gate completed', 4);
      }
      await refreshTeam();
      setFeedback(null);
      setSparkActive(true);
    } catch (nextError) {
      setFeedback(
        nextError instanceof Error
          ? nextError.message
          : 'Connection issue. Please try again or contact the facilitator.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout className="justify-center gap-5 py-5">
      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-start justify-between gap-3">
          <QuestHeader
            eyebrow="Endgame"
            title="Final Gate: The Fourfold Spark"
            subtitle="Choose what truly restores the Core of Learno."
          />
          <ScoreBadge score={team.score} />
        </div>
      </section>

      {!allWorldsUnlocked ? (
        <section className="glass-panel rounded-[2rem] p-6">
          <p className="text-base leading-7 text-slate-100/86">
            The Living Map is still incomplete. Restore all four worlds first.
          </p>
          <div className="mt-6">
            <GlowingButton onClick={() => navigate('/map')}>Back to Map</GlowingButton>
          </div>
        </section>
      ) : (
        <>
          <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-sky-100">What restores the Core of Learno?</h2>
            <p className="mt-3 text-base leading-7 text-slate-100/82">
              The final answer must hold all four restored forces together.
            </p>
            <div className="mt-5 space-y-3">
              {options.map((option) => {
                const isSelected = selectedOption === option.key;
                const isCorrect = option.key === 'C';
                const showCorrect = team.final_gate_completed && isCorrect;

                return (
                  <button
                    key={option.key}
                    className={`w-full rounded-2xl border px-4 py-4 text-left text-base leading-7 transition ${
                      showCorrect
                        ? 'border-emerald-200/45 bg-emerald-200/14 text-white shadow-glow-green'
                        : isSelected
                          ? 'border-sky-300/40 bg-sky-300/12 text-white shadow-glow-blue'
                          : 'border-white/10 bg-slate-950/35 text-slate-200 hover:bg-white/5'
                    } ${team.final_gate_completed ? 'pointer-events-none' : ''}`}
                    disabled={team.final_gate_completed}
                    onClick={() => setSelectedOption(option.key)}
                    type="button"
                  >
                    <span className="font-semibold">{option.key}.</span> {option.text}
                  </button>
                );
              })}
            </div>

            {feedback ? <p className="mt-4 text-base text-rose-200">{feedback}</p> : null}

            <div className="mt-6 space-y-3">
              <GlowingButton disabled={team.final_gate_completed || submitting} onClick={onSubmit}>
                {submitting ? 'Saving...' : team.final_gate_completed ? 'Fourfold Spark Activated' : 'Awaken the Core'}
              </GlowingButton>
              {team.final_gate_completed ? (
                <GlowingButton
                  className="bg-gradient-to-r from-amber-300/90 via-yellow-200/90 to-orange-300/90 shadow-glow-gold"
                  onClick={() => navigate('/reveal')}
                >
                  Enter the Reveal
                </GlowingButton>
              ) : (
                <GlowingButton
                  className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                  onClick={() => navigate('/map')}
                >
                  Back to Map
                </GlowingButton>
              )}
            </div>
          </section>

          <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6">
            <div className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center">
              {worldPieces.map((piece, index) => (
                <div
                  key={piece.src}
                  className={`absolute h-24 w-24 overflow-hidden rounded-[1.35rem] border bg-slate-950/74 backdrop-blur-md animate-revealRise ${piece.className}`}
                  style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'both' }}
                >
                  <img
                    alt={piece.alt}
                    className="h-full w-full object-cover object-top opacity-90"
                    src={`${import.meta.env.BASE_URL}assets/${piece.src}`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,15,0.06),rgba(5,7,15,0.42))]" />
                </div>
              ))}

              {beamClasses.map((beam, index) => (
                <div
                  key={beam}
                  className={`${sparkActive ? 'opacity-100 animate-converge' : 'opacity-35'} absolute rounded-full ${beam}`}
                  style={{ animationDelay: `${index * 0.14}s` }}
                />
              ))}
              <CoreVisual boosted={sparkActive} className="h-36 w-36 md:h-44 md:w-44" showReadyText={false} unlockedCount={4} />
            </div>

            <div className="mt-2 text-center">
              <h3 className="text-xl font-semibold text-white">Fourfold Spark</h3>
              <p className="mt-3 text-base leading-7 text-slate-100/84">
                {sparkActive
                  ? 'The four restored forces converge. The gate recognizes the Living Map.'
                  : 'Blue, red, yellow, and green must agree before the gate opens.'}
              </p>
            </div>
          </section>
        </>
      )}
    </Layout>
  );
};
