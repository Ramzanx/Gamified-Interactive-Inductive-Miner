import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'game-summary',
    templateUrl: './game-summary.component.html',
    styleUrls: ['./game-summary.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class GameSummaryComponent {
    @Input() totalStages!: number;
    @Input() stageTimes!: number[];
    @Input() totalTime = 0;
    @Input() stagePointsEarned!: number[];
    @Input() totalPointsEarned = 0;
    @Input() expEarned = 0;
    fastThreshold = 2000;
    averageThreshold = 3500;
    slowThreshold = 5000;
    grade: string = "S";

    @Output() playAgain = new EventEmitter<void>();
    @Output() toggleStageDetailsExpand = new EventEmitter<boolean>();

    showStageDetails: boolean = false;

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
        const centis  = Math.floor((ms % 1000) / 10);
      
        return `${minutes.toString().padStart(2,'0')}:`
             + `${seconds.toString().padStart(2,'0')}.`
             + `${centis.toString().padStart(2,'0')}`;
      }
    
}
