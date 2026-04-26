import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native'
import { UserPreferences } from '../../services/profileService'

interface NotificationsCardProps {
  preferences: UserPreferences | null
  onUpdate: (data: Partial<UserPreferences>) => Promise<void>
}

const NotificationsCard: React.FC<NotificationsCardProps> = ({ preferences, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    preferences?.notifications || {}
  )

  const notificationOptions = [
    { 
      id: 'workout_reminders', 
      label: 'Workout Reminders', 
      description: 'Get reminded about your scheduled workouts',
      hasTimePicker: true
    },
    { 
      id: 'weekly_progress', 
      label: 'Weekly Progress Summary', 
      description: 'Receive a summary of your weekly achievements',
      hasTimePicker: false
    },
    { 
      id: 'streak_reminders', 
      label: 'Streak Reminders', 
      description: 'Notifications to maintain your workout streak',
      hasTimePicker: false
    },
    { 
      id: 'new_challenges', 
      label: 'New Challenge Alerts', 
      description: 'Be notified when new challenges are available',
      hasTimePicker: false
    },
    { 
      id: 'app_tips', 
      label: 'App Tips & Suggestions', 
      description: 'Helpful tips to improve your fitness journey',
      hasTimePicker: false
    },
    { 
      id: 'friend_activity', 
      label: 'Friend Activity', 
      description: 'Updates when friends complete workouts',
      hasTimePicker: false
    },
    { 
      id: 'achievement_unlocked', 
      label: 'Achievement Unlocked', 
      description: 'Celebrate when you unlock new achievements',
      hasTimePicker: false
    },
  ]

  const handleSave = async () => {
    try {
      await onUpdate({
        notifications
      })
      setIsEditing(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences')
    }
  }

  const handleCancel = () => {
    setNotifications(preferences?.notifications || {})
    setIsEditing(false)
  }

  const toggleNotification = (id: string) => {
    setNotifications(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const enabledCount = Object.values(notifications).filter(Boolean).length

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {enabledCount} of {notificationOptions.length} enabled
          </Text>
        </View>
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
        <View style={styles.notificationsDisplay}>
          {notificationOptions.map((option) => {
            const isEnabled = notifications[option.id]
            return (
              <View key={option.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationLabel}>{option.label}</Text>
                  <Text style={styles.notificationDescription}>{option.description}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  isEnabled ? styles.statusEnabled : styles.statusDisabled
                ]}>
                  <Text style={[
                    styles.statusText,
                    isEnabled ? styles.statusTextEnabled : styles.statusTextDisabled
                  ]}>
                    {isEnabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      ) : (
        <View style={styles.editForm}>
          <View style={styles.editHeader}>
            <Text style={styles.editTitle}>Choose Your Notifications</Text>
            <Text style={styles.editDescription}>
              Select which notifications you'd like to receive
            </Text>
          </View>

          {notificationOptions.map((option) => {
            const isEnabled = notifications[option.id]
            return (
              <View key={option.id} style={styles.notificationToggle}>
                <View style={styles.toggleContent}>
                  <Text style={styles.toggleLabel}>{option.label}</Text>
                  <Text style={styles.toggleDescription}>{option.description}</Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={() => toggleNotification(option.id)}
                  trackColor={{ false: '#333', true: '#00ff88' }}
                  thumbColor={isEnabled ? '#000' : '#888'}
                />
              </View>
            )
          })}

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNotifications(
                Object.fromEntries(notificationOptions.map(opt => [opt.id, true]))
              )}
            >
              <Text style={styles.quickActionText}>Enable All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNotifications({})}
            >
              <Text style={styles.quickActionText}>Disable All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Notification Tips</Text>
        <Text style={styles.tipText}>• Enable workout reminders to stay consistent</Text>
        <Text style={styles.tipText}>• Weekly summaries help track your progress</Text>
        <Text style={styles.tipText}>• Too many notifications? Disable what you don't need</Text>
      </View>
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
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
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
  notificationsDisplay: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  notificationContent: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  statusEnabled: {
    backgroundColor: '#00ff88',
  },
  statusDisabled: {
    backgroundColor: '#333',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextEnabled: {
    color: '#000',
  },
  statusTextDisabled: {
    color: '#888',
  },
  editForm: {
    gap: 16,
  },
  editHeader: {
    marginBottom: 8,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 4,
  },
  editDescription: {
    fontSize: 12,
    color: '#888',
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#888',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#00ff88',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  tipsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00ff88',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    lineHeight: 16,
  },
})

export default NotificationsCard
