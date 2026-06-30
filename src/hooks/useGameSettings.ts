import { useCallback, useEffect, useState } from 'react';
import { defaultGameSettings } from '../data/gameConfig';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';
import { getGameSettings, subscribeToGameSettings } from '../services/gameService';
import type { GameSettings } from '../types/game';

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(defaultGameSettings);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError(supabaseConfigError);
      return;
    }

    setLoading(true);
    try {
      const nextSettings = await getGameSettings();
      setSettings(nextSettings);
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
  }, []);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const unsubscribe = subscribeToGameSettings(async () => {
      await refreshSettings();
    });

    return unsubscribe;
  }, [refreshSettings]);

  return {
    settings,
    loading,
    error,
    refreshSettings,
  };
};
