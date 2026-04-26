import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Switch, Platform, Modal } from 'react-native'
import { UserMetrics } from '../../services/profileService'
import DateTimePicker from '@react-native-community/datetimepicker'

interface BodyMetricsCardProps {
  metrics: UserMetrics | null
  onUpdate: (data: Partial<UserMetrics>) => Promise<void>
}

const BodyMetricsCard: React.FC<BodyMetricsCardProps> = ({ metrics, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isMetric, setIsMetric] = useState(true)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerDate, setDatePickerDate] = useState(new Date())

  // Initialize form values when metrics data changes
  React.useEffect(() => {
    if (metrics) {
      setWeight(metrics.weight_kg ? (isMetric ? metrics.weight_kg : metrics.weight_kg * 2.20462).toFixed(1) : '')
      setHeight(metrics.height_cm ? (isMetric ? metrics.height_cm : metrics.height_cm * 0.393701).toFixed(1) : '')
      setBodyFat(metrics.body_fat_pct?.toFixed(1) || '')
      setDateOfBirth(metrics.date_of_birth || '')
      setGender(metrics.gender || '')
    }
  }, [metrics, isMetric])

  const handleSave = async () => {
    try {
      const weightKg = isMetric ? parseFloat(weight) : parseFloat(weight) / 2.20462
      const heightCm = isMetric ? parseFloat(height) : parseFloat(height) / 0.393701

      await onUpdate({
        weight_kg: weightKg || undefined,
        height_cm: heightCm || undefined,
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : undefined,
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined
      })
      setIsEditing(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to update metrics')
    }
  }

  const handleCancel = () => {
    // Reset to original values
    if (metrics) {
      setWeight(metrics.weight_kg ? (isMetric ? metrics.weight_kg : metrics.weight_kg * 2.20462).toFixed(1) : '')
      setHeight(metrics.height_cm ? (isMetric ? metrics.height_cm : metrics.height_cm * 0.393701).toFixed(1) : '')
      setBodyFat(metrics.body_fat_pct?.toFixed(1) || '')
      setDateOfBirth(metrics.date_of_birth || '')
      setGender(metrics.gender || '')
    } else {
      setWeight('')
      setHeight('')
      setBodyFat('')
      setDateOfBirth('')
      setGender('')
    }
    setIsEditing(false)
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setDateOfBirth(formattedDate)
      setDatePickerDate(selectedDate)
    }
  }

  const showDatePickerModal = () => {
    if (dateOfBirth) {
      setDatePickerDate(new Date(dateOfBirth))
    } else {
      setDatePickerDate(new Date())
    }
    setShowDatePicker(true)
  }

  const toggleUnit = () => {
    const newIsMetric = !isMetric
    setIsMetric(newIsMetric)
    
    // Convert current values
    if (weight) {
      const weightKg = newIsMetric ? parseFloat(weight) / 2.20462 : parseFloat(weight) * 2.20462
      setWeight(weightKg.toFixed(1))
    }
    if (height) {
      const heightCm = newIsMetric ? parseFloat(height) / 0.393701 : parseFloat(height) * 0.393701
      setHeight(heightCm.toFixed(1))
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const MetricInput = ({ 
    label, 
    value, 
    setValue, 
    placeholder, 
    unit, 
    keyboardType = 'numeric' 
  }: {
    label: string
    value: string
    setValue: (value: string) => void
    placeholder: string
    unit: string
    keyboardType?: 'numeric' | 'decimal-pad'
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#888"
          keyboardType={keyboardType}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Body Metrics</Text>
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
        <View style={styles.metricsDisplay}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Current Weight</Text>
            <Text style={styles.metricValue}>
              {metrics?.weight_kg ? `${metrics.weight_kg.toFixed(1)} kg` : 'Not set'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Height</Text>
            <Text style={styles.metricValue}>
              {metrics?.height_cm ? `${metrics.height_cm.toFixed(1)} cm` : 'Not set'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Age</Text>
            <Text style={styles.metricValue}>
              {metrics?.date_of_birth ? formatDate(metrics.date_of_birth) : 'Not set'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Gender</Text>
            <Text style={styles.metricValue}>
              {metrics?.gender || 'Not set'}
            </Text>
          </View>
          {metrics?.body_fat_pct && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Body Fat %</Text>
              <Text style={styles.metricValue}>
                {metrics.body_fat_pct.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.editForm}>
          <View style={styles.unitToggle}>
            <Text style={styles.unitLabel}>Units</Text>
            <TouchableOpacity 
              style={styles.unitButton}
              onPress={toggleUnit}
            >
              <Text style={styles.unitButtonText}>
                {isMetric ? 'Metric (kg, cm)' : 'Imperial (lbs, ft)'}
              </Text>
            </TouchableOpacity>
          </View>

          <MetricInput
            label="Current Weight"
            value={weight}
            setValue={setWeight}
            placeholder="Enter weight"
            unit={isMetric ? 'kg' : 'lbs'}
            keyboardType="decimal-pad"
          />

          <MetricInput
            label="Height"
            value={height}
            setValue={setHeight}
            placeholder="Enter height"
            unit={isMetric ? 'cm' : 'in'}
            keyboardType="decimal-pad"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={showDatePickerModal}
            >
              <Text style={styles.datePickerText}>
                {dateOfBirth ? formatDate(dateOfBirth) : 'Select Date of Birth'}
              </Text>
              <Text style={styles.datePickerIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderOptions}>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    gender === option && styles.genderOptionSelected
                  ]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    gender === option && styles.genderOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <MetricInput
            label="Body Fat % (Optional)"
            value={bodyFat}
            setValue={setBodyFat}
            placeholder="Enter body fat percentage"
            unit="%"
            keyboardType="decimal-pad"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
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
  metricsDisplay: {
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  metricLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  editForm: {
    gap: 16,
  },
  unitToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  unitButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitButtonText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  unit: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  genderOptionSelected: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#ccc',
  },
  genderOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00ff88',
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  datePickerIcon: {
    fontSize: 18,
    color: '#00ff88',
  },
})

export default BodyMetricsCard
