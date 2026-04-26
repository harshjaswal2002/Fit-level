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

  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios') {
        console.log('HealthKit is only available on iOS')
        return false
      }

      // HealthKit is available by default on iOS devices
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize HealthKit:', error)
      return false
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize()
        if (!initialized) return false
      }

      // Request HealthKit permissions
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

      return new Promise((resolve) => {
        Health.initHealthKit(permissions, (error: string, result: any) => {
          if (error) {
            console.error('HealthKit initialization error:', error)
            resolve(false)
          } else {
            resolve(true)
          }
        })
      })
    } catch (error) {
      console.error('Failed to request HealthKit permissions:', error)
      return false
    }
  }

  async getTodayData(): Promise<HealthData> {
    try {
      if (!this.isInitialized) {
        throw new Error('HealthKit not initialized')
      }

      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      // Fetch today's health data
      const [stepsResult, distanceResult, caloriesResult, heartRateResult, weightResult] = await Promise.all([
        this.getSteps(startOfDay, endOfDay),
        this.getDistance(startOfDay, endOfDay),
        this.getCalories(startOfDay, endOfDay),
        this.getHeartRate(startOfDay, endOfDay),
        this.getWeight(startOfDay, endOfDay)
      ])

      return {
        steps: stepsResult,
        calories: caloriesResult,
        distance: distanceResult,
        activeMinutes: await this.getActiveMinutes(startOfDay, endOfDay),
        heartRate: heartRateResult,
        weight: weightResult,
        lastSynced: new Date()
      }
    } catch (error) {
      console.error('Failed to fetch today\'s health data:', error)
      throw error
    }
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
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 100,
      }

      // Note: getWorkouts might not be available in all versions
      // Using a placeholder implementation
      resolve(0)
    })
  }

  async getHistoricalData(startDate: Date, endDate: Date): Promise<HealthData[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('HealthKit not initialized')
      }

      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const data: HealthData[] = []

      for (let i = 0; i < days; i++) {
        const dayStart = new Date(startDate)
        dayStart.setDate(dayStart.getDate() + i)
        
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const [stepsResult, distanceResult, caloriesResult, heartRateResult, weightResult] = await Promise.all([
          this.getSteps(dayStart, dayEnd),
          this.getDistance(dayStart, dayEnd),
          this.getCalories(dayStart, dayEnd),
          this.getHeartRate(dayStart, dayEnd),
          this.getWeight(dayStart, dayEnd)
        ])

        data.push({
          steps: stepsResult,
          calories: caloriesResult,
          distance: distanceResult,
          activeMinutes: await this.getActiveMinutes(dayStart, dayEnd),
          heartRate: heartRateResult,
          weight: weightResult,
          lastSynced: new Date()
        })
      }

      return data
    } catch (error) {
      console.error('Failed to fetch historical health data:', error)
      throw error
    }
  }

  async checkAuthorizationStatus(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false
      }

      // Note: getAuthorizationStatus might not be available in all versions
      // Using a placeholder implementation
      return true
    } catch (error) {
      console.error('Failed to check authorization status:', error)
      return false
    }
  }
}

export const healthService = new HealthService()
