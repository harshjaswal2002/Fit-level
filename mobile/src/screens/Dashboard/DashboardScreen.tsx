import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { callRPC } from '../../lib/supabaseHelpers'
import XPBar from '../../components/XPBar'
import StatCard from '../../components/StatCard'
import PhaseCard from '../../components/PhaseCard'
import { RootStackParamList } from '../../types'
import { LinearGradient } from 'expo-linear-gradient'

interface TodaySummary {
  calories?: number
  protein?: number
  steps?: number
  workout_done?: boolean
}

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>()
  const { session } = useAuth()
  const { data: dashboardData, loading, error, refresh } = useDashboard(session?.user?.id)
  const [refreshing, setRefreshing] = React.useState(false)
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null)
  const [localData, setLocalData] = useState<any>(null) // Local state for immediate updates
  
  const { width } = Dimensions.get('window')

  const handleLogDataPress = () => {
    navigation.navigate('Log')
  }

  const handleProfilePress = () => {
    navigation.navigate('Profile')
  }

  const fetchTodaySummary = async () => {
    if (!session?.user?.id) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_logs')
        .select('calories, protein, steps, workout_done')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setTodaySummary(data as TodaySummary | null)
    } catch (error) {
      console.error('Error fetching today summary:', error)
      setTodaySummary(null)
    }
  }

  const fetchProfileData = async () => {
    if (!session?.user?.id) return

    try {
      // Fetch from user_profile table (same as profile page)
      const { data: profileData, error } = await supabase
        .from('user_profile')
        .select('display_name, username, bio, avatar_url, primary_goal, weekly_workout_days, daily_step_goal, target_weight_kg')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const { data: metricsData, error: metricsError } = await supabase
        .from('user_metrics')
        .select('weight_kg, height_cm, date_of_birth, gender, body_fat_pct')
        .eq('user_id', session.user.id)
        .maybeSingle()

      // Fetch level/XP data from RPC function
      const { data: dashboardData, error: dashboardError } = await callRPC(
        'get_user_dashboard', 
        { p_user_id: session.user.id }
      )

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Update local state with fresh profile data
      if (profileData || metricsData || dashboardData) {
        const profileInfo = {
          display_name: (profileData as any)?.display_name || '',
          username: (profileData as any)?.username || '',
          bio: (profileData as any)?.bio || '',
          avatar_url: (profileData as any)?.avatar_url || '',
          primary_goal: (profileData as any)?.primary_goal || '',
          weekly_workout_days: (profileData as any)?.weekly_workout_days || 3,
          daily_step_goal: (profileData as any)?.daily_step_goal || 8000,
          target_weight_kg: (profileData as any)?.target_weight_kg || (metricsData as any)?.weight_kg,
          weight_kg: (metricsData as any)?.weight_kg,
          height_cm: (metricsData as any)?.height_cm,
          date_of_birth: (metricsData as any)?.date_of_birth,
          gender: (metricsData as any)?.gender,
          body_fat_pct: (metricsData as any)?.body_fat_pct,
          // Add level/XP data from RPC function
          xp: (dashboardData as any)?.profile?.xp || 0,
          level: (dashboardData as any)?.profile?.level || 1,
          streak: (dashboardData as any)?.profile?.streak || 0,
          weight: (dashboardData as any)?.profile?.weight || (metricsData as any)?.weight_kg,
          target_weight: (dashboardData as any)?.profile?.target_weight || (profileData as any)?.target_weight_kg
        }

        setLocalData((prev: any) => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            ...profileInfo
          }
        } : {
          profile: profileInfo
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    }
  }

  useEffect(() => {
    fetchTodaySummary()
    fetchProfileData()
  }, [session?.user?.id])

  // Listen for profile updates from other parts of the app
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('Profile updated, refreshing dashboard...')
      fetchProfileData()
    }

    // Add event listener for profile updates
    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_profile',
          filter: `user_id=eq.${session?.user?.id}`
        }, 
        handleProfileUpdate
      )
      .subscribe()

    // Also listen for metrics changes
    const metricsSubscription = supabase
      .channel('metrics_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_metrics',
          filter: `user_id=eq.${session?.user?.id}`
        }, 
        handleProfileUpdate
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      metricsSubscription.unsubscribe()
    }
  }, [session?.user?.id])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refresh(), fetchTodaySummary(), fetchProfileData()])
    setRefreshing(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getMotivationalQuote = () => {
    const quotes = [
      "Every workout counts!",
      "Progress over perfection",
      "You're stronger than yesterday",
      "Consistency is key",
      "One day at a time"
    ]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  // Use local data if available, otherwise use dashboard data
  const currentData = localData || dashboardData

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

  if (!currentData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00ff88" />
      }
    >
      <LinearGradient
        colors={['#1a1a1a', '#0f0f0f']}
        style={styles.gradientContainer}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>{getGreeting()}! 💪</Text>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <Text style={styles.emailText}>{session?.user?.email?.split('@')[0]}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.profileAvatar}>
                  <Image source={{ uri: currentData.profile?.avatar_url }} style={styles.profileImage} />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.motivationalText}>{getMotivationalQuote()}</Text>
          </View>

          {/* XP Progress Card */}
          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>Level Progress</Text>
              <Text style={styles.xpLevel}>Lv. {currentData.profile?.level || 1}</Text>
            </View>
            <XPBar 
              currentXP={currentData.profile?.xp || 0} 
              level={currentData.profile?.level || 1} 
            />
            <View style={styles.xpStats}>
              <View style={styles.xpStat}>
                <Text style={styles.xpStatValue}>{currentData.profile?.xp || 0}</Text>
                <Text style={styles.xpStatLabel}>Total XP</Text>
              </View>
              <View style={styles.xpStat}>
                <Text style={styles.xpStatValue}>{currentData.profile?.streak || 0}</Text>
                <Text style={styles.xpStatLabel}>Day Streak</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={handleLogDataPress}
              >
                <Text style={styles.quickActionIcon}>📝</Text>
                <Text style={styles.quickActionText}>Log Data</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={handleProfilePress}
              >
                <Text style={styles.quickActionIcon}>⚙️</Text>
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStatsContainer}>
            <StatCard
              label="Calories"
              value={todaySummary?.calories || 0}
              unit="kcal"
              icon="🔥"
            />
            <StatCard
              label="Protein"
              value={todaySummary?.protein || 0}
              unit="g"
              icon="🥩"
            />
            <StatCard
              label="Steps"
              value={todaySummary?.steps || 0}
              unit=""
              icon="🚶"
            />
          </View>
          
          {/* Today's Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Today's Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>
                  {todaySummary?.workout_done ? '✅' : '⭕'}
                </Text>
                <Text style={styles.statusText}>
                  {todaySummary?.workout_done ? 'Workout Done' : 'Workout Pending'}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusText}>
                  {session?.user?.email?.[0]?.toUpperCase()}
                </Text>
                <Text style={styles.statusText}>
                  {todaySummary ? 'Data Logged' : 'No Data Yet'}
                </Text>
              </View>
            </View>
          </View>

          {/* Current Phase */}
          {currentData.current_phase && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Phase</Text>
              <PhaseCard
                phaseName={currentData.current_phase.name}
                daysCompleted={0}
                totalDays={currentData.current_phase.duration_days}
              />
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryAction]}
                onPress={handleLogDataPress}
              >
                <Text style={styles.actionIcon}>📝</Text>
                <Text style={styles.actionButtonText}>Log Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => navigation.navigate('Tasks')}
              >
                <Text style={styles.actionIcon}>✅</Text>
                <Text style={styles.actionButtonText}>Tasks</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => navigation.navigate('Progress')}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionButtonText}>Progress</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => navigation.navigate('Rewards')}
              >
                <Text style={styles.actionIcon}>🎁</Text>
                <Text style={styles.actionButtonText}>Rewards</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {currentData.recent_weight_logs && currentData.recent_weight_logs.length > 0 ? (
                <View>
                  <Text style={styles.activityTitle}>Weight Progress</Text>
                  {currentData.recent_weight_logs.slice(0, 3).map((log: any, index: number) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityLeft}>
                        <Text style={styles.activityIcon}>⚖️</Text>
                        <Text style={styles.activityDate}>
                          {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={styles.activityValue}>{log.weight} kg</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyActivity}>
                  <Text style={styles.emptyActivityIcon}>📈</Text>
                  <Text style={styles.emptyActivityText}>Start logging your weight to see progress</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  gradientContainer: {
    flex: 1,
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
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#888',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  motivationalText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  xpCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  xpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ff88',
  },
  xpStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  xpStat: {
    alignItems: 'center',
  },
  xpStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  xpStatLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: 8,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    width: '48%',
  },
  primaryAction: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
    width: '100%',
  },
  secondaryAction: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityDate: {
    fontSize: 14,
    color: '#888',
  },
  activityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 24,
  },
  emptyActivityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
})

export default DashboardScreen
