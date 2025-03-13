export interface MotivationalQuote {
  id: number;
  quote: string;
  author: string;
  category: string;
}

export interface StudyStreak {
  date: string;
  minutes_studied: number;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate: string;
  completed: boolean;
}

export interface StudyMaterial {
  id: number;
  title: string;
  description?: string;
  url?: string;
  type: 'document' | 'link' | 'note';
  dateAdded: string;
} 