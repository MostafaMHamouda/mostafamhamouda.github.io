import type { RealtimeChannel } from '@supabase/supabase-js';
import { defaultGameSettings, deriveTeamStatus, getDisplayStatus, getWorldConfig, getWorldProgress, isAllWorldsUnlocked, worldColumnMap } from '../data/gameConfig';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import type { CompletionType, GameSettingKey, GameSettings, RegisterTeamInput, Team, TeamCompletion, TeamEvent, TeamStatus, WorldKey } from '../types/game';

type TeamPatch = Partial<
  Pick<
    Team,
    | 'team_name'
    | 'members_count'
    | 'pathfinder'
    | 'scanner'
    | 'score'
    | 'hints_used'
    | 'education_unlocked'
    | 'entrepreneurship_unlocked'
    | 'entertainment_unlocked'
    | 'exploration_unlocked'
    | 'final_gate_completed'
    | 'reveal_completed'
    | 'last_unlocked_world'
    | 'current_status'
    | 'last_activity_at'
  >
>;

const TEAM_COLUMNS = '*';

const nowIso = () => new Date().toISOString();

const toError = (error: unknown, fallback: string) =>
  error instanceof Error ? error : new Error(fallback);

const ensureSupabase = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using synced game mode.');
  }

  return getSupabaseClient();
};

const withDerivedStatus = (team: Team, patch: TeamPatch) => {
  const merged = {
    ...team,
    ...patch,
  };

  return {
    ...patch,
    last_activity_at: patch.last_activity_at ?? nowIso(),
    current_status: patch.current_status ?? deriveTeamStatus(merged),
  };
};

const getCompletionLabel = (itemType: CompletionType, itemId: string) => {
  if (itemType === 'world') {
    return `${getWorldConfig(itemId as WorldKey)?.title ?? itemId} restored`;
  }

  if (itemType === 'final_gate') return 'Final Gate completed';
  if (itemType === 'reveal') return 'Reveal completed';
  return itemId;
};

export const registerTeam = async (input: RegisterTeamInput) => {
  const supabase = ensureSupabase();
  const settings = await getGameSettings();

  if (!settings.registrations_open) {
    throw new Error('Team registration is currently closed. Please contact the facilitator.');
  }

  const normalizedName = input.team_name.trim();
  const { data: duplicate } = await supabase
    .from('teams')
    .select('id, team_name')
    .ilike('team_name', normalizedName)
    .limit(1)
    .maybeSingle();

  if (duplicate) {
    throw new Error('A team with this name already exists. Add a number or unique mark and try again.');
  }

  const { data, error } = await supabase
    .from('teams')
    .insert({
      team_name: normalizedName,
      members_count: input.members_count,
      pathfinder: input.pathfinder?.trim() || null,
      scanner: input.scanner?.trim() || null,
      current_status: 'in_progress',
    })
    .select(TEAM_COLUMNS)
    .single();

  if (error || !data) {
    throw toError(error, 'Team registration failed.');
  }

  await logTeamEvent(data.id, 'team_registered', 'Team registered');
  return data as Team;
};

export const getTeam = async (teamId: string) => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('teams')
    .select(TEAM_COLUMNS)
    .eq('id', teamId)
    .maybeSingle();

  if (error) throw toError(error, 'Failed to load team.');
  return (data as Team | null) ?? null;
};

export const updateTeam = async (teamId: string, patch: TeamPatch) => {
  const supabase = ensureSupabase();
  const current = await getTeam(teamId);
  if (!current) throw new Error('Team not found.');

  const derivedPatch = withDerivedStatus(current, patch);
  const { data, error } = await supabase
    .from('teams')
    .update(derivedPatch)
    .eq('id', teamId)
    .select(TEAM_COLUMNS)
    .single();

  if (error || !data) throw toError(error, 'Failed to update team.');
  return data as Team;
};

export const getAllTeams = async () => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('teams')
    .select(TEAM_COLUMNS)
    .order('created_at', { ascending: true });

  if (error) throw toError(error, 'Failed to load teams.');
  return (data as Team[]) ?? [];
};

export const deleteTeam = async (teamId: string) => {
  const supabase = ensureSupabase();
  const { error } = await supabase.from('teams').delete().eq('id', teamId);
  if (error) throw toError(error, 'Failed to delete team.');
};

export const unlockWorld = async (teamId: string, worldKey: WorldKey) => {
  const current = await getTeam(teamId);
  if (!current) throw new Error('Team not found.');

  const columnKey = worldColumnMap[worldKey];
  if (current[columnKey]) {
    return { team: current, alreadyUnlocked: true };
  }

  const team = await updateTeam(teamId, {
    [columnKey]: true,
    last_unlocked_world: worldKey,
  } as TeamPatch);

  return { team, alreadyUnlocked: false };
};

export const lockWorld = async (teamId: string, worldKey: WorldKey) => {
  const current = await getTeam(teamId);
  if (!current) throw new Error('Team not found.');

  const columnKey = worldColumnMap[worldKey];
  const team = await updateTeam(teamId, {
    [columnKey]: false,
    last_unlocked_world: current.last_unlocked_world === worldKey ? null : current.last_unlocked_world,
  } as TeamPatch);

  return team;
};

export const completeItem = async (
  teamId: string,
  itemType: CompletionType,
  itemId: string,
  points: number,
) => {
  const supabase = ensureSupabase();
  const { data: existing, error: existingError } = await supabase
    .from('team_completions')
    .select('*')
    .eq('team_id', teamId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .maybeSingle();

  if (existingError) throw toError(existingError, 'Failed to read completion state.');
  if (existing) {
    return {
      completion: existing as TeamCompletion,
      team: await getTeam(teamId),
      alreadyCompleted: true,
      awardedPoints: 0,
    };
  }

  const { data, error } = await supabase
    .from('team_completions')
    .insert({
      team_id: teamId,
      item_type: itemType,
      item_id: itemId,
      points_awarded: Math.max(0, points),
    })
    .select('*')
    .single();

  if (error || !data) {
    const duplicate = await supabase
      .from('team_completions')
      .select('*')
      .eq('team_id', teamId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();

    if (duplicate.data) {
      return {
        completion: duplicate.data as TeamCompletion,
        team: await getTeam(teamId),
        alreadyCompleted: true,
        awardedPoints: 0,
      };
    }

    throw toError(error, 'Failed to complete item.');
  }

  let team = await getTeam(teamId);
  if (!team) throw new Error('Team not found after completion.');

  if (points !== 0) {
    team = await updateTeam(teamId, {
      score: Math.max(0, team.score + points),
    });
  } else {
    team = await updateTeam(teamId, {});
  }

  return {
    completion: data as TeamCompletion,
    team,
    alreadyCompleted: false,
    awardedPoints: Math.max(0, points),
  };
};

export const uncompleteItem = async (teamId: string, itemType: CompletionType, itemId: string) => {
  const supabase = ensureSupabase();
  const { data: existing, error: readError } = await supabase
    .from('team_completions')
    .select('*')
    .eq('team_id', teamId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .maybeSingle();

  if (readError) throw toError(readError, 'Failed to read completion.');
  if (!existing) {
    return { removed: false, team: await getTeam(teamId) };
  }

  const { error } = await supabase.from('team_completions').delete().eq('id', existing.id);
  if (error) throw toError(error, 'Failed to clear completion.');

  let team = await getTeam(teamId);
  if (!team) throw new Error('Team not found after completion removal.');

  const points = Number(existing.points_awarded) || 0;
  if (points !== 0) {
    team = await updateTeam(teamId, { score: Math.max(0, team.score - points) });
  } else {
    team = await updateTeam(teamId, {});
  }

  return { removed: true, team, completion: existing as TeamCompletion };
};

export const getTeamCompletions = async (teamId: string) => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('team_completions')
    .select('*')
    .eq('team_id', teamId)
    .order('completed_at', { ascending: true });

  if (error) throw toError(error, 'Failed to load completions.');
  return (data as TeamCompletion[]) ?? [];
};

export const getAllCompletions = async () => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('team_completions')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) throw toError(error, 'Failed to load all completions.');
  return (data as TeamCompletion[]) ?? [];
};

export const useHint = async (teamId: string) => {
  const current = await getTeam(teamId);
  if (!current) throw new Error('Team not found.');

  return updateTeam(teamId, {
    hints_used: current.hints_used + 1,
    score: Math.max(0, current.score - 1),
  });
};

export const adjustScore = async (teamId: string, delta: number, reason: string) => {
  const current = await getTeam(teamId);
  if (!current) throw new Error('Team not found.');

  const team = await updateTeam(teamId, {
    score: Math.max(0, current.score + delta),
  });
  await logTeamEvent(teamId, 'score_adjusted', reason, delta);
  return team;
};

export const resetScore = async (teamId: string) => {
  const current = await getTeam(teamId);
  if (!current) throw new Error('Team not found.');

  const delta = current.score === 0 ? 0 : -current.score;
  const team = await updateTeam(teamId, { score: 0 });
  await logTeamEvent(teamId, 'score_adjusted', 'Score reset to 0', delta);
  return team;
};

export const completeFinalGate = async (teamId: string) => {
  const current = await getTeam(teamId);
  if (!current) throw new Error('Team not found.');

  const completionResult = await completeItem(teamId, 'final_gate', 'final-gate', 4);
  const team = await updateTeam(teamId, { final_gate_completed: true });

  return {
    team,
    alreadyCompleted: completionResult.alreadyCompleted || current.final_gate_completed,
  };
};

export const resetFinalGate = async (teamId: string) => {
  await uncompleteItem(teamId, 'final_gate', 'final-gate');
  return updateTeam(teamId, {
    final_gate_completed: false,
    reveal_completed: false,
  });
};

export const completeReveal = async (teamId: string) => {
  await completeItem(teamId, 'reveal', 'reveal', 0);
  return updateTeam(teamId, {
    reveal_completed: true,
    current_status: 'completed',
  });
};

export const logTeamEvent = async (
  teamId: string | null,
  eventType: string,
  eventLabel: string,
  pointsDelta = 0,
  metadata: Record<string, unknown> = {},
) => {
  const supabase = ensureSupabase();
  const { error } = await supabase.from('team_events').insert({
    team_id: teamId,
    event_type: eventType,
    event_label: eventLabel,
    points_delta: pointsDelta,
    metadata,
  });

  if (error) throw toError(error, 'Failed to log team event.');
};

export const getTeamEvents = async (teamId: string) => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('team_events')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw toError(error, 'Failed to load team events.');
  return (data as TeamEvent[]) ?? [];
};

export const getAllEvents = async (limit = 200) => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('team_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw toError(error, 'Failed to load activity log.');
  return (data as TeamEvent[]) ?? [];
};

export const getGameSettings = async (): Promise<GameSettings> => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('game_settings')
    .select('key, value');

  if (error) throw toError(error, 'Failed to load game settings.');

  const settings = { ...defaultGameSettings };
  for (const row of data ?? []) {
    const key = row.key as GameSettingKey;
    if (key in settings) {
      settings[key] = Boolean(row.value);
    }
  }

  return settings;
};

export const updateGameSetting = async (key: GameSettingKey, value: boolean) => {
  const supabase = ensureSupabase();
  const { error } = await supabase.from('game_settings').upsert({
    key,
    value,
  });

  if (error) throw toError(error, 'Failed to update game setting.');
};

const createRealtimeSubscription = (
  channelName: string,
  table: string,
  callback: (payload: unknown) => void,
  filter?: string,
) => {
  const supabase = ensureSupabase();
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      },
      (payload) => callback(payload),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};

export const subscribeToTeams = (callback: (payload: unknown) => void) =>
  createRealtimeSubscription('learnova-teams', 'teams', callback);

export const subscribeToTeamEvents = (callback: (payload: unknown) => void) =>
  createRealtimeSubscription('learnova-events', 'team_events', callback);

export const subscribeToTeam = (teamId: string, callback: (payload: unknown) => void) =>
  createRealtimeSubscription(`learnova-team-${teamId}`, 'teams', callback, `id=eq.${teamId}`);

export const subscribeToTeamCompletions = (teamId: string, callback: (payload: unknown) => void) =>
  createRealtimeSubscription(
    `learnova-team-completions-${teamId}`,
    'team_completions',
    callback,
    `team_id=eq.${teamId}`,
  );

export const subscribeToGameSettings = (callback: (payload: unknown) => void) =>
  createRealtimeSubscription('learnova-settings', 'game_settings', callback);

export const unsubscribe = (channel: RealtimeChannel | null | undefined) => {
  if (!channel) return;
  const supabase = ensureSupabase();
  void supabase.removeChannel(channel);
};

export const getWorldProgressState = getWorldProgress;
export const getComputedStatus = getDisplayStatus;
export const canOpenFinalGateForTeam = (team: Team | null) =>
  isAllWorldsUnlocked(team) && Boolean(team);
export const getItemCompletionLabel = getCompletionLabel;
