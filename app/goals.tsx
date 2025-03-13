import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Switch,
  Platform,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, layout, borderRadius } from './theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Goal {
  id: string;
  title: string;
  targetDate: string;
  targetTime: string;
  completed: boolean;
  reminderEnabled: boolean;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [newGoal, setNewGoal] = useState({
    title: '',
    targetDate: new Date().toISOString().split('T')[0],
    targetTime: '09:00 AM',
    completed: false,
    reminderEnabled: false,
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const storedGoals = await AsyncStorage.getItem('studyGoals');
      setGoals(storedGoals ? JSON.parse(storedGoals) : []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      setGoals(updatedGoals);
      await AsyncStorage.setItem('studyGoals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const scheduleReminder = async (goal: Goal) => {
    if (!goal.reminderEnabled || Platform.OS === 'web') return;
  
    const now = new Date();
    console.log('Current Time:', now.toLocaleString());
  
    // Fix: Ensure proper regex parsing for time
    const match = goal.targetTime.match(/(\d+):(\d+) (AM|PM)/);
    if (!match) {
      console.log('Error: Time format is incorrect.');
      return; // Prevent errors if time format is incorrect
    }
  
    const [_, hours, minutes, period] = match;
    let reminderDate = new Date(goal.targetDate);
    console.log('Target Date (Before Time Adjustment):', reminderDate.toLocaleString());
  
    let hourInt = parseInt(hours, 10);
  
    if (period === 'PM' && hourInt !== 12) hourInt += 12;
    if (period === 'AM' && hourInt === 12) hourInt = 0;
  
    reminderDate.setHours(hourInt, parseInt(minutes, 10), 0, 0);
    console.log('Reminder Time (After Time Adjustment):', reminderDate.toLocaleString());
  
    // Convert `now` and `reminderDate` to UTC timestamps for accurate comparison
    const nowUtc = now.getTime();
    const reminderUtc = reminderDate.getTime();
  
    console.log('Now UTC:', nowUtc);
    console.log('Reminder UTC:', reminderUtc);
  
    // 🚀 Fix: Ensure we only schedule future notifications
    if (reminderUtc > nowUtc) {
      const delaySeconds = Math.floor((reminderUtc - nowUtc) / 1000);
      console.log('Delay Seconds:', delaySeconds);
  
      if (delaySeconds > 0) {
        try {
          await Notifications.scheduleNotificationAsync({
            identifier: goal.id,
            content: { title: '🎯 Goal Reminder', body: `Time to work on: ${goal.title}` },
            trigger: { seconds: delaySeconds }, // Schedule in seconds from now
          });
          console.log('Notification scheduled successfully.');
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      } else {
        console.log('Notification cannot be scheduled for the past.');
      }
    } else {
      console.log('Reminder time is in the past.');
    }
  };
  
  
  
  
  

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;
    const goal = { id: Date.now().toString(), ...newGoal };
  
    // 🚀 Fix: Do NOT schedule the reminder immediately
    const updatedGoals = [goal, ...goals];
    await saveGoals(updatedGoals);
    setModalVisible(false);
    resetNewGoal();
  };
  

  const handleEditGoal = async () => {
    if (!editingGoal || !editingGoal.title.trim()) return;
    const updatedGoals = goals.map((goal) =>
      goal.id === editingGoal.id ? editingGoal : goal
    );
    await saveGoals(updatedGoals);
  
    // 🚀 Fix: Do NOT schedule the reminder immediately
    setEditingGoal(null);
    setModalVisible(false);
    closeActionMenu();
  };

  const checkForReminders = async () => {
    try {
      const storedGoals = await AsyncStorage.getItem('studyGoals');
      const goals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];
  
      const now = new Date().getTime(); // Get current time in milliseconds
  
      for (const goal of goals) {
        if (goal.reminderEnabled) {
          const [_, hours, minutes, period] = goal.targetTime.match(/(\d+):(\d+) (AM|PM)/) || [];
          let hourInt = parseInt(hours, 10);
          if (period === 'PM' && hourInt !== 12) hourInt += 12;
          if (period === 'AM' && hourInt === 12) hourInt = 0;
  
          const reminderDate = new Date(goal.targetDate);
          reminderDate.setHours(hourInt, parseInt(minutes, 10), 0, 0);
  
          if (reminderDate.getTime() <= now) {
            await Notifications.scheduleNotificationAsync({
              identifier: goal.id,
              content: {
                title: '🎯 Goal Reminder',
                body: `Time to work on: ${goal.title}`,
              },
              trigger: null, // 🚀 Send immediately since it's time
            });
  
            // Disable the reminder after sending (optional)
            goal.reminderEnabled = false;
            await saveGoals(goals);
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      checkForReminders();
    }, 60000); // Check every 60 seconds (1 minute)
  
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);
  
  

  const handleDeleteGoal = async (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    await saveGoals(updatedGoals);
    await Notifications.cancelScheduledNotificationAsync(id);
    closeActionMenu();
  };

  const handleToggleGoal = async (id: string) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    await saveGoals(updatedGoals);
  };

  const resetNewGoal = () => {
    setNewGoal({
      title: '',
      targetDate: new Date().toISOString().split('T')[0],
      targetTime: '09:00 AM',
      completed: false,
      reminderEnabled: false,
    });
  };

  const toggleActionMenu = (goalId: string) => {
    setSelectedGoalId(goalId);
    setActionMenuVisible(!actionMenuVisible);
    Animated.timing(fadeAnim, {
      toValue: actionMenuVisible ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeActionMenu = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setActionMenuVisible(false);
      setSelectedGoalId(null);
    });
  };

  const actionMenuStyle = {
    opacity: fadeAnim,
    transform: [
      {
        translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  return (
    <TouchableWithoutFeedback onPress={() => actionMenuVisible && closeActionMenu()}>
      <View style={styles.container}>
        <LinearGradient colors={['#151530', '#1C1C3D']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <Text style={styles.title}>Goals</Text>
        </View>

        <FlatList
          data={goals}
          renderItem={({ item }) => (
            <View style={[styles.goalCard, layout.glowEffect]}>
              <LinearGradient colors={[colors.background.card, colors.background.secondary]} style={StyleSheet.absoluteFill} />
              <View style={styles.goalHeader}>
                <TouchableOpacity onPress={() => handleToggleGoal(item.id)}>
                  <MaterialIcons
                    name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
                    size={28}
                    color={item.completed ? colors.success : colors.text.secondary}
                  />
                </TouchableOpacity>
                <Text style={[styles.statusText, item.completed ? styles.completedStatus : styles.pendingStatus]}>
                  {item.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
              <View style={styles.goalContent}>
                <Text style={[styles.goalTitle, item.completed && styles.goalTitleCompleted]}>{item.title}</Text>
                <View style={styles.goalInfoContainer}>
                  <View style={styles.goalInfo}>
                    <MaterialIcons name="event" size={16} color={colors.text.secondary} />
                    <Text style={styles.goalDate}>{item.targetDate}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <MaterialIcons name="alarm" size={16} color={colors.text.secondary} />
                    <Text style={styles.goalDate}>{item.targetTime}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.goalActionsContainer}>
                <TouchableOpacity style={styles.goalActions} onPress={() => toggleActionMenu(item.id)}>
                  <MaterialIcons name="more-vert" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {selectedGoalId === item.id && actionMenuVisible && (
                <Animated.View style={[styles.actionMenu, actionMenuStyle]}>
                  <TouchableOpacity
                    style={[styles.actionMenuItem, { paddingVertical: spacing.sm * 1.5 }]}
                    onPress={() => {
                      setEditingGoal(item);
                      setModalVisible(true);
                      closeActionMenu();
                    }}
                  >
                    <Text style={styles.actionMenuText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionMenuItem, { paddingVertical: spacing.sm * 1.5 }]}
                    onPress={() => {
                      handleDeleteGoal(item.id);
                      closeActionMenu();
                    }}
                  >
                    <Text style={[styles.actionMenuText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          )}
          keyExtractor={(item) => item.id}
        />

        <TouchableOpacity style={[styles.fab, layout.glowEffect]} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={30} color={colors.text.inverse} />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalCard, layout.glowEffect, { backgroundColor: '#1C1C3D' }]}>
              <Text style={styles.modalTitle}>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text.primary, borderRadius: borderRadius.sm }]}
                placeholder="Goal Title"
                placeholderTextColor={colors.text.secondary}
                value={editingGoal ? editingGoal.title : newGoal.title}
                onChangeText={(text) => {
                  if (editingGoal) {
                    setEditingGoal({ ...editingGoal, title: text });
                  } else {
                    setNewGoal({ ...newGoal, title: text });
                  }
                }}
              />

              <View style={styles.modalDatePicker}>
                <Text style={styles.modalLabel}>Target Date:</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.modalDateText}>
                    {editingGoal ? editingGoal.targetDate : newGoal.targetDate}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={editingGoal ? new Date(editingGoal.targetDate) : new Date(newGoal.targetDate)}
                    mode="date"
                    onChange={(event, selectedDate) => {
                      const currentDate = selectedDate || new Date();
                      setShowDatePicker(false);
                      if (editingGoal) {
                        setEditingGoal({ ...editingGoal, targetDate: currentDate.toISOString().split('T')[0] });
                      } else {
                        setNewGoal({ ...newGoal, targetDate: currentDate.toISOString().split('T')[0] });
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.modalTimePicker}>
                <Text style={styles.modalLabel}>Target Time:</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.modalDateText}>
                    {editingGoal ? editingGoal.targetTime : newGoal.targetTime}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={editingGoal ? new Date(`1970-01-01T${editingGoal.targetTime.replace(' ', 'T')}`) : new Date(`1970-01-01T${newGoal.targetTime.replace(' ', 'T')}`)}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      const currentTime = selectedTime || new Date();
                      setShowTimePicker(false);
                      const hours = currentTime.getHours();
                      const minutes = currentTime.getMinutes();
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
                      const time = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                      if (editingGoal) {
                        setEditingGoal({ ...editingGoal, targetTime: time });
                      } else {
                        setNewGoal({ ...newGoal, targetTime: time });
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.reminderContainer}>
                <Switch
                  trackColor={{ false: colors.text.secondary, true: colors.primary }}
                  thumbColor={editingGoal ? (editingGoal.reminderEnabled ? colors.text.inverse : colors.text.secondary) : newGoal.reminderEnabled ? colors.text.inverse : colors.text.secondary}
                  ios_backgroundColor={colors.text.secondary}
                  onValueChange={(value) => {
                    if (editingGoal) {
                      setEditingGoal({ ...editingGoal, reminderEnabled: value });
                    } else {
                      setNewGoal({ ...newGoal, reminderEnabled: value });
                    }
                  }}
                  value={editingGoal ? editingGoal.reminderEnabled : newGoal.reminderEnabled}
                />
                <Text style={styles.modalLabel}>Remind me</Text>
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={editingGoal ? handleEditGoal : handleAddGoal}>
                <Text style={styles.modalButtonText}>{editingGoal ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1F' },
  header: { padding: spacing.md },
  title: { fontSize: typography.sizes.xl, color: colors.text.primary },
  goalCard: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    margin: spacing.sm,
    borderRadius: borderRadius.lg,
    minHeight: 140,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#00FFFF', // Electric blue shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.8,
  shadowRadius: 10,
  elevation: 8, 
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalContent: { marginTop: spacing.sm },
  goalTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.text.primary },
  goalTitleCompleted: { textDecorationLine: 'line-through', color: colors.text.secondary },
  goalInfoContainer: { marginTop: spacing.sm },
  goalInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  goalDate: { fontSize: typography.sizes.sm, color: colors.text.primary, marginLeft: spacing.xs },
  goalActionsContainer: {
    position: 'absolute',
    right: spacing.md                         ,
    bottom: spacing.md,
  },
  goalActions: {
    padding: spacing.sm,
  },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.primary, padding: spacing.lg, borderRadius: borderRadius.round },
  statusText: { fontWeight: 'bold' },
  pendingStatus: { color: colors.warning },
  completedStatus: { color: colors.success },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalInput: {
    height: 43,
    borderColor: colors.text.secondary,
    borderWidth: 1,
    padding: spacing.xs,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  modalDatePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  modalDateText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  modalButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.inverse,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    justifyContent: 'flex-start',
  },
  actionMenu: {
    position: 'absolute',
    right: spacing.md - 5,
    bottom: spacing.md - 15,
    backgroundColor: '#F5F5DC', // Cream color
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 120,
  },
  actionMenuItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenuText: {
    fontSize: typography.sizes.md,
    color: 'black', 
  },
  
  deleteText: {
    color: colors.error,
  },
});
