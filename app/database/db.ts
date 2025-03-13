import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Quote {
  id: number;
  quote: string;
  author: string;
  category: string;
}

export interface StudyStreak {
  date: string;
  minutes_studied: number;
}

const STORAGE_KEY = 'eduboost_data';

const defaultQuotes: Quote[] = [
  { id: 1, quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'motivation' },
  { id: 2, quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'perseverance' },
  { id: 4, quote: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King', category: 'learning' },
  { id: 5, quote: 'The more that you read, the more things you will know. The more that you learn, the more places you will go.', author: 'Dr. Seuss', category: 'learning' },
  { id: 6, quote: '"Study now, read Wattpad later—your grades need a happy ending too!', author: 'Yours truly', category: 'motivation' },
  { id: 7, quote: 'Study now, game later—because victory tastes sweeter!', author: 'Yours truly', category: 'motivation' }
];

interface StorageData {
  quotes: Quote[];
  streaks: StudyStreak[];
}

const getStoredData = async (): Promise<StorageData> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { quotes: defaultQuotes, streaks: [] };
  } catch (error) {
    console.error('Error reading storage:', error);
    return { quotes: defaultQuotes, streaks: [] };
  }
};

const saveStoredData = async (data: StorageData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving storage:', error);
  }
};

export const initDatabase = async (): Promise<void> => {
  const data = await getStoredData();
  if (!data.quotes || data.quotes.length === 0) {
    await saveStoredData({ quotes: defaultQuotes, streaks: [] });
  }
};

export const getRandomMotivationalQuote = async (): Promise<Quote | null> => {
  const data = await getStoredData();
  if (!data.quotes.length) return null;
  const randomIndex = Math.floor(Math.random() * data.quotes.length);
  return data.quotes[randomIndex];
};

export const updateStudyStreak = async (date: Date, minutesStudied: number): Promise<void> => {
  const data = await getStoredData();
  const dateStr = date.toISOString().split('T')[0];
  const streakIndex = data.streaks.findIndex((s) => s.date === dateStr);

  if (streakIndex >= 0) {
    data.streaks[streakIndex].minutes_studied = minutesStudied;
  } else {
    data.streaks.push({ date: dateStr, minutes_studied: minutesStudied });
  }

  await saveStoredData(data);
};

export const getStudyStreak = async (): Promise<StudyStreak[]> => {
  const data = await getStoredData();
  return data.streaks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30);
};
