export const CURRENT_TEAM_ID_KEY = 'learnova_current_team_id';
export const ADMIN_AUTH_KEY = 'learnova_admin_authenticated';
const LEGACY_TEAM_STATE_KEY = 'learnova-lost-map.team-state';
const LEGACY_LAST_UNLOCK_KEY = 'learnova-lost-map.last-unlocked-world';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const clearLegacyState = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LEGACY_TEAM_STATE_KEY);
  window.localStorage.removeItem(LEGACY_LAST_UNLOCK_KEY);
};

export const getCurrentTeamId = () => {
  if (!canUseStorage()) return null;
  clearLegacyState();
  return window.localStorage.getItem(CURRENT_TEAM_ID_KEY);
};

export const setCurrentTeamId = (teamId: string) => {
  if (!canUseStorage()) return;
  clearLegacyState();
  window.localStorage.setItem(CURRENT_TEAM_ID_KEY, teamId);
};

export const clearCurrentTeamId = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CURRENT_TEAM_ID_KEY);
};

export const hasLegacyTeamState = () => {
  if (!canUseStorage()) return false;
  return Boolean(window.localStorage.getItem(LEGACY_TEAM_STATE_KEY));
};

export const isAdminAuthenticated = () => {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};

export const setAdminAuthenticated = (value: boolean) => {
  if (!canUseStorage()) return;
  if (value) {
    window.localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return;
  }

  window.localStorage.removeItem(ADMIN_AUTH_KEY);
};
