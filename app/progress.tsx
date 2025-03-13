import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, layout, borderRadius } from './theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BAR_WIDTH = 32;
const BAR_GAP = 8;
const MAX_BAR_HEIGHT = 150;

interface StudyStreak {
  date: string;
  minutes_studied: number;
}

export default function ProgressScreen() {
  const [streakData, setStreakData] = useState<StudyStreak[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const storedStreaks = await AsyncStorage.getItem('studyStreaks');
      const data: StudyStreak[] = storedStreaks ? JSON.parse(storedStreaks) : [];

      // Sort data by date
      const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Get the last 7 days including today
      const today = new Date();
      const last7Days: StudyStreak[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // Find the data for the current date
        const dataForDate = sortedData.find(d => d.date === dateString);

        // If data exists, add it, otherwise add a zeroed entry
        if (dataForDate) {
          last7Days.push(dataForDate);
        } else {
          last7Days.push({ date: dateString, minutes_studied: 0 });
        }
      }

      setStreakData(last7Days);

      // Calculate current streak
      let streak = 0;
      const sortedDates = data
        .map(d => d.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);

        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          streak++;
        } else {
          break;
        }
      }

      setCurrentStreak(streak);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  // Function to get the best day
  const getBestDay = () => {
    if (streakData.length === 0) return 'No data';
    const bestDay = streakData.reduce((prev, current) => (prev.minutes_studied > current.minutes_studied) ? prev : current);
    return new Date(bestDay.date).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={colors.background.gradient} style={StyleSheet.absoluteFill} />

      {/* Title at the top-left */}
      <Text style={styles.pageTitle}>Progress</Text>

      <View style={styles.content}>
        <View style={[styles.streakCard, layout.glowEffect]}>
          <LinearGradient colors={[colors.background.card, colors.background.secondary]} style={StyleSheet.absoluteFill} />
          <View style={styles.streakContent}>
            <MaterialIcons name="local-fire-department" size={48} color={colors.warning} />
            <View>
              <Text style={styles.streakText}>
                You've studied for {currentStreak} {currentStreak === 1 ? 'day' : 'days'} in a row!
              </Text>
              <Text style={styles.streakSubtext}>Keep up the great work!</Text>
            </View>
          </View>
        </View>

        <View style={[styles.chartCard, layout.glowEffect]}>
          <LinearGradient colors={[colors.background.card, colors.background.secondary]} style={StyleSheet.absoluteFill} />
          <Text style={styles.cardTitle}>Study Duration Trends</Text>
          <View style={styles.chart}>
            {streakData.map((day) => {
              const maxMinutes = Math.max(...streakData.map(d => d.minutes_studied), 60);
              const height = (day.minutes_studied / maxMinutes) * MAX_BAR_HEIGHT;
              return (
                <View key={day.date} style={styles.barWrapper}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.bar, { height }]} />
                  <Text style={styles.barLabel}>
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                  <Text style={styles.barValue}>
  {day.minutes_studied >= 60
    ? `${Math.floor(day.minutes_studied / 60)}h ${day.minutes_studied % 60}m`
    : `${day.minutes_studied}m`}
</Text>

                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.statsCard, layout.glowEffect]}>
          <LinearGradient colors={[colors.background.card, colors.background.secondary]} style={StyleSheet.absoluteFill} />
          <Text style={styles.cardTitle}>Study Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
            <Text style={styles.statValue}>
  {(() => {
    const total = streakData.reduce((sum, day) => sum + day.minutes_studied, 0);
    return total >= 60
      ? `${Math.floor(total / 60)}h ${total % 60}m`
      : `${total}m`;
  })()}
</Text>

              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statItem}>
            <Text style={styles.statValue}>
  {(() => {
    const avg = Math.round(
      streakData.reduce((sum, day) => sum + day.minutes_studied, 0) /
      (streakData.length || 1)
    );
    return avg >= 60
      ? `${Math.floor(avg / 60)}h ${avg % 60}m`
      : `${avg}m`;
  })()}
</Text>

              <Text style={styles.statLabel}>Daily Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {getBestDay()}
              </Text>
              <Text style={styles.statLabel}>Best Day</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  pageTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg, // Moves title down slightly
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl, // Pushes cards further down
  },
  streakCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  streakSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  chartCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: MAX_BAR_HEIGHT + 55,
  },
  barWrapper: {
    alignItems: 'center',
    width: BAR_WIDTH,
  },
  bar: {
    width: BAR_WIDTH - BAR_GAP,
    borderRadius: borderRadius.sm,
    minHeight: 5,
  },
  barLabel: {
    fontSize: typography.sizes.md,  // Slightly smaller font
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',  // Ensure text is centered
    flexWrap: 'nowrap',   // Prevent wrapping issue
  },
  barValue: {
    fontSize: typography.sizes.md,
    color: colors.text.white, // Set to white
    marginTop: spacing.xs,
    fontWeight: 'bold',
    color: '#FFFFFF', 
  },
  statsCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
