export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Custom = 'Custom'
}

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
    maxScore: 1000,
    minScore: 100,
    maxTimeMs: 10_000,
  },
  [Difficulty.Medium]: {
    maxScore: 3000,
    minScore: 300,
    maxTimeMs: 10_000,
  },
  [Difficulty.Hard]: {
    maxScore: 5000,
    minScore: 500,
    maxTimeMs: 10_000,
  },
  [Difficulty.Custom]: {
    maxScore: 0,
    minScore: 0,
    maxTimeMs: 0,
  },
};