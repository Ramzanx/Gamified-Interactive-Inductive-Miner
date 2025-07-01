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

interface HighscoreEntry {
  score: number;
  difficulty: string;
  time: string;
  grade: string;
  totalStages: number;
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
  @Input() highscores: HighscoreEntry[] = [];

  tabs = [
    { label: 'Highscores', icon: '🏆' },
    { label: 'Achievements', icon: '🎖️' }
  ];

  activeTab = this.tabs[0].label;

  activeScoreMode: '5-stage' | '10-stage' = '5-stage';

  highscores5Stage: HighscoreEntry[] = [
    { score: 820, difficulty: 'Easy', time: '1:23', grade: 'B+', totalStages: 5 },
    { score: 780, difficulty: 'Medium', time: '1:30', grade: 'B', totalStages: 10 },
    // ...
  ];

  highscores10Stage: HighscoreEntry[] = [
    { score: 820, difficulty: 'Easy', time: '1:23', grade: 'B+', totalStages: 5 },
    { score: 780, difficulty: 'Medium', time: '1:30', grade: 'B', totalStages: 10 },
    // ...
  ];

  get displayedScores(): HighscoreEntry[] {
    const stageCount = this.activeScoreMode === '5-stage' ? 5 : 10;
    return this.highscores
      .filter(s => s.totalStages === stageCount)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  achievementsByCategory: AchievementCategory[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.achievementsByCategory = [
      {
        title: 'Beginner',
        badges: [
          { caption: 'Reach Level 2', icon: 'military_tech', achieved: this.playerLevel >= 2 },
          { caption: 'Win a game', icon: 'emoji_events', achieved: this.winStreak >= 1 },
          // TODO: Add more Achievements
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