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
    maxScore: 1000,
    minScore: 100,
    maxTimeMs: 8000,
  },
  [Difficulty.Medium]: {
    maxScore: 3000,
    minScore: 300,
    maxTimeMs: 12500,
  },
  [Difficulty.Hard]: {
    maxScore: 5000,
    minScore: 500,
    maxTimeMs: 20000,
  },
  [Difficulty.Custom]: {
    maxScore: 0,
    minScore: 0,
    maxTimeMs: 0,
  },
};