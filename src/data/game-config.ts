import { qrAccessCodes, type QrAccessKey } from './qr-access';
import type { WorldKey } from '../lib/team-state';

export type WorldSlug = 'education' | 'entrepreneurship' | 'entertainment' | 'exploration';

export const worldConfigs = [
  {
    slug: 'education',
    key: 'educationUnlocked',
    title: 'Education World',
    guardian: 'Fahim',
    color: 'blue',
    description: 'Every question opens a new world.',
    lockedLabel: 'Covered by Fog',
    path: '/education/mirror-of-misunderstanding',
    code: 'WHY-OPENS',
    streamName: 'Blue Stream of Understanding',
    qrKey: 'educationMirror',
    markerPosition: 'top-left',
  },
  {
    slug: 'entrepreneurship',
    key: 'entrepreneurshipUnlocked',
    title: 'Entrepreneurship World',
    guardian: 'Riyada',
    color: 'red',
    description: 'Every challenge hides an opportunity.',
    lockedLabel: 'Covered by Fog',
    path: '/entrepreneurship/market-of-needs',
    code: 'NEED-BUILDS',
    streamName: 'Red Stream of Initiative',
    qrKey: 'entrepreneurshipMarket',
    markerPosition: 'top-right',
  },
  {
    slug: 'entertainment',
    key: 'entertainmentUnlocked',
    title: 'Entertainment World',
    guardian: 'Sharara',
    color: 'gold',
    description: 'Creativity gives light to the human spirit.',
    lockedLabel: 'Covered by Fog',
    path: '/entertainment/story-loom',
    code: 'STORY-LIGHTS',
    streamName: 'Yellow Stream of Expression',
    qrKey: 'entertainmentStory',
    markerPosition: 'bottom-left',
  },
  {
    slug: 'exploration',
    key: 'explorationUnlocked',
    title: 'Exploration World',
    guardian: 'Rahhal',
    color: 'green',
    description: 'The unknown is where growth begins.',
    lockedLabel: 'Covered by Fog',
    path: '/exploration/listening-compass',
    code: 'PATH-CARE',
    streamName: 'Green Stream of Discovery',
    qrKey: 'explorationCompass',
    markerPosition: 'bottom-right',
  },
] as const satisfies ReadonlyArray<{
  slug: WorldSlug;
  key: WorldKey;
  title: string;
  guardian: string;
  color: 'blue' | 'red' | 'gold' | 'green';
  description: string;
  lockedLabel: string;
  path: string;
  code: string;
  streamName: string;
  qrKey: QrAccessKey;
  markerPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}>;

export const fogTrapConfigs = [
  { id: 'perfect-answer', title: 'The Perfect Answer', path: '/fog/perfect-answer', qrKey: 'fogPerfect' },
  { id: 'shiny-idea', title: 'The Shiny Idea', path: '/fog/shiny-idea', qrKey: 'fogShiny' },
  { id: 'empty-performance', title: 'The Empty Performance', path: '/fog/empty-performance', qrKey: 'fogEmpty' },
  { id: 'rush-path', title: 'The Rush Path', path: '/fog/rush-path', qrKey: 'fogRush' },
  { id: 'lone-hero', title: 'The Lone Hero', path: '/fog/lone-hero', qrKey: 'fogLone' },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  path: string;
  qrKey: QrAccessKey;
}>;

export const bonusQuestConfigs = [
  { id: 'badge-constellation', title: 'Badge Constellation', path: '/bonus/badge-constellation', qrKey: 'bonusBadges' },
  { id: 'wonder-log', title: 'Wonder Log', path: '/bonus/wonder-log', qrKey: 'bonusWonder' },
  { id: 'prototype-flame', title: 'Prototype Flame', path: '/bonus/prototype-flame', qrKey: 'bonusPrototype' },
  { id: 'anti-dimness-oath', title: 'Anti-Dimness Oath', path: '/bonus/anti-dimness-oath', qrKey: 'bonusOath' },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  path: string;
  qrKey: QrAccessKey;
}>;

export const finalGateConfig = {
  title: 'Final Gate',
  path: '/final-gate',
  qrKey: 'finalGate',
} as const;

export const getQrParam = (qrKey: QrAccessKey) => qrAccessCodes[qrKey];
