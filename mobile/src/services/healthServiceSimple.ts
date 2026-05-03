import { Platform } from 'react-native'
import Health, { HealthKitPermissions } from 'react-native-health'

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
  private isAuthorized = false

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
            // Continue with permission request after initialization
            this.requestPermissions().then(resolve)
          })
          return
        }

        const permissions = {
          permissions: {
            read: [
              Health.Constants.Permissions.Steps,
              Health.Constants.Permissions.DistanceWalkingRunning,
              Health.Constants.Permissions.ActiveEnergyBurned,
              Health.Constants.Permissions.HeartRate,
              Health.Constants.Permissions.RestingHeartRate,
              Health.Constants.Permissions.BodyMass,
              Health.Constants.Permissions.Workout,
            ],
            write: [
              Health.Constants.Permissions.Steps,
              Health.Constants.Permissions.DistanceWalkingRunning,
              Health.Constants.Permissions.ActiveEnergyBurned,
              Health.Constants.Permissions.Workout,
            ],
          },
        }

        Health.initHealthKit(permissions, (error: string, result: any) => {
          if (error) {
            console.error('HealthKit authorization failed:', error)
            this.isAuthorized = false
            resolve(false)
          } else {
            console.log('HealthKit authorization successful')
            this.isAuthorized = true
            resolve(true)
          }
        })
      } catch (error) {
        console.error('Failed to request HealthKit permissions:', error)
        this.isAuthorized = false
        resolve(false)
      }
    })
  }

  async getTodayData(): Promise<HealthData> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isInitialized || !this.isAuthorized) {
          // Return default data if not authorized
          resolve({
            steps: 0,
            calories: 0,
            distance: 0,
            activeMinutes: 0,
            lastSynced: new Date()
          })
          return
        }

        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        // Fetch all health data in parallel
        Promise.all([
          this.getSteps(startOfDay, endOfDay),
          this.getCalories(startOfDay, endOfDay),
          this.getDistance(startOfDay, endOfDay),
          this.getHeartRate(startOfDay, endOfDay),
          this.getWeight(startOfDay, endOfDay),
          this.getActiveMinutes(startOfDay, endOfDay)
        ]).then(([steps, calories, distance, heartRate, weight, activeMinutes]) => {
          resolve({
            steps,
            calories,
            distance,
            activeMinutes,
            heartRate,
            weight,
            lastSynced: new Date()
          })
        }).catch((error) => {
          console.error('Failed to fetch health data:', error)
          // Return default data on error
          resolve({
            steps: 0,
            calories: 0,
            distance: 0,
            activeMinutes: 0,
            lastSynced: new Date()
          })
        })
      } catch (error) {
        console.error('Failed to fetch today\'s health data:', error)
        resolve({
          steps: 0,
          calories: 0,
          distance: 0,
          activeMinutes: 0,
          lastSynced: new Date()
        })
      }
    })
  }

  private async getSteps(startDate: Date, endDate: Date): Promise<number> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 1,
      }

      Health.getDailyStepCountSamples(options, (error: string, result: any) => {
        if (error) {
          console.error('Failed to get steps:', error)
          resolve(0)
        } else {
          resolve(result?.[0]?.value || 0)
        }
      })
    })
  }

  private async getCalories(startDate: Date, endDate: Date): Promise<number> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 1,
      }

      Health.getActiveEnergyBurned(options, (error: string, result: any) => {
        if (error) {
          console.error('Failed to get calories:', error)
          resolve(0)
        } else {
          resolve(result?.[0]?.value || 0)
        }
      })
    })
  }

  private async getDistance(startDate: Date, endDate: Date): Promise<number> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 1,
      }

      Health.getDistanceWalkingRunning(options, (error: string, result: any) => {
        if (error) {
          console.error('Failed to get distance:', error)
          resolve(0)
        } else {
          resolve(result?.[0]?.value || 0)
        }
      })
    })
  }

  private async getHeartRate(startDate: Date, endDate: Date): Promise<{ resting: number; average: number; maximum: number } | undefined> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 100,
      }

      Promise.all([
        new Promise<any>((innerResolve) => {
          Health.getRestingHeartRateSamples(options, (error: string, result: any) => {
            if (error) innerResolve(null)
            else innerResolve(result)
          })
        }),
        new Promise<any>((innerResolve) => {
          Health.getHeartRateSamples(options, (error: string, result: any) => {
            if (error) innerResolve(null)
            else innerResolve(result)
          })
        })
      ]).then(([restingResult, heartRateSamples]) => {
        const resting = restingResult?.[0]?.value || 0
        
        let average = 0
        let maximum = 0
        
        if (heartRateSamples && heartRateSamples.length > 0) {
          const values = heartRateSamples.map((sample: any) => sample.value).filter((v: any) => v > 0)
          if (values.length > 0) {
            average = values.reduce((sum: any, val: any) => sum + val, 0) / values.length
            maximum = Math.max(...values)
          }
        }

        resolve({ resting, average: Math.round(average), maximum })
      }).catch(() => {
        resolve(undefined)
      })
    })
  }

  private async getWeight(startDate: Date, endDate: Date): Promise<number | undefined> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 1,
      }

      Health.getLeanBodyMassSamples(options, (error: string, result: any) => {
        if (error) {
          console.error('Failed to get weight:', error)
          resolve(undefined)
        } else {
          resolve(result?.[0]?.value)
        }
      })
    })
  }

  private async getActiveMinutes(startDate: Date, endDate: Date): Promise<number> {
    return new Promise((resolve) => {
      // For now, estimate active minutes based on steps and calories
      // This is a simplified calculation since workout data requires additional permissions
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 1,
      }

      Health.getDailyStepCountSamples(options, (error: string, result: any) => {
        if (error) {
          console.error('Failed to get steps for active minutes calculation:', error)
          resolve(0)
        } else {
          const steps = result?.[0]?.value || 0
          // Estimate active minutes: roughly 100 steps per minute of moderate activity
          const estimatedMinutes = Math.min(Math.floor(steps / 100), 120) // Cap at 2 hours
          resolve(estimatedMinutes)
        }
      })
    })
  }

  async checkAuthorizationStatus(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false
      }

      // Check if we have already successfully authorized
      if (this.isAuthorized) {
        return true
      }

      // Try to get a sample to check authorization
      return new Promise((resolve) => {
        const options = {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          ascending: false,
          limit: 1,
        }

        Health.getDailyStepCountSamples(options, (error: string, result: any) => {
          if (error && error.includes('authorized')) {
            this.isAuthorized = false
            resolve(false)
          } else if (error) {
            // Other error, assume not authorized
            this.isAuthorized = false
            resolve(false)
          } else {
            this.isAuthorized = true
            resolve(true)
          }
        })
      })
    } catch (error) {
      console.error('Failed to check authorization status:', error)
      return false
    }
  }
}

export const healthService = new HealthService()
