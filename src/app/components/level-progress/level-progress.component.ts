import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-level-progress',
  templateUrl: './level-progress.component.html',
  styleUrls: ['./level-progress.component.css'],
  standalone: true,
})
export class LevelProgressComponent {
  @Input() level!: number;
  @Input() currentXp!: number;
  @Input() xpForNextLevel!: number;

  get progressPercent(): number {
    return Math.min(100, (this.currentXp / this.xpForNextLevel) * 100);
  }
}