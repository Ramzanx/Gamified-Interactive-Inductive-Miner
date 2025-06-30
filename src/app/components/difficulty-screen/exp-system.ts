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
    'A': 40,
    'B+': 40,
    'B': 40,
    'C': 20,
    'D': 20,
    'F': 20
};

const MEDIUM_GRADES: Grades = {
    'S+': 120,
    'S': 120,
    'A+': 120,
    'A': 100,
    'B+': 100,
    'B': 100,
    'C': 80,
    'D': 80,
    'F': 80
};

const HARD_GRADES: Grades = {
    'S+': 200,
    'S': 200,
    'A+': 200,
    'A': 180,
    'B+': 180,
    'B': 180,
    'C': 160,
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