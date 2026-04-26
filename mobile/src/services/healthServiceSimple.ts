import { Platform } from 'react-native'
import Health from 'react-native-health'

export interface HealthData {
  steps: number
  calories: number
  distance: number
  activeMinutes: number
  heartRate?: {
    resting: number
    average: number
    maximum: number
  }
  weight?: number
  lastSynced: Date
}

export class HealthService {
  private isInitialized = false

  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios') {
        console.log('HealthKit is only available on iOS')
        return false
      }

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize HealthKit:', error)
      return false
    }
  }

  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!this.isInitialized) {
          this.initialize().then((initialized) => {
            if (!initialized) {
              resolve(false)
              return
            }
          })
        }

        const permissions = {
          permissions: {
            read: [
              'Steps',
              'DistanceWalkingRunning',
              'ActiveEnergyBurned',
              'HeartRate',
              'RestingHeartRate',
              'BodyMass',
            ],
            write: [
              'Steps',
              'DistanceWalkingRunning',
              'ActiveEnergyBurned',
            ],
          },
        }

        // @ts-ignore - TypeScript issue with Health.initHealthKit
        Health.initHealthKit(permissions, (error: string) => {
          if (error) {
            console.error('HealthKit authorization failed:', error)
            resolve(false)
          } else {
            resolve(true)
          }
        })
      } catch (error) {
        console.error('Failed to request HealthKit permissions:', error)
        resolve(false)
      }
    })
  }

  async getTodayData(): Promise<HealthData> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isInitialized) {
          reject(new Error('HealthKit not initialized'))
          return
        }

        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        // Get steps
        const stepsOptions = {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
          ascending: false,
          limit: 1,
        }

        // @ts-ignore - TypeScript issue with Health.getDailyStepCountSamples
        Health.getDailyStepCountSamples(stepsOptions, (error: string, result: any) => {
          if (error || !result || result.length === 0) {
            // Return default data if HealthKit fails
            resolve({
              steps: 0,
              calories: 0,
              distance: 0,
              activeMinutes: 0,
              lastSynced: new Date()
            })
          } else {
            resolve({
              steps: result[0]?.value || 0,
              calories: 0,
              distance: 0,
              activeMinutes: 0,
              lastSynced: new Date()
            })
          }
        })
      } catch (error) {
        console.error('Failed to fetch today\'s health data:', error)
        reject(error)
      }
    })
  }

  async checkAuthorizationStatus(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!this.isInitialized) {
          resolve(false)
          return
        }

        // @ts-ignore - TypeScript issue with Health.getAuthStatus
        Health.getAuthStatus('Steps', (error: string, result: string) => {
          resolve(result === 'authorized')
        })
      } catch (error) {
        console.error('Failed to check authorization status:', error)
        resolve(false)
      }
    })
  }
}

export const healthService = new HealthService()
