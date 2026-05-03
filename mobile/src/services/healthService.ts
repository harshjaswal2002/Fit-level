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

      // Check if HealthKit library is properly loaded
      if (!Health) {
        console.error('HealthKit library not available')
        return false
      }

      // Log Health object structure for debugging
      console.log('Health object structure:', Object.keys(Health))
      
      // Try different API patterns
      let initHealthKit = Health.initHealthKit
      let Constants = Health.Constants

      // Try accessing through default if direct access fails
      if (!initHealthKit && (Health as any).default) {
        console.log('Using Health.default pattern')
        initHealthKit = (Health as any).default.initHealthKit
        Constants = (Health as any).default.Constants
      } else if ((Health as any).default) {
        console.log('Health.default available but initHealthKit not found, checking structure...')
        console.log('Health.default keys:', Object.keys((Health as any).default))
      }

      if (!initHealthKit) {
        console.error('HealthKit initHealthKit function not found in any pattern')
        console.log('Available Health methods:', Object.getOwnPropertyNames(Health))
        if ((Health as any).default) {
          console.log('Available Health.default methods:', Object.getOwnPropertyNames((Health as any).default))
        }
        return false
      }

      if (!Constants || !Constants.Permissions) {
        console.error('HealthKit Constants.Permissions not found')
        return false
      }

      // Request HealthKit permissions
      const permissions = {
        permissions: {
          read: [
            Constants.Permissions.Steps,
            Constants.Permissions.DistanceWalkingRunning,
            Constants.Permissions.ActiveEnergyBurned,
            Constants.Permissions.HeartRate,
            Constants.Permissions.RestingHeartRate,
            Constants.Permissions.BodyMass,
            Constants.Permissions.Workout,
          ],
          write: [
            Constants.Permissions.Steps,
            Constants.Permissions.DistanceWalkingRunning,
            Constants.Permissions.ActiveEnergyBurned,
            Constants.Permissions.Workout,
          ],
        },
      }

      return new Promise((resolve) => {
        initHealthKit(permissions, (error: string, result: any) => {
          if (error) {
            console.error('HealthKit initialization error:', error)
            resolve(false)
          } else {
            console.log('HealthKit permissions granted successfully')
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

      let getDailyStepCountSamples = Health.getDailyStepCountSamples
      if (!getDailyStepCountSamples && (Health as any).default) {
        getDailyStepCountSamples = (Health as any).default.getDailyStepCountSamples
      }

      if (!getDailyStepCountSamples) {
        console.error('getDailyStepCountSamples function not found')
        resolve(0)
        return
      }

      getDailyStepCountSamples(options, (error: string, result: any) => {
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

      let getDistanceWalkingRunning = Health.getDistanceWalkingRunning
      if (!getDistanceWalkingRunning && (Health as any).default) {
        getDistanceWalkingRunning = (Health as any).default.getDistanceWalkingRunning
      }

      if (!getDistanceWalkingRunning) {
        console.error('getDistanceWalkingRunning function not found')
        resolve(0)
        return
      }

      getDistanceWalkingRunning(options, (error: string, result: any) => {
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

      let getActiveEnergyBurned = Health.getActiveEnergyBurned
      if (!getActiveEnergyBurned && (Health as any).default) {
        getActiveEnergyBurned = (Health as any).default.getActiveEnergyBurned
      }

      if (!getActiveEnergyBurned) {
        console.error('getActiveEnergyBurned function not found')
        resolve(0)
        return
      }

      getActiveEnergyBurned(options, (error: string, result: any) => {
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

      let getRestingHeartRateSamples = Health.getRestingHeartRateSamples
      let getHeartRateSamples = Health.getHeartRateSamples
      
      if (!getRestingHeartRateSamples && (Health as any).default) {
        getRestingHeartRateSamples = (Health as any).default.getRestingHeartRateSamples
      }
      if (!getHeartRateSamples && (Health as any).default) {
        getHeartRateSamples = (Health as any).default.getHeartRateSamples
      }

      if (!getRestingHeartRateSamples || !getHeartRateSamples) {
        console.error('Heart rate functions not found')
        resolve(undefined)
        return
      }

      Promise.all([
        new Promise<any>((innerResolve) => {
          getRestingHeartRateSamples(options, (error: string, result: any) => {
            if (error) innerResolve(null)
            else innerResolve(result)
          })
        }),
        new Promise<any>((innerResolve) => {
          getHeartRateSamples(options, (error: string, result: any) => {
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

      let getLeanBodyMassSamples = Health.getLeanBodyMassSamples
      if (!getLeanBodyMassSamples && (Health as any).default) {
        getLeanBodyMassSamples = (Health as any).default.getLeanBodyMassSamples
      }

      if (!getLeanBodyMassSamples) {
        console.error('getLeanBodyMassSamples function not found')
        resolve(undefined)
        return
      }

      getLeanBodyMassSamples(options, (error: string, result: any) => {
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
