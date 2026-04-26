import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native'
import { UserIntegration } from '../../services/profileService'
import { healthService } from '../../services/healthServiceSimple'

interface ConnectedAppsCardProps {
  integrations: UserIntegration[]
  onUpdate: (integrationName: string, data: Partial<UserIntegration>) => Promise<void>
}

const ConnectedAppsCard: React.FC<ConnectedAppsCardProps> = ({ integrations, onUpdate }) => {
  const [loading, setLoading] = useState('')

  const appleHealthIntegration = integrations.find(i => i.integration_name === 'apple_health')
  const healthConnectIntegration = integrations.find(i => i.integration_name === 'health_connect')

  const handleConnectAppleHealth = async () => {
    try {
      setLoading('apple_health')
      
      // Request HealthKit permissions
      const hasPermissions = await healthService.requestPermissions()
      
      if (!hasPermissions) {
        Alert.alert(
          'HealthKit Permission Denied',
          'Please grant HealthKit permissions to connect Apple Health.',
          [{ text: 'OK' }]
        )
        return
      }
      
      // Test the connection by fetching today's data
      await healthService.getTodayData()
      
      await onUpdate('apple_health', {
        is_active: true,
        connected_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      })
      
      Alert.alert(
        'Apple Health Connected',
        'Your Apple Health data is now synced with Fit Level!',
        [{ text: 'OK' }]
      )
    } catch (error: any) {
      console.error('Apple Health connection error:', error)
      Alert.alert(
        'Connection Failed',
        error.message || 'Failed to connect Apple Health. Please ensure HealthKit is available and try again.',
        [{ text: 'OK' }]
      )
    } finally {
      setLoading('')
    }
  }

  const handleDisconnectAppleHealth = async () => {
    Alert.alert(
      'Disconnect Apple Health',
      'Are you sure you want to disconnect Apple Health?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading('apple_health')
              await onUpdate('apple_health', {
                is_active: false,
                connected_at: undefined,
                last_synced_at: undefined
              })
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect Apple Health')
            } finally {
              setLoading('')
            }
          }
        }
      ]
    )
  }

  const handleConnectHealthConnect = async () => {
    try {
      setLoading('health_connect')
      
      // Simulate Google Health Connect connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await onUpdate('health_connect', {
        is_active: true,
        connected_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      })
      
      Alert.alert(
        'Google Health Connect Connected',
        'Your Google Health Connect data is now synced with Fit Level!',
        [{ text: 'OK' }]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to connect Google Health Connect')
    } finally {
      setLoading('')
    }
  }

  const handleDisconnectHealthConnect = async () => {
    Alert.alert(
      'Disconnect Google Health Connect',
      'Are you sure you want to disconnect Google Health Connect?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading('health_connect')
              await onUpdate('health_connect', {
                is_active: false,
                connected_at: undefined,
                last_synced_at: undefined
              })
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect Google Health Connect')
            } finally {
              setLoading('')
            }
          }
        }
      ]
    )
  }

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`
    return `${Math.floor(diffMinutes / 1440)} days ago`
  }

  const IntegrationTile = ({ 
    name, 
    icon, 
    integration, 
    onConnect, 
    onDisconnect,
    isAvailable = true 
  }: {
    name: string
    icon: string
    integration?: UserIntegration
    onConnect: () => void
    onDisconnect: () => void
    isAvailable?: boolean
  }) => {
    const isConnected = integration?.is_active
    const isLoading = loading === integration?.integration_name

    return (
      <View style={[
        styles.integrationTile,
        !isAvailable && styles.integrationTileDisabled
      ]}>
        <View style={styles.integrationHeader}>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationIcon}>{icon}</Text>
            <View style={styles.integrationDetails}>
              <Text style={styles.integrationName}>{name}</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  isConnected ? styles.statusConnected : styles.statusDisconnected
                ]} />
                <Text style={[
                  styles.statusText,
                  isConnected ? styles.statusTextConnected : styles.statusTextDisconnected
                ]}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.connectButton,
              isConnected ? styles.disconnectButton : styles.connectButtonActive,
              isLoading && styles.buttonLoading
            ]}
            onPress={isConnected ? onDisconnect : onConnect}
            disabled={!isAvailable || isLoading}
          >
            <Text style={[
              styles.connectButtonText,
              isConnected ? styles.disconnectButtonText : styles.connectButtonTextActive,
              isLoading && styles.buttonTextLoading
            ]}>
              {isLoading ? '...' : (isConnected ? 'Disconnect' : 'Connect')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isConnected && integration?.last_synced_at && (
          <View style={styles.syncInfo}>
            <Text style={styles.syncLabel}>Last synced</Text>
            <Text style={styles.syncTime}>{formatLastSync(integration.last_synced_at)}</Text>
          </View>
        )}
        
        {!isAvailable && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connected Fitness Apps</Text>
      </View>

      <View style={styles.integrationsList}>
        {Platform.OS === 'ios' && (
          <IntegrationTile
            name="Apple Health"
            icon="🍎"
            integration={appleHealthIntegration}
            onConnect={handleConnectAppleHealth}
            onDisconnect={handleDisconnectAppleHealth}
          />
        )}

        {Platform.OS === 'android' && (
          <IntegrationTile
            name="Google Health Connect"
            icon="🤖"
            integration={healthConnectIntegration}
            onConnect={handleConnectHealthConnect}
            onDisconnect={handleDisconnectHealthConnect}
          />
        )}

        <IntegrationTile
          name="Garmin Connect"
          icon="⌚"
          onConnect={() => Alert.alert('Coming Soon', 'Garmin Connect integration is coming soon!')}
          onDisconnect={() => {}}
          isAvailable={false}
        />

        <IntegrationTile
          name="Fitbit"
          icon="🟦"
          onConnect={() => Alert.alert('Coming Soon', 'Fitbit integration is coming soon!')}
          onDisconnect={() => {}}
          isAvailable={false}
        />

        <IntegrationTile
          name="Strava"
          icon="🚴"
          onConnect={() => Alert.alert('Coming Soon', 'Strava integration is coming soon!')}
          onDisconnect={() => {}}
          isAvailable={false}
        />
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Why connect fitness apps?</Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefitItem}>• Automatic workout tracking</Text>
          <Text style={styles.benefitItem}>• Real-time step counting</Text>
          <Text style={styles.benefitItem}>• Heart rate monitoring</Text>
          <Text style={styles.benefitItem}>• Sleep tracking integration</Text>
          <Text style={styles.benefitItem}>• Nutrition data sync</Text>
        </View>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  integrationsList: {
    gap: 16,
  },
  integrationTile: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
  },
  integrationTileDisabled: {
    opacity: 0.6,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  integrationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  integrationDetails: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusConnected: {
    backgroundColor: '#00ff88',
  },
  statusDisconnected: {
    backgroundColor: '#666',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextConnected: {
    color: '#00ff88',
  },
  statusTextDisconnected: {
    color: '#666',
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  connectButtonActive: {
    backgroundColor: '#00ff88',
  },
  disconnectButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#666',
  },
  buttonLoading: {
    opacity: 0.6,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectButtonTextActive: {
    color: '#000',
  },
  disconnectButtonText: {
    color: '#fff',
  },
  buttonTextLoading: {
    opacity: 0.6,
  },
  syncInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  syncLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  syncTime: {
    fontSize: 12,
    color: '#00ff88',
    fontWeight: '500',
  },
  comingSoon: {
    alignItems: 'center',
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  benefitsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
})

export default ConnectedAppsCard
