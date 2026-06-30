import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { getTeamCompletions, subscribeToTeamCompletions } from '../services/gameService';
import type { TeamCompletion } from '../types/game';

export const useTeamCompletions = (teamId: string | null | undefined) => {
  const [completions, setCompletions] = useState<TeamCompletion[]>([]);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState<string | null>(null);

  const refreshCompletions = useCallback(async () => {
    if (!teamId) {
      setCompletions([]);
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
      const nextCompletions = await getTeamCompletions(teamId);
      setCompletions(nextCompletions);
      setError(null);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Connection issue. Please try again or contact the facilitator.',
      );
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    void refreshCompletions();
  }, [refreshCompletions]);

  useEffect(() => {
    if (!teamId || !isSupabaseConfigured) return;
    const unsubscribe = subscribeToTeamCompletions(teamId, async () => {
      await refreshCompletions();
    });

    return unsubscribe;
  }, [refreshCompletions, teamId]);

  return {
    completions,
    loading,
    error,
    refreshCompletions,
  };
};
