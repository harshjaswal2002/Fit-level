import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import XPBar from '../../components/XPBar'
import StatCard from '../../components/StatCard'
import PhaseCard from '../../components/PhaseCard'
import { RootStackParamList } from '../../types'

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>()
  const { session } = useAuth()
  const { data, loading, error, refresh } = useDashboard(session?.user?.id)

  const handleLogDataPress = () => {
    navigation.navigate('Log')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.emailText}>{session?.user?.email}</Text>
        </View>

        {/* XP Bar */}
        <XPBar 
          currentXP={data.profile?.xp || 0} 
          level={data.profile?.level || 1} 
        />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Streak"
            value={data.profile?.streak || 0}
            unit="days"
            icon="🔥"
          />
          <StatCard
            label="Level"
            value={data.profile?.level || 1}
            icon="⭐"
          />
          <StatCard
            label="Total XP"
            value={data.profile?.xp || 0}
            icon="💎"
          />
        </View>

        {/* Current Phase */}
        {data.current_phase && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Phase</Text>
            <PhaseCard
              phaseName={data.current_phase.name}
              daysCompleted={0} // We'll calculate this from logs
              totalDays={data.current_phase.duration_days}
            />
          </View>
        )}

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryContainer}>
            <StatCard
              label="Calories"
              value={data.today_summary?.calories || 0}
              unit="kcal"
              icon="🔥"
            />
            <StatCard
              label="Protein"
              value={data.today_summary?.protein || 0}
              unit="g"
              icon="🥩"
            />
            <StatCard
              label="Steps"
              value={data.today_summary?.steps || 0}
              unit=""
              icon="👟"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLogDataPress}
          >
            <Text style={styles.actionButtonText}>📝 Log Today's Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.actionButtonText}>✅ Complete Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {data.recent_weight_logs && data.recent_weight_logs.length > 0 ? (
            <View style={styles.weightHistory}>
              <Text style={styles.weightHistoryTitle}>Recent Weight Logs</Text>
              {data.recent_weight_logs.slice(0, 3).map((log, index) => (
                <View key={index} style={styles.weightLogItem}>
                  <Text style={styles.weightLogDate}>
                    {new Date(log.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.weightLogValue}>
                    {log.weight} kg
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>No recent weight logs</Text>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#888',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ff88',
  },
  weightHistory: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  weightHistoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  weightLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  weightLogDate: {
    fontSize: 14,
    color: '#888',
  },
  weightLogValue: {
    fontSize: 14,
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
})

export default DashboardScreen
