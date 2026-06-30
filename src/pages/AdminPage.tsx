import { useEffect, useMemo, useState } from 'react';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { TextareaPrompt } from '../components/TextareaPrompt';
import { buildAppRouteUrl, copyToClipboard } from '../lib/clipboard';
import { isAdminAuthenticated, setAdminAuthenticated } from '../lib/teamSession';
import { supabaseConfigError } from '../lib/supabase';
import {
  bonusQuestConfigs,
  defaultGameSettings,
  finalGateConfig,
  fogTrapConfigs,
  getDisplayStatus,
  getQrParam,
  getWorldProgress,
  qrRouteConfigs,
  worldConfigs,
} from '../data/gameConfig';
import {
  adjustScore,
  completeFinalGate,
  completeItem,
  deleteTeam,
  getAllCompletions,
  getAllEvents,
  getAllTeams,
  getGameSettings,
  lockWorld,
  logTeamEvent,
  resetFinalGate,
  resetScore,
  subscribeToGameSettings,
  subscribeToTeamEvents,
  subscribeToTeams,
  uncompleteItem,
  unlockWorld,
  updateGameSetting,
  updateTeam,
} from '../services/gameService';
import type { CompletionType, GameSettings, Team, TeamCompletion, TeamEvent, TeamStatus } from '../types/game';

type AdminTab =
  | 'overview'
  | 'teams'
  | 'details'
  | 'activity'
  | 'leaderboard'
  | 'controls'
  | 'qr'
  | 'export';

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'teams', label: 'Teams' },
  { id: 'details', label: 'Team Details' },
  { id: 'activity', label: 'Activity Log' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'controls', label: 'Game Controls' },
  { id: 'qr', label: 'QR Routes' },
  { id: 'export', label: 'Data Export' },
];

const statusTone: Record<TeamStatus, string> = {
  in_progress: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
  final_ready: 'border-amber-200/20 bg-amber-200/10 text-amber-100',
  completed: 'border-emerald-200/20 bg-emerald-200/10 text-emerald-100',
  stuck: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
  inactive: 'border-slate-200/20 bg-slate-200/10 text-slate-100',
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

const toCsvValue = (value: string | number | boolean) =>
  `"${String(value).replace(/"/g, '""')}"`;

const downloadText = (filename: string, text: string, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const progressLabel = (team: Team) => {
  const progress = getWorldProgress(team);
  return `${progress.unlockedCount}/${progress.total} worlds`;
};

const eventMatchesFilter = (event: TeamEvent, filter: string) => {
  if (filter === 'all') return true;
  if (filter === 'world') return event.event_type === 'world_unlocked';
  if (filter === 'hint') return event.event_type === 'hint_used';
  if (filter === 'bonus') return event.event_type === 'bonus_completed';
  if (filter === 'final') return event.event_type === 'final_gate_completed' || event.event_type === 'game_completed';
  if (filter === 'admin') return event.event_type === 'admin_action';
  return true;
};

const buildTeamsCsv = (teams: Team[], completions: TeamCompletion[]) => {
  const rows = [
    [
      'team_name',
      'score',
      'progress',
      'hints',
      'worlds_unlocked',
      'bonuses_completed_count',
      'fog_traps_completed_count',
      'final_gate_completed',
      'status',
      'created_at',
      'last_activity_at',
    ].join(','),
  ];

  for (const team of teams) {
    const teamCompletions = completions.filter((completion) => completion.team_id === team.id);
    const bonuses = teamCompletions.filter((completion) => completion.item_type === 'bonus').length;
    const fog = teamCompletions.filter((completion) => completion.item_type === 'fog_trap').length;
    const progress = getWorldProgress(team);
    const unlockedWorlds = worldConfigs
      .filter((world) => team[world.columnKey])
      .map((world) => world.key)
      .join('|');

    rows.push(
      [
        team.team_name,
        team.score,
        `${progress.unlockedCount}/${progress.total}`,
        team.hints_used,
        unlockedWorlds,
        bonuses,
        fog,
        team.final_gate_completed,
        getDisplayStatus(team),
        team.created_at,
        team.last_activity_at,
      ]
        .map(toCsvValue)
        .join(','),
    );
  }

  return rows.join('\n');
};

const buildEventsCsv = (events: TeamEvent[], teams: Team[]) => {
  const teamLookup = new Map(teams.map((team) => [team.id, team.team_name]));
  const rows = [['time', 'team', 'event_type', 'event_label', 'points_delta'].join(',')];

  for (const event of events) {
    rows.push(
      [
        event.created_at,
        event.team_id ? teamLookup.get(event.team_id) ?? event.team_id : 'System',
        event.event_type,
        event.event_label,
        event.points_delta,
      ]
        .map(toCsvValue)
        .join(','),
    );
  }

  return rows.join('\n');
};

export const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [completions, setCompletions] = useState<TeamCompletion[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultGameSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<'all' | 'in_progress' | 'final_ready' | 'completed' | 'stuck'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'world' | 'hint' | 'bonus' | 'final' | 'admin'>('all');
  const [resetPhrase, setResetPhrase] = useState('');
  const [noteTeamId, setNoteTeamId] = useState<string>('');
  const [noteText, setNoteText] = useState('');
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);

  const adminPin = import.meta.env.VITE_ADMIN_PIN?.trim();
  const setupError = supabaseConfigError ?? (!adminPin ? 'VITE_ADMIN_PIN is missing. Add it to your .env file.' : null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [nextTeams, nextEvents, nextCompletions, nextSettings] = await Promise.all([
        getAllTeams(),
        getAllEvents(250),
        getAllCompletions(),
        getGameSettings(),
      ]);

      setTeams(nextTeams);
      setEvents(nextEvents);
      setCompletions(nextCompletions);
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

  useEffect(() => {
    if (!authenticated || setupError) return;

    void loadDashboard();
    const unsubscribeTeams = subscribeToTeams(() => {
      void loadDashboard();
    });
    const unsubscribeEvents = subscribeToTeamEvents(() => {
      void loadDashboard();
    });
    const unsubscribeSettings = subscribeToGameSettings(() => {
      void loadDashboard();
    });

    return () => {
      unsubscribeTeams();
      unsubscribeEvents();
      unsubscribeSettings();
    };
  }, [authenticated, setupError]);

  useEffect(() => {
    if (!selectedTeamId && teams[0]) {
      setSelectedTeamId(teams[0].id);
      setNoteTeamId(teams[0].id);
      return;
    }

    if (selectedTeamId && !teams.some((team) => team.id === selectedTeamId)) {
      const nextTeamId = teams[0]?.id ?? null;
      setSelectedTeamId(nextTeamId);
      setNoteTeamId(nextTeamId ?? '');
    }
  }, [selectedTeamId, teams]);

  const setFlash = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2200);
  };

  const runAdminAction = async (label: string, action: () => Promise<void>) => {
    setPendingLabel(label);
    try {
      await action();
      await loadDashboard();
      setError(null);
      setFlash(label);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Supabase update failed. Check connection and project configuration.',
      );
    } finally {
      setPendingLabel(null);
    }
  };

  const teamEventsMap = useMemo(() => {
    const grouped = new Map<string, TeamEvent[]>();
    for (const event of events) {
      if (!event.team_id) continue;
      const current = grouped.get(event.team_id) ?? [];
      current.push(event);
      grouped.set(event.team_id, current);
    }
    return grouped;
  }, [events]);

  const teamCompletionsMap = useMemo(() => {
    const grouped = new Map<string, TeamCompletion[]>();
    for (const completion of completions) {
      const current = grouped.get(completion.team_id) ?? [];
      current.push(completion);
      grouped.set(completion.team_id, current);
    }
    return grouped;
  }, [completions]);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const selectedTeamCompletions = selectedTeam ? teamCompletionsMap.get(selectedTeam.id) ?? [] : [];
  const selectedTeamEvents = selectedTeam ? (teamEventsMap.get(selectedTeam.id) ?? []).slice(0, 20) : [];

  const visibleTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch = team.team_name.toLowerCase().includes(teamSearch.toLowerCase());
      const displayStatus = getDisplayStatus(team);
      const matchesFilter =
        teamFilter === 'all' ||
        (teamFilter === 'stuck' ? displayStatus === 'stuck' : displayStatus === teamFilter);
      return matchesSearch && matchesFilter;
    });
  }, [teamFilter, teamSearch, teams]);

  const overviewStats = useMemo(() => {
    const totalTeams = teams.length;
    const completedTeams = teams.filter((team) => getDisplayStatus(team) === 'completed').length;
    const finalReadyTeams = teams.filter((team) => getDisplayStatus(team) === 'final_ready').length;
    const activeTeams = teams.filter((team) => ['in_progress', 'final_ready'].includes(getDisplayStatus(team))).length;
    const highestScore = teams.length > 0 ? Math.max(...teams.map((team) => team.score)) : 0;
    const totalHints = teams.reduce((sum, team) => sum + team.hints_used, 0);
    const averageProgress =
      teams.length > 0
        ? (
            teams.reduce((sum, team) => sum + getWorldProgress(team).unlockedCount, 0) / teams.length
          ).toFixed(1)
        : '0.0';
    const stuckTeams = teams.filter((team) => getDisplayStatus(team) === 'stuck');

    return {
      totalTeams,
      completedTeams,
      finalReadyTeams,
      activeTeams,
      highestScore,
      totalHints,
      averageProgress,
      stuckTeams,
    };
  }, [teams]);

  const scoreBoard = useMemo(() => {
    return [...teams].sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const rightProgress = getWorldProgress(right).unlockedCount;
      const leftProgress = getWorldProgress(left).unlockedCount;
      if (rightProgress !== leftProgress) return rightProgress - leftProgress;
      if (left.hints_used !== right.hints_used) return left.hints_used - right.hints_used;
      return Date.parse(left.updated_at) - Date.parse(right.updated_at);
    });
  }, [teams]);

  const progressBoard = useMemo(() => {
    return [...teams].sort((left, right) => {
      const leftProgress = getWorldProgress(left).unlockedCount;
      const rightProgress = getWorldProgress(right).unlockedCount;
      if (rightProgress !== leftProgress) return rightProgress - leftProgress;
      return Date.parse(right.last_activity_at) - Date.parse(left.last_activity_at);
    });
  }, [teams]);

  const filteredEvents = useMemo(
    () => events.filter((event) => eventMatchesFilter(event, activityFilter)),
    [activityFilter, events],
  );

  const fullGameExport = useMemo(
    () =>
      JSON.stringify(
        {
          teams,
          completions,
          events,
          settings,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    [completions, events, settings, teams],
  );

  const onCopy = async (value: string, message: string) => {
    const ok = await copyToClipboard(value);
    setFlash(ok ? message : 'Copy failed. You can still copy the visible text manually.');
  };

  const onAuthenticate = () => {
    if (!adminPin) {
      setPinError('VITE_ADMIN_PIN is missing.');
      return;
    }

    if (pinInput.trim() !== adminPin) {
      setPinError('Incorrect PIN.');
      return;
    }

    setAdminAuthenticated(true);
    setAuthenticated(true);
    setPinError(null);
    setPinInput('');
  };

  const onLogout = () => {
    setAdminAuthenticated(false);
    setAuthenticated(false);
  };

  if (setupError) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-rose-300/20 p-6">
          <QuestHeader eyebrow="Admin Console" title="Configuration required" subtitle={setupError} />
        </section>
      </Layout>
    );
  }

  if (!authenticated) {
    return (
      <Layout className="justify-center gap-5 py-5">
        <section className="glass-panel rounded-[2rem] border border-amber-200/20 p-6">
          <QuestHeader eyebrow="Admin Console" title="Facilitator PIN" subtitle="Facilitator use only." />
          <div className="mt-5 space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/30"
              onChange={(event) => setPinInput(event.target.value)}
              placeholder="Enter admin PIN"
              type="password"
              value={pinInput}
            />
            {pinError ? (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
                {pinError}
              </div>
            ) : null}
            <GlowingButton onClick={onAuthenticate}>Unlock Admin Dashboard</GlowingButton>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout className="gap-5 py-5">
      <section className="glass-panel rounded-[2rem] border border-amber-200/15 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <QuestHeader
            eyebrow="Admin Console"
            title="Facilitator Dashboard"
            subtitle="Multi-team live control for The Learnova Lost Map."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => window.open(buildAppRouteUrl('/admin/live'), '_blank', 'noopener')}
            >
              Open Live Screen
            </GlowingButton>
            <GlowingButton onClick={() => void loadDashboard()}>Refresh Data</GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => downloadText('learnova-full-game.json', fullGameExport, 'application/json;charset=utf-8')}
            >
              Export Full JSON
            </GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-rose-400 to-orange-300"
              onClick={onLogout}
            >
              Logout Admin
            </GlowingButton>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeTab === tab.id
                  ? 'border-sky-300/30 bg-sky-300/12 text-sky-100'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {pendingLabel ? (
          <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 p-4 text-sm text-sky-100">
            Saving: {pendingLabel}
          </div>
        ) : null}
        {feedback ? (
          <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4 text-sm text-emerald-100">
            {feedback}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </section>

      {loading ? (
        <section className="glass-panel rounded-[2rem] p-6 text-base text-slate-100/86">
          Loading synced game data...
        </section>
      ) : null}

      {activeTab === 'overview' ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Total Teams', overviewStats.totalTeams],
              ['Active Teams', overviewStats.activeTeams],
              ['Completed Teams', overviewStats.completedTeams],
              ['Final Ready', overviewStats.finalReadyTeams],
              ['Average Progress', `${overviewStats.averageProgress}/4`],
              ['Highest Score', overviewStats.highestScore],
              ['Teams Possibly Stuck', overviewStats.stuckTeams.length],
              ['Total Hints Used', overviewStats.totalHints],
            ].map(([label, value]) => (
              <div className="glass-panel rounded-[2rem] p-5" key={label}>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300/72">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </section>

          <section className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-xl font-semibold text-sky-100">Needs Attention</h2>
            <div className="mt-4 space-y-3">
              {overviewStats.stuckTeams.length > 0 ? (
                overviewStats.stuckTeams.map((team) => (
                  <div className="rounded-2xl border border-rose-300/15 bg-rose-300/8 p-4" key={team.id}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{team.team_name}</h3>
                        <p className="mt-1 text-sm text-slate-200/78">
                          Last activity: {formatDateTime(team.last_activity_at)} · {progressLabel(team)}
                        </p>
                      </div>
                      <p className="text-sm text-rose-100">
                        Check if they need a hint or QR direction.
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base text-slate-200/76">No stuck teams right now.</p>
              )}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'teams' ? (
        <section className="glass-panel rounded-[2rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-semibold text-sky-100">Teams</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/30"
                onChange={(event) => setTeamSearch(event.target.value)}
                placeholder="Search team name"
                value={teamSearch}
              />
              <select
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/30"
                onChange={(event) => setTeamFilter(event.target.value as typeof teamFilter)}
                value={teamFilter}
              >
                <option value="all">All</option>
                <option value="in_progress">In Progress</option>
                <option value="final_ready">Final Ready</option>
                <option value="completed">Completed</option>
                <option value="stuck">Possibly Stuck</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-100/86">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-300/72">
                <tr>
                  <th className="px-3 py-3">Team Name</th>
                  <th className="px-3 py-3">Members</th>
                  <th className="px-3 py-3">Score</th>
                  <th className="px-3 py-3">Progress</th>
                  <th className="px-3 py-3">Hints</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Last Activity</th>
                  <th className="px-3 py-3">Created At</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTeams.map((team) => {
                  const displayStatus = getDisplayStatus(team);
                  return (
                    <tr className="border-t border-white/8" key={team.id}>
                      <td className="px-3 py-4 font-medium text-white">{team.team_name}</td>
                      <td className="px-3 py-4">{team.members_count}</td>
                      <td className="px-3 py-4">{team.score}</td>
                      <td className="px-3 py-4">{progressLabel(team)}</td>
                      <td className="px-3 py-4">{team.hints_used}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full border px-3 py-1.5 text-xs ${statusTone[displayStatus]}`}>
                          {displayStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-4">{formatDateTime(team.last_activity_at)}</td>
                      <td className="px-3 py-4">{formatDateTime(team.created_at)}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs text-sky-100"
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setActiveTab('details');
                            }}
                            type="button"
                          >
                            View Details
                          </button>
                          <button
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-100"
                            onClick={() =>
                              void runAdminAction(`Added +1 to ${team.team_name}`, async () => {
                                await adjustScore(team.id, 1, 'Admin added 1 point');
                                await logTeamEvent(team.id, 'admin_action', 'Admin added 1 point', 1);
                              })
                            }
                            type="button"
                          >
                            Add +1
                          </button>
                          <button
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-100"
                            onClick={() =>
                              void runAdminAction(`Added +5 to ${team.team_name}`, async () => {
                                await adjustScore(team.id, 5, 'Admin added 5 points');
                                await logTeamEvent(team.id, 'admin_action', 'Admin added 5 points', 5);
                              })
                            }
                            type="button"
                          >
                            Add +5
                          </button>
                          <button
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-100"
                            onClick={() =>
                              void runAdminAction(`Reset score for ${team.team_name}`, async () => {
                                await resetScore(team.id);
                                await logTeamEvent(team.id, 'admin_action', 'Admin reset score');
                              })
                            }
                            type="button"
                          >
                            Reset Score
                          </button>
                          <button
                            className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs text-rose-100"
                            onClick={() => {
                              if (!window.confirm(`Delete ${team.team_name}?`)) return;
                              void runAdminAction(`Deleted ${team.team_name}`, async () => {
                                await deleteTeam(team.id);
                              });
                            }}
                            type="button"
                          >
                            Delete Team
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === 'details' ? (
        <section className="glass-panel rounded-[2rem] p-5">
          {selectedTeam ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{selectedTeam.team_name}</h2>
                  <p className="mt-2 text-sm text-slate-200/76">
                    {selectedTeam.members_count} members · Pathfinder {selectedTeam.pathfinder ?? '—'} · Scanner {selectedTeam.scanner ?? '—'}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-2 text-sm ${statusTone[getDisplayStatus(selectedTeam)]}`}>
                  {getDisplayStatus(selectedTeam).replace('_', ' ')}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Score', selectedTeam.score],
                  ['Hints Used', selectedTeam.hints_used],
                  ['Progress', progressLabel(selectedTeam)],
                  ['Last Activity', formatDateTime(selectedTeam.last_activity_at)],
                ].map(([label, value]) => (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4" key={label}>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300/72">{label}</p>
                    <p className="mt-3 text-lg font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <section className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <h3 className="text-lg font-semibold text-sky-100">World Status</h3>
                <div className="mt-4 space-y-4">
                  {worldConfigs.map((world) => {
                    const route = `${world.route}?qr=${getQrParam(world.qrKey)}`;
                    const unlocked = selectedTeam[world.columnKey];
                    return (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4" key={world.key}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{world.title}</h4>
                            <p className="mt-1 text-sm text-slate-200/76">
                              Guardian: {world.guardian} · Secret code: {world.code}
                            </p>
                            <p className="mt-2 break-all text-sm text-slate-300/78">{route}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-2 text-sm ${unlocked ? statusTone.completed : statusTone.in_progress}`}>
                            {unlocked ? 'Restored' : 'Locked'}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <GlowingButton
                            onClick={() =>
                              void runAdminAction(`Unlocked ${world.title} for ${selectedTeam.team_name}`, async () => {
                                await unlockWorld(selectedTeam.id, world.key);
                                await completeItem(selectedTeam.id, 'world', world.key, world.score);
                                await logTeamEvent(selectedTeam.id, 'admin_action', `Admin unlocked ${world.title}`, world.score, {
                                  action: 'unlock_world',
                                  worldKey: world.key,
                                });
                              })
                            }
                          >
                            Unlock
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() =>
                              void runAdminAction(`Locked ${world.title} for ${selectedTeam.team_name}`, async () => {
                                await lockWorld(selectedTeam.id, world.key);
                                await uncompleteItem(selectedTeam.id, 'world', world.key);
                                await logTeamEvent(selectedTeam.id, 'admin_action', `Admin locked ${world.title}`, -world.score, {
                                  action: 'lock_world',
                                  worldKey: world.key,
                                });
                              })
                            }
                          >
                            Lock
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-amber-300/90 via-yellow-200/90 to-orange-300/90 shadow-glow-gold"
                            onClick={() =>
                              void runAdminAction(`Marked ${world.title} animation`, async () => {
                                await updateTeam(selectedTeam.id, { last_unlocked_world: world.key });
                                await logTeamEvent(selectedTeam.id, 'admin_action', `Admin marked ${world.title} as newly unlocked`, 0, {
                                  action: 'mark_unlock_animation',
                                  worldKey: world.key,
                                });
                              })
                            }
                          >
                            Mark Newly Unlocked
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() => void onCopy(route, 'Route copied.')}
                          >
                            Copy Route
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() => void onCopy(buildAppRouteUrl(route), 'Full URL copied.')}
                          >
                            Copy Full URL
                          </GlowingButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <h3 className="text-lg font-semibold text-slate-100">Fog Traps</h3>
                <div className="mt-4 space-y-4">
                  {fogTrapConfigs.map((trap) => {
                    const route = `${trap.route}?qr=${getQrParam(trap.qrKey)}`;
                    const complete = selectedTeamCompletions.some(
                      (completion) => completion.item_type === 'fog_trap' && completion.item_id === trap.id,
                    );

                    return (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4" key={trap.id}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{trap.title}</h4>
                            <p className="mt-2 break-all text-sm text-slate-300/78">{route}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-2 text-sm ${complete ? statusTone.completed : statusTone.in_progress}`}>
                            {complete ? 'Completed' : 'Not completed'}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <GlowingButton
                            onClick={() =>
                              void runAdminAction(`Marked ${trap.title} complete`, async () => {
                                await completeItem(selectedTeam.id, 'fog_trap', trap.id, 0);
                                await logTeamEvent(selectedTeam.id, 'admin_action', `Admin completed ${trap.title}`, 0, {
                                  action: 'complete_fog_trap',
                                  fogTrapId: trap.id,
                                });
                              })
                            }
                          >
                            Mark Complete
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() =>
                              void runAdminAction(`Marked ${trap.title} incomplete`, async () => {
                                await uncompleteItem(selectedTeam.id, 'fog_trap', trap.id);
                                await logTeamEvent(selectedTeam.id, 'admin_action', `Admin reverted ${trap.title}`, 0, {
                                  action: 'uncomplete_fog_trap',
                                  fogTrapId: trap.id,
                                });
                              })
                            }
                          >
                            Mark Incomplete
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() => void onCopy(route, 'Fog route copied.')}
                          >
                            Copy Route
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() => void onCopy(buildAppRouteUrl(route), 'Full URL copied.')}
                          >
                            Copy Full URL
                          </GlowingButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <h3 className="text-lg font-semibold text-amber-100">Bonus Quests</h3>
                <div className="mt-4 space-y-4">
                  {bonusQuestConfigs.map((quest) => {
                    const route = `${quest.route}?qr=${getQrParam(quest.qrKey)}`;
                    const complete = selectedTeamCompletions.some(
                      (completion) => completion.item_type === 'bonus' && completion.item_id === quest.id,
                    );

                    return (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4" key={quest.id}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{quest.title}</h4>
                            <p className="mt-2 break-all text-sm text-slate-300/78">{route}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-2 text-sm ${complete ? statusTone.completed : statusTone.in_progress}`}>
                            {complete ? 'Completed' : 'Not completed'}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <GlowingButton
                            onClick={() =>
                              void runAdminAction(`Marked ${quest.title} complete`, async () => {
                                await completeItem(selectedTeam.id, 'bonus', quest.id, quest.score);
                                await logTeamEvent(selectedTeam.id, 'admin_action', `Admin completed ${quest.title}`, quest.score, {
                                  action: 'complete_bonus',
                                  bonusId: quest.id,
                                });
                              })
                            }
                          >
                            Mark Complete
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() =>
                              void runAdminAction(`Marked ${quest.title} incomplete`, async () => {
                                await uncompleteItem(selectedTeam.id, 'bonus', quest.id);
                                await logTeamEvent(selectedTeam.id, 'admin_action', `Admin reverted ${quest.title}`, -quest.score, {
                                  action: 'uncomplete_bonus',
                                  bonusId: quest.id,
                                });
                              })
                            }
                          >
                            Mark Incomplete
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() => void onCopy(route, 'Bonus route copied.')}
                          >
                            Copy Route
                          </GlowingButton>
                          <GlowingButton
                            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                            onClick={() => void onCopy(buildAppRouteUrl(route), 'Full URL copied.')}
                          >
                            Copy Full URL
                          </GlowingButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <h3 className="text-lg font-semibold text-sky-100">Final Gate</h3>
                  <p className="mt-3 text-sm text-slate-200/76">
                    Status: {selectedTeam.final_gate_completed ? 'Completed' : 'Pending'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <GlowingButton
                      onClick={() =>
                        void runAdminAction(`Completed Final Gate for ${selectedTeam.team_name}`, async () => {
                          await completeFinalGate(selectedTeam.id);
                          await logTeamEvent(selectedTeam.id, 'admin_action', 'Admin completed Final Gate', 4, {
                            action: 'complete_final_gate',
                          });
                        })
                      }
                    >
                      Complete Final Gate
                    </GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() =>
                        void runAdminAction(`Reset Final Gate for ${selectedTeam.team_name}`, async () => {
                          await resetFinalGate(selectedTeam.id);
                          await uncompleteItem(selectedTeam.id, 'reveal', 'reveal');
                          await logTeamEvent(selectedTeam.id, 'admin_action', 'Admin reset Final Gate', -4, {
                            action: 'reset_final_gate',
                          });
                        })
                      }
                    >
                      Reset Final Gate
                    </GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() => void onCopy(buildAppRouteUrl('/reveal'), 'Reveal URL copied.')}
                    >
                      Open Reveal Page URL
                    </GlowingButton>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <h3 className="text-lg font-semibold text-sky-100">Score Controls</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[1, 5, 10].map((value) => (
                      <GlowingButton
                        key={`add-${value}`}
                        onClick={() =>
                          void runAdminAction(`Added ${value} points to ${selectedTeam.team_name}`, async () => {
                            await adjustScore(selectedTeam.id, value, `Admin added ${value} points`);
                            await logTeamEvent(selectedTeam.id, 'admin_action', `Admin added ${value} points`, value);
                          })
                        }
                      >
                        Add {value}
                      </GlowingButton>
                    ))}
                    {[1, 5, 10].map((value) => (
                      <GlowingButton
                        className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                        key={`remove-${value}`}
                        onClick={() =>
                          void runAdminAction(`Removed ${value} points from ${selectedTeam.team_name}`, async () => {
                            await adjustScore(selectedTeam.id, -value, `Admin removed ${value} points`);
                            await logTeamEvent(selectedTeam.id, 'admin_action', `Admin removed ${value} points`, -value);
                          })
                        }
                      >
                        Remove {value}
                      </GlowingButton>
                    ))}
                    <GlowingButton
                      className="bg-gradient-to-r from-rose-400 to-orange-300"
                      onClick={() =>
                        void runAdminAction(`Reset score for ${selectedTeam.team_name}`, async () => {
                          await resetScore(selectedTeam.id);
                          await logTeamEvent(selectedTeam.id, 'admin_action', 'Admin reset score');
                        })
                      }
                    >
                      Reset Score To 0
                    </GlowingButton>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <h3 className="text-lg font-semibold text-sky-100">Activity Log For This Team</h3>
                <div className="mt-4 space-y-3">
                  {selectedTeamEvents.length > 0 ? (
                    selectedTeamEvents.map((event) => (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4" key={event.id}>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium text-white">{event.event_label}</p>
                            <p className="mt-1 text-sm text-slate-200/76">
                              {event.event_type} · {formatDateTime(event.created_at)}
                            </p>
                          </div>
                          <span className="text-sm text-slate-100/84">{event.points_delta >= 0 ? `+${event.points_delta}` : event.points_delta}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-base text-slate-200/76">No events for this team yet.</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <p className="text-base text-slate-200/76">Select a team from the Teams tab to manage it.</p>
          )}
        </section>
      ) : null}

      {activeTab === 'activity' ? (
        <section className="glass-panel rounded-[2rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-xl font-semibold text-sky-100">Activity Log</h2>
            <select
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/30"
              onChange={(event) => setActivityFilter(event.target.value as typeof activityFilter)}
              value={activityFilter}
            >
              <option value="all">All events</option>
              <option value="world">World unlocks</option>
              <option value="hint">Hints</option>
              <option value="bonus">Bonuses</option>
              <option value="final">Final gate</option>
              <option value="admin">Admin actions</option>
            </select>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-100/86">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-300/72">
                <tr>
                  <th className="px-3 py-3">Time</th>
                  <th className="px-3 py-3">Team</th>
                  <th className="px-3 py-3">Event Type</th>
                  <th className="px-3 py-3">Event Label</th>
                  <th className="px-3 py-3">Points Delta</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const teamName = event.team_id ? teams.find((team) => team.id === event.team_id)?.team_name ?? event.team_id : 'System';
                  return (
                    <tr className="border-t border-white/8" key={event.id}>
                      <td className="px-3 py-4">{formatDateTime(event.created_at)}</td>
                      <td className="px-3 py-4">{teamName}</td>
                      <td className="px-3 py-4">{event.event_type}</td>
                      <td className="px-3 py-4">{event.event_label}</td>
                      <td className="px-3 py-4">{event.points_delta >= 0 ? `+${event.points_delta}` : event.points_delta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === 'leaderboard' ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-xl font-semibold text-sky-100">Score Leaderboard</h2>
            <div className="mt-4 space-y-3">
              {scoreBoard.map((team, index) => (
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4" key={team.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-300/72">#{index + 1}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{team.team_name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-white">{team.score}</p>
                      <p className="text-sm text-slate-200/76">{progressLabel(team)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-xl font-semibold text-sky-100">Progress Board</h2>
            <div className="mt-4 space-y-3">
              {progressBoard.map((team) => (
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4" key={team.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{team.team_name}</h3>
                      <p className="mt-1 text-sm text-slate-200/76">
                        Last activity {formatDateTime(team.last_activity_at)}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-white">{progressLabel(team)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-100">
              Leaderboard supports facilitation, but final recognition should include creativity, teamwork, and learning behavior.
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-amber-100">Collaboration / Spirit Note</h3>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/30"
                onChange={(event) => setNoteTeamId(event.target.value)}
                value={noteTeamId}
              >
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              <TextareaPrompt
                className="min-h-28"
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Example: Great teamwork during Entertainment challenge"
                value={noteText}
              />
              <GlowingButton
                disabled={!noteTeamId || !noteText.trim()}
                onClick={() =>
                  void runAdminAction('Saved collaboration note', async () => {
                    await logTeamEvent(noteTeamId, 'admin_action', 'Collaboration note added', 0, {
                      note: noteText.trim(),
                    });
                    setNoteText('');
                  })
                }
              >
                Save Note
              </GlowingButton>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'controls' ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-xl font-semibold text-sky-100">Game Controls</h2>
            <div className="mt-5 grid gap-3">
              {[
                ['registrations_open', settings.registrations_open, settings.registrations_open ? 'Close registrations' : 'Open registrations'],
                ['game_started', settings.game_started, settings.game_started ? 'Pause game start flag' : 'Start game'],
                ['game_paused', settings.game_paused, settings.game_paused ? 'Resume game' : 'Pause game'],
                ['final_gate_open', settings.final_gate_open, settings.final_gate_open ? 'Close final gate globally' : 'Open final gate globally'],
                ['public_leaderboard_visible', settings.public_leaderboard_visible, settings.public_leaderboard_visible ? 'Hide public leaderboard' : 'Show public leaderboard'],
              ].map(([key, currentValue, label]) => (
                <GlowingButton
                  key={String(key)}
                  onClick={() =>
                    void runAdminAction(`${label}`, async () => {
                      await updateGameSetting(key as keyof GameSettings, !Boolean(currentValue));
                    })
                  }
                >
                  {label}
                </GlowingButton>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-xl font-semibold text-rose-100">Danger Zone</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200/76">
              Export before reset is strongly recommended. Reset all deletes teams, completions, and events, but keeps game settings.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <GlowingButton
                className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                onClick={() => downloadText('learnova-full-game.json', fullGameExport, 'application/json;charset=utf-8')}
              >
                Export Before Reset
              </GlowingButton>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-slate-200">Type RESET LEARNOVA MAP</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-rose-300/50 focus:ring-2 focus:ring-rose-300/30"
                onChange={(event) => setResetPhrase(event.target.value)}
                placeholder="RESET LEARNOVA MAP"
                value={resetPhrase}
              />
            </div>

            <div className="mt-4">
              <GlowingButton
                className="bg-gradient-to-r from-rose-400 to-orange-300"
                disabled={resetPhrase !== 'RESET LEARNOVA MAP'}
                onClick={() => {
                  if (!window.confirm('Reset all game data?')) return;
                  void runAdminAction('Reset all game data', async () => {
                    for (const team of teams) {
                      await deleteTeam(team.id);
                    }
                    setSelectedTeamId(null);
                    setResetPhrase('');
                  });
                }}
              >
                Reset All Game Data
              </GlowingButton>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'qr' ? (
        <section className="glass-panel rounded-[2rem] p-5">
          <h2 className="text-xl font-semibold text-sky-100">QR Routes</h2>
          <div className="mt-4 space-y-3">
            {qrRouteConfigs.map((item) => (
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4" key={item.route}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300/72">{item.type}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 break-all text-sm text-slate-200/78">{item.route}</p>
                    <p className="mt-2 text-sm text-slate-300/70">Suggested placement: {item.suggestedPlacement}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <GlowingButton onClick={() => void onCopy(item.route, 'Route copied.')}>Copy Route</GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() => void onCopy(buildAppRouteUrl(item.route), 'Full URL copied.')}
                    >
                      Copy Full URL
                    </GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() => window.open(buildAppRouteUrl(item.route), '_blank', 'noopener')}
                    >
                      Open
                    </GlowingButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === 'export' ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-xl font-semibold text-sky-100">Data Export</h2>
            <div className="mt-5 grid gap-3">
              <GlowingButton
                onClick={() => downloadText('learnova-teams.csv', buildTeamsCsv(teams, completions), 'text/csv;charset=utf-8')}
              >
                Teams CSV
              </GlowingButton>
              <GlowingButton
                onClick={() => downloadText('learnova-teams.json', JSON.stringify(teams, null, 2), 'application/json;charset=utf-8')}
              >
                Teams JSON
              </GlowingButton>
              <GlowingButton
                onClick={() => downloadText('learnova-events.csv', buildEventsCsv(events, teams), 'text/csv;charset=utf-8')}
              >
                Events CSV
              </GlowingButton>
              <GlowingButton
                onClick={() => downloadText('learnova-full-game.json', fullGameExport, 'application/json;charset=utf-8')}
              >
                Full Game JSON
              </GlowingButton>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <h2 className="text-xl font-semibold text-sky-100">Export Preview</h2>
            <pre className="mt-4 max-h-[26rem] overflow-auto rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs text-slate-100/80">
{fullGameExport}
            </pre>
          </div>
        </section>
      ) : null}
    </Layout>
  );
};
