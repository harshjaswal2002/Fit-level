import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider style={{paddingTop: 45, backgroundColor: '#0f0f0f', paddingBottom: 10}}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0f0f0f" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
