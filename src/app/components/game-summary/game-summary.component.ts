import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { Difficulty, SCORE_CONFIG } from '../difficulty-screen/scoring-system';
import { EXP_CONFIG, Grade, GRADE_ORDER } from '../difficulty-screen/exp-system';

type ScoreConfig = {
    maxScore: number;
    minScore: number;
    maxTimeMs: number; // Max time in ms
};

@Component({
    selector: 'game-summary',
    templateUrl: './game-summary.component.html',
    styleUrls: ['./game-summary.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class GameSummaryComponent implements OnChanges {
    @Input() totalStages!: number;
    @Input() stageTimes!: number[];
    @Input() totalTime = 0;
    @Input() stageScore!: number[];
    @Input() totalScore = 0;

    @Input() selectedDifficulty!: Difficulty;


    @Output() expEarned = new EventEmitter<number>();

    @Output() playAgain = new EventEmitter<void>();
    @Output() toggleStageDetailsExpand = new EventEmitter<boolean>();

    @Output() highscoreSubmitted = new EventEmitter<{
        score: number;
        difficulty: string;
        time: string;
        grade: string;
        totalStages: number;
    }>();

    @Output() GradeAchievementUnlocked = new EventEmitter<Grade>();

    fastThreshold = 2200;
    slowThreshold = 3600;
    exp: number = 0; // Default
    grade: Grade = 'F'; // Default
    mediumMult: number = 3;
    hardMult: number = 7;

    showStageDetails: boolean = false;

    ngOnChanges(changes: SimpleChanges): void {

        if (this.stageScore && this.stageScore.length > 0) {
            this.grade = this.getOverallGrade(this.stageScore, SCORE_CONFIG[this.selectedDifficulty]);

            //EXP - comes with score
            const exp = this.getEarnedExp();
            this.exp = exp;

            // Debug purpose: Emit only after the current change-detection cycle has stabilised
            queueMicrotask(() => {
                this.expEarned.emit(this.exp);

                this.highscoreSubmitted.emit({
                    score: this.totalScore,
                    difficulty: this.selectedDifficulty,
                    time: this.formatMs(this.totalTime),
                    grade: this.grade,
                    totalStages: this.totalStages
                });

                if (this.grade === GRADE_ORDER[0]) this.GradeAchievementUnlocked.emit(this.grade);
            });
        }
    }

    onPlayAgain(): void {
        this.playAgain.emit();
    }

    getTimeClass(time: number): string {
        let mult: number = 1;
        if (this.selectedDifficulty === Difficulty.Medium) mult = this.mediumMult;
        if (this.selectedDifficulty === Difficulty.Hard) mult = this.hardMult;
        if (time <= this.fastThreshold * mult) return 'time-fast';
        if (time >= this.slowThreshold * mult) return 'time-slow';
        return 'time-average';
    }

    toggleStageDetails(): void {
        this.showStageDetails = !this.showStageDetails;
        this.toggleStageDetailsExpand.emit(this.showStageDetails);
    }

    formatMs(ms: number): string {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centis = Math.floor((ms % 1000) / 10);

        return `${minutes.toString().padStart(2, '0')}:`
            + `${seconds.toString().padStart(2, '0')}.`
            + `${centis.toString().padStart(2, '0')}`;
    }

    getGrade(time: number): Grade {
        let mult: number = 1;
        if (this.selectedDifficulty === Difficulty.Medium) mult = this.mediumMult;
        if (this.selectedDifficulty === Difficulty.Hard) mult = this.hardMult;
        if (time <= 1000 * mult) return GRADE_ORDER[0]; // S+
        if (time <= 1500 * mult) return GRADE_ORDER[1]; // S
        if (time <= 2000 * mult) return GRADE_ORDER[2]; // A+
        if (time <= 2200 * mult) return GRADE_ORDER[3]; // A
        if (time <= 2400 * mult) return GRADE_ORDER[4]; // B+
        if (time <= 2600 * mult) return GRADE_ORDER[5]; // B
        if (time <= 3100 * mult) return GRADE_ORDER[6]; // C
        if (time <= 3600 * mult) return GRADE_ORDER[7]; // D
        return GRADE_ORDER[8]; // F
    }

    getOverallGrade(stageScore: number[], config: ScoreConfig): Grade {
        if (!stageScore || stageScore.length === 0 || this.totalStages === 0) return GRADE_ORDER[8] // F;
        const average = this.totalTime / this.totalStages;
        return this.getGrade(average);
    }

    getEarnedExp(): number {
        let mult = 1;
        if (this.totalStages === 10) mult = 2;
        return EXP_CONFIG[this.selectedDifficulty][this.grade] * mult;
    }
}