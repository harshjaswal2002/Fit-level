import { UserProfile, UserMetrics, UserPreferences, UserIntegration } from '../services/profileService'

export interface ProfileCompletionItem {
  id: string
  label: string
  weight: number
  completed: boolean
  section?: string
}

export interface ProfileCompletionResult {
  percentage: number
  items: ProfileCompletionItem[]
  completedItems: number
  totalItems: number
}

export function calculateProfileCompletion({
  profile,
  metrics,
  preferences,
  integrations,
}: {
  profile: UserProfile | null
  metrics: UserMetrics | null
  preferences: UserPreferences | null
  integrations: UserIntegration[]
}): ProfileCompletionResult {
  const items: ProfileCompletionItem[] = []
  let totalScore = 0

  // Profile photo uploaded (10%)
  items.push({
    id: 'avatar',
    label: 'Profile photo uploaded',
    weight: 10,
    completed: !!profile?.avatar_url,
    section: 'header'
  })
  if (profile?.avatar_url) totalScore += 10

  // Full name set (5%)
  items.push({
    id: 'display_name',
    label: 'Full name set',
    weight: 5,
    completed: !!profile?.display_name,
    section: 'header'
  })
  if (profile?.display_name) totalScore += 5

  // Date of birth set (5%)
  items.push({
    id: 'date_of_birth',
    label: 'Date of birth set',
    weight: 5,
    completed: !!metrics?.date_of_birth,
    section: 'metrics'
  })
  if (metrics?.date_of_birth) totalScore += 5

  // Current weight entered (10%)
  items.push({
    id: 'weight',
    label: 'Current weight entered',
    weight: 10,
    completed: !!metrics?.weight_kg,
    section: 'metrics'
  })
  if (metrics?.weight_kg) totalScore += 10

  // Height entered (10%)
  items.push({
    id: 'height',
    label: 'Height entered',
    weight: 10,
    completed: !!metrics?.height_cm,
    section: 'metrics'
  })
  if (metrics?.height_cm) totalScore += 10

  // Fitness goal selected (10%)
  items.push({
    id: 'primary_goal',
    label: 'Fitness goal selected',
    weight: 10,
    completed: !!profile?.primary_goal,
    section: 'goals'
  })
  if (profile?.primary_goal) totalScore += 10

  // Workout preferences set (10%)
  items.push({
    id: 'workout_types',
    label: 'Workout preferences set',
    weight: 10,
    completed: !!(preferences?.workout_types && preferences.workout_types.length > 0),
    section: 'preferences'
  })
  if (preferences?.workout_types && preferences.workout_types.length > 0) totalScore += 10

  // Fitness app connected (15%)
  const hasActiveIntegration = integrations.some(i => i.is_active)
  items.push({
    id: 'integration',
    label: 'Fitness app connected',
    weight: 15,
    completed: hasActiveIntegration,
    section: 'integrations'
  })
  if (hasActiveIntegration) totalScore += 15

  // Weekly activity target set (10%)
  items.push({
    id: 'weekly_workout_days',
    label: 'Weekly activity target set',
    weight: 10,
    completed: !!(profile?.weekly_workout_days && profile.weekly_workout_days > 0),
    section: 'goals'
  })
  if (profile?.weekly_workout_days && profile.weekly_workout_days > 0) totalScore += 10

  // Bio/about me filled (5%)
  items.push({
    id: 'bio',
    label: 'Bio/about me filled',
    weight: 5,
    completed: !!profile?.bio,
    section: 'header'
  })
  if (profile?.bio) totalScore += 5

  // Notification preferences configured (5%)
  const hasNotifications = preferences?.notifications && 
    typeof preferences.notifications === 'object' && 
    Object.keys(preferences.notifications).length > 0
  items.push({
    id: 'notifications',
    label: 'Notification preferences configured',
    weight: 5,
    completed: !!hasNotifications,
    section: 'notifications'
  })
  if (hasNotifications) totalScore += 5

  // Measurement unit preference set (5%)
  items.push({
    id: 'unit_system',
    label: 'Measurement unit preference set',
    weight: 5,
    completed: !!preferences?.unit_system,
    section: 'settings'
  })
  if (preferences?.unit_system) totalScore += 5

  const completedItems = items.filter(item => item.completed).length

  return {
    percentage: totalScore,
    items,
    completedItems,
    totalItems: items.length
  }
}

export function getIncompleteItems(completion: ProfileCompletionResult): ProfileCompletionItem[] {
  return completion.items.filter(item => !item.completed)
}

export function getItemsBySection(completion: ProfileCompletionResult): Record<string, ProfileCompletionItem[]> {
  const sections: Record<string, ProfileCompletionItem[]> = {}
  
  completion.items.forEach(item => {
    const section = item.section || 'other'
    if (!sections[section]) {
      sections[section] = []
    }
    sections[section].push(item)
  })
  
  return sections
}

export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return '#00ff88' // Green
  if (percentage >= 60) return '#ffa500' // Orange
  if (percentage >= 40) return '#ffcc00' // Yellow
  return '#ff6b6b' // Red
}

export function getCompletionMessage(percentage: number): string {
  if (percentage >= 100) return 'Profile Complete! 🎉'
  if (percentage >= 80) return 'Almost there! Keep going!'
  if (percentage >= 60) return 'Good progress! Keep filling in your profile.'
  if (percentage >= 40) return 'Getting started! Add more details to your profile.'
  return 'Just getting started! Complete your profile to get the most out of the app.'
}
