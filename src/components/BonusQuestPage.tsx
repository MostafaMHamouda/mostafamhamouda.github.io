import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCurrentTeam } from '../hooks/useCurrentTeam';
import { useTeamCompletions } from '../hooks/useTeamCompletions';
import { completeItem, logTeamEvent } from '../services/gameService';
import { CodeInput } from './CodeInput';
import { GlowingButton } from './GlowingButton';
import { Layout } from './Layout';
import { QuestHeader } from './QuestHeader';
import { ScoreBadge } from './ScoreBadge';
import { SuccessModal } from './SuccessModal';
import { TextareaPrompt } from './TextareaPrompt';

type BonusAnswerField = {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea';
};

type BonusQuestPageProps = {
  id: string;
  title: string;
  instructions: ReactNode;
  answerFields: BonusAnswerField[];
  successMessage: string;
};

export const BonusQuestPage = ({
  id,
  title,
  instructions,
  answerFields,
  successMessage,
}: BonusQuestPageProps) => {
  const navigate = useNavigate();
  const { team, teamId, loading, error, refreshTeam } = useCurrentTeam();
  const { completions, refreshCompletions } = useTeamCompletions(teamId);

  const initialAnswers = useMemo(
    () => Object.fromEntries(answerFields.map((field) => [field.id, ''])) as Record<string, string>,
    [answerFields],
  );

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCompleted = completions.some(
    (completion) => completion.item_type === 'bonus' && completion.item_id === id,
  );

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
          <QuestHeader eyebrow="Bonus Quest" title={title} subtitle={error ?? 'Team session was not found.'} />
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

    const hasBlankField = answerFields.some((field) => !answers[field.id]?.trim());
    if (hasBlankField) {
      setFeedback('A bonus quest only counts when every response field has a real answer.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await completeItem(team.id, 'bonus', id, 2);
      if (result.alreadyCompleted) {
        setFeedback('Already completed.');
      } else {
        await logTeamEvent(team.id, 'bonus_completed', title, 2, { bonusId: id });
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

  return (
    <Layout className="gap-5 py-5">
      <section className="glass-panel rounded-[2rem] border border-amber-200/10 bg-gradient-to-br from-amber-300/12 via-orange-300/8 to-slate-900/20 p-5">
        <div className="flex items-start justify-between gap-3">
          <QuestHeader
            eyebrow="Bonus Quest"
            title={title}
            subtitle="Optional side quest. Completing it adds +2 score once."
          />
          <ScoreBadge score={team.score} />
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] border border-amber-200/10 bg-slate-900/35 p-5">
        <h2 className="text-lg font-semibold text-amber-100">Quest Instructions</h2>
        <div className="mt-4 space-y-4 text-base leading-7 text-slate-100/86">{instructions}</div>
      </section>

      <form className="space-y-5" onSubmit={onSubmit}>
        <section className="glass-panel rounded-[2rem] border border-amber-200/10 bg-slate-900/35 p-5">
          <h2 className="text-lg font-semibold text-amber-100">Team Response</h2>
          <div className="mt-4 space-y-4">
            {answerFields.map((field) => (
              <label className="block" key={field.id}>
                <span className="mb-2 block text-base text-slate-200">{field.label}</span>
                {field.type === 'text' ? (
                  <CodeInput
                    className="focus:border-amber-200/50 focus:ring-amber-200/25"
                    disabled={submitting}
                    placeholder={field.placeholder}
                    value={answers[field.id]}
                    onChange={(event) =>
                      setAnswers((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  />
                ) : (
                  <TextareaPrompt
                    className="min-h-28 focus:border-amber-200/50 focus:ring-amber-200/25"
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

          {feedback ? <p className="mt-4 text-base text-amber-100/85">{feedback}</p> : null}

          <div className="mt-6 space-y-3">
            <GlowingButton
              className="bg-gradient-to-r from-amber-300/90 via-yellow-200/90 to-orange-300/90 shadow-glow-gold"
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Saving...' : 'Complete Bonus Quest'}
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
        <section className="glass-panel rounded-[2rem] border border-amber-200/10 bg-slate-900/35 p-5">
          <h2 className="text-lg font-semibold text-amber-100">Bonus Recorded</h2>
          <p className="mt-3 text-base leading-7 text-slate-100/86">{successMessage}</p>
        </section>
      ) : null}

      <SuccessModal
        open={showSuccessModal}
        title="Bonus Completed"
        description={successMessage}
        actionLabel="Back to Map"
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/map');
        }}
      />
    </Layout>
  );
};
