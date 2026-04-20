import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAuth } from '../../hooks/useAuth'
import { RootStackParamList } from '../../types'

type LogScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Log'>

interface DailyLogData {
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
  }, [])

  const fetchTodayLog = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(
        `https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/daily_logs?user_id=eq.${session.user.id}&date=eq.${new Date().toISOString().split('T')[0]}`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U'
          }
        }
      )

      const data = await response.json()
      
      if (data.length > 0) {
        const log = data[0]
        setExistingLog(log)
        setCalories(log.calories?.toString() || '')
        setProtein(log.protein?.toString() || '')
        setSteps(log.steps?.toString() || '')
        setWorkoutDone(log.workout_done || false)
        setNotes(log.notes || '')
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
      const logData: DailyLogData = {
        date: new Date().toISOString().split('T')[0],
        calories: calories ? parseInt(calories) : undefined,
        protein: protein ? parseInt(protein) : undefined,
        steps: steps ? parseInt(steps) : undefined,
        workout_done: workoutDone,
        notes: notes || undefined,
      }

      const url = existingLog 
        ? `https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/daily_logs?id=eq.${existingLog.id}`
        : 'https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/daily_logs'

      const response = await fetch(url, {
        method: existingLog ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U',
          'Prefer': existingLog ? 'return=representation' : 'return=representation'
        },
        body: JSON.stringify(existingLog ? { ...logData, updated_at: new Date().toISOString() } : logData)
      })

      if (response.ok) {
        // Now call log_daily_data function to auto-complete tasks
        const rpcResponse = await fetch(
          'https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/rpc/log_daily_data',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U'
            },
            body: JSON.stringify({
              p_user_id: session.user.id,
              p_calories: calories ? parseInt(calories) : undefined,
              p_protein: protein ? parseInt(protein) : undefined,
              p_steps: steps ? parseInt(steps) : undefined,
              p_workout_done: workoutDone,
              p_notes: notes || undefined
            })
          }
        )

        const rpcData = await rpcResponse.json()
        
        if (rpcResponse.ok) {
          Alert.alert(
            'Success!',
            'Daily data logged successfully! Some tasks may have been auto-completed.',
            [{ text: 'OK' }]
          )
        } else {
          Alert.alert('Success!', 'Daily data logged successfully!')
        }
      } else {
        throw new Error('Failed to log data')
      }
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
          {existingLog ? 'Update today\'s log' : 'Track your progress'}
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
})

export default LogScreen
