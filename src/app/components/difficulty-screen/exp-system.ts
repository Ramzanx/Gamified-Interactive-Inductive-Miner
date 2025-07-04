export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
    Custom = 'Custom'
}

export type Grade = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

export const GRADE_ORDER: Grade[] = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'];

export type Grades = Record<Grade, number>;

export type GradeConfigMap = Record<Difficulty, Grades>;

const EASY_GRADES: Grades = {
    'S+': 60,
    'S': 60,
    'A+': 60,
    'A': 50,
    'B+': 50,
    'B': 50,
    'C': 40,
    'D': 40,
    'F': 40
};

const MEDIUM_GRADES: Grades = {
    'S+': 140,
    'S': 140,
    'A+': 140,
    'A': 140,
    'B+': 120,
    'B': 120,
    'C': 120,
    'D': 80,
    'F': 80
};

const HARD_GRADES: Grades = {
    'S+': 250,
    'S': 250,
    'A+': 250,
    'A': 250,
    'B+': 200,
    'B': 200,
    'C': 200,
    'D': 160,
    'F': 160
};

const CUSTOM_GRADES: Grades = {
    'S+': 0,
    'S': 0,
    'A+': 0,
    'A': 0,
    'B+': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'F': 0
};

export const EXP_CONFIG: GradeConfigMap = {
    [Difficulty.Easy]: EASY_GRADES,
    [Difficulty.Medium]: MEDIUM_GRADES,
    [Difficulty.Hard]: HARD_GRADES,
    [Difficulty.Custom]: CUSTOM_GRADES
};