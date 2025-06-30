import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';


interface Badge {
  caption: string;
  icon: string;
  achieved: boolean;
}

interface AchievementCategory {
  title: string;
  badges: Badge[];
}

@Component({
  selector: 'player-info-panel',
  templateUrl: './player-info-panel.component.html',
  styleUrls: ['./player-info-panel.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PlayerInfoPanelComponent implements OnChanges {
  @Input() playerLevel!: number;
  @Input() winStreak!: number;
  @Input() hasCustomModeUnlocked!: boolean;

  tabs = [
    { label: 'Highscores', icon: '🏆' },
    { label: 'Achievements', icon: '🎖️' }
  ];

  activeTab = this.tabs[0].label;

  activeScoreMode: '5-stage' | '10-stage' = '5-stage';

  highscores5Stage = [
    { score: 820, time: '1:23', grade: 'B+' },
    { score: 780, time: '1:30', grade: 'B' },

  ];

  highscores10Stage = [
    { score: 1420, time: '2:10', grade: 'A' },
    { score: 1300, time: '2:25', grade: 'A-' }
  ];

  get displayedScores() {
    return this.activeScoreMode === '5-stage' ? this.highscores5Stage : this.highscores10Stage;
  }

  achievementsByCategory: AchievementCategory[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.achievementsByCategory = [
      {
        title: 'Beginner',
        badges: [
          { caption: 'Reach Level 1', icon: 'military_tech', achieved: this.playerLevel >= 2 },
          { caption: 'Win a game', icon: 'emoji_events', achieved: this.winStreak >= 1 }
        ]
      },
      {
        title: 'Expert',
        badges: [
          { caption: 'Unlock Custom Mode', icon: 'lock_open', achieved: this.hasCustomModeUnlocked }
        ]
      }
    ];
  }
} 