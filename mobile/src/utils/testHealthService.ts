import { healthService } from '../services/healthServiceSimple'

export const testAppleHealthIntegration = async () => {
  console.log('🧪 Testing Apple Health Integration...')
  
  try {
    // Test 1: Initialize HealthKit
    console.log('1. Testing HealthKit initialization...')
    const initialized = await healthService.initialize()
    console.log(`   HealthKit initialized: ${initialized}`)
    
    if (!initialized) {
      console.log('❌ HealthKit initialization failed')
      return false
    }
    
    // Test 2: Check authorization status
    console.log('2. Checking authorization status...')
    const isAuthorized = await healthService.checkAuthorizationStatus()
    console.log(`   Authorization status: ${isAuthorized}`)
    
    // Test 3: Request permissions (if not already authorized)
    if (!isAuthorized) {
      console.log('3. Requesting HealthKit permissions...')
      const permissionsGranted = await healthService.requestPermissions()
      console.log(`   Permissions granted: ${permissionsGranted}`)
      
      if (!permissionsGranted) {
        console.log('❌ Permission request failed')
        return false
      }
    }
    
    // Test 4: Fetch today's data
    console.log('4. Fetching today\'s health data...')
    const healthData = await healthService.getTodayData()
    console.log('   Health data retrieved:', {
      steps: healthData.steps,
      calories: healthData.calories,
      distance: healthData.distance,
      activeMinutes: healthData.activeMinutes,
      hasHeartRate: !!healthData.heartRate,
      hasWeight: !!healthData.weight,
      lastSynced: healthData.lastSynced
    })
    
    console.log('✅ Apple Health integration test completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Apple Health integration test failed:', error)
    return false
  }
}

export const simulateHealthData = () => {
  return {
    steps: Math.floor(Math.random() * 5000) + 3000,
    calories: Math.floor(Math.random() * 300) + 1500,
    distance: parseFloat((Math.random() * 3 + 1).toFixed(2)),
    activeMinutes: Math.floor(Math.random() * 60) + 20,
    heartRate: {
      resting: Math.floor(Math.random() * 10) + 60,
      average: Math.floor(Math.random() * 20) + 70,
      maximum: Math.floor(Math.random() * 30) + 120
    },
    weight: parseFloat((Math.random() * 20 + 60).toFixed(1)),
    lastSynced: new Date()
  }
}
