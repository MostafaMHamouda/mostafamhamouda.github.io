import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getWorldConfig, worldColumnMap } from '../data/gameConfig';
import { useCurrentTeam } from '../hooks/useCurrentTeam';
import { useTeamCompletions } from '../hooks/useTeamCompletions';
import { completeItem, logTeamEvent, unlockWorld, useHint } from '../services/gameService';
import type { WorldKey } from '../types/game';
import { cn } from '../lib/utils';
import { CodeInput } from './CodeInput';
import { GlowingButton } from './GlowingButton';
import { GuardianCard } from './GuardianCard';
import { Layout } from './Layout';
import { QuestHeader } from './QuestHeader';
import { ScoreBadge } from './ScoreBadge';
import { SuccessModal } from './SuccessModal';
import { TextareaPrompt } from './TextareaPrompt';

type ThemeColor = 'blue' | 'red' | 'gold' | 'green';

type AnswerField = {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea';
};

type ChallengePageProps = {
  worldName: string;
  challengeTitle: string;
  themeColor: ThemeColor;
  guardianName: string;
  loreIntro: string;
  digitalPuzzle: ReactNode;
  answerFields: AnswerField[];
  interactiveTaskTitle: string;
  interactiveTaskInstructions: ReactNode;
  guardianInstructions: ReactNode;
  correctCode: string;
  unlockWorldKey:
    | WorldKey
    | 'educationUnlocked'
    | 'entrepreneurshipUnlocked'
    | 'entertainmentUnlocked'
    | 'explorationUnlocked';
  unlockWorldSlug?: WorldKey;
  scoreOnCompletion: number;
  streamName: string;
  successMessage: string;
  mapPieceMessage: string;
  hintText: string;
};

const themeStyles: Record<
  ThemeColor,
  {
    accentText: string;
    accentBorder: string;
    accentRing: string;
    accentBg: string;
    accentGlow: string;
    buttonClass: string;
  }
> = {
  blue: {
    accentText: 'text-sky-200',
    accentBorder: 'border-sky-300/25',
    accentRing: 'focus:ring-sky-300/30 focus:border-sky-300/50',
    accentBg: 'from-sky-400/25 via-cyan-300/10 to-indigo-400/15',
    accentGlow: 'shadow-glow-blue',
    buttonClass: 'from-sky-400/90 via-indigo-400/90 to-cyan-300/90',
  },
  red: {
    accentText: 'text-rose-200',
    accentBorder: 'border-rose-300/25',
    accentRing: 'focus:ring-rose-300/30 focus:border-rose-300/50',
    accentBg: 'from-rose-400/25 via-orange-300/10 to-red-400/15',
    accentGlow: 'shadow-glow-red',
    buttonClass: 'from-rose-400/90 via-orange-300/90 to-red-300/90',
  },
  gold: {
    accentText: 'text-amber-100',
    accentBorder: 'border-amber-200/25',
    accentRing: 'focus:ring-amber-200/30 focus:border-amber-200/50',
    accentBg: 'from-amber-300/25 via-yellow-200/10 to-orange-300/15',
    accentGlow: 'shadow-glow-gold',
    buttonClass: 'from-amber-300/90 via-yellow-200/90 to-orange-300/90',
  },
  green: {
    accentText: 'text-emerald-100',
    accentBorder: 'border-emerald-200/25',
    accentRing: 'focus:ring-emerald-200/30 focus:border-emerald-200/50',
    accentBg: 'from-emerald-300/25 via-lime-200/10 to-teal-300/15',
    accentGlow: 'shadow-glow-green',
    buttonClass: 'from-emerald-300/90 via-lime-200/90 to-teal-300/90',
  },
};

const normalizeCode = (value: string) => value.trim().toUpperCase();

const normalizeWorldKey = (value: ChallengePageProps['unlockWorldKey']): WorldKey => {
  switch (value) {
    case 'educationUnlocked':
      return 'education';
    case 'entrepreneurshipUnlocked':
      return 'entrepreneurship';
    case 'entertainmentUnlocked':
      return 'entertainment';
    case 'explorationUnlocked':
      return 'exploration';
    default:
      return value;
  }
};

export const ChallengePage = ({
  worldName,
  challengeTitle,
  themeColor,
  guardianName,
  loreIntro,
  digitalPuzzle,
  answerFields,
  interactiveTaskTitle,
  interactiveTaskInstructions,
  guardianInstructions,
  correctCode,
  unlockWorldKey,
  unlockWorldSlug,
  scoreOnCompletion,
  streamName,
  successMessage,
  mapPieceMessage,
  hintText,
}: ChallengePageProps) => {
  const navigate = useNavigate();
  const { team, teamId, loading, error, refreshTeam } = useCurrentTeam();
  const { completions, refreshCompletions } = useTeamCompletions(teamId);
  const theme = themeStyles[themeColor];
  const worldKey = unlockWorldSlug ?? normalizeWorldKey(unlockWorldKey);
  const worldConfig = getWorldConfig(worldKey);
  const worldColumnKey = worldConfig?.columnKey ?? worldColumnMap[worldKey];

  const initialAnswers = useMemo(
    () =>
      Object.fromEntries(answerFields.map((field) => [field.id, ''])) as Record<string, string>,
    [answerFields],
  );

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [codeInput, setCodeInput] = useState('');
  const [hintRevealed, setHintRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintSaving, setHintSaving] = useState(false);

  const hasWorldCompletion = completions.some(
    (completion) => completion.item_type === 'world' && completion.item_id === worldKey,
  );
  const isCompleted = Boolean(team?.[worldColumnKey]);

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
          <QuestHeader
            eyebrow={worldName}
            title={challengeTitle}
            subtitle={error ?? 'Team session was not found.'}
          />
          <div className="mt-6">
            <GlowingButton onClick={() => navigate('/team-register')}>
              Go to Team Register
            </GlowingButton>
          </div>
        </section>
      </Layout>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (normalizeCode(codeInput) !== normalizeCode(correctCode)) {
      setFeedback('Fog blocks the path. Check the code with the Guardian and try again.');
      return;
    }

    setSubmitting(true);

    try {
      if (team[worldColumnKey] || hasWorldCompletion) {
        setFeedback('This world is already restored for your team.');
        setShowSuccessModal(true);
        return;
      }

      const unlockResult = await unlockWorld(team.id, worldKey);
      const completionResult = await completeItem(team.id, 'world', worldKey, scoreOnCompletion);

      if (!completionResult.alreadyCompleted && !unlockResult.alreadyUnlocked) {
        await logTeamEvent(team.id, 'world_unlocked', `${worldName} restored`, scoreOnCompletion, {
          worldKey,
        });
      }

      await Promise.all([refreshTeam(), refreshCompletions()]);
      setFeedback(null);
      setShowSuccessModal(true);
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

  const onRevealHint = async () => {
    if (hintRevealed) return;

    setHintRevealed(true);
    setHintSaving(true);

    try {
      await useHint(team.id);
      await logTeamEvent(team.id, 'hint_used', `${worldName} hint used`, -1, { worldKey });
      await refreshTeam();
    } catch (nextError) {
      setFeedback(
        nextError instanceof Error
          ? nextError.message
          : 'Connection issue. Please try again or contact the facilitator.',
      );
    } finally {
      setHintSaving(false);
    }
  };

  return (
    <Layout className="gap-5 py-5">
      <section
        className={cn(
          'glass-panel rounded-[2rem] border bg-gradient-to-br p-5',
          theme.accentBorder,
          theme.accentBg,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <QuestHeader eyebrow={worldName} title={challengeTitle} subtitle={loreIntro} />
          <ScoreBadge score={team.score} />
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-5">
        <h2 className={cn('text-lg font-semibold', theme.accentText)}>Digital Puzzle</h2>
        <div className="mt-4 space-y-4 text-base leading-7 text-slate-100/86">{digitalPuzzle}</div>
      </section>

      <form className="space-y-5" onSubmit={onSubmit}>
        <section className="glass-panel rounded-[2rem] p-5">
          <h2 className={cn('text-lg font-semibold', theme.accentText)}>Team Answers</h2>
          <div className="mt-4 space-y-4">
            {answerFields.map((field) => (
              <label className="block" key={field.id}>
                <span className="mb-2 block text-base text-slate-200">{field.label}</span>
                {field.type === 'text' ? (
                  <CodeInput
                    className={cn(theme.accentRing)}
                    disabled={submitting}
                    placeholder={field.placeholder}
                    value={answers[field.id]}
                    onChange={(event) =>
                      setAnswers((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  />
                ) : (
                  <TextareaPrompt
                    className={cn('min-h-28', theme.accentRing)}
                    disabled={submitting}
                    placeholder={field.placeholder}
                    value={answers[field.id]}
                    onChange={(event) =>
                      setAnswers((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-5">
          <h2 className={cn('text-lg font-semibold', theme.accentText)}>{interactiveTaskTitle}</h2>
          <div className="mt-4 text-base leading-7 text-slate-100/86">
            {interactiveTaskInstructions}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-5">
          <GuardianCard guardian={guardianName} world={worldName} message="" />
          <div className="mt-4 text-base leading-7 text-slate-100/86">{guardianInstructions}</div>
        </section>

        <section className="glass-panel rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className={cn('text-lg font-semibold', theme.accentText)}>Guardian Code</h2>
            <button
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition',
                theme.accentBorder,
                theme.accentText,
                hintRevealed || hintSaving ? 'opacity-50' : 'hover:bg-white/5',
              )}
              onClick={onRevealHint}
              type="button"
            >
              {hintSaving ? 'Saving...' : hintRevealed ? 'Hint Revealed' : 'Reveal Hint'}
            </button>
          </div>

          {hintRevealed ? (
            <div
              className={cn(
                'mt-4 rounded-2xl border bg-slate-950/45 p-4 text-sm',
                theme.accentBorder,
                theme.accentGlow,
              )}
            >
              <p className="font-medium text-white">Hint</p>
              <p className="mt-2 leading-6 text-slate-200/82">{hintText}</p>
            </div>
          ) : null}

          <label className="mt-5 block">
            <span className="mb-2 block text-base text-slate-200">Enter the Guardian code</span>
            <CodeInput
              className={cn(theme.accentRing)}
              disabled={submitting}
              placeholder="Type the code exactly as given"
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
            />
          </label>

          {feedback ? <p className="mt-3 text-sm text-rose-200">{feedback}</p> : null}

          <div className="mt-6 space-y-3">
            <GlowingButton className={cn(theme.buttonClass)} disabled={submitting} type="submit">
              {submitting ? 'Validating...' : isCompleted ? 'Already Restored' : 'Validate Code'}
            </GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => navigate('/map')}
              type="button"
            >
              Back to Map
            </GlowingButton>
          </div>
        </section>
      </form>

      {isCompleted ? (
        <section className={cn('glass-panel rounded-[2rem] border p-5', theme.accentBorder)}>
          <h2 className={cn('text-lg font-semibold', theme.accentText)}>Map Piece Restored</h2>
          <p className="mt-3 text-base leading-7 text-slate-100/86">{successMessage}</p>
          <p className="mt-3 text-base font-medium text-white">{mapPieceMessage}</p>
        </section>
      ) : null}

      <SuccessModal
        open={showSuccessModal}
        title="Guardian Code Accepted"
        description={`The ${streamName} flows again.`}
        actionLabel="Return to the Living Map"
        extra={
          <div className="space-y-3">
            <div
              className={cn(
                'h-2 w-full rounded-full bg-gradient-to-r bg-[length:200%_100%] animate-energyFlow',
                theme.buttonClass,
              )}
            />
            <p className="text-base font-medium text-white">{successMessage}</p>
            <p className="text-base text-slate-100/86">{mapPieceMessage}</p>
          </div>
        }
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/map');
        }}
      />
    </Layout>
  );
};
