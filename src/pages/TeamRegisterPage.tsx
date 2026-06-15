import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeInput } from '../components/CodeInput';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { buildInitialTeamState, saveTeamState } from '../lib/team-state';

export const TeamRegisterPage = () => {
  const navigate = useNavigate();
  const livingMapSrc = `${import.meta.env.BASE_URL}assets/living-map-reference.png`;
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
