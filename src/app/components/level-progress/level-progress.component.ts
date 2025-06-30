import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'level-progress',
  templateUrl: './level-progress.component.html',
  styleUrls: ['./level-progress.component.css'],
  standalone: true,
})
export class LevelProgressComponent {
  @Input() set expEarned(exp: number) {
    if (exp > 0) this.addExp(exp);
  }

  @Output() levelUp = new EventEmitter<number>();

  level = 1;
  currentExp = 0;
  expForNextLevel = this.expNeeded(this.level);

  get progressPercent(): number {
    return (this.currentExp / this.expForNextLevel) * 100;
  }

  private expNeeded(level: number): number {
    return 50 * level;
  }

  private addExp(amount: number): void {
    this.currentExp += amount;
    while (this.currentExp >= this.expForNextLevel) {
      this.currentExp -= this.expForNextLevel;
      this.level++;
      this.expForNextLevel = this.expNeeded(this.level);
      this.levelUp.emit(this.level);
    }
  }
}
