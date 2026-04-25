import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { callRPC, selectRecord } from '../lib/supabaseHelpers'
import { Reward, Redemption, RewardResponse } from '../types'

export const useRewards = (userId: string | undefined) => {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userXP, setUserXP] = useState(0)
  const [redemptionHistory, setRedemptionHistory] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRewards = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .order('xp_cost', { ascending: true })

      if (rewardsError) {
        // If table doesn't exist, provide fallback data
        if (rewardsError.code === 'PGRST205') {
          const fallbackRewards: Reward[] = [
            {
              id: '1',
              name: 'Cheat Meal',
              xp_cost: 500,
              description: 'One guilt-free meal',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'Rest Day Pass',
              xp_cost: 300,
              description: 'Skip required tasks for one day',
              created_at: new Date().toISOString(),
            },
            {
              id: '3',
              name: 'Protein Shake Bonus',
              xp_cost: 150,
              description: 'Bonus XP for consistency',
              created_at: new Date().toISOString(),
            }
          ]
          setRewards(fallbackRewards)
          setError('Database tables not set up. Please run schema.sql and functions.sql in your Supabase database.')
          return
        }
        throw rewardsError
      }

      // Fetch user's current XP
      if (userId) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', userId)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        setUserXP((profileData as any)?.xp || 0)

        // Fetch redemption history
        const { data: historyData, error: historyError } = await supabase
          .from('redemptions')
          .select('*, rewards(*)')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(10)

        if (historyError) throw historyError

        setRedemptionHistory(historyData || [])
      }

      setRewards(rewardsData || [])
    } catch (error: any) {
      setError(error.message)
      console.error('Rewards fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const redeemReward = async (rewardId: string): Promise<RewardResponse> => {
    if (!userId) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await callRPC(
        'redeem_reward', { 
          p_user_id: userId, 
          p_reward_id: rewardId 
        })

      if (error) throw error

      // Refresh data after redemption
      await fetchRewards()

      return { success: true, data }
    } catch (error: any) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [userId])

  const refresh = () => {
    fetchRewards()
  }

  return {
    rewards,
    userXP,
    redemptionHistory,
    loading,
    error,
    redeemReward,
    refresh,
  }
}
