export interface StudyMaterial {
  id: number;
  title: string;
  content: string | null;
  file_path: string | null;
  file_type: string;
  created_at: string;
}

export interface StudyGoal {
  id: number;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  created_at: string;
}

export interface StudyStreak {
  id: number;
  date: string;
  minutes_studied: number;
}

export interface MotivationalQuote {
  id: number;
  quote: string;
  author: string;
  category: string;
}

export type RootStackParamList = {
  Home: undefined;
  StudyMaterials: undefined;
  AddStudyMaterial: undefined;
  ViewStudyMaterial: { id: number };
  Goals: undefined;
  AddGoal: undefined;
  Progress: undefined;
  Settings: undefined;
}; 