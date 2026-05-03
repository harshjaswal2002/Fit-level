import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  StatusBar
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { LinearGradient } from 'expo-linear-gradient'
import { RootStackParamList } from '../types'

// Components
import CompletionCard from '../components/profile/CompletionCard'
import ProfileHeaderCard from '../components/profile/ProfileHeaderCard'
import BodyMetricsCard from '../components/profile/BodyMetricsCard'
import GoalsCard from '../components/profile/GoalsCard'
import WorkoutPreferencesCard from '../components/profile/WorkoutPreferencesCard'
import ConnectedAppsCard from '../components/profile/ConnectedAppsCard'
import NotificationsCard from '../components/profile/NotificationsCard'
import SettingsCard from '../components/profile/SettingsCard'
import AccountCard from '../components/profile/AccountCard'
import { InviteButton } from '../components/InviteButton'

type ProfileScreenNavigationProp = StackNavigationProp<any>

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>()
  const { session } = useAuth()
  const { 
    profileData, 
    loading, 
    error, 
    completionPercentage,
    refresh,
    updateProfile,
    updateMetrics,
    updatePreferences,
    updateIntegration
  } = useProfile()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } catch (err) {
      console.error('Error refreshing profile:', err)
    } finally {
      setRefreshing(false)
    }
  }

  // Wrap update functions to trigger dashboard refresh
  const handleProfileUpdate = async (data: any) => {
    try {
      await updateProfile(data)
      // Small delay to ensure database update is processed
      setTimeout(() => {
        console.log('Profile updated, dashboard should refresh automatically')
      }, 100)
    } catch (error) {
      throw error
    }
  }

  const handleMetricsUpdate = async (data: any) => {
    try {
      await updateMetrics(data)
      // Small delay to ensure database update is processed
      setTimeout(() => {
        console.log('Metrics updated, dashboard should refresh automatically')
      }, 100)
    } catch (error) {
      throw error
    }
  }

  const handlePreferencesUpdate = async (data: any) => {
    try {
      await updatePreferences(data)
      // Small delay to ensure database update is processed
      setTimeout(() => {
        console.log('Preferences updated, dashboard should refresh automatically')
      }, 100)
    } catch (error) {
      throw error
    }
  }

  if (loading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
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
            {/* Profile Completion Card */}
            <CompletionCard 
              percentage={completionPercentage}
              profileData={profileData}
            />

            {/* Profile Header */}
            <ProfileHeaderCard 
              profile={profileData?.profile || null}
              onUpdate={handleProfileUpdate}
            />

            {/* Invite Friends */}
            <InviteButton 
              userId={session?.user?.id || ''}
              userName={profileData?.profile?.display_name || 'Friend'}
            />

            {/* Body Metrics */}
            <BodyMetricsCard 
              metrics={profileData?.metrics || null}
              onUpdate={handleMetricsUpdate}
            />

            {/* Fitness Goals */}
            <GoalsCard 
              profile={profileData?.profile || null}
              onUpdate={handleProfileUpdate}
            />

            {/* Workout Preferences */}
            <WorkoutPreferencesCard 
              preferences={profileData?.preferences || null}
              onUpdate={handlePreferencesUpdate}
            />

            {/* Connected Apps */}
            <ConnectedAppsCard 
              integrations={profileData?.integrations || []}
              onUpdate={updateIntegration}
            />

            {/* Notifications */}
            <NotificationsCard 
              preferences={profileData?.preferences || null}
              onUpdate={updatePreferences}
            />

            {/* Settings */}
            <SettingsCard 
              preferences={profileData?.preferences || null}
              onUpdate={updatePreferences}
            />

            {/* Account Management */}
            <AccountCard />
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#0f0f0f',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
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
  placeholderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
})

export default ProfileScreen
