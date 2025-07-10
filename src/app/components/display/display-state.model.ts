// src/app/components/display/display-state.model.ts
export interface DisplayState {
    /* --------------- “Player Info” ----------------- */
    userLevel: number;
    userExp: number;

    /* --------------- “Performance / Scores” -------- */
    stageTimes: number[];
    stageScore: number[];
    highscores: {
        score: number;
        difficulty: string;
        time: string;
        grade: string;
        totalStages: number;
    }[];

    /* --------------- “Achievements” ----------- */
    sGrade: boolean;
    hardGrade: boolean;
    mediumDiff: number;
    hardDiff: number;
}