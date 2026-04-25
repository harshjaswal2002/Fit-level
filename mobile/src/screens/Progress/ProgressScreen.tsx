import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAuth } from '../../hooks/useAuth'
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
  const [loading, setLoading] = useState(true)
  const [submittingWeight, setSubmittingWeight] = useState(false)
  const navigation = useNavigation<ProgressScreenNavigationProp>()

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    if (!session?.user?.id) return

    try {
      // Fetch profile
      const profileResponse = await fetch(
        `https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/profiles?id=eq.${session.user.id}&select=*,phases(*)`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U'
          }
        }
      )
      const profileData = await profileResponse.json()
      
      if (profileData.length > 0) {
        setProfile(profileData[0])
      }

      // Fetch weight logs - TEMPORARILY DISABLED TO TEST ERROR SOURCE
      // const weightResponse = await fetch(
      //   `https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/weight_logs?user_id=eq.${session.user.id}&select=*&order=date.desc&limit=30`,
      //   {
      //     headers: {
      //       'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U',
      //       'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U'
      //     }
      //   }
      // )
      // const weightData = await weightResponse.json()
      // setWeightLogs(weightData || [])
      setWeightLogs([]) // Temporary empty data

    } catch (error) {
      console.error('Error fetching progress data:', error)
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
      
      const url = existingLog 
        ? `https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/weight_logs?id=eq.${existingLog.id}`
        : 'https://hssbcoglkvkhuyvurcmm.supabase.co/rest/v1/weight_logs'

      const response = await fetch(url, {
        method: existingLog ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U'
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          weight: parseFloat(weight),
          date: today
        })
      })

      if (response.ok) {
        Alert.alert('Success', 'Weight logged successfully!')
        setWeight('')
        fetchProgressData()
      } else {
        throw new Error('Failed to log weight')
      }
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
              value={profile?.weight || 0}
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
              value={profile?.streak || 0}
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
            {profile?.weight && profile?.target_weight && (
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>
                  Weight to Goal: {(profile.weight - profile.target_weight).toFixed(1)} kg
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min(100, Math.max(0, 
                          ((profile.weight - profile.target_weight) / profile.weight) * 100
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
