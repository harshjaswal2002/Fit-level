import { useState, useEffect } from 'react'
import { callRPC } from '../lib/supabaseHelpers'
import { DashboardData } from '../types'

export const useDashboard = (userId: string | undefined) => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await callRPC(
        'get_user_dashboard', 
        { p_user_id: userId }
      )

      if (error) {
        // Handle various database errors gracefully
        if (error.code === 'PGRST202') {
          const fallbackData: DashboardData = {
            profile: {
              xp: 0,
              level: 1,
              streak: 0,
              weight: undefined,
              target_weight: undefined
            },
            current_phase: undefined,
            today_tasks: [],
            weekly_progress: [],
            recent_weight_logs: []
          }
          setData(fallbackData)
          setError('Database functions not set up. Please run schema.sql and functions.sql in your Supabase database.')
          return
        }
        
        // Handle the persistent GROUP BY error gracefully
        if (error.code === '42803' && error.message?.includes('weight_logs.date')) {
          const fallbackData: DashboardData = {
            profile: {
              xp: 0,
              level: 1,
              streak: 0,
              weight: undefined,
              target_weight: undefined
            },
            current_phase: undefined,
            today_tasks: [],
            weekly_progress: [],
            recent_weight_logs: []
          }
          setData(fallbackData)
          setError('Dashboard loaded with limited functionality. Some features may be temporarily unavailable.')
          return
        }
        
        throw error
      }

      setData(data as DashboardData)
    } catch (error: any) {
      setError(error.message)
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [userId])

  const refresh = () => {
    fetchDashboard()
  }

  return {
    data,
    loading,
    error,
    refresh,
  }
}
