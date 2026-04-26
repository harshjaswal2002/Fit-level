import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { profileService, ProfileData } from '../services/profileService'
import { calculateProfileCompletion } from '../utils/profileCompletion'

export interface UseProfileReturn {
  profileData: ProfileData | null
  loading: boolean
  error: string | null
  completionPercentage: number
  refresh: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  updateMetrics: (data: any) => Promise<void>
  updatePreferences: (data: any) => Promise<void>
  updateIntegration: (integrationName: string, data: any) => Promise<void>
  uploadAvatar: (fileUri: string) => Promise<string>
}

export const useProfile = (): UseProfileReturn => {
  const { session } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  const userId = session?.user?.id

  const fetchProfileData = useCallback(async () => {
    if (!userId) {
      console.log('No user ID, skipping profile fetch')
      return
    }

    try {
      console.log('Fetching profile data for user:', userId)
      setLoading(true)
      setError(null)

      const data = await profileService.getProfileData(userId)
      console.log('Profile data received:', data)
      setProfileData(data)

      // Calculate completion percentage
      const completion = calculateProfileCompletion({
        profile: data.profile,
        metrics: data.metrics,
        preferences: data.preferences,
        integrations: data.integrations
      })
      setCompletionPercentage(completion.percentage)
      console.log('Profile completion percentage:', completion.percentage)

    } catch (err: any) {
      console.error('Error fetching profile data:', err)
      setError(err.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const updateProfile = useCallback(async (data: any) => {
    if (!userId) return

    try {
      await profileService.updateProfile(userId, data)
      await fetchProfileData() // Refresh data after update
    } catch (err: any) {
      console.error('Error updating profile:', err)
      throw err
    }
  }, [userId, fetchProfileData])

  const updateMetrics = useCallback(async (data: any) => {
    if (!userId) return

    try {
      await profileService.updateMetrics(userId, data)
      await fetchProfileData() // Refresh data after update
    } catch (err: any) {
      console.error('Error updating metrics:', err)
      throw err
    }
  }, [userId, fetchProfileData])

  const updatePreferences = useCallback(async (data: any) => {
    if (!userId) return

    try {
      await profileService.updatePreferences(userId, data)
      await fetchProfileData() // Refresh data after update
    } catch (err: any) {
      console.error('Error updating preferences:', err)
      throw err
    }
  }, [userId, fetchProfileData])

  const updateIntegration = useCallback(async (integrationName: string, data: any) => {
    if (!userId) return

    try {
      await profileService.updateIntegration(userId, integrationName, data)
      await fetchProfileData() // Refresh data after update
    } catch (err: any) {
      console.error('Error updating integration:', err)
      throw err
    }
  }, [userId, fetchProfileData])

  const uploadAvatar = useCallback(async (fileUri: string): Promise<string> => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const avatarUrl = await profileService.uploadAvatar(userId, fileUri)
      await fetchProfileData() // Refresh data after upload
      return avatarUrl
    } catch (err: any) {
      console.error('Error uploading avatar:', err)
      throw err
    }
  }, [userId, fetchProfileData])

  const refresh = useCallback(async () => {
    await fetchProfileData()
  }, [fetchProfileData])

  return {
    profileData,
    loading,
    error,
    completionPercentage,
    refresh,
    updateProfile,
    updateMetrics,
    updatePreferences,
    updateIntegration,
    uploadAvatar
  }
}
