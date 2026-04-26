import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { insertRecord } from '../../lib/supabaseHelpers'
import StatCard from '../../components/StatCard'
import PhaseCard from '../../components/PhaseCard'
import { RootStackParamList } from '../../types'

type ProgressScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Progress'>

interface WeightLog {
  id: string
  weight: number
  date: string
}

interface Profile {
  weight?: number
  target_weight?: number
  streak: number
  phases?: {
    name: string
    duration_days: number
  }
}

const ProgressScreen = () => {
  const { session } = useAuth()
  const [weight, setWeight] = useState('')
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingWeight, setSubmittingWeight] = useState(false)
  const navigation = useNavigation<ProgressScreenNavigationProp>()

  // Calculate streak based on consecutive daily logs
  const calculateStreak = (logs: any[]): number => {
    if (!logs || logs.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Sort logs by date (most recent first)
    const sortedLogs = logs
      .map(log => ({ ...log, dateObj: new Date(log.date) }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
    
    let streak = 0
    let currentDate = new Date(today)
    
    for (const log of sortedLogs) {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      
      // Check if this log is for the current date we're checking
      if (logDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1) // Move to previous day
      } else if (logDate.getTime() < currentDate.getTime()) {
        // If the log date is before the current date we're checking, break the streak
        break
      }
      // If log date is after current date (future date), continue checking
    }
    
    return streak
  }

  useEffect(() => {
    fetchProgressData()
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

  const fetchProgressData = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      
      // Ensure profile exists before fetching data
      await ensureProfileExists(session.user.id)

      // Fetch profile with phase information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          phases (*)
        `)
        .eq('id', session.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profileData) {
        setProfile(profileData as Profile)
      }

      // Fetch weight logs
      const { data: weightData, error: weightError } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .limit(30)

      if (weightError && weightError.code !== 'PGRST205') {
        throw weightError
      }

      setWeightLogs(weightData || [])

      // Fetch daily logs for streak calculation
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .limit(365) // Get last year of logs for streak calculation

      if (dailyError && dailyError.code !== 'PGRST205') {
        throw dailyError
      }

      setDailyLogs(dailyData || [])

    } catch (error) {
      console.error('Error fetching progress data:', error)
      // Set default values to prevent infinite loading
      setProfile({
        weight: undefined,
        target_weight: undefined,
        streak: 0,
        phases: undefined
      })
      setWeightLogs([])
      setDailyLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddWeight = async () => {
    if (!weight || parseFloat(weight) <= 0) {
      Alert.alert('Error', 'Please enter a valid weight')
      return
    }

    setSubmittingWeight(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Check if weight already logged today
      const existingLog = weightLogs.find(log => log.date === today)
      
      const weightData = {
        user_id: session?.user?.id,
        weight: parseFloat(weight),
        date: today
      }

      let { data, error } = existingLog
        ? await (supabase.from('weight_logs').update as any)(weightData)
            .eq('id', existingLog.id)
            .select()
        : await (supabase.from('weight_logs').insert as any)(weightData)
            .select()

      if (error) {
        // Handle table not existing error
        if (error.code === 'PGRST205') {
          Alert.alert(
            'Database Setup Required',
            'Please run schema.sql in your Supabase database to enable weight logging.',
            [{ text: 'OK' }]
          )
          return
        }
        
        // Handle foreign key constraint error
        if (error.code === '23503') {
          Alert.alert(
            'Profile Error',
            'User profile not found. Please try logging out and back in.',
            [{ text: 'OK' }]
          )
          return
        }
        
        throw error
      }

      // Also create/update daily log for streak calculation
      const dailyLogData = {
        user_id: session?.user?.id,
        date: today,
        weight: parseFloat(weight)
      }

      const { error: dailyLogError } = await insertRecord('daily_logs', dailyLogData)

      if (dailyLogError) {
        console.error('Failed to update daily log:', dailyLogError)
        // Don't show error to user since weight logging succeeded
      }

      Alert.alert('Success', 'Weight logged successfully!')
      setWeight('')
      fetchProgressData()
    } catch (error) {
      Alert.alert('Error', 'Failed to log weight')
      console.error('Weight log error:', error)
    } finally {
      setSubmittingWeight(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Progress Tracking</Text>

        {/* Current Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Stats</Text>
          <View style={styles.statsRow}>
            <StatCard
              label="Current Weight"
              value={weightLogs.length > 0 ? weightLogs[0].weight : (profile?.weight || 0)}
              unit="kg"
              icon="⚖️"
            />
            <StatCard
              label="Target Weight"
              value={profile?.target_weight || 0}
              unit="kg"
              icon="🎯"
            />
            <StatCard
              label="Streak"
              value={calculateStreak(dailyLogs)}
              unit="days"
              icon="🔥"
            />
          </View>
        </View>

        {/* Current Phase */}
        {profile?.phases && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Phase</Text>
            <PhaseCard
              phaseName={profile.phases.name}
              daysCompleted={0} // Would need to calculate from logs
              totalDays={profile.phases.duration_days}
            />
          </View>
        )}

        {/* Add Weight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Weight</Text>
          <View style={styles.weightInputContainer}>
            <TextInput
              style={styles.weightInput}
              placeholder="Enter weight (kg)"
              placeholderTextColor="#888"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity
              style={[styles.addButton, submittingWeight && styles.addButtonDisabled]}
              onPress={handleAddWeight}
              disabled={submittingWeight}
            >
              {submittingWeight ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.addButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Weight History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight History</Text>
          {weightLogs.length === 0 ? (
            <Text style={styles.noDataText}>No weight logs yet</Text>
          ) : (
            <View style={styles.weightHistoryContainer}>
              {weightLogs.map((log) => (
                <View key={log.id} style={styles.weightLogItem}>
                  <Text style={styles.weightLogDate}>
                    {new Date(log.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.weightLogValue}>
                    {log.weight} kg
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Progress Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Summary</Text>
          <View style={styles.progressContainer}>
            {weightLogs.length > 0 && profile?.target_weight && (
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>
                  Weight to Goal: {(weightLogs[0].weight - profile.target_weight).toFixed(1)} kg
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min(100, Math.max(0, 
                          ((weightLogs[0].weight - profile.target_weight) / weightLogs[0].weight) * 100
                        ))}%` 
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
            
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>
                Total Logs: {weightLogs.length}
              </Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  weightInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  weightInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#555',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  weightHistoryContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  weightLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  weightLogDate: {
    fontSize: 14,
    color: '#888',
  },
  weightLogValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  progressContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
})

export default ProgressScreen
