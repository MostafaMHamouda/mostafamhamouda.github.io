export type WorldKey =
  | 'education'
  | 'entrepreneurship'
  | 'entertainment'
  | 'exploration';

export type TeamStatus =
  | 'in_progress'
  | 'final_ready'
  | 'completed'
  | 'stuck'
  | 'inactive';

export type CompletionType =
  | 'world'
  | 'fog_trap'
  | 'bonus'
  | 'final_gate'
  | 'reveal';

export type Team = {
  id: string;
  team_name: string;
  members_count: number;
  pathfinder: string | null;
  scanner: string | null;
  score: number;
  hints_used: number;
  education_unlocked: boolean;
  entrepreneurship_unlocked: boolean;
  entertainment_unlocked: boolean;
  exploration_unlocked: boolean;
  final_gate_completed: boolean;
  reveal_completed: boolean;
  last_unlocked_world: string | null;
  current_status: TeamStatus;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type TeamCompletion = {
  id: string;
  team_id: string;
  item_type: CompletionType;
  item_id: string;
  completed_at: string;
  points_awarded: number;
};

export type TeamEvent = {
  id: string;
  team_id: string | null;
  event_type: string;
  event_label: string;
  points_delta: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type GameSettingKey =
  | 'registrations_open'
  | 'final_gate_open'
  | 'game_started'
  | 'game_paused'
  | 'public_leaderboard_visible';

export type GameSettings = Record<GameSettingKey, boolean>;

export type RegisterTeamInput = {
  team_name: string;
  members_count: number;
  pathfinder?: string | null;
  scanner?: string | null;
};
