import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import AuthNavigator from './AuthNavigator'
import TabNavigator from './TabNavigator'

const AppNavigator = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f', paddingVertical: 45 }}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    )
  }

  return session ? <TabNavigator /> : <AuthNavigator />
}

export default AppNavigator
