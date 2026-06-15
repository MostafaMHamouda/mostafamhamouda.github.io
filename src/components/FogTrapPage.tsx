import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamState, saveTeamState } from '../lib/team-state';
import { cn } from '../lib/utils';
import { CodeInput } from './CodeInput';
import { GlowingButton } from './GlowingButton';
import { Layout } from './Layout';
import { QuestHeader } from './QuestHeader';
import { ScoreBadge } from './ScoreBadge';
import { SuccessModal } from './SuccessModal';
import { TextareaPrompt } from './TextareaPrompt';

type FogAnswerField = {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea';
};

type FogTrapPageProps = {
  id: string;
  title: string;
  fogMessage: string;
  taskContent: ReactNode;
  answerFields: FogAnswerField[];
  correctAnswer?: string;
  clue: string;
  scoreOnCompletion?: number;
  wrongAnswerMessage?: string;
  successMessage?: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

export const FogTrapPage = ({
  id,
  title,
  fogMessage,
  taskContent,
  answerFields,
  correctAnswer,
  clue,
  scoreOnCompletion = 0,
  wrongAnswerMessage = 'The Fog is still twisting this answer. Re-read the trap and try again.',
  successMessage = 'The trap is recorded. Take the clue and return to the map.',
}: FogTrapPageProps) => {
  const navigate = useNavigate();
  const teamState = getTeamState();

  const initialAnswers = useMemo(
    () => Object.fromEntries(answerFields.map((field) => [field.id, ''])) as Record<string, string>,
    [answerFields],
  );

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(Boolean(teamState?.fogCompleted.includes(id)));

  if (!teamState) return null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const latestState = getTeamState();
    if (!latestState) return;

    const hasBlankField = answerFields.some((field) => !answers[field.id]?.trim());
    if (hasBlankField) {
      setFeedback('The Fog clears only when your team leaves a real response in every field.');
      return;
    }

    if (correctAnswer) {
      const firstValue = answers[answerFields[0]?.id ?? ''] ?? '';
      if (normalize(firstValue) !== normalize(correctAnswer)) {
        setFeedback(wrongAnswerMessage);
        return;
      }
    }

    if (!latestState.fogCompleted.includes(id)) {
      const nextState = {
        ...latestState,
        fogCompleted: [...latestState.fogCompleted, id],
        score: latestState.score + Math.max(0, scoreOnCompletion),
      };
      saveTeamState(nextState);
    }

    setIsCompleted(true);
    setFeedback(null);
    setShowSuccessModal(true);
  };

  return (
    <Layout className="gap-5 py-5">
      <section className="glass-panel rounded-[2rem] border border-slate-200/10 bg-gradient-to-br from-slate-300/10 via-slate-700/8 to-slate-900/25 p-5 shadow-[0_20px_60px_rgba(10,12,20,0.55)]">
        <div className="flex items-start justify-between gap-3">
          <QuestHeader eyebrow="Fog Trap" title={title} subtitle={fogMessage} />
          <ScoreBadge score={getTeamState()?.score ?? teamState.score} />
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] border border-slate-200/10 bg-slate-900/35 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Trap Task</h2>
        <div className="mt-4 space-y-4 text-base leading-7 text-slate-200/86">{taskContent}</div>
      </section>

      <form className="space-y-5" onSubmit={onSubmit}>
        <section className="glass-panel rounded-[2rem] border border-slate-200/10 bg-slate-900/35 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Team Response</h2>
          <div className="mt-4 space-y-4">
            {answerFields.map((field) => (
              <label className="block" key={field.id}>
                <span className="mb-2 block text-base text-slate-200">{field.label}</span>
                {field.type === 'text' ? (
                  <CodeInput
                    className={cn('focus:border-slate-300/50 focus:ring-slate-300/25')}
                    placeholder={field.placeholder}
                    value={answers[field.id]}
                    onChange={(event) =>
                      setAnswers((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  />
                ) : (
                  <TextareaPrompt
                    className={cn('min-h-28 focus:border-slate-300/50 focus:ring-slate-300/25')}
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

          {feedback ? <p className="mt-4 text-base text-slate-300">{feedback}</p> : null}

          <div className="mt-6 space-y-3">
            <GlowingButton
              className="bg-gradient-to-r from-slate-200/90 via-slate-300/90 to-slate-400/90 text-slate-950 shadow-[0_0_24px_rgba(203,213,225,0.25)]"
              type="submit"
            >
              Dispel the Trap
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
        <section className="glass-panel rounded-[2rem] border border-slate-200/10 bg-slate-900/35 p-5">
          <h2 className="text-lg font-semibold text-slate-100">Clue Uncovered</h2>
          <p className="mt-3 text-base leading-7 text-slate-200/86">{clue}</p>
        </section>
      ) : null}

      <SuccessModal
        open={showSuccessModal}
        title="Fog Shifted"
        description={successMessage}
        actionLabel="Back to Map"
        extra={<p className="text-base font-medium text-white">{clue}</p>}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/map');
        }}
      />
    </Layout>
  );
};
