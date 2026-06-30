import { useCallback, useEffect, useState } from 'react';
import { getCurrentTeamId } from '../lib/teamSession';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { getTeam, subscribeToTeam } from '../services/gameService';
import type { Team } from '../types/game';

export const useCurrentTeam = () => {
  const [teamId, setTeamId] = useState<string | null>(() => getCurrentTeamId());
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState<string | null>(null);

  const refreshTeam = useCallback(async () => {
    const nextTeamId = getCurrentTeamId();
    setTeamId(nextTeamId);

    if (!nextTeamId) {
      setTeam(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      setError(supabaseConfigError);
      return;
    }

    setLoading(true);
    try {
      const nextTeam = await getTeam(nextTeamId);
      if (!nextTeam) {
        setTeam(null);
        setError('Team session was not found. Register again to continue.');
      } else {
        setTeam(nextTeam);
        setError(null);
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Connection issue. Please try again or contact the facilitator.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTeam();
  }, [refreshTeam]);

  useEffect(() => {
    if (!teamId || !isSupabaseConfigured) return;

    const unsubscribe = subscribeToTeam(teamId, async () => {
      await refreshTeam();
    });

    return unsubscribe;
  }, [refreshTeam, teamId]);

  return {
    team,
    loading,
    error,
    refreshTeam,
    teamId,
  };
};
