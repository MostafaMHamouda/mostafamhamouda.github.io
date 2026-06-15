export type TeamState = {
  teamName: string;
  membersCount: number;
  pathfinder: string;
  scanner: string;
  score: number;
  hintsUsed: number;
  educationUnlocked: boolean;
  entrepreneurshipUnlocked: boolean;
  entertainmentUnlocked: boolean;
  explorationUnlocked: boolean;
  fogCompleted: string[];
  bonusCompleted: string[];
  finalGateCompleted: boolean;
  createdAt: string;
};
