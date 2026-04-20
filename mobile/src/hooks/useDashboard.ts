import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

      const { data, error } = await supabase
        .rpc('get_user_dashboard', { p_user_id: userId })

      if (error) {
        // If function doesn't exist, provide fallback data
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
