import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeInput } from '../components/CodeInput';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { buildInitialTeamState, saveTeamState } from '../lib/team-state';

export const TeamRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    teamName: '',
    membersCount: '4',
    pathfinder: '',
    scanner: '',
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    saveTeamState(
      buildInitialTeamState({
        teamName: form.teamName.trim(),
        membersCount: Number(form.membersCount),
        pathfinder: form.pathfinder.trim(),
        scanner: form.scanner.trim(),
      }),
    );

    navigate('/map');
  };

  return (
    <Layout className="justify-center">
      <section className="glass-panel rounded-[2rem] p-6">
        <QuestHeader
          eyebrow="Team Registry"
          title="Gather Your Crew"
          subtitle="Register your trail team before the first QR unlock."
        />
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Team Name</span>
            <CodeInput
              required
              value={form.teamName}
              onChange={(event) => setForm((current) => ({ ...current, teamName: event.target.value }))}
              placeholder="Aurora Navigators"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Number of Members</span>
            <CodeInput
              required
              min={2}
              max={12}
              type="number"
              value={form.membersCount}
              onChange={(event) => setForm((current) => ({ ...current, membersCount: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Pathfinder Name</span>
            <CodeInput
              required
              value={form.pathfinder}
              onChange={(event) => setForm((current) => ({ ...current, pathfinder: event.target.value }))}
              placeholder="Team lead on clue navigation"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Scanner Name</span>
            <CodeInput
              required
              value={form.scanner}
              onChange={(event) => setForm((current) => ({ ...current, scanner: event.target.value }))}
              placeholder="QR keeper"
            />
          </label>
          <div className="pt-2">
            <GlowingButton type="submit">Enter the Map</GlowingButton>
          </div>
        </form>
      </section>
    </Layout>
  );
};
