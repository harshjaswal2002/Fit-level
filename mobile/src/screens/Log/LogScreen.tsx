import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { callRPC, selectRecord, insertRecord } from '../../lib/supabaseHelpers'
import { RootStackParamList } from '../../types'

type LogScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Log'>

interface DailyLogData {
  user_id: string
  date: string
  calories?: number
  protein?: number
  steps?: number
  workout_done: boolean
  notes?: string
}

const LogScreen = () => {
  const { session } = useAuth()
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [steps, setSteps] = useState('')
  const [workoutDone, setWorkoutDone] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingLog, setExistingLog] = useState<any>(null)
  const navigation = useNavigation<LogScreenNavigationProp>()

  useEffect(() => {
    fetchTodayLog()
  }, [session?.user?.id])

  const ensureProfileExists = async (userId: string): Promise<boolean> => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const { error: insertError } = await insertRecord('profiles', {
          id: userId,
          xp: 0,
          level: 1,
          streak: 0,
        })

        if (insertError) {
          console.error('Error creating profile:', insertError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
      return false
    }
  }

  const fetchTodayLog = async () => {
    if (!session?.user?.id) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setExistingLog(data)
        setCalories((data as any).calories?.toString() || '')
        setProtein((data as any).protein?.toString() || '')
        setSteps((data as any).steps?.toString() || '')
        setWorkoutDone((data as any).workout_done || false)
        setNotes((data as any).notes || '')
      }
    } catch (error) {
      console.error('Error fetching today\'s log:', error)
    }
  }

  const handleSubmit = async () => {
    if (!calories && !protein && !steps && !workoutDone && !notes) {
      Alert.alert('Error', 'Please enter at least one field')
      return
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    setLoading(true)

    try {
      // Ensure profile exists before logging data
      const profileExists = await ensureProfileExists(session.user.id)
      if (!profileExists) {
        Alert.alert(
          'Profile Error',
          'Unable to create user profile. Please try logging out and back in.',
          [{ text: 'OK' }]
        )
        return
      }

      const logData: DailyLogData = {
        user_id: session.user.id,
        date: new Date().toISOString().split('T')[0],
        calories: calories ? parseInt(calories) : undefined,
        protein: protein ? parseInt(protein) : undefined,
        steps: steps ? parseInt(steps) : undefined,
        workout_done: workoutDone,
        notes: notes || undefined,
      }

      let { data, error } = existingLog
        ? await (supabase.from('daily_logs').update as any)(logData)
            .eq('id', existingLog.id)
            .select()
        : await (supabase.from('daily_logs').insert as any)(logData)
            .select()

      if (error) {
        // Handle table not existing error
        if (error.code === 'PGRST205') {
          Alert.alert(
            'Database Setup Required',
            'Please run schema.sql and functions.sql in your Supabase database to enable logging functionality.',
            [{ text: 'OK' }]
          )
          return
        }
        
        // Handle foreign key constraint error
        if (error.code === '23503') {
          Alert.alert(
            'Profile Error',
            'User profile not found. Please try logging out and back in to create your profile.',
            [{ text: 'OK' }]
          )
          return
        }
        
        throw error
      }

      // Now call log_daily_data function to auto-complete tasks
      const { data: rpcData, error: rpcError } = await callRPC(
        'log_daily_data',
        {
          p_user_id: session.user.id,
          p_calories: calories ? parseInt(calories) : undefined,
          p_protein: protein ? parseInt(protein) : undefined,
          p_steps: steps ? parseInt(steps) : undefined,
          p_workout_done: workoutDone,
          p_notes: notes || undefined
        }
      )

      if (rpcError) {
        // Function might not exist, but log was still saved
        console.warn('RPC function error:', rpcError)
        Alert.alert(
          'Success!',
          'Daily data logged successfully! (Task auto-completion requires database setup)',
          [{ text: 'OK' }]
        )
      } else {
        const autoCompleted = (rpcData as any)?.auto_completed_tasks || []
        const message = autoCompleted.length > 0
          ? `Daily data logged successfully! ${autoCompleted.length} task(s) auto-completed.`
          : 'Daily data logged successfully!'
        
        Alert.alert('Success!', message, [{ text: 'OK' }])
      }

      // Refresh the existing log data
      setExistingLog(data?.[0] || null)
    } catch (error) {
      Alert.alert('Error', 'Failed to log daily data')
      console.error('Log error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Log Daily Data</Text>
        <Text style={styles.subtitle}>
          {existingLog ? 'Update today\'s log' : `Track your progress for ${new Date().toLocaleDateString()}`}
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter calories"
              placeholderTextColor="#888"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter protein in grams"
              placeholderTextColor="#888"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Steps</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter steps"
              placeholderTextColor="#888"
              value={steps}
              onChangeText={setSteps}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Workout Done</Text>
              <TouchableOpacity
                style={[styles.switch, workoutDone && styles.switchActive]}
                onPress={() => setWorkoutDone(!workoutDone)}
              >
                <Text style={[styles.switchText, workoutDone && styles.switchTextActive]}>
                  {workoutDone ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about your day..."
              placeholderTextColor="#888"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>
                {existingLog ? 'Update Log' : 'Log Data'}
              </Text>
            )}
          </TouchableOpacity>
          
          {existingLog && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setCalories('')
                setProtein('')
                setSteps('')
                setWorkoutDone(false)
                setNotes('')
              }}
            >
              <Text style={styles.clearButtonText}>Clear Form</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>• 100g+ protein auto-completes "Protein Goal Met"</Text>
          <Text style={styles.tipText}>• 10k+ steps auto-completes "10k Steps Done"</Text>
          <Text style={styles.tipText}>• Workout checked auto-completes "Workout Completed"</Text>
          <Text style={styles.tipText}>• &lt;2000 calories auto-completes "Calorie Deficit"</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 50,
    height: 30,
    backgroundColor: '#333',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: '#00ff88',
  },
  switchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  switchTextActive: {
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#555',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  tipsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ff88',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    lineHeight: 20,
  },
  clearButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
})

export default LogScreen
