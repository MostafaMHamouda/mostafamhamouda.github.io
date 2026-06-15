import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { QuestHeader } from '../components/QuestHeader';
import { bonusQuestConfigs, finalGateConfig, fogTrapConfigs, getQrParam, worldConfigs } from '../data/game-config';
import { buildAppRouteUrl, copyToClipboard } from '../lib/clipboard';
import {
  addScore,
  clearLastUnlockedWorld,
  exportTeamState,
  getTeamState,
  importTeamState,
  markBonusCompleted,
  markFogCompleted,
  resetTeamState,
  saveTeamState,
  setFinalGateCompleted,
  setLastUnlockedWorld,
  setWorldUnlocked,
  subtractScore,
} from '../lib/team-state';
import { TeamState } from '../types/team';

const sectionPanel = 'glass-panel rounded-[2rem] p-5';

export const AdminPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [teamState, setTeamState] = useState<TeamState | null>(() => getTeamState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [importValue, setImportValue] = useState('');

  if (!teamState) return <Navigate to="/team-register" replace />;

  const unlockedCount = worldConfigs.filter((world) => teamState[world.key]).length;

  const qrRoutes = useMemo(
    () => [
      ...worldConfigs.map((world) => ({
        title: world.title,
        route: `${world.path}?qr=${getQrParam(world.qrKey)}`,
        type: 'World',
      })),
      ...fogTrapConfigs.map((trap) => ({
        title: trap.title,
        route: `${trap.path}?qr=${getQrParam(trap.qrKey)}`,
        type: 'Fog Trap',
      })),
      ...bonusQuestConfigs.map((quest) => ({
        title: quest.title,
        route: `${quest.path}?qr=${getQrParam(quest.qrKey)}`,
        type: 'Bonus Quest',
      })),
      {
        title: finalGateConfig.title,
        route: `${finalGateConfig.path}?qr=${getQrParam(finalGateConfig.qrKey)}`,
        type: 'Final Gate',
      },
    ],
    [],
  );

  const refreshState = () => setTeamState(getTeamState());

  const persist = (nextState: TeamState) => {
    saveTeamState(nextState);
    setTeamState(nextState);
  };

  const withFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 1800);
  };

  const onCopy = async (text: string, message = 'Copied') => {
    const ok = await copyToClipboard(text);
    withFeedback(ok ? message : 'Copy failed. You can still copy the visible text manually.');
  };

  const onExport = () => {
    const json = exportTeamState();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'learnova-team-state.json';
    anchor.click();
    URL.revokeObjectURL(url);
    withFeedback('Team state exported.');
  };

  const onImport = (json: string) => {
    if (!window.confirm('Importing state will overwrite the current team progress. Continue?')) return;
    const result = importTeamState(json);
    if (!result.ok) {
      withFeedback(result.error);
      return;
    }
    setImportValue('');
    refreshState();
    withFeedback('Team state imported.');
  };

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onImport(text);
  };

  const setScore = (value: number) =>
    persist({
      ...teamState,
      score: Math.max(0, value),
    });

  return (
    <Layout className="gap-5 py-5">
      <section className={`${sectionPanel} border border-rose-300/20`}>
        <QuestHeader eyebrow="Admin Console" title="Facilitator Dashboard" subtitle="Facilitator use only." />
        <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-base leading-7 text-rose-100">
          Facilitator use only. Use manual controls only when live play needs help or correction.
        </div>
        {feedback ? (
          <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3 text-sm text-sky-100">
            {feedback}
          </div>
        ) : null}
      </section>

      <section className={sectionPanel}>
        <h2 className="text-xl font-semibold text-sky-100">Quick Launch</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <GlowingButton onClick={() => navigate('/start')}>Open Start</GlowingButton>
          <GlowingButton onClick={() => navigate('/map')}>Open Map</GlowingButton>
          <GlowingButton
            className="bg-gradient-to-r from-amber-300/90 via-yellow-200/90 to-orange-300/90 shadow-glow-gold"
            onClick={() => navigate(`/final-gate?qr=${getQrParam(finalGateConfig.qrKey)}`)}
          >
            Open Final Gate
          </GlowingButton>
          <GlowingButton
            className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
            onClick={() => navigate('/reveal')}
          >
            Open Reveal
          </GlowingButton>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Team Name', value: teamState.teamName },
          { label: 'Score', value: String(teamState.score) },
          { label: 'Progress', value: `${unlockedCount}/4` },
          { label: 'Hints Used', value: String(teamState.hintsUsed) },
          { label: 'Final Gate', value: teamState.finalGateCompleted ? 'Complete' : 'Pending' },
        ].map((card) => (
          <div className={sectionPanel} key={card.label}>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300/72">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section className={sectionPanel}>
        <h2 className="text-xl font-semibold text-sky-100">World Status</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {worldConfigs.map((world) => {
            const route = `${world.path}?qr=${getQrParam(world.qrKey)}`;
            const unlocked = teamState[world.key];

            return (
              <div className="rounded-3xl border border-white/10 bg-slate-950/32 p-5" key={world.slug}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{world.title}</h3>
                    <p className="mt-1 text-base text-slate-200/80">Guardian: {world.guardian}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100">
                    {unlocked ? 'Restored' : 'Locked'}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-200/78">
                  <p>Route: {route}</p>
                  <p>Code: {world.code}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <GlowingButton
                    onClick={() => {
                      setWorldUnlocked(world.key, true);
                      refreshState();
                      withFeedback(`${world.title} unlocked.`);
                    }}
                  >
                    Unlock
                  </GlowingButton>
                  <GlowingButton
                    className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                    onClick={() => {
                      setWorldUnlocked(world.key, false);
                      refreshState();
                      withFeedback(`${world.title} locked.`);
                    }}
                  >
                    Lock
                  </GlowingButton>
                  <GlowingButton
                    className="bg-gradient-to-r from-amber-300/90 via-yellow-200/90 to-orange-300/90 shadow-glow-gold"
                    onClick={() => {
                      setLastUnlockedWorld(world.slug);
                      withFeedback(`New unlock animation marked for ${world.title}.`);
                    }}
                  >
                    Mark Newly Unlocked
                  </GlowingButton>
                  <GlowingButton
                    className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                    onClick={() => onCopy(route, 'Route copied.')}
                  >
                    Copy Route
                  </GlowingButton>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className={sectionPanel}>
          <h2 className="text-xl font-semibold text-sky-100">Fog Traps</h2>
          <div className="mt-5 space-y-4">
            {fogTrapConfigs.map((trap) => {
              const route = `${trap.path}?qr=${getQrParam(trap.qrKey)}`;
              const complete = teamState.fogCompleted.includes(trap.id);
              return (
                <div className="rounded-3xl border border-white/10 bg-slate-950/32 p-4" key={trap.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{trap.title}</h3>
                      <p className="mt-1 text-sm text-slate-200/76">{route}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100">
                      {complete ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <GlowingButton
                      onClick={() => {
                        markFogCompleted(trap.id, true);
                        refreshState();
                        withFeedback(`${trap.title} marked complete.`);
                      }}
                    >
                      Mark Complete
                    </GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() => {
                        markFogCompleted(trap.id, false);
                        refreshState();
                        withFeedback(`${trap.title} marked incomplete.`);
                      }}
                    >
                      Mark Incomplete
                    </GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() => onCopy(route, 'Fog route copied.')}
                    >
                      Copy Route
                    </GlowingButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={sectionPanel}>
          <h2 className="text-xl font-semibold text-sky-100">Bonus Quests</h2>
          <div className="mt-5 space-y-4">
            {bonusQuestConfigs.map((quest) => {
              const route = `${quest.path}?qr=${getQrParam(quest.qrKey)}`;
              const complete = teamState.bonusCompleted.includes(quest.id);
              return (
                <div className="rounded-3xl border border-white/10 bg-slate-950/32 p-4" key={quest.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                      <p className="mt-1 text-sm text-slate-200/76">{route}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100">
                      {complete ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <GlowingButton
                      onClick={() => {
                        markBonusCompleted(quest.id, true);
                        refreshState();
                        withFeedback(`${quest.title} marked complete.`);
                      }}
                    >
                      Mark Complete
                    </GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() => {
                        markBonusCompleted(quest.id, false);
                        refreshState();
                        withFeedback(`${quest.title} marked incomplete.`);
                      }}
                    >
                      Mark Incomplete
                    </GlowingButton>
                    <GlowingButton
                      className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                      onClick={() => onCopy(route, 'Bonus route copied.')}
                    >
                      Copy Route
                    </GlowingButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className={sectionPanel}>
          <h2 className="text-xl font-semibold text-sky-100">Score Controls</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[1, 5, 10].map((value) => (
              <GlowingButton
                key={`add-${value}`}
                onClick={() => {
                  addScore(value);
                  refreshState();
                  withFeedback(`Added ${value} points.`);
                }}
              >
                Add {value}
              </GlowingButton>
            ))}
            {[1, 5, 10].map((value) => (
              <GlowingButton
                className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                key={`remove-${value}`}
                onClick={() => {
                  subtractScore(value);
                  refreshState();
                  withFeedback(`Removed ${value} points.`);
                }}
              >
                Remove {value}
              </GlowingButton>
            ))}
            <GlowingButton
              className="bg-gradient-to-r from-rose-400 to-orange-300"
              onClick={() => {
                if (!window.confirm('Reset score to 0?')) return;
                setScore(0);
                withFeedback('Score reset.');
              }}
            >
              Reset score to 0
            </GlowingButton>
          </div>
        </div>

        <div className={sectionPanel}>
          <h2 className="text-xl font-semibold text-sky-100">Game Controls</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <GlowingButton
              onClick={() => {
                const nextState = {
                  ...teamState,
                  educationUnlocked: true,
                  entrepreneurshipUnlocked: true,
                  entertainmentUnlocked: true,
                  explorationUnlocked: true,
                };
                persist(nextState);
                withFeedback('All worlds unlocked.');
              }}
            >
              Unlock All Worlds
            </GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => {
                if (!window.confirm('Lock all worlds?')) return;
                const nextState = {
                  ...teamState,
                  educationUnlocked: false,
                  entrepreneurshipUnlocked: false,
                  entertainmentUnlocked: false,
                  explorationUnlocked: false,
                  finalGateCompleted: false,
                };
                persist(nextState);
                withFeedback('All worlds locked.');
              }}
            >
              Lock All Worlds
            </GlowingButton>
            <GlowingButton
              onClick={() => {
                setFinalGateCompleted(true);
                refreshState();
                withFeedback('Final Gate marked complete.');
              }}
            >
              Complete Final Gate
            </GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => {
                setFinalGateCompleted(false);
                refreshState();
                withFeedback('Final Gate reset.');
              }}
            >
              Reset Final Gate
            </GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-amber-300/90 via-yellow-200/90 to-orange-300/90 shadow-glow-gold"
              onClick={() => {
                clearLastUnlockedWorld();
                withFeedback('Last unlock animation cleared.');
              }}
            >
              Clear Last Unlock Animation
            </GlowingButton>
            <GlowingButton onClick={onExport}>Export Team State JSON</GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Team State JSON
            </GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-rose-400 to-orange-300"
              onClick={() => {
                if (!window.confirm('Reset the whole team state?')) return;
                resetTeamState();
                navigate('/team-register', { replace: true });
              }}
            >
              Reset Team
            </GlowingButton>
            <GlowingButton
              className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
              onClick={() => navigate('/map')}
            >
              Back to Map
            </GlowingButton>
          </div>

          <input
            accept=".json,application/json"
            className="hidden"
            onChange={onImportFile}
            ref={fileInputRef}
            type="file"
          />

          <div className="mt-5">
            <label className="mb-2 block text-base text-slate-200">Paste JSON to import</label>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/30"
              onChange={(event) => setImportValue(event.target.value)}
              placeholder="Paste exported TeamState JSON here"
              value={importValue}
            />
            <div className="mt-3">
              <GlowingButton onClick={() => onImport(importValue)}>Import Pasted JSON</GlowingButton>
            </div>
          </div>
        </div>
      </section>

      <section className={sectionPanel}>
        <h2 className="text-xl font-semibold text-sky-100">QR Route List</h2>
        <div className="mt-5 space-y-3">
          {qrRoutes.map((item) => (
            <div className="rounded-3xl border border-white/10 bg-slate-950/32 p-4" key={item.route}>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300/72">{item.type}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 break-all text-sm text-slate-200/78">{item.route}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <GlowingButton onClick={() => onCopy(item.route, 'Route copied.')}>Copy Route</GlowingButton>
                  <GlowingButton
                    className="bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950"
                    onClick={() => onCopy(buildAppRouteUrl(item.route), 'Full URL copied.')}
                  >
                    Copy Full URL
                  </GlowingButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionPanel}>
        <h2 className="text-xl font-semibold text-sky-100">Facilitator Notes</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-100/84">
          <li>Use Unlock manually only if a technical issue happens.</li>
          <li>Use Lock to correct accidental unlocks.</li>
          <li>Use Export before resetting during live play.</li>
          <li>QR codes should point to the deployed site URL.</li>
        </ul>
      </section>
    </Layout>
  );
};
