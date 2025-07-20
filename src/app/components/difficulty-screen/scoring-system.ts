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
    maxScore: 40000,
    minScore: 4000,
    maxTimeMs: 16000,
  },
  [Difficulty.Hard]: {
    maxScore: 70000,
    minScore: 7000,
    maxTimeMs: 26000,
  },
  [Difficulty.Custom]: {
    maxScore: 0,
    minScore: 0,
    maxTimeMs: 0,
  },
};