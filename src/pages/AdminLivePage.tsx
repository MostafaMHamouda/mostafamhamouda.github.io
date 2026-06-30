import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { QuestHeader } from '../components/QuestHeader';
import { defaultGameSettings, getDisplayStatus, getWorldProgress, worldConfigs } from '../data/gameConfig';
import { isAdminAuthenticated } from '../lib/teamSession';
import { getAllTeams, getGameSettings, subscribeToGameSettings, subscribeToTeams } from '../services/gameService';
import type { GameSettings, Team } from '../types/game';

export const AdminLivePage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultGameSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [allTeams, nextSettings] = await Promise.all([getAllTeams(), getGameSettings()]);
        setTeams(allTeams);
        setSettings(nextSettings);
        setError(null);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : 'Supabase update failed. Check connection and project configuration.',
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
    const unsubscribeTeams = subscribeToTeams(() => {
      void load();
    });
    const unsubscribeSettings = subscribeToGameSettings(() => {
      void load();
    });

    return () => {
      unsubscribeTeams();
      unsubscribeSettings();
    };
  }, []);

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Layout className="gap-5 py-5">
      <section className="glass-panel rounded-[2rem] border border-sky-300/15 p-6">
        <QuestHeader
          eyebrow="Live Screen"
          title="The Learnova Lost Map"
          subtitle="Projector view for facilitators. Live team progress updates appear here."
        />
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200/78">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            Teams: {teams.length}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            Public leaderboard: {settings.public_leaderboard_visible ? 'Visible' : 'Hidden'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            Final gate: {settings.final_gate_open ? 'Open' : 'Closed'}
          </span>
        </div>
      </section>

      {loading ? (
        <section className="glass-panel rounded-[2rem] p-6 text-base text-slate-100/86">
          Loading live game data...
        </section>
      ) : null}

      {error ? (
        <section className="glass-panel rounded-[2rem] border border-rose-300/20 p-6 text-base text-rose-100">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {teams
          .slice()
          .sort((left, right) => right.score - left.score)
          .map((team) => {
            const progress = getWorldProgress(team);
            const status = getDisplayStatus(team);

            return (
              <article
                className="glass-panel rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/45 p-5"
                key={team.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{team.team_name}</h2>
                    <p className="mt-1 text-sm text-slate-200/76">
                      {team.members_count} members · Hints {team.hints_used}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100">
                    {status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-5">
                  <ProgressBar current={progress.unlockedCount} total={progress.total} />
                </div>

                <div className="mt-4 flex items-center justify-between text-base text-slate-100/86">
                  <span>Score</span>
                  <span className="text-2xl font-semibold text-white">{team.score}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {worldConfigs.map((world) => (
                    <span
                      className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] ${
                        team[world.columnKey]
                          ? 'border-sky-300/20 bg-sky-300/10 text-slate-100'
                          : 'border-white/10 bg-white/5 text-slate-300'
                      }`}
                      key={world.key}
                    >
                      {world.title.replace(' World', '')}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
      </section>
    </Layout>
  );
};
