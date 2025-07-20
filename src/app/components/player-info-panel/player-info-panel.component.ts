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

interface AchievementState {
  userLevel: number;
  sGrade: boolean;
  hardGrade: boolean;
  hardDiff: number;
  mediumDiff: number;
  [key: string]: any; // (Optional, for flexibility)
}

@Component({
  selector: 'player-info-panel',
  templateUrl: './player-info-panel.component.html',
  styleUrls: ['./player-info-panel.component.css'],
  standalone: true,
  imports: [CommonModule],
})

export class PlayerInfoPanelComponent {
  @Input() playerLevel!: number;
  @Input() highscores: HighscoreEntry[] = [];
  @Input() achievementState!: AchievementState;


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

  get achievementsByCategory() {
    return [
      {
        title: 'Beginner',
        badges: [
          {
            caption: 'Score 25.000 Points',
            icon: 'military_tech',
            achieved: this.highscores?.some(h => h.score >= 25000)
          },
          {
            caption: 'Reach Level 3',
            icon: 'looks_3',
            achieved: this.achievementState.userLevel >= 3
          }
        ]
      },
      {
        title: 'Intermediate',
        badges: [
          {
            caption: 'Score 200.000 Points',
            icon: 'workspace_premium',
            achieved: this.highscores?.some(h => h.score >= 200000)
          },
          {
            caption: 'Play 3 Games on Medium Difficulty',
            icon: 'sports_esports',
            achieved: this.achievementState.mediumDiff >= 3
          },
          {
            caption: 'Achieve a S+ Grade in any Difficulty',
            icon: 'star',
            achieved: this.achievementState.sGrade
          },
        ]
      },
      {
        title: 'Expert',
        badges: [
          {
            caption: 'Score 300.000 Points',
            icon: 'emoji_events',
            achieved: this.highscores?.some(h => h.score >= 300000)
          },
          {
            caption: 'Play 5 Games on Hard Difficulty',
            icon: 'whatshot',
            achieved: this.achievementState.hardDiff >= 5
          },
          {
            caption: 'Achieve an A+ Grade in Hard Difficulty',
            icon: 'school',
            achieved: this.achievementState.hardGrade
          },
        ]
      }
    ];
  }


  get currentTitle(): string {
    if (!this.achievementsByCategory) return '-';

    let current = '-';
    for (const category of this.achievementsByCategory) {
      const allAchieved = category.badges.every(b => b.achieved);
      if (allAchieved) current = category.title;
    }
    return current;
  }
} 