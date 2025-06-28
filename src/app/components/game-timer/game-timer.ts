import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'game-timer',
    templateUrl: './game-timer.html',
    styleUrl: './game-timer.css',
    standalone: true,
    imports: [
        CommonModule
    ],

})

export class GameTimerComponent {
    // Timer
    timerRunning: boolean = false;
    elapsedTime: number = 0;
    timerInterval: any;


    startGameTimer(): void {
        this.timerRunning = true;
        this.elapsedTime = 0;
        this.timerInterval = setInterval(() => {
            this.elapsedTime += 10;
        }, 10);
    }

    stopGameTimer(): void {
        this.timerRunning = false;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetGameTimer(): void {
        this.stopGameTimer(); // Stop if running
        this.elapsedTime = 0;
    }

    getElapsedMs(): number {
        return this.elapsedTime; // or return this.elapsedTime if you want raw value
    }

    getCurrentTime(): string {
        return this.formattedTime; // or return this.elapsedTime if you want raw value
    }

    get formattedTime(): string {
        const totalMs = this.elapsedTime;
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const milliseconds = Math.floor((totalMs % 1000) / 10); // ← now 2 digits

        return (
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0') + '.' +
            String(milliseconds).padStart(2, '0')
        );
    }
}