import { useEffect, useState } from 'react';
import { getTeamState, TEAM_STATE_EVENT } from '../lib/team-state';
import { TeamState } from '../types/team';

export const useTeamState = () => {
  const [teamState, setTeamState] = useState<TeamState | null>(() => getTeamState());

  useEffect(() => {
    const sync = () => setTeamState(getTeamState());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener(TEAM_STATE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener(TEAM_STATE_EVENT, sync);
    };
  }, []);

  return teamState;
};
