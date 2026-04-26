import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { UserPreferences } from '../../services/profileService'

interface WorkoutPreferencesCardProps {
  preferences: UserPreferences | null
  onUpdate: (data: Partial<UserPreferences>) => Promise<void>
}

const WORKOUT_TYPES = [
  'Strength Training',
  'HIIT',
  'Running / Cardio',
  'Yoga',
  'Cycling',
  'Swimming',
  'Pilates',
  'CrossFit',
  'Home Workout',
  'Outdoor / Sport',
  'Martial Arts',
  'Dance',
]

const WORKOUT_DURATIONS = [
  { id: 'under_20', label: '< 20 min' },
  { id: '20_30', label: '20–30 min' },
  { id: '30_45', label: '30–45 min' },
  { id: '45_60', label: '45–60 min' },
  { id: 'over_60', label: '60+ min' },
]

const WORKOUT_TIMES = [
  { id: 'morning', label: 'Morning (5am–10am)' },
  { id: 'midday', label: 'Midday (10am–2pm)' },
  { id: 'evening', label: 'Evening (2pm–6pm)' },
  { id: 'night', label: 'Night (6pm+)' },
]

const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

const WorkoutPreferencesCard: React.FC<WorkoutPreferencesCardProps> = ({ preferences, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState<string[]>(preferences?.workout_types || [])
  const [selectedDuration, setSelectedDuration] = useState(preferences?.workout_duration || '')
  const [selectedTime, setSelectedTime] = useState(preferences?.workout_time || '')
  const [selectedLevel, setSelectedLevel] = useState(preferences?.fitness_level || '')

  const handleSave = async () => {
    try {
      await onUpdate({
        workout_types: selectedWorkoutTypes,
        workout_duration: selectedDuration,
        workout_time: selectedTime,
        fitness_level: selectedLevel
      })
      setIsEditing(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences')
    }
  }

  const handleCancel = () => {
    setSelectedWorkoutTypes(preferences?.workout_types || [])
    setSelectedDuration(preferences?.workout_duration || '')
    setSelectedTime(preferences?.workout_time || '')
    setSelectedLevel(preferences?.fitness_level || '')
    setIsEditing(false)
  }

  const toggleWorkoutType = (type: string) => {
    if (selectedWorkoutTypes.includes(type)) {
      setSelectedWorkoutTypes(selectedWorkoutTypes.filter(t => t !== type))
    } else {
      setSelectedWorkoutTypes([...selectedWorkoutTypes, type])
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Preferences</Text>
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
        <View style={styles.preferencesDisplay}>
          <View style={styles.preferenceSection}>
            <Text style={styles.sectionLabel}>Workout Types</Text>
            <View style={styles.chipContainer}>
              {selectedWorkoutTypes.length > 0 ? (
                selectedWorkoutTypes.map((type, index) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{type}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noPreferences}>No workout types selected</Text>
              )}
            </View>
          </View>

          <View style={styles.preferenceSection}>
            <Text style={styles.sectionLabel}>Preferred Duration</Text>
            <Text style={styles.preferenceValue}>
              {WORKOUT_DURATIONS.find(d => d.id === selectedDuration)?.label || 'Not set'}
            </Text>
          </View>

          <View style={styles.preferenceSection}>
            <Text style={styles.sectionLabel}>Preferred Time</Text>
            <Text style={styles.preferenceValue}>
              {WORKOUT_TIMES.find(t => t.id === selectedTime)?.label || 'Not set'}
            </Text>
          </View>

          <View style={styles.preferenceSection}>
            <Text style={styles.sectionLabel}>Fitness Level</Text>
            <Text style={styles.preferenceValue}>
              {FITNESS_LEVELS.find(l => l.id === selectedLevel)?.label || 'Not set'}
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Workout Types (Select multiple)</Text>
            <View style={styles.workoutTypesGrid}>
              {WORKOUT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.workoutTypeChip,
                    selectedWorkoutTypes.includes(type) && styles.workoutTypeChipSelected
                  ]}
                  onPress={() => toggleWorkoutType(type)}
                >
                  <Text style={[
                    styles.workoutTypeChipText,
                    selectedWorkoutTypes.includes(type) && styles.workoutTypeChipTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preferred Workout Duration</Text>
            <View style={styles.optionsGrid}>
              {WORKOUT_DURATIONS.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.optionTile,
                    selectedDuration === duration.id && styles.optionTileSelected
                  ]}
                  onPress={() => setSelectedDuration(duration.id)}
                >
                  <Text style={[
                    styles.optionTileText,
                    selectedDuration === duration.id && styles.optionTileTextSelected
                  ]}>
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preferred Workout Time</Text>
            <View style={styles.optionsGrid}>
              {WORKOUT_TIMES.map((time) => (
                <TouchableOpacity
                  key={time.id}
                  style={[
                    styles.optionTile,
                    selectedTime === time.id && styles.optionTileSelected
                  ]}
                  onPress={() => setSelectedTime(time.id)}
                >
                  <Text style={[
                    styles.optionTileText,
                    selectedTime === time.id && styles.optionTileTextSelected
                  ]}>
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fitness Level</Text>
            <View style={styles.optionsGrid}>
              {FITNESS_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionTile,
                    selectedLevel === level.id && styles.optionTileSelected
                  ]}
                  onPress={() => setSelectedLevel(level.id)}
                >
                  <Text style={[
                    styles.optionTileText,
                    selectedLevel === level.id && styles.optionTileTextSelected
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Preferences</Text>
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
  preferencesDisplay: {
    gap: 16,
  },
  preferenceSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    color: '#ccc',
  },
  noPreferences: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#fff',
  },
  editForm: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  workoutTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workoutTypeChip: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  workoutTypeChipSelected: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  workoutTypeChipText: {
    fontSize: 12,
    color: '#ccc',
  },
  workoutTypeChipTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  optionsGrid: {
    gap: 8,
  },
  optionTile: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
  },
  optionTileSelected: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  optionTileText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  optionTileTextSelected: {
    color: '#000',
    fontWeight: '600',
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

export default WorkoutPreferencesCard
