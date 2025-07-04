export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Custom = 'Custom'
}

//Score
export interface ScoreConfig {
  maxScore: number;
  minScore: number;
  maxTimeMs: number;
}

export type DifficultyConfigMap = {
  [key in Difficulty]: ScoreConfig;
};

export const SCORE_CONFIG: DifficultyConfigMap = {
  [Difficulty.Easy]: {
    maxScore: 10000,
    minScore: 1000,
    maxTimeMs: 5000,
  },
  [Difficulty.Medium]: {
    maxScore: 30000,
    minScore: 3000,
    maxTimeMs: 10000,
  },
  [Difficulty.Hard]: {
    maxScore: 50000,
    minScore: 5000,
    maxTimeMs: 15000,
  },
  [Difficulty.Custom]: {
    maxScore: 0,
    minScore: 0,
    maxTimeMs: 0,
  },
};