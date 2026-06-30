import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeInput } from '../components/CodeInput';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { useGameSettings } from '../hooks/useGameSettings';
import { hasLegacyTeamState, setCurrentTeamId } from '../lib/teamSession';
import { supabaseConfigError } from '../lib/supabase';
import { registerTeam } from '../services/gameService';

export const TeamRegisterPage = () => {
  const navigate = useNavigate();
  const livingMapSrc = `${import.meta.env.BASE_URL}assets/living-map-reference.png`;
  const legacyStateDetected = useMemo(() => hasLegacyTeamState(), []);
  const { settings } = useGameSettings();
  const [form, setForm] = useState({
    teamName: '',
    membersCount: '4',
    pathfinder: '',
    scanner: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupError = supabaseConfigError;
  const registrationClosedMessage =
    !settings.registrations_open
      ? 'Team registration is currently closed. Please contact the facilitator.'
      : null;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const teamName = form.teamName.trim();
    const membersCount = Number(form.membersCount);

    if (!teamName) {
      setError('Team name is required.');
      return;
    }

    if (!Number.isFinite(membersCount) || membersCount < 1 || membersCount > 12) {
      setError('Members count must be between 1 and 12.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const team = await registerTeam({
        team_name: teamName,
        members_count: membersCount,
        pathfinder: form.pathfinder.trim(),
        scanner: form.scanner.trim(),
      });

      setCurrentTeamId(team.id);
      navigate('/map');
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Connection issue. Please try again or contact the facilitator.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formDisabled = Boolean(setupError || registrationClosedMessage || submitting);

  return (
    <Layout className="justify-center">
      <section className="glass-panel overflow-hidden rounded-[2rem] border border-amber-200/15">
        <div className="relative">
          <img
            alt="Living Map registration panel"
            className="h-40 w-full object-cover object-center opacity-55"
            src={livingMapSrc}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,15,0.08),rgba(5,7,15,0.82))]" />
          <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
            <QuestHeader
              eyebrow="Team Registry"
              title="Gather Your Crew"
              subtitle="Register your trail team before the first QR unlock."
            />
          </div>
        </div>

        <form className="space-y-4 p-6" onSubmit={onSubmit}>
          {legacyStateDetected ? (
            <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-100">
              This version uses synced team data. Please register your team again if needed.
            </div>
          ) : null}

          {setupError ? (
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">
              {setupError}
            </div>
          ) : null}

          {registrationClosedMessage ? (
            <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-100">
              {registrationClosedMessage}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-100">
              {error}
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Team Name</span>
            <CodeInput
              disabled={formDisabled}
              required
              value={form.teamName}
              onChange={(event) =>
                setForm((current) => ({ ...current, teamName: event.target.value }))
              }
              placeholder="Aurora Navigators"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Number of Members</span>
            <CodeInput
              disabled={formDisabled}
              required
              min={1}
              max={12}
              type="number"
              value={form.membersCount}
              onChange={(event) =>
                setForm((current) => ({ ...current, membersCount: event.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Pathfinder Name</span>
            <CodeInput
              disabled={formDisabled}
              required
              value={form.pathfinder}
              onChange={(event) =>
                setForm((current) => ({ ...current, pathfinder: event.target.value }))
              }
              placeholder="Team lead on clue navigation"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Scanner Name</span>
            <CodeInput
              disabled={formDisabled}
              required
              value={form.scanner}
              onChange={(event) =>
                setForm((current) => ({ ...current, scanner: event.target.value }))
              }
              placeholder="QR keeper"
            />
          </label>
          <div className="pt-2">
            <GlowingButton disabled={formDisabled} type="submit">
              {submitting ? 'Creating Team...' : 'Enter the Map'}
            </GlowingButton>
          </div>
        </form>
      </section>
    </Layout>
  );
};
