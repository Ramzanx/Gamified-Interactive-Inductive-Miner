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

/* 150 EXP for level 3 needed --> 
    Worst performance: 150//40 = 4 games 
    Best performance: 150//80 = 2 games
*/
const EASY_GRADES: Grades = {
    'S+': 80,
    'S': 80,
    'A+': 80,
    'A': 60,
    'B+': 60,
    'B': 60,
    'C': 40,
    'D': 40,
    'F': 40
};

/* 2550 EXP for level 10 needed--> 
    Best performance: 2550//320 = 8 games (4 on 10 Stages)
    Worst performance: 2550//215 = 12 games (6 on 10 Stages)
*/
const MEDIUM_GRADES: Grades = {
    'S+': 325,
    'S': 325,
    'A+': 325,
    'A': 270,
    'B+': 270,
    'B': 270,
    'C': 215,
    'D': 215,
    'F': 215
};

// EXP doesnt matter: Increased for instant gratification
const HARD_GRADES: Grades = {
    'S+': 700,
    'S': 700,
    'A+': 700,
    'A': 500,
    'B+': 500,
    'B': 500,
    'C': 325,
    'D': 325,
    'F': 325
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