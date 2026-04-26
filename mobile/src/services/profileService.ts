import { supabase } from '../lib/supabase'

// Types for profile data
export interface UserProfile {
  id?: string
  user_id?: string
  display_name?: string
  username?: string
  bio?: string
  avatar_url?: string
  primary_goal?: string
  weekly_workout_days?: number
  daily_step_goal?: number
  target_weight_kg?: number
  profile_completion_pct?: number
  updated_at?: string
}

export interface UserMetrics {
  id?: string
  user_id?: string
  weight_kg?: number
  height_cm?: number
  date_of_birth?: string
  gender?: string
  body_fat_pct?: number
  updated_at?: string
}

export interface UserPreferences {
  id?: string
  user_id?: string
  unit_system?: 'metric' | 'imperial'
  workout_types?: string[]
  workout_duration?: string
  workout_time?: string
  fitness_level?: string
  notifications?: Record<string, boolean>
  theme?: string
  language?: string
  updated_at?: string
}

export interface UserIntegration {
  id?: string
  user_id?: string
  integration_name: string
  connected_at?: string
  last_synced_at?: string
  is_active?: boolean
}

export interface ProfileData {
  profile: UserProfile | null
  metrics: UserMetrics | null
  preferences: UserPreferences | null
  integrations: UserIntegration[]
}

// Profile Service Class
class ProfileService {
  // Get complete profile data
  async getProfileData(userId: string): Promise<ProfileData> {
    try {
      const [profileResult, metricsResult, preferencesResult, integrationsResult] = await Promise.all([
        supabase.from('user_profile').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_metrics').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_integrations').select('*').eq('user_id', userId)
      ])

      return {
        profile: profileResult.data,
        metrics: metricsResult.data,
        preferences: preferencesResult.data,
        integrations: integrationsResult.data || []
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
      throw error
    }
  }

  // Update profile
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Use a simple approach - try insert first, then update if duplicate
      const insertData = { user_id: userId, ...data }
      
      const { data: insertResult, error: insertError } = await supabase
        .from('user_profile')
        .insert(insertData as any)
        .select()
        .single()

      if (!insertError) {
        return insertResult
      }

      // If insert failed due to duplicate, update instead
      if (insertError.code === '23505') {
        const { data: updateResult, error: updateError } = await supabase
          .from('user_profile')
          .update(data as any)
          .eq('user_id', userId)
          .select()
          .single()
        
        if (updateError) throw updateError
        return updateResult
      }

      throw insertError
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Update metrics
  async updateMetrics(userId: string, data: Partial<UserMetrics>): Promise<UserMetrics> {
    try {
      // Use upsert with proper conflict handling
      const { data: result, error } = await supabase
        .from('user_metrics')
        .upsert({ 
          user_id: userId, 
          ...data,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating metrics:', error)
      throw error
    }
  }

  // Update preferences
  async updatePreferences(userId: string, data: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const { data: result, error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: userId, 
          ...data,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }

  // Update integration
  async updateIntegration(
    userId: string, 
    integrationName: string, 
    data: Partial<UserIntegration>
  ): Promise<UserIntegration> {
    try {
      // Use a simple approach - try insert first, then update if duplicate
      const insertData = { user_id: userId, integration_name: integrationName, ...data }
      
      const { data: insertResult, error: insertError } = await supabase
        .from('user_integrations')
        .insert(insertData as any)
        .select()
        .single()

      if (!insertError) {
        return insertResult
      }

      // If insert failed due to duplicate, update instead
      if (insertError.code === '23505') {
        // @ts-ignore - TypeScript issue with Supabase update method
        const { data: updateResult, error: updateError } = await supabase
          .from('user_integrations')
          .update(data)
          .eq('user_id', userId)
          .eq('integration_name', integrationName)
          .select()
          .single()
        
        if (updateError) throw updateError
        return updateResult
      }

      throw insertError
    } catch (error) {
      console.error('Error updating integration:', error)
      throw error
    }
  }

  // Get profile completion percentage
  async getProfileCompletion(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_profile_completion', { p_user_id: userId } as any)

      if (error) throw error
      return data || 0
    } catch (error) {
      console.error('Error getting profile completion:', error)
      return 0
    }
  }

  // Upload avatar
  async uploadAvatar(userId: string, fileUri: string): Promise<string> {
    try {
      const fileExt = fileUri.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`
      
      // For React Native, we need to fetch the file first
      const response = await fetch(fileUri)
      const blob = await response.blob()
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with avatar URL
      await this.updateProfile(userId, { avatar_url: publicUrl })

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  // Delete user account
  async deleteAccount(userId: string): Promise<void> {
    try {
      // This will cascade delete all related records due to ON DELETE CASCADE
      const { error } = await supabase.auth.admin.deleteUser(userId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting account:', error)
      throw error
    }
  }

  // Get member since date
  async getMemberSince(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId)
      
      if (error) throw error
      
      return data.user?.created_at || ''
    } catch (error) {
      console.error('Error getting member since date:', error)
      return ''
    }
  }
}

export const profileService = new ProfileService()
