import { Component, Input } from '@angular/core';

@Component({
  selector: 'level-progress',
  templateUrl: './level-progress.component.html',
  styleUrls: ['./level-progress.component.css'],
  standalone: true,
})
export class LevelProgressComponent {
  @Input() level: number = 1;
  @Input() currentExp: number = 0;
  @Input() expForNextLevel: number = 50;

  get progressPercent(): number {
    return (this.currentExp / this.expForNextLevel) * 100;
  }
}