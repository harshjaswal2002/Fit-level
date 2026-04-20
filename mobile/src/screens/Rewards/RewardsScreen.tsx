import React from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useRewards } from '../../hooks/useRewards'
import RewardCard from '../../components/RewardCard'

const RewardsScreen = () => {
  const { session } = useAuth()
  const { rewards, userXP, redemptionHistory, loading, error, redeemReward } = useRewards(session?.user?.id)

  const handleRedeemReward = async (rewardId: string) => {
    try {
      const result = await redeemReward(rewardId)
      
      if (result.success) {
        Alert.alert(
          'Reward Redeemed!',
          `You successfully redeemed ${result.data?.reward_name}! ${result.data?.remaining_xp} XP remaining.`,
          [{ text: 'OK' }]
        )
      } else {
        Alert.alert('Error', result.error || 'Failed to redeem reward')
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading rewards</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rewards</Text>
          <View style={styles.xpContainer}>
            <Text style={styles.xpLabel}>Your XP</Text>
            <Text style={styles.xpValue}>{userXP}</Text>
          </View>
        </View>

        {/* Available Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          {rewards.length === 0 ? (
            <Text style={styles.noRewardsText}>No rewards available</Text>
          ) : (
            rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userXP={userXP}
                onRedeem={handleRedeemReward}
              />
            ))
          )}
        </View>

        {/* Redemption History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redemption History</Text>
          {redemptionHistory.length === 0 ? (
            <Text style={styles.noHistoryText}>No rewards redeemed yet</Text>
          ) : (
            <View style={styles.historyContainer}>
              {redemptionHistory.map((redemption) => (
                <View key={redemption.id} style={styles.historyItem}>
                  <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemName}>
                      {redemption.rewards?.name || 'Unknown Reward'}
                    </Text>
                    <Text style={styles.historyItemDate}>
                      {new Date(redemption.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.historyItemCost}>
                    -{redemption.rewards?.xp_cost || 0} XP
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* XP Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 How to Earn XP</Text>
          <Text style={styles.tipText}>• Complete daily tasks (20-50 XP each)</Text>
          <Text style={styles.tipText}>• Maintain your streak for bonus XP</Text>
          <Text style={styles.tipText}>• Log your daily data consistently</Text>
          <Text style={styles.tipText}>• Progress through fitness phases</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00ff88',
    alignItems: 'center',
    minWidth: 100,
  },
  xpLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  xpValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  noRewardsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  historyContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#888',
  },
  historyItemCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  noHistoryText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  tipsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ff88',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    lineHeight: 20,
  },
})

export default RewardsScreen
