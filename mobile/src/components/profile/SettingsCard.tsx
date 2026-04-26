import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native'
import { UserPreferences } from '../../services/profileService'

interface SettingsCardProps {
  preferences: UserPreferences | null
  onUpdate: (data: Partial<UserPreferences>) => Promise<void>
}

const SETTINGS_OPTIONS = [
  {
    id: 'unit_system',
    label: 'Unit System',
    description: 'Choose between metric and imperial units',
    type: 'toggle',
    options: ['metric', 'imperial'],
    labels: ['Metric (kg, cm)', 'Imperial (lbs, ft)']
  },
  {
    id: 'theme',
    label: 'Theme',
    description: 'Choose your preferred app theme',
    type: 'toggle',
    options: ['system', 'light', 'dark'],
    labels: ['System', 'Light', 'Dark']
  },
  {
    id: 'language',
    label: 'Language',
    description: 'Select your preferred language',
    type: 'select',
    options: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
    labels: ['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', '日本語', '한국어', '中文']
  },
  {
    id: 'auto_sync',
    label: 'Auto Sync',
    description: 'Automatically sync data with connected apps',
    type: 'switch',
    defaultValue: true
  },
  {
    id: 'analytics',
    label: 'Analytics & Insights',
    description: 'Help improve the app with usage data',
    type: 'switch',
    defaultValue: false
  },
  {
    id: 'crash_reporting',
    label: 'Crash Reporting',
    description: 'Automatically report crashes to help fix bugs',
    type: 'switch',
    defaultValue: true
  },
  {
    id: 'beta_features',
    label: 'Beta Features',
    description: 'Get early access to new features',
    type: 'switch',
    defaultValue: false
  }
]

const SettingsCard: React.FC<SettingsCardProps> = ({ preferences, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [currentSettings, setCurrentSettings] = useState({
    unit_system: preferences?.unit_system || 'metric',
    theme: preferences?.theme || 'system',
    language: preferences?.language || 'en',
    auto_sync: true,
    analytics: false,
    crash_reporting: true,
    beta_features: false
  })

  const handleSave = async () => {
    try {
      await onUpdate(currentSettings)
      setIsEditing(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings')
    }
  }

  const handleCancel = () => {
    setCurrentSettings({
      unit_system: preferences?.unit_system || 'metric',
      theme: preferences?.theme || 'system',
      language: preferences?.language || 'en',
      auto_sync: true,
      analytics: false,
      crash_reporting: true,
      beta_features: false
    })
    setIsEditing(false)
  }

  const updateSetting = (key: string, value: any) => {
    setCurrentSettings(prev => ({
      ...prev,
      [key]: value
    } as any))
  }

  const renderSettingControl = (setting: any) => {
    const currentValue = currentSettings[setting.id as keyof typeof currentSettings]

    switch (setting.type) {
      case 'toggle':
        if (setting.options.length === 2) {
          // Simple toggle for unit system
          return (
            <View style={styles.toggleOptions}>
              {setting.options.map((option: string, index: number) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.toggleOption,
                    currentValue === option && styles.toggleOptionSelected
                  ]}
                  onPress={() => updateSetting(setting.id, option)}
                >
                  <Text style={[
                    styles.toggleOptionText,
                    currentValue === option && styles.toggleOptionTextSelected
                  ]}>
                    {setting.labels[index]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        } else {
          // Multi-option toggle for theme
          return (
            <View style={styles.multiToggleContainer}>
              {setting.options.map((option: string, index: number) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.multiToggleOption,
                    currentValue === option && styles.multiToggleOptionSelected
                  ]}
                  onPress={() => updateSetting(setting.id, option)}
                >
                  <Text style={[
                    styles.multiToggleOptionText,
                    currentValue === option && styles.multiToggleOptionTextSelected
                  ]}>
                    {setting.labels[index]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        }
      case 'select':
        return (
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                Alert.alert(
                  'Select Language',
                  'Choose your preferred language',
                  setting.options.map((option: string, index: number) => ({
                    text: setting.labels[index],
                    onPress: () => updateSetting(setting.id, option)
                  }))
                )
              }}
            >
              <Text style={styles.selectButtonText}>
                {setting.labels[setting.options.indexOf(currentValue)]}
              </Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        )
      case 'switch':
        return (
          <Switch
            value={currentValue as boolean}
            onValueChange={(value) => updateSetting(setting.id, value)}
            trackColor={{ false: '#333', true: '#00ff88' }}
            thumbColor={currentValue ? '#000' : '#888'}
          />
        )
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preferences</Text>
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
        <View style={styles.settingsDisplay}>
          {SETTINGS_OPTIONS.map((setting) => {
            const currentValue = currentSettings[setting.id as keyof typeof currentSettings]
            let displayValue = ''

            if (setting.type === 'toggle') {
              const index = setting.options?.indexOf(currentValue as string) ?? -1
              displayValue = setting.labels?.[index] || String(currentValue)
            } else if (setting.type === 'switch') {
              displayValue = currentValue ? 'Enabled' : 'Disabled'
            } else if (setting.type === 'select') {
              const index = setting.options?.indexOf(currentValue as string) ?? -1
              displayValue = setting.labels?.[index] || String(currentValue)
            }

            return (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <View style={styles.settingValue}>
                  <Text style={styles.valueText}>{displayValue}</Text>
                </View>
              </View>
            )
          })}
        </View>
      ) : (
        <View style={styles.editForm}>
          <Text style={styles.editTitle}>Customize Your Experience</Text>
          <Text style={styles.editDescription}>
            Adjust these settings to personalize your app experience
          </Text>

          {SETTINGS_OPTIONS.map((setting) => (
            <View key={setting.id} style={styles.settingEdit}>
              <View style={styles.settingEditContent}>
                <Text style={styles.settingEditLabel}>{setting.label}</Text>
                <Text style={styles.settingEditDescription}>{setting.description}</Text>
              </View>
              <View style={styles.settingControl}>
                {renderSettingControl(setting)}
              </View>
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ About Settings</Text>
        <Text style={styles.infoText}>• Unit system affects weight and height displays</Text>
        <Text style={styles.infoText}>• Theme changes the app's appearance</Text>
        <Text style={styles.infoText}>• Language preference affects app text</Text>
        <Text style={styles.infoText}>• Some settings require app restart to take effect</Text>
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
  settingsDisplay: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#888',
  },
  settingValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 14,
    color: '#00ff88',
    fontWeight: '500',
  },
  editForm: {
    gap: 20,
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
    marginBottom: 16,
  },
  settingEdit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingEditContent: {
    flex: 1,
    marginRight: 16,
  },
  settingEditLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingEditDescription: {
    fontSize: 12,
    color: '#888',
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  toggleOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleOption: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleOptionSelected: {
    backgroundColor: '#00ff88',
  },
  toggleOptionText: {
    fontSize: 12,
    color: '#ccc',
  },
  toggleOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  multiToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  multiToggleOption: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  multiToggleOptionSelected: {
    backgroundColor: '#00ff88',
  },
  multiToggleOptionText: {
    fontSize: 12,
    color: '#ccc',
  },
  multiToggleOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  selectContainer: {
    minWidth: 120,
  },
  selectButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  selectArrow: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  infoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00ff88',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    lineHeight: 16,
  },
})

export default SettingsCard
