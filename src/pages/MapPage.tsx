import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CoreVisual } from '../components/CoreVisual';
import { EnergyStream } from '../components/EnergyStream';
import { FogOverlay } from '../components/FogOverlay';
import { GlowingButton } from '../components/GlowingButton';
import { Layout } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { QuestHeader } from '../components/QuestHeader';
import { ScoreBadge } from '../components/ScoreBadge';
import { WorldCard } from '../components/WorldCard';
import { finalGateConfig, getQrParam, getWorldProgress, isAllWorldsUnlocked, worldConfigs } from '../data/gameConfig';
import { useCurrentTeam } from '../hooks/useCurrentTeam';
import { useGameSettings } from '../hooks/useGameSettings';
import { buildAppRouteUrl } from '../lib/clipboard';
import { updateTeam } from '../services/gameService';
import { cn } from '../lib/utils';

const pieceStageMap = {
  education: {
    frame: 'left-[4%] top-[5%] w-[28%] md:left-[7%] md:top-[7%] md:w-[30%]',
    stream: 'left-[29%] top-[33%] w-[18%] rotate-[31deg] md:left-[36%] md:top-[34%] md:w-[14%]',
    glow: 'shadow-glow-blue',
    border: 'border-sky-300/22',
    badge: 'bg-sky-400/14 text-sky-100',
    image: 'piece-education.png',
    quote: 'Every question opens a new world.',
  },
  entrepreneurship: {
    frame: 'right-[4%] top-[5%] w-[28%] md:right-[7%] md:top-[7%] md:w-[30%]',
    stream: 'left-[53%] top-[33%] w-[18%] rotate-[-31deg] md:left-[50%] md:top-[34%] md:w-[14%]',
    glow: 'shadow-glow-red',
    border: 'border-rose-300/22',
    badge: 'bg-rose-400/14 text-rose-100',
    image: 'piece-entrepreneurship.png',
    quote: 'Every challenge hides an opportunity.',
  },
  entertainment: {
    frame: 'left-[4%] bottom-[6%] w-[28%] md:left-[7%] md:bottom-[7%] md:w-[30%]',
    stream: 'left-[29%] top-[58%] w-[18%] rotate-[-31deg] md:left-[36%] md:top-[58%] md:w-[14%]',
    glow: 'shadow-glow-gold',
    border: 'border-amber-200/24',
    badge: 'bg-amber-300/14 text-amber-100',
    image: 'piece-entertainment.png',
    quote: 'Creativity gives light to the human spirit.',
  },
  exploration: {
    frame: 'right-[4%] bottom-[6%] w-[28%] md:right-[7%] md:bottom-[7%] md:w-[30%]',
    stream: 'left-[53%] top-[58%] w-[18%] rotate-[31deg] md:left-[50%] md:top-[58%] md:w-[14%]',
    glow: 'shadow-glow-green',
    border: 'border-emerald-200/24',
    badge: 'bg-emerald-300/14 text-emerald-100',
    image: 'piece-exploration.png',
    quote: 'The unknown is where growth begins.',
  },
} as const;

const getWorldLabel = (title: string) => ({
  primary: title.replace(' World', ''),
  secondary: 'World',
});

export const MapPage = () => {
  const { team, teamId, loading, error } = useCurrentTeam();
  const { settings } = useGameSettings();
  const [selectedWorldSlug, setSelectedWorldSlug] = useState<(typeof worldConfigs)[number]['slug']>('education');
  const [highlightedWorld, setHighlightedWorld] = useState<(typeof worldConfigs)[number]['slug'] | null>(null);
  const [showUnlockToast, setShowUnlockToast] = useState(false);

  useEffect(() => {
    if (!teamId || !team) return;
    const lastUnlocked = team.last_unlocked_world as (typeof worldConfigs)[number]['slug'] | null;
    if (!lastUnlocked) return;

    const matchingWorld = worldConfigs.find((world) => world.slug === lastUnlocked);
    if (!matchingWorld || !team[matchingWorld.columnKey]) {
      return;
    }

    setSelectedWorldSlug(lastUnlocked);
    setHighlightedWorld(lastUnlocked);
    setShowUnlockToast(true);

    const timeout = window.setTimeout(() => {
      setHighlightedWorld(null);
      setShowUnlockToast(false);
      void updateTeam(teamId, { last_unlocked_world: null });
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [team, teamId]);

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
            eyebrow="Living Map Chamber"
            title="Team data unavailable"
            subtitle={error ?? 'Register your team again to continue.'}
          />
        </section>
      </Layout>
    );
  }

  const { unlockedCount } = getWorldProgress(team);
  const allWorldsUnlocked = isAllWorldsUnlocked(team);
  const canOpenFinalGate = allWorldsUnlocked && settings.final_gate_open;
  const selectedWorld =
    worldConfigs.find((world) => world.slug === selectedWorldSlug) ?? worldConfigs[0];
  const selectedPiece = pieceStageMap[selectedWorld.slug];
  const livingMapRefSrc = `${import.meta.env.BASE_URL}assets/living-map-reference.png`;

  const piecePreviewSrc = useMemo(
    () => `${import.meta.env.BASE_URL}assets/${selectedPiece.image}`,
    [selectedPiece.image],
  );

  const markerDetails = useMemo(
    () => ({
      title: selectedWorld.title,
      guardian: selectedWorld.guardian,
      status: team[selectedWorld.columnKey] ? 'Restored' : 'Covered by Fog',
      message: team[selectedWorld.columnKey]
        ? selectedWorld.description
        : 'This piece is still sealed. Scan its printed QR to enter the challenge.',
      quote: selectedPiece.quote,
    }),
    [selectedPiece.quote, selectedWorld, team],
  );

  const finalGateLabel = !allWorldsUnlocked
    ? 'Restore 4/4 Worlds to unlock the Final Gate'
    : settings.final_gate_open
      ? 'Open Final Gate'
      : 'Final Gate is closed by the facilitator';

  return (
    <Layout className="gap-5 py-5">
      <section className="glass-panel rounded-[2rem] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <QuestHeader
              eyebrow="Living Map Chamber"
              title={team.team_name}
              subtitle="Restore the four worlds, reconnect them to the Core, and prepare the Fourfold Spark."
            />
            <p className="mt-3 text-sm text-slate-200/76">Hints used: {team.hints_used}</p>
          </div>
          <ScoreBadge score={team.score} />
        </div>
        <div className="mt-5">
          <ProgressBar current={unlockedCount} total={4} />
        </div>
        {!settings.final_gate_open && allWorldsUnlocked ? (
          <div className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm text-amber-100">
            All four worlds are restored, but the Final Gate is still closed by the facilitator.
          </div>
        ) : null}
      </section>

      <section className="glass-panel overflow-hidden rounded-[2rem] p-3">
        <div className="relative aspect-[1/1.08] w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-stars md:aspect-[16/10]">
          <img
            alt="The full Living Map reference"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.26] blur-[0.5px]"
            src={livingMapRefSrc}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,240,197,0.16),transparent_16%),linear-gradient(180deg,rgba(5,7,15,0.08),rgba(5,7,15,0.52))]" />

          <div className="absolute inset-[18%] rounded-full border border-white/8 bg-slate-950/18 blur-3xl" />

          {worldConfigs.map((world) => (
            <EnergyStream
              key={world.slug}
              active={team[world.columnKey]}
              className={pieceStageMap[world.slug].stream}
              color={world.color}
              fromWorld={world.title}
            />
          ))}

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <CoreVisual
              boosted={Boolean(highlightedWorld)}
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-40 md:w-40"
              showReadyText={false}
              unlockedCount={unlockedCount}
            />
          </div>

          {worldConfigs.map((world, index) => {
            const piece = pieceStageMap[world.slug];
            const unlocked = team[world.columnKey];
            const selected = selectedWorldSlug === world.slug;
            const highlighted = highlightedWorld === world.slug;
            const pieceSrc = `${import.meta.env.BASE_URL}assets/${piece.image}`;
            const label = getWorldLabel(world.title);

            return (
              <button
                key={world.slug}
                className={cn(
                  'group absolute z-10 overflow-hidden rounded-[1.75rem] border bg-slate-950/70 text-left backdrop-blur-sm transition duration-500',
                  'aspect-[1/1.08] animate-float md:aspect-[4/5]',
                  piece.frame,
                  unlocked ? [piece.border, piece.glow] : 'border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.28)]',
                  selected && 'scale-[1.03]',
                  highlighted && 'scale-[1.05] ring-2 ring-white/20',
                )}
                onClick={() => setSelectedWorldSlug(world.slug)}
                style={{
                  animationDelay: `${index * -1.3}s`,
                  animationDuration: `${9 + index}s`,
                }}
                type="button"
              >
                <img
                  alt={`${world.title} map piece`}
                  className={cn(
                    'h-full w-full object-cover object-[center_top] transition duration-700',
                    unlocked ? 'scale-[1.02] saturate-[1.02]' : 'scale-100 saturate-[0.32] brightness-[0.45]',
                    selected && 'scale-[1.05]',
                  )}
                  src={pieceSrc}
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,15,0.02),rgba(5,7,15,0.16)_36%,rgba(5,7,15,0.78)_100%)]" />
                {!unlocked ? <FogOverlay className="opacity-90" /> : null}

                <div className="absolute right-3 top-3 z-10 md:right-4 md:top-4">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-1 text-[0.5rem] font-medium uppercase tracking-[0.16em] shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:px-2.5 md:text-[0.68rem]',
                      unlocked
                        ? [piece.border, piece.badge]
                        : 'border-white/10 bg-slate-900/82 text-slate-200/92',
                    )}
                  >
                    {unlocked ? 'Restored' : 'Fog'}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 p-3 md:p-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/72 px-2.5 py-2.5 text-center backdrop-blur-md md:px-3 md:py-3 md:text-left">
                    <p className="hidden text-[0.62rem] uppercase tracking-[0.22em] text-slate-300/72 md:block md:text-[0.7rem]">
                      {world.guardian}
                    </p>
                    <h3 className="font-semibold leading-[1.06] text-white">
                      <span
                        className={cn(
                          'block text-[0.58rem] md:mt-1 md:text-[0.96rem]',
                          world.slug === 'entrepreneurship' && 'text-[0.5rem] md:text-[0.86rem] tracking-[-0.01em]',
                        )}
                      >
                        {label.primary}
                      </span>
                      <span className="mt-1 block text-[0.58rem] md:text-[0.9rem]">{label.secondary}</span>
                    </h3>
                  </div>
                </div>
              </button>
            );
          })}

          {showUnlockToast && highlightedWorld ? (
            <div className="absolute left-1/2 top-5 z-30 w-[88%] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/82 p-4 text-center backdrop-blur-xl animate-revealRise">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-200/80">World Restored</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {worldConfigs.find((world) => world.slug === highlightedWorld)?.title} has been restored.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_1.5fr]">
          <div className="hidden overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/60 md:block">
            <img
              alt={`${markerDetails.title} preview art`}
              className="h-56 w-full object-cover object-top md:h-full"
              src={piecePreviewSrc}
            />
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/58 p-4 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-300/78">Selected Piece</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{markerDetails.title}</h3>
                <p className="mt-1 text-base text-slate-200/80">Guardian: {markerDetails.guardian}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-100">
                {markerDetails.status}
              </span>
            </div>

            <p className="mt-4 text-base leading-7 text-slate-100/86">{markerDetails.message}</p>
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-200/78">
              {markerDetails.quote}
            </p>

            {allWorldsUnlocked ? (
              <p className="mt-4 text-sm text-amber-100/86">
                {settings.final_gate_open
                  ? 'The Core is ready for the Fourfold Spark.'
                  : 'The Core is ready, but the facilitator still controls access to the Final Gate.'}
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-300/76">Tap any piece to inspect it, then scan its printed QR to begin.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {worldConfigs.map((world) => (
          <WorldCard
            key={world.slug}
            color={world.color}
            description={world.description}
            guardian={world.guardian}
            highlighted={highlightedWorld === world.slug || selectedWorldSlug === world.slug}
            lockedLabel={world.lockedLabel}
            onInspect={() => setSelectedWorldSlug(world.slug)}
            title={world.title}
            unlocked={team[world.columnKey]}
          />
        ))}
      </section>

      <section className="glass-panel rounded-3xl p-4">
        <GlowingButton
          disabled={!canOpenFinalGate}
          onClick={() => {
            if (!canOpenFinalGate) return;
            window.location.assign(
              buildAppRouteUrl(`/final-gate?qr=${getQrParam(finalGateConfig.qrKey)}`),
            );
          }}
        >
          {finalGateLabel}
        </GlowingButton>
      </section>
    </Layout>
  );
};
