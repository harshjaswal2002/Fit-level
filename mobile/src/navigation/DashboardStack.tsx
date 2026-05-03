import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import DashboardScreen from '../screens/Dashboard/DashboardScreen'
import LogScreen from '../screens/Log/LogScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { RootStackParamList } from '../types'

const Stack = createStackNavigator<RootStackParamList>()

const DashboardStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Log" 
        component={LogScreen}
        options={{ 
          headerShown: true,
          headerTitle: 'Log Data',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerShown: true,
          headerTitle: 'Profile & Settings',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  )
}

export default DashboardStack
