import { TeamState } from '../types/team';
import { worldConfigs, type WorldSlug } from '../data/game-config';

export const STORAGE_KEY = 'learnova-lost-map.team-state';
const LAST_UNLOCKED_WORLD_KEY = 'learnova-lost-map.last-unlocked-world';
export const TEAM_STATE_EVENT = 'learnova-team-state-change';

const createDefaultState = (): TeamState => ({
  teamName: '',
  membersCount: 0,
  pathfinder: '',
  scanner: '',
  score: 0,
  hintsUsed: 0,
  educationUnlocked: false,
  entrepreneurshipUnlocked: false,
  entertainmentUnlocked: false,
  explorationUnlocked: false,
  fogCompleted: [],
  bonusCompleted: [],
  finalGateCompleted: false,
  createdAt: new Date().toISOString(),
});

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const getTeamState = (): TeamState | null => {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TeamState;
  } catch {
    return null;
  }
};

export const saveTeamState = (state: TeamState) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(TEAM_STATE_EVENT));
};

export const updateTeamState = (partial: Partial<TeamState>) => {
  const current = getTeamState() ?? createDefaultState();
  const next = { ...current, ...partial };
  saveTeamState(next);
  return next;
};

export const addScore = (points: number) => {
  const current = getTeamState();
  if (!current) return null;
  const next = { ...current, score: current.score + Math.max(0, points) };
  saveTeamState(next);
  return next;
};

export const subtractScore = (points: number) => {
  const current = getTeamState();
  if (!current) return null;
  const next = { ...current, score: Math.max(0, current.score - Math.max(0, points)) };
  saveTeamState(next);
  return next;
};

export const completeFogTrap = (id: string) => {
  const current = getTeamState();
  if (!current) return null;
  const fogCompleted = current.fogCompleted.includes(id)
    ? current.fogCompleted
    : [...current.fogCompleted, id];
  const next = { ...current, fogCompleted };
  saveTeamState(next);
  return next;
};

export const completeBonus = (id: string) => {
  const current = getTeamState();
  if (!current) return null;
  const bonusCompleted = current.bonusCompleted.includes(id)
    ? current.bonusCompleted
    : [...current.bonusCompleted, id];
  const next = { ...current, bonusCompleted };
  saveTeamState(next);
  return next;
};

export type WorldKey =
  | 'educationUnlocked'
  | 'entrepreneurshipUnlocked'
  | 'entertainmentUnlocked'
  | 'explorationUnlocked';

export const unlockWorld = (worldKey: WorldKey) => {
  return setWorldUnlocked(worldKey, true);
};

export const setWorldUnlocked = (worldKey: WorldKey, value: boolean) => {
  const current = getTeamState();
  if (!current) return null;
  const next = { ...current, [worldKey]: value };
  saveTeamState(next);
  return next;
};

export const resetTeamState = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LAST_UNLOCKED_WORLD_KEY);
  window.dispatchEvent(new Event(TEAM_STATE_EVENT));
};

export const isAllWorldsUnlocked = () => {
  const current = getTeamState();
  if (!current) return false;
  return (
    current.educationUnlocked &&
    current.entrepreneurshipUnlocked &&
    current.entertainmentUnlocked &&
    current.explorationUnlocked
  );
};

export const setLastUnlockedWorld = (world: WorldSlug | null) => {
  if (!canUseStorage()) return;
  if (!world) {
    window.localStorage.removeItem(LAST_UNLOCKED_WORLD_KEY);
    window.dispatchEvent(new Event(TEAM_STATE_EVENT));
    return;
  }
  window.localStorage.setItem(LAST_UNLOCKED_WORLD_KEY, world);
  window.dispatchEvent(new Event(TEAM_STATE_EVENT));
};

export const getLastUnlockedWorld = (): WorldSlug | null => {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(LAST_UNLOCKED_WORLD_KEY);
  if (!raw) return null;
  return worldConfigs.some((world) => world.slug === raw) ? (raw as WorldSlug) : null;
};

export const clearLastUnlockedWorld = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LAST_UNLOCKED_WORLD_KEY);
  window.dispatchEvent(new Event(TEAM_STATE_EVENT));
};

export const markFogCompleted = (id: string, value: boolean) => {
  const current = getTeamState();
  if (!current) return null;
  const fogCompleted = value
    ? current.fogCompleted.includes(id)
      ? current.fogCompleted
      : [...current.fogCompleted, id]
    : current.fogCompleted.filter((item) => item !== id);
  const next = { ...current, fogCompleted };
  saveTeamState(next);
  return next;
};

export const markBonusCompleted = (id: string, value: boolean) => {
  const current = getTeamState();
  if (!current) return null;
  const bonusCompleted = value
    ? current.bonusCompleted.includes(id)
      ? current.bonusCompleted
      : [...current.bonusCompleted, id]
    : current.bonusCompleted.filter((item) => item !== id);
  const next = { ...current, bonusCompleted };
  saveTeamState(next);
  return next;
};

export const setFinalGateCompleted = (value: boolean) => {
  const current = getTeamState();
  if (!current) return null;
  const next = { ...current, finalGateCompleted: value };
  saveTeamState(next);
  return next;
};

export const exportTeamState = () => {
  const current = getTeamState();
  if (!current) return null;
  return JSON.stringify(current, null, 2);
};

const isValidImportState = (value: unknown): value is TeamState => {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    typeof state.teamName === 'string' &&
    typeof state.membersCount === 'number' &&
    typeof state.pathfinder === 'string' &&
    typeof state.scanner === 'string' &&
    typeof state.score === 'number' &&
    typeof state.hintsUsed === 'number' &&
    typeof state.educationUnlocked === 'boolean' &&
    typeof state.entrepreneurshipUnlocked === 'boolean' &&
    typeof state.entertainmentUnlocked === 'boolean' &&
    typeof state.explorationUnlocked === 'boolean' &&
    Array.isArray(state.fogCompleted) &&
    Array.isArray(state.bonusCompleted) &&
    typeof state.finalGateCompleted === 'boolean' &&
    typeof state.createdAt === 'string'
  );
};

export const importTeamState = (json: string) => {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!isValidImportState(parsed)) {
      return { ok: false as const, error: 'Invalid TeamState structure.' };
    }
    saveTeamState(parsed);
    return { ok: true as const, state: parsed };
  } catch {
    return { ok: false as const, error: 'Invalid JSON.' };
  }
};

export const buildInitialTeamState = (
  partial: Pick<TeamState, 'teamName' | 'membersCount' | 'pathfinder' | 'scanner'>,
): TeamState => ({
  ...createDefaultState(),
  ...partial,
  createdAt: new Date().toISOString(),
});
