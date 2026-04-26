import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ScrollView } from 'react-native'
import { UserProfile } from '../../services/profileService'
import * as ImagePicker from 'expo-image-picker'

interface ProfileHeaderCardProps {
  profile: UserProfile | null
  onUpdate: (data: Partial<UserProfile>) => Promise<void>
}

const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Update form state when profile data changes
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await onUpdate({
        display_name: displayName,
        bio: bio
      })
      setIsEditing(false)
    } catch (error: any) {
      console.error('Profile update error:', error)
      Alert.alert('Error', error.message || 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    setDisplayName(profile?.display_name || '')
    setBio(profile?.bio || '')
    setIsEditing(false)
  }

  const handlePhotoUpload = async () => {
    try {
      setUploadingPhoto(true)
      
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library.')
        return
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0]
        
        // Update profile with new avatar URL
        await onUpdate({
          avatar_url: asset.uri
        })
        
        Alert.alert('Success', 'Profile photo updated successfully!')
      }
    } catch (error: any) {
      console.error('Photo upload error:', error)
      Alert.alert('Error', 'Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleCameraUpload = async () => {
    try {
      setUploadingPhoto(true)
      
      // Request permission to access camera
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your camera.')
        return
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0]
        
        // Update profile with new avatar URL
        await onUpdate({
          avatar_url: asset.uri
        })
        
        Alert.alert('Success', 'Profile photo updated successfully!')
      }
    } catch (error: any) {
      console.error('Camera upload error:', error)
      Alert.alert('Error', 'Failed to take photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const getAvatarSource = () => {
    if (profile?.avatar_url) {
      return { uri: profile.avatar_url }
    }
    return undefined
  }

  const getInitials = () => {
    const name = displayName || profile?.display_name || 'User'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {getAvatarSource() ? (
            <Image source={getAvatarSource()} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <TouchableOpacity 
          style={styles.cameraButton}
          onPress={() => {
            Alert.alert(
              'Update Profile Photo',
              'Choose how you want to update your profile photo',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Take Photo', 
                  onPress: handleCameraUpload,
                  style: 'default'
                },
                { 
                  text: 'Choose from Library', 
                  onPress: handlePhotoUpload,
                  style: 'default'
                }
              ]
            )
          }}
          disabled={uploadingPhoto}
        >
          <Text style={styles.cameraIcon}>
            {uploadingPhoto ? '⏳' : '📷'}
          </Text>
        </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.displayNameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                placeholderTextColor="#888"
                maxLength={50}
              />
              <TextInput
                style={[styles.bioInput, styles.bioTextarea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#888"
                multiline
                maxLength={150}
                textAlignVertical="top"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayContainer}>
              <Text style={styles.displayName}>
                {displayName || profile?.display_name || 'Anonymous User'}
              </Text>
              <Text style={styles.username}>
                @{profile?.username || 'user_' + (profile?.id?.slice(0, 8) || 'unknown')}
              </Text>
              {bio && (
                <Text style={styles.bioText} numberOfLines={3}>
                  {bio}
                </Text>
              )}
              <View style={styles.memberSince}>
                <Text style={styles.memberSinceText}>
                  Member since {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Recently'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {isEditing && (
        <View style={styles.editingTips}>
          <Text style={styles.tipsText}>
            💡 Display name and bio help others know you better
          </Text>
        </View>
      )}
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  cameraIcon: {
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  displayContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  memberSince: {
    marginTop: 'auto',
  },
  memberSinceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  editContainer: {
    flex: 1,
  },
  displayNameInput: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  bioInput: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
  },
  bioTextarea: {
    height: 80,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00ff88',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editingTips: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tipsText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
})

export default ProfileHeaderCard
