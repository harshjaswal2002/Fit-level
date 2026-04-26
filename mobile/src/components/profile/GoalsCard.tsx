import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native'
import { UserProfile } from '../../services/profileService'

interface GoalsCardProps {
  profile: UserProfile | null
  onUpdate: (data: Partial<UserProfile>) => Promise<void>
}

const GOALS = [
  { id: 'lose_weight', label: '🏃 Lose Weight', emoji: '🏃' },
  { id: 'build_muscle', label: '💪 Build Muscle', emoji: '💪' },
  { id: 'improve_flexibility', label: '🧘 Improve Flexibility', emoji: '🧘' },
  { id: 'improve_cardio', label: '❤️ Improve Cardio / Endurance', emoji: '❤️' },
  { id: 'maintain_weight', label: '⚖️ Maintain Weight', emoji: '⚖️' },
  { id: 'increase_strength', label: '🏋️ Increase Strength', emoji: '🏋️' },
  { id: 'general_health', label: '🧬 General Health & Wellness', emoji: '🧬' },
]

const WORKOUT_DURATIONS = [
  { id: 'under_20', label: '< 20 min' },
  { id: '20_30', label: '20–30 min' },
  { id: '30_45', label: '30–45 min' },
  { id: '45_60', label: '45–60 min' },
  { id: 'over_60', label: '60+ min' },
]

const GoalsCard: React.FC<GoalsCardProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(profile?.primary_goal || '')
  const [weeklyWorkoutDays, setWeeklyWorkoutDays] = useState(profile?.weekly_workout_days?.toString() || '3')
  const [dailyStepGoal, setDailyStepGoal] = useState(profile?.daily_step_goal?.toString() || '8000')
  const [targetWeight, setTargetWeight] = useState(profile?.target_weight_kg?.toString() || '')

  const handleSave = async () => {
    try {
      await onUpdate({
        primary_goal: selectedGoal,
        weekly_workout_days: parseInt(weeklyWorkoutDays) || 3,
        daily_step_goal: parseInt(dailyStepGoal) || 8000,
        target_weight_kg: targetWeight ? parseFloat(targetWeight) : undefined
      })
      setIsEditing(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to update goals')
    }
  }

  const handleCancel = () => {
    setSelectedGoal(profile?.primary_goal || '')
    setWeeklyWorkoutDays(profile?.weekly_workout_days?.toString() || '3')
    setDailyStepGoal(profile?.daily_step_goal?.toString() || '8000')
    setTargetWeight(profile?.target_weight_kg?.toString() || '')
    setIsEditing(false)
  }

  const showTargetWeight = selectedGoal === 'lose_weight' || selectedGoal === 'build_muscle'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Fitness Goal</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {!isEditing ? (
        <View style={styles.goalsDisplay}>
          <View style={styles.primaryGoal}>
            <Text style={styles.sectionLabel}>Primary Goal</Text>
            <View style={styles.goalDisplay}>
              <Text style={styles.goalEmoji}>
                {GOALS.find(g => g.id === profile?.primary_goal)?.emoji || '🎯'}
              </Text>
              <Text style={styles.goalText}>
                {GOALS.find(g => g.id === profile?.primary_goal)?.label || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.targets}>
            <Text style={styles.sectionLabel}>Weekly Targets</Text>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Workout Days</Text>
              <Text style={styles.targetValue}>{profile?.weekly_workout_days || 3} days/week</Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={styles.targetLabel}>Daily Steps</Text>
              <Text style={styles.targetValue}>{profile?.daily_step_goal?.toLocaleString() || '8,000'} steps</Text>
            </View>
            {profile?.target_weight_kg && (
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Target Weight</Text>
                <Text style={styles.targetValue}>{profile.target_weight_kg.toFixed(1)} kg</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Choose Your Primary Goal</Text>
            <View style={styles.goalsGrid}>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalTile,
                    selectedGoal === goal.id && styles.goalTileSelected
                  ]}
                  onPress={() => setSelectedGoal(goal.id)}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text style={[
                    styles.goalTileLabel,
                    selectedGoal === goal.id && styles.goalTileLabelSelected
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Weekly Workout Target</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setWeeklyWorkoutDays(Math.max(1, parseInt(weeklyWorkoutDays) - 1).toString())}
              >
                <Text style={styles.stepperButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepperValue}>
                <Text style={styles.stepperValueText}>{weeklyWorkoutDays}</Text>
                <Text style={styles.stepperValueLabel}>days/week</Text>
              </View>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setWeeklyWorkoutDays(Math.min(7, parseInt(weeklyWorkoutDays) + 1).toString())}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Daily Step Goal</Text>
            <TextInput
              style={styles.stepInput}
              value={dailyStepGoal}
              onChangeText={setDailyStepGoal}
              placeholder="8000"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>

          {showTargetWeight && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Target Weight (kg)</Text>
              <TextInput
                style={styles.weightInput}
                value={targetWeight}
                onChangeText={setTargetWeight}
                placeholder="Enter target weight"
                placeholderTextColor="#888"
                keyboardType="decimal-pad"
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Goals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  goalsDisplay: {
    gap: 20,
  },
  primaryGoal: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 12,
  },
  goalDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  targets: {
    gap: 12,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  targetLabel: {
    fontSize: 14,
    color: '#888',
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  editForm: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalTile: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    minHeight: 80,
  },
  goalTileSelected: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  goalTileLabel: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
  },
  goalTileLabelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  stepperValue: {
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepperValueLabel: {
    fontSize: 12,
    color: '#888',
  },
  stepInput: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  weightInput: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00ff88',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})

export default GoalsCard
