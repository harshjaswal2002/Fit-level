import { Platform } from 'react-native'

// Types for fitness data
export interface FitnessData {
  steps?: number
  calories?: number
  distance?: number
  activeMinutes?: number
  heartRate?: {
    resting?: number
    average?: number
    maximum?: number
  }
  weight?: number
  workouts?: WorkoutData[]
}

export interface WorkoutData {
  id: string
  type: string
  duration: number // in minutes
  calories?: number
  distance?: number
  startTime: Date
  endTime: Date
  heartRateZones?: HeartRateZone[]
}

export interface HeartRateZone {
  name: string
  min: number
  max: number
  duration: number // in minutes
}

export interface FitnessService {
  isAvailable(): boolean
  requestPermissions(): Promise<boolean>
  getTodayData(): Promise<FitnessData>
  getHistoricalData(startDate: Date, endDate: Date): Promise<FitnessData[]>
  subscribeToUpdates(callback: (data: FitnessData) => void): () => void
}

// Mock Apple Health Service (iOS)
class AppleHealthService implements FitnessService {
  private isInitialized = false

  isAvailable(): boolean {
    return Platform.OS === 'ios'
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // In a real implementation, this would use react-native-health
      // For now, we'll simulate the permission request
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate permission granted
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Apple Health permission request failed:', error)
      return false
    }
  }

  async getTodayData(): Promise<FitnessData> {
    if (!this.isInitialized) {
      throw new Error('Apple Health not initialized')
    }

    // Simulate fetching today's data
    return {
      steps: Math.floor(Math.random() * 10000) + 5000,
      calories: Math.floor(Math.random() * 500) + 1500,
      distance: Math.random() * 5 + 2,
      activeMinutes: Math.floor(Math.random() * 60) + 20,
      heartRate: {
        resting: Math.floor(Math.random() * 20) + 50,
        average: Math.floor(Math.random() * 30) + 80,
        maximum: Math.floor(Math.random() * 40) + 120
      }
    }
  }

  async getHistoricalData(startDate: Date, endDate: Date): Promise<FitnessData[]> {
    if (!this.isInitialized) {
      throw new Error('Apple Health not initialized')
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const data: FitnessData[] = []

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      data.push({
        steps: Math.floor(Math.random() * 10000) + 5000,
        calories: Math.floor(Math.random() * 500) + 1500,
        distance: Math.random() * 5 + 2,
        activeMinutes: Math.floor(Math.random() * 60) + 20,
        heartRate: {
          resting: Math.floor(Math.random() * 20) + 50,
          average: Math.floor(Math.random() * 30) + 80,
          maximum: Math.floor(Math.random() * 40) + 120
        },
        workouts: this.generateMockWorkouts(date)
      })
    }

    return data
  }

  subscribeToUpdates(callback: (data: FitnessData) => void): () => void {
    // In a real implementation, this would subscribe to Apple Health updates
    // For now, we'll simulate periodic updates
    const interval = setInterval(async () => {
      if (this.isInitialized) {
        const data = await this.getTodayData()
        callback(data)
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }

  private generateMockWorkouts(date: Date): WorkoutData[] {
    const workouts: WorkoutData[] = []
    const workoutCount = Math.random() > 0.7 ? 1 : 0

    for (let i = 0; i < workoutCount; i++) {
      const startTime = new Date(date)
      startTime.setHours(9 + i * 4, 0, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(startTime.getMinutes() + Math.floor(Math.random() * 60) + 30)

      workouts.push({
        id: `workout_${date.getTime()}_${i}`,
        type: ['Running', 'Cycling', 'Strength Training', 'Yoga'][Math.floor(Math.random() * 4)],
        duration: (endTime.getTime() - startTime.getTime()) / (1000 * 60),
        calories: Math.floor(Math.random() * 300) + 200,
        distance: Math.random() * 10 + 1,
        startTime,
        endTime,
        heartRateZones: this.generateHeartRateZones()
      })
    }

    return workouts
  }

  private generateHeartRateZones(): HeartRateZone[] {
    return [
      { name: 'Resting', min: 50, max: 70, duration: 5 },
      { name: 'Fat Burn', min: 70, max: 130, duration: 15 },
      { name: 'Cardio', min: 130, max: 155, duration: 20 },
      { name: 'Peak', min: 155, max: 185, duration: 10 }
    ]
  }
}

// Mock Google Health Connect Service (Android)
class GoogleHealthConnectService implements FitnessService {
  private isInitialized = false

  isAvailable(): boolean {
    return Platform.OS === 'android'
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // In a real implementation, this would use react-native-health-connect
      // For now, we'll simulate the permission request
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate permission granted
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Google Health Connect permission request failed:', error)
      return false
    }
  }

  async getTodayData(): Promise<FitnessData> {
    if (!this.isInitialized) {
      throw new Error('Google Health Connect not initialized')
    }

    // Simulate fetching today's data
    return {
      steps: Math.floor(Math.random() * 12000) + 6000,
      calories: Math.floor(Math.random() * 600) + 1800,
      distance: Math.random() * 6 + 3,
      activeMinutes: Math.floor(Math.random() * 70) + 25,
      heartRate: {
        resting: Math.floor(Math.random() * 15) + 55,
        average: Math.floor(Math.random() * 25) + 85,
        maximum: Math.floor(Math.random() * 35) + 125
      }
    }
  }

  async getHistoricalData(startDate: Date, endDate: Date): Promise<FitnessData[]> {
    if (!this.isInitialized) {
      throw new Error('Google Health Connect not initialized')
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const data: FitnessData[] = []

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      data.push({
        steps: Math.floor(Math.random() * 12000) + 6000,
        calories: Math.floor(Math.random() * 600) + 1800,
        distance: Math.random() * 6 + 3,
        activeMinutes: Math.floor(Math.random() * 70) + 25,
        heartRate: {
          resting: Math.floor(Math.random() * 15) + 55,
          average: Math.floor(Math.random() * 25) + 85,
          maximum: Math.floor(Math.random() * 35) + 125
        },
        workouts: this.generateMockWorkouts(date)
      })
    }

    return data
  }

  subscribeToUpdates(callback: (data: FitnessData) => void): () => void {
    // In a real implementation, this would subscribe to Google Health Connect updates
    // For now, we'll simulate periodic updates
    const interval = setInterval(async () => {
      if (this.isInitialized) {
        const data = await this.getTodayData()
        callback(data)
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }

  private generateMockWorkouts(date: Date): WorkoutData[] {
    const workouts: WorkoutData[] = []
    const workoutCount = Math.random() > 0.6 ? 1 : 0

    for (let i = 0; i < workoutCount; i++) {
      const startTime = new Date(date)
      startTime.setHours(8 + i * 5, 30, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(startTime.getMinutes() + Math.floor(Math.random() * 45) + 25)

      workouts.push({
        id: `workout_${date.getTime()}_${i}`,
        type: ['Walking', 'Running', 'Cycling', 'Gym', 'Swimming'][Math.floor(Math.random() * 5)],
        duration: (endTime.getTime() - startTime.getTime()) / (1000 * 60),
        calories: Math.floor(Math.random() * 350) + 250,
        distance: Math.random() * 8 + 2,
        startTime,
        endTime,
        heartRateZones: this.generateHeartRateZones()
      })
    }

    return workouts
  }

  private generateHeartRateZones(): HeartRateZone[] {
    return [
      { name: 'Resting', min: 55, max: 75, duration: 8 },
      { name: 'Fat Burn', min: 75, max: 135, duration: 12 },
      { name: 'Cardio', min: 135, max: 160, duration: 18 },
      { name: 'Peak', min: 160, max: 190, duration: 7 }
    ]
  }
}

// Factory function to get the appropriate service
export const getFitnessService = (): FitnessService => {
  if (Platform.OS === 'ios') {
    return new AppleHealthService()
  } else if (Platform.OS === 'android') {
    return new GoogleHealthConnectService()
  } else {
    throw new Error('Platform not supported')
  }
}

// Utility functions
export const formatFitnessData = (data: FitnessData): string => {
  const parts = []
  
  if (data.steps) parts.push(`${data.steps.toLocaleString()} steps`)
  if (data.calories) parts.push(`${data.calories} cal`)
  if (data.distance) parts.push(`${data.distance.toFixed(1)} km`)
  if (data.activeMinutes) parts.push(`${data.activeMinutes} active min`)
  
  return parts.join(' • ')
}

export const calculateCaloriesFromSteps = (steps: number, weight: number): number => {
  // Rough calculation: 0.04 calories per step per kg of body weight
  return Math.round(steps * 0.04 * weight)
}

export const estimateWorkoutIntensity = (heartRate: number, age: number): 'Low' | 'Moderate' | 'High' | 'Very High' => {
  const maxHeartRate = 220 - age
  const percentage = (heartRate / maxHeartRate) * 100
  
  if (percentage < 50) return 'Low'
  if (percentage < 70) return 'Moderate'
  if (percentage < 85) return 'High'
  return 'Very High'
}
