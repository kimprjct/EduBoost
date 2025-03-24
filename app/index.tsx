import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, layout } from './theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [quote, setQuote] = useState(null);
  const [showQuote, setShowQuote] = useState(true);
  const [studyStreak, setStudyStreak] = useState([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isStudying, setIsStudying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const checkStudyingStatus = async () => {
        const studying = await AsyncStorage.getItem('isStudying');
        if (studying === 'true') {
          setIsStudying(true);
          setShowQuote(false);
          const storedStartTime = await AsyncStorage.getItem('startTime');
          if (storedStartTime) {
            setStartTime(parseInt(storedStartTime, 10));
          }
        }
      };

      checkStudyingStatus();

      return () => {
        // Optional: Any cleanup when the screen goes out of focus
      };
    }, [])
  );

  const loadInitialData = async () => {
    await loadQuote();
    await loadStudyStreak();
    const studying = await AsyncStorage.getItem('isStudying');
    if (studying === 'true') {
      setIsStudying(true);
      setShowQuote(false);
    }
  };

  const loadQuote = async () => {
    try {
      const storedQuotes = await AsyncStorage.getItem('motivationalQuotes');
      let quotes = storedQuotes ? JSON.parse(storedQuotes) : [
        { id: 0, quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'motivation' },
        { id: 1, quote: 'Study now, read Wattpad later.', author: 'Yours truly', category: 'motivation' },
        { id: 2, quote: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'Believing in Yourself' },
        { id: 3, quote: 'The only place where success comes before work is in the dictionary.', author: 'Vidal Sassoon', category: 'Hard Work' },
        { id: 4, quote: 'It always seems impossible until it’s done.', author: 'Nelson Mandela', category: 'Perseverance' },
        { id: 5, quote: 'Dreams don’t work unless you do.', author: 'John C. Maxwell', category: 'Overcoming Procrastination' },
        { id: 6, quote: 'Success is the progressive realization of a worthy goal.', author: 'Earl Nightingale', category: 'Success Mindset' },
        { id: 7, quote: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela', category: 'Education’s Power' },
        { id: 8, quote: 'Motivation is what sets you in motion, habit is what keeps you going.', author: 'Jim Ryun', category: 'Motivation and Growth' }
      ];
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } catch (error) {
      console.error('Error loading quote:', error);
    }
  };
  
  const saveQuotes = async (quotes) => {
    try {
      await AsyncStorage.setItem('motivationalQuotes', JSON.stringify(quotes));
    } catch (error) {
      console.error('Error saving quotes:', error);
    }
  };
  
  // Example usage: Save quotes when the app starts
  const initialQuotes = [
    { id: 0, quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'motivation' },
    { id: 1, quote: 'Study now, read Wattpad later.', author: 'Yours truly', category: 'motivation' },
    { id: 2, quote: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'Believing in Yourself' },
    { id: 3, quote: 'The only place where success comes before work is in the dictionary.', author: 'Vidal Sassoon', category: 'Hard Work' },
    { id: 4, quote: 'It always seems impossible until it’s done.', author: 'Nelson Mandela', category: 'Perseverance' },
    { id: 5, quote: 'Dreams don’t work unless you do.', author: 'John C. Maxwell', category: 'Overcoming Procrastination' },
    { id: 6, quote: 'Success is the progressive realization of a worthy goal.', author: 'Earl Nightingale', category: 'Success Mindset' },
    { id: 7, quote: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela', category: 'Education’s Power' },
    { id: 8, quote: 'Motivation is what sets you in motion, habit is what keeps you going.', author: 'Jim Ryun', category: 'Motivation and Growth' }
  ];
  
  // Save quotes when the app starts
  useEffect(() => {
    const storedQuotes = async () => {
      const quotes = await AsyncStorage.getItem('motivationalQuotes');
      if (!quotes) {
        await saveQuotes(initialQuotes);
      }
    };
    storedQuotes();
  }, []);
  

  const loadStudyStreak = async () => {
    try {
        let streak = await AsyncStorage.getItem('studyStreaks');
        streak = streak ? JSON.parse(streak) : [];
        setStudyStreak(streak);

        const today = new Date().toISOString().split('T')[0];
        const todayRecord = streak.find(s => s.date === today);
        setTodayMinutes(todayRecord ? todayRecord.minutes_studied : 0);

        // Recalculate the streak
        const consecutiveDays = getConsecutiveDays(streak);
        setStudyStreak(streak);

        // If streak should reset, update storage
        if (consecutiveDays === 0) {
            await AsyncStorage.setItem('studyStreaks', JSON.stringify([]));
        }

    } catch (error) {
        console.error('Error loading study streak:', error);
    }
};


  const handleGotIt = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      setShowQuote(false);
      await AsyncStorage.setItem('showQuote', 'false'); // Persist the quote display state
      loadStudyStreak();
      fadeAnim.setValue(1);
    });
  };

  const handleStartStopStudy = async () => {
    const newState = !isStudying;
    setIsStudying(newState);
    await AsyncStorage.setItem('isStudying', newState.toString());

    if (newState) {
      const now = Date.now();
      setStartTime(now);
      await AsyncStorage.setItem('startTime', now.toString());
    } else {
      const endTime = Date.now();
      const studyTime = Math.floor((endTime - startTime) / 1000); // Calculate study time in seconds
      await updateStudyStreak(studyTime);
      setStartTime(null);
      await AsyncStorage.removeItem('startTime');
    }
  };

  const updateStudyStreak = async (studyTime) => {
    try {
      let streak = await AsyncStorage.getItem('studyStreaks');
      streak = streak ? JSON.parse(streak) : [];

      const today = new Date().toISOString().split('T')[0];
      const todayRecord = streak.find(s => s.date === today);

      if (todayRecord) {
        todayRecord.minutes_studied += Math.floor(studyTime / 60); // Update today's study time
      } else {
        streak.push({
          date: today,
          minutes_studied: Math.floor(studyTime / 60),
        });
      }

      await AsyncStorage.setItem('studyStreaks', JSON.stringify(streak));
      setStudyStreak(streak);

      // Update today's minutes
      const todayMinutes = streak.find(s => s.date === today).minutes_studied;
      setTodayMinutes(todayMinutes);

      // Update day streak
      const consecutiveDays = getConsecutiveDays(streak);
      setStudyStreak(streak);
    } catch (error) {
      console.error('Error updating study streak:', error);
    }
  };

  const getConsecutiveDays = (streak) => {
    if (!streak.length) return 0;

    streak.sort((a, b) => new Date(a.date) - new Date(b.date));

    let consecutiveDays = 1; 
    for (let i = streak.length - 1; i > 0; i--) {
        if (!isConsecutive(streak[i].date, streak[i - 1].date)) {
            return 0; // Reset streak if a gap is found
        }
        consecutiveDays++;
    }

    return consecutiveDays;
};


  const isConsecutive = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d1.getTime() - d2.getTime());
    return diff === (24 * 60 * 60 * 1000); // Check if dates are consecutive
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (startTime) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }

      // Reset today's study and day streak at 12 AM
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setTodayMinutes(0);
        setStudyStreak([]);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#151530', '#1C1C3D']} style={StyleSheet.absoluteFill} />

      {showQuote ? (
        <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
          <LinearGradient colors={[colors.background.card, colors.background.secondary]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          
          {/* Quote Symbol with Transparent Circle */}
          <View style={styles.quoteIconContainer}>
            <View style={styles.quoteCircle}>
              <MaterialIcons name="format-quote" size={36} color={colors.primary} />
            </View>
          </View>

          {/* Quote Text Moved Down */}
          <Text style={styles.quoteText}>{quote?.quote}</Text>

          <View style={styles.quoteInfoContainer}>
            <Text style={styles.authorText}>- {quote?.author}</Text>
            <Text style={styles.categoryText}>{quote?.category}</Text>
          </View>

          {/* Enlarged "Got It" Button */}
          <TouchableOpacity style={styles.gotItButton} onPress={handleGotIt}>
            <Text style={styles.gotItText}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <View style={styles.statsContainer}>
  <View style={styles.statCard}>
    <MaterialIcons name="timer" size={28} color={colors.secondary} />
    <Text style={styles.statValue}>{todayMinutes}</Text>
    <Text style={styles.statUnit}>min</Text>
    <Text style={styles.statLabel}>Today's Study</Text>
  </View>
  <View style={styles.statCard}>
    <MaterialIcons name="local-fire-department" size={28} color="orange" />
    <Text style={styles.statValue}>{getConsecutiveDays(studyStreak)}</Text>
    <Text style={styles.statLabel}>Day Streak</Text>
  </View>
</View>


          {/* Start Studying / Stop Studying Button */}
          <TouchableOpacity style={styles.startStudyButton} onPress={handleStartStopStudy}>
            <Text style={styles.startStudyText}>
              {isStudying ? 'Stop Studying' : 'Start Studying'}
            </Text>
          </TouchableOpacity>

          {/* Timer Display */}
          {isStudying && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {Math.floor(elapsedTime / 60)}:{elapsedTime % 60 < 10 ? `0${elapsedTime % 60}` : elapsedTime % 60}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151530', // Slightly lighter dark blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteCard: {
    width: '85%',
    borderRadius: borderRadius.xl || 16,
    borderColor: '#00FFFF',
    borderWidth: 1, 
    padding: spacing.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
    aspectRatio: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent background
    shadowColor: '#00FFFF', // Electric blue shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 14,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent background
  },
  quoteIconContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md, // Moves the quote symbol to the left
  },
  quoteCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent circle
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  quoteText: {
    fontSize: typography.sizes.xl,
    fontStyle: 'italic',
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl, // Moves quote text down
    justifyContent: 'center',
    alignSelf: 'center', // Ensures it stays centered
    marginTop: spacing.xl
  },
  
  quoteInfoContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  authorText: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.primary,
    
  },
  categoryText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  gotItButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg || 10,
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  gotItText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
  },

welcomeContainer: {
  alignItems: 'center',
  paddingTop: spacing.xs,
},
welcomeTitle: {
  fontSize: typography.sizes.xxl,
  fontWeight: 'bold',
  color: colors.text.primary,
},
statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '80%',
  marginTop: spacing.xxl,
},
statCard: {
  alignItems: 'center',
  backgroundColor: colors.background.secondary,
  padding: spacing.lg,
  borderRadius: borderRadius.xl || 16,
  width: '45%',
  height: 190,
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#00FFFF',
  shadowColor: '#00FFFF', // Electric blue shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.8,
  shadowRadius: 10,
  elevation: 8, // For Android
},
statValue: {
  fontSize: typography.sizes.xxl,
  fontWeight: 'bold',
  color: colors.primary,
  textAlign: 'center',
  marginTop: spacing.md,
},
statUnit: {
  fontSize: typography.sizes.lg,
  color: colors.text.secondary,
  textAlign: 'center',
  marginTop: -5, // Moves "min" closer to the number
},
statLabel: {
  fontSize: typography.sizes.lg,
  color: colors.text.secondary,
  textAlign: 'center',
  marginTop: spacing.md,
},
startStudyButton: {
  backgroundColor: colors.primary,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xl,
  borderRadius: borderRadius.lg || 10,
  marginTop: spacing.xl,
  alignSelf: 'center',
},
startStudyText: {
  color: colors.text.inverse,
  fontSize: typography.sizes.lg,
  fontWeight: 'bold',
},
timerContainer: {
  backgroundColor: colors.background.secondary,
  padding: spacing.md,
  borderRadius: borderRadius.md || 10,
  width: '40%',
  height: 80,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: spacing.xl,
  borderWidth: 1, // Add border
  borderColor: colors.border.light, // Add border color
  shadowColor: '#00FFFF', // Electric blue shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 14,
    elevation: 8,
},
timerText: {
  fontSize: typography.sizes.xl,
  fontWeight: 'bold',
  color: colors.primary,
},
});
