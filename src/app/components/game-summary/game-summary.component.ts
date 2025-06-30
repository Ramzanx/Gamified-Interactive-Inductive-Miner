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
    @Input() stagePointsEarned!: number[];
    @Input() totalPointsEarned = 0;

    @Input() easyConfig!: ScoreConfig;
    @Input() mediumConfig!: ScoreConfig;
    @Input() hardConfig!: ScoreConfig;

    @Input() selectedDifficulty!: Difficulty;

    
    @Output() expEarned = new EventEmitter<number>();

    @Output() playAgain = new EventEmitter<void>();
    @Output() toggleStageDetailsExpand = new EventEmitter<boolean>();

    fastThreshold = 2000;
    averageThreshold = 3500;
    slowThreshold = 5000;
    exp: number = 0; // Default
    grade: Grade = 'F'; // Default

    showStageDetails: boolean = false;

    ngOnChanges(changes: SimpleChanges): void {

        if (this.stagePointsEarned && this.stagePointsEarned.length > 0) {
            //TODO: Logs Entfernen
            console.log('Difficulty:', this.selectedDifficulty);
            console.log('Config:', SCORE_CONFIG[this.selectedDifficulty]);
            console.log('Stage Points:', this.stagePointsEarned);
            console.log('Total Points:', this.totalPointsEarned);
            console.log('Total Stages:', this.totalStages);
            console.log('Average per stage:', this.totalPointsEarned / this.totalStages);
            this.grade = this.getOverallGrade(this.stagePointsEarned, SCORE_CONFIG[this.selectedDifficulty]);

            //EXP - comes with score
            const exp = this.getEarnedExp();
            this.exp = exp;
            
            // DEBUG: Emit after the current change-detection cycle has stabilised
            queueMicrotask(() => this.expEarned.emit(this.exp));
        }
    }

    onPlayAgain(): void {
        this.playAgain.emit();
    }

    getTimeClass(time: number): string {
        if (time <= this.fastThreshold) return 'time-fast';
        if (time >= this.slowThreshold) return 'time-slow';
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

    getGrade(score: number, config: ScoreConfig): Grade {
        if (score >= config.maxScore * 0.95) return GRADE_ORDER[0]; // S+
        if (score >= config.maxScore * 0.90) return GRADE_ORDER[1]; // S 
        if (score >= config.maxScore * 0.85) return GRADE_ORDER[2]; // A+
        if (score >= config.maxScore * 0.80) return GRADE_ORDER[3]; // A
        if (score >= config.maxScore * 0.70) return GRADE_ORDER[4]; // B+
        if (score >= config.maxScore * 0.60) return GRADE_ORDER[5]; // B
        if (score >= config.maxScore * 0.50) return GRADE_ORDER[6]; // C
        if (score >= config.maxScore * 0.40) return GRADE_ORDER[7]; // D
        return GRADE_ORDER[8]; // F
    }

    getOverallGrade(stagePoints: number[], config: ScoreConfig): Grade {
        if (!stagePoints || stagePoints.length === 0 || this.totalStages === 0) return GRADE_ORDER[8] // F;
        const average = this.totalPointsEarned / this.totalStages;
        return this.getGrade(average, config);
    }

    getEarnedExp(): number {
        let mult = 1;
        if (this.totalStages === 10) mult = 2;
        return EXP_CONFIG[this.selectedDifficulty][this.grade] * mult;
    }
}
