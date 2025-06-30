import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Difficulty } from './scoring-system';

@Component({
  selector: 'difficulty-screen',
  templateUrl: './difficulty-screen.html',
  styleUrls: ['./difficulty-screen.css'],   // <-- plural
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule
  ],
})
export class DifficultyScreenComponent {

  @Input() userLevel = 0;
  Difficulty = Difficulty; // Type-issues HTML: Make Difficulty available in the template
  difficulty: Difficulty = Difficulty.Easy;
  @Input() stageCount: number | null = null;

  @Output() difficultyChange = new EventEmitter<Difficulty>();
  @Output() stageCountChange = new EventEmitter<number>();

  @Output() startGameAndTimer = new EventEmitter<void>();
  @Output() stopGameTimer = new EventEmitter<void>();

  constructor(private _snackbar: MatSnackBar) { }

  timerRunning = false;
  elapsedTime = 0;
  timerInterval: ReturnType<typeof setInterval> | undefined;

  countingDown = false;
  countdown: number | string = '';
  animateCountdown = false;

  handleDifficultyClick(difficulty: Difficulty, requiredLevel: number): void {
    if (this.userLevel >= requiredLevel) {
      this.difficulty = difficulty;
      this.difficultyChange.emit(difficulty);
    } else {
      this._snackbar.open(
        `Reach level ${requiredLevel} to unlock ${difficulty}!`,
        'OK',
        { duration: 3000 }
      );
    }
  }

  startCountdown(): void {
    this.countingDown = true;
    const countdownSequence: (number | string)[] = [3, 2, 1, 'GO!'];
    let index = 0;

    const showNext = () => {
      this.countdown = countdownSequence[index++];
      this.animateCountdown = false;
      setTimeout(() => (this.animateCountdown = true), 50);

      if (index === countdownSequence.length) {
        clearInterval(countdownInterval);
        setTimeout(() => {
          this.countingDown = false;
          this.startGame();
        }, 800); // leave “GO!” visible a bit
      }
    };

    showNext();                                   // show first number immediately
    const countdownInterval = setInterval(showNext, 1000);
  }

  selectStageCount(count: number, event: Event): void {
    event.stopPropagation();
    this.stageCount = count;
    this.stageCountChange.emit(count);
  }


  startGame(): void {
    // const difficultyScreen = document.getElementById('difficultyScreen');
    // if (difficultyScreen) difficultyScreen.style.display = 'none';

    this.startGameAndTimer.emit();
  }

  stopGame(): void {
    this.stopGameTimer.emit();
  }
}