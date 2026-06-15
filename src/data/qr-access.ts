export const qrAccessCodes = {
  educationMirror: 'fahim-blue',
  entrepreneurshipMarket: 'riyada-red',
  entertainmentStory: 'sharara-gold',
  explorationCompass: 'rahhal-green',
  fogPerfect: 'fog-perfect',
  fogShiny: 'fog-shiny',
  fogEmpty: 'fog-stage',
  fogRush: 'fog-pattern',
  fogLone: 'fog-balance',
  bonusBadges: 'bonus-stars',
  bonusWonder: 'bonus-light',
  bonusPrototype: 'bonus-flame',
  bonusOath: 'bonus-bond',
  finalGate: 'final-spark',
} as const;

export type QrAccessKey = keyof typeof qrAccessCodes;
