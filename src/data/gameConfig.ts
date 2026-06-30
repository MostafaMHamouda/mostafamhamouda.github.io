import { qrAccessCodes, type QrAccessKey } from './qr-access';
import type { GameSettings, Team, TeamStatus, WorldKey } from '../types/game';

export type WorldColor = 'blue' | 'red' | 'gold' | 'green';
export type WorldSlug = WorldKey;

export const worldColumnMap = {
  education: 'education_unlocked',
  entrepreneurship: 'entrepreneurship_unlocked',
  entertainment: 'entertainment_unlocked',
  exploration: 'exploration_unlocked',
} as const;

export type WorldColumnKey = (typeof worldColumnMap)[WorldKey];

export type WorldConfig = {
  key: WorldKey;
  columnKey: WorldColumnKey;
  slug: WorldKey;
  title: string;
  challengeTitle: string;
  guardian: string;
  route: string;
  path: string;
  code: string;
  color: WorldColor;
  score: number;
  description: string;
  lockedLabel: string;
  streamName: string;
  qrKey: QrAccessKey;
  markerPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  suggestedPlacement: string;
};

export const worldConfigs: WorldConfig[] = [
  {
    key: 'education',
    columnKey: 'education_unlocked',
    slug: 'education',
    title: 'Education World',
    challengeTitle: 'The Mirror of Misunderstanding',
    guardian: 'Fahim',
    route: '/education/mirror-of-misunderstanding',
    path: '/education/mirror-of-misunderstanding',
    code: 'WHY-OPENS',
    color: 'blue',
    score: 6,
    description: 'Every question opens a new world.',
    lockedLabel: 'Covered by Fog',
    streamName: 'Blue Stream of Understanding',
    qrKey: 'educationMirror',
    markerPosition: 'top-left',
    suggestedPlacement: 'Education zone or near learning wall',
  },
  {
    key: 'entrepreneurship',
    columnKey: 'entrepreneurship_unlocked',
    slug: 'entrepreneurship',
    title: 'Entrepreneurship World',
    challengeTitle: 'The Market of Needs',
    guardian: 'Riyada',
    route: '/entrepreneurship/market-of-needs',
    path: '/entrepreneurship/market-of-needs',
    code: 'NEED-BUILDS',
    color: 'red',
    score: 6,
    description: 'Every challenge hides an opportunity.',
    lockedLabel: 'Covered by Fog',
    streamName: 'Red Stream of Initiative',
    qrKey: 'entrepreneurshipMarket',
    markerPosition: 'top-right',
    suggestedPlacement: 'Innovation wall or startup corner',
  },
  {
    key: 'entertainment',
    columnKey: 'entertainment_unlocked',
    slug: 'entertainment',
    title: 'Entertainment World',
    challengeTitle: 'The Story Loom',
    guardian: 'Sharara',
    route: '/entertainment/story-loom',
    path: '/entertainment/story-loom',
    code: 'STORY-LIGHTS',
    color: 'gold',
    score: 6,
    description: 'Creativity gives light to the human spirit.',
    lockedLabel: 'Covered by Fog',
    streamName: 'Yellow Stream of Expression',
    qrKey: 'entertainmentStory',
    markerPosition: 'bottom-left',
    suggestedPlacement: 'Stage, media corner, or storytelling area',
  },
  {
    key: 'exploration',
    columnKey: 'exploration_unlocked',
    slug: 'exploration',
    title: 'Exploration World',
    challengeTitle: 'The Listening Compass',
    guardian: 'Rahhal',
    route: '/exploration/listening-compass',
    path: '/exploration/listening-compass',
    code: 'PATH-CARE',
    color: 'green',
    score: 6,
    description: 'The unknown is where growth begins.',
    lockedLabel: 'Covered by Fog',
    streamName: 'Green Stream of Discovery',
    qrKey: 'explorationCompass',
    markerPosition: 'bottom-right',
    suggestedPlacement: 'Exploration wall or quiet listening corner',
  },
];

export type FogTrapConfig = {
  id: string;
  title: string;
  route: string;
  path: string;
  qrKey: QrAccessKey;
  suggestedPlacement: string;
};

export const fogTrapConfigs: FogTrapConfig[] = [
  {
    id: 'perfect-answer',
    title: 'The Perfect Answer',
    route: '/fog/perfect-answer',
    path: '/fog/perfect-answer',
    qrKey: 'fogPerfect',
    suggestedPlacement: 'Near Education World entrance',
  },
  {
    id: 'shiny-idea',
    title: 'The Shiny Idea',
    route: '/fog/shiny-idea',
    path: '/fog/shiny-idea',
    qrKey: 'fogShiny',
    suggestedPlacement: 'Near Entrepreneurship World entrance',
  },
  {
    id: 'empty-performance',
    title: 'The Empty Performance',
    route: '/fog/empty-performance',
    path: '/fog/empty-performance',
    qrKey: 'fogEmpty',
    suggestedPlacement: 'Near Entertainment World entrance',
  },
  {
    id: 'rush-path',
    title: 'The Rush Path',
    route: '/fog/rush-path',
    path: '/fog/rush-path',
    qrKey: 'fogRush',
    suggestedPlacement: 'Near Exploration World entrance',
  },
  {
    id: 'lone-hero',
    title: 'The Lone Hero',
    route: '/fog/lone-hero',
    path: '/fog/lone-hero',
    qrKey: 'fogLone',
    suggestedPlacement: 'Between world zones for team check-in',
  },
];

export type BonusQuestConfig = {
  id: string;
  title: string;
  route: string;
  path: string;
  qrKey: QrAccessKey;
  score: number;
  suggestedPlacement: string;
};

export const bonusQuestConfigs: BonusQuestConfig[] = [
  {
    id: 'badge-constellation',
    title: 'Badge Constellation',
    route: '/bonus/badge-constellation',
    path: '/bonus/badge-constellation',
    qrKey: 'bonusBadges',
    score: 2,
    suggestedPlacement: 'Reflection table or team zone',
  },
  {
    id: 'wonder-log',
    title: 'Wonder Log',
    route: '/bonus/wonder-log',
    path: '/bonus/wonder-log',
    qrKey: 'bonusWonder',
    score: 2,
    suggestedPlacement: 'Notebook wall or reflection station',
  },
  {
    id: 'prototype-flame',
    title: 'Prototype Flame',
    route: '/bonus/prototype-flame',
    path: '/bonus/prototype-flame',
    qrKey: 'bonusPrototype',
    score: 2,
    suggestedPlacement: 'Prototype table or test area',
  },
  {
    id: 'anti-dimness-oath',
    title: 'Anti-Dimness Oath',
    route: '/bonus/anti-dimness-oath',
    path: '/bonus/anti-dimness-oath',
    qrKey: 'bonusOath',
    score: 2,
    suggestedPlacement: 'Closing reflection zone',
  },
];

export const finalGateConfig = {
  id: 'final-gate',
  title: 'Final Gate',
  route: '/final-gate',
  path: '/final-gate',
  qrKey: 'finalGate' as const,
  score: 4,
  suggestedPlacement: 'Final chamber near facilitator',
};

export const defaultGameSettings: GameSettings = {
  registrations_open: true,
  final_gate_open: true,
  game_started: true,
  game_paused: false,
  public_leaderboard_visible: false,
};

export const qrRouteConfigs = [
  {
    title: 'Start',
    route: '/start',
    type: 'Start',
    suggestedPlacement: 'Reception or game entry point',
  },
  ...worldConfigs.map((world) => ({
    title: `${world.title}: ${world.challengeTitle}`,
    route: `${world.route}?qr=${qrAccessCodes[world.qrKey]}`,
    type: 'World' as const,
    suggestedPlacement: world.suggestedPlacement,
  })),
  ...fogTrapConfigs.map((trap) => ({
    title: `Fog Trap: ${trap.title}`,
    route: `${trap.route}?qr=${qrAccessCodes[trap.qrKey]}`,
    type: 'Fog Trap' as const,
    suggestedPlacement: trap.suggestedPlacement,
  })),
  ...bonusQuestConfigs.map((quest) => ({
    title: `Bonus Quest: ${quest.title}`,
    route: `${quest.route}?qr=${qrAccessCodes[quest.qrKey]}`,
    type: 'Bonus Quest' as const,
    suggestedPlacement: quest.suggestedPlacement,
  })),
  {
    title: finalGateConfig.title,
    route: `${finalGateConfig.route}?qr=${qrAccessCodes[finalGateConfig.qrKey]}`,
    type: 'Final Gate' as const,
    suggestedPlacement: finalGateConfig.suggestedPlacement,
  },
  {
    title: 'Reveal',
    route: '/reveal',
    type: 'Reveal' as const,
    suggestedPlacement: 'Facilitator share-out screen',
  },
];

export const getQrParam = (qrKey: QrAccessKey) => qrAccessCodes[qrKey];

export const getWorldConfig = (worldKey: WorldKey) =>
  worldConfigs.find((world) => world.key === worldKey) ?? null;

export const countUnlockedWorlds = (team: Team | null | undefined) => {
  if (!team) return 0;
  return worldConfigs.filter((world) => team[world.columnKey]).length;
};

export const isAllWorldsUnlocked = (team: Team | null | undefined) =>
  countUnlockedWorlds(team) === worldConfigs.length;

export const getWorldProgress = (team: Team | null | undefined) => ({
  unlockedCount: countUnlockedWorlds(team),
  total: worldConfigs.length,
});

export const deriveTeamStatus = (
  teamLike: Pick<
    Team,
    | 'education_unlocked'
    | 'entrepreneurship_unlocked'
    | 'entertainment_unlocked'
    | 'exploration_unlocked'
    | 'final_gate_completed'
    | 'reveal_completed'
  >,
): TeamStatus => {
  if (teamLike.reveal_completed) return 'completed';
  if (isAllWorldsUnlocked(teamLike as Team) && !teamLike.final_gate_completed) return 'final_ready';
  return 'in_progress';
};

export const getDisplayStatus = (team: Team, now = Date.now()): TeamStatus => {
  if (team.reveal_completed) return 'completed';
  const lastActivity = Date.parse(team.last_activity_at);
  const minutesSinceActivity = Number.isFinite(lastActivity)
    ? (now - lastActivity) / (1000 * 60)
    : 0;

  if (team.current_status === 'stuck' || team.current_status === 'inactive') {
    return team.current_status;
  }

  if (!team.reveal_completed && team.current_status === 'in_progress' && minutesSinceActivity >= 15) {
    return 'inactive';
  }

  if (!team.reveal_completed && team.current_status === 'in_progress' && minutesSinceActivity >= 7) {
    return 'stuck';
  }

  if (isAllWorldsUnlocked(team) && !team.final_gate_completed) {
    return 'final_ready';
  }

  return team.current_status;
};

