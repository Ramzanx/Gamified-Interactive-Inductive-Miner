import { CommonModule } from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressBarModule  } from 'primeng/progressbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'difficulty-screen',
    templateUrl: './difficulty-screen.html',
    styleUrl: './difficulty-screen.css',
    standalone: true,
    imports: [
      CommonModule,
      MatButtonModule,
      MatSnackBarModule
    ],
    
})

export class DifficultyScreenComponent {

  @Input() userLevel?: number | undefined;
  @Output() startGameAndTimer = new EventEmitter<void>();
  @Output() stopGameTimer = new EventEmitter<void>();

  constructor(private _snackbar: MatSnackBar) {}

  // Timer
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Custom' = 'Easy';
  timerRunning: boolean = false;
  elapsedTime: number = 0;
  timerInterval: any;

  // Countdown
  countingDown = false;
  countdown: number | string = '';
  animateCountdown = false;

  handleDifficultyClick(difficulty: any, requiredLevel: number) {
      if (this.userLevel! >= requiredLevel) {
        this.difficulty = difficulty;
      } else {
        this._snackbar.open(`Reach level ${requiredLevel} to unlock ${difficulty}!`, 'OK', {
          duration: 3000,
        });
      }
  }

  startCountdown() {
      this.countingDown = true;
      const countdownSequence = [3, 2, 1, 'GO!'];
      let index = 0;
    
      const showNext = () => {
        this.countdown = countdownSequence[index++];
        this.animateCountdown = false;
        setTimeout(() => this.animateCountdown = true, 50);
    
        if (index === countdownSequence.length) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            this.countingDown = false;
            this.startGame();
          }, 800); // "GO!" stays visible for 1 second
        }
      };
    
      // Show the first number immediately
      showNext();
    
      const countdownInterval = setInterval(showNext, 1000);
  }

  startGame(): void {
      const difficultyScreen = document.getElementById('difficultyScreen');
      if (difficultyScreen) {
          difficultyScreen.style.display = 'none';
      }

      this.startGameAndTimer.emit();
  }

  stopGame(): void {
    this.stopGameTimer.emit();  
  }

}