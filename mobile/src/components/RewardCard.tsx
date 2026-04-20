import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Reward } from '../types'

interface RewardCardProps {
  reward: Reward
  userXP: number
  onRedeem: (rewardId: string) => void
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, userXP, onRedeem }) => {
  const canAfford = userXP >= reward.xp_cost
  const isDisabled = !canAfford

  const handleRedeem = () => {
    if (canAfford && onRedeem) {
      onRedeem(reward.id)
    }
  }

  return (
    <View style={[
      styles.container,
      isDisabled && styles.disabledContainer
    ]}>
      <View style={styles.content}>
        <Text style={styles.rewardName}>{reward.name}</Text>
        <Text style={styles.rewardDescription}>{reward.description}</Text>
        <View style={styles.xpContainer}>
          <Text style={[
            styles.xpCost,
            canAfford ? styles.xpAffordable : styles.xpUnaffordable
          ]}>
            {reward.xp_cost} XP
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.redeemButton,
          canAfford ? styles.buttonEnabled : styles.buttonDisabled
        ]}
        onPress={handleRedeem}
        disabled={isDisabled}
      >
        <Text style={[
          styles.redeemButtonText,
          canAfford ? styles.buttonTextEnabled : styles.buttonTextDisabled
        ]}>
          {isDisabled ? 'Insufficient XP' : 'Redeem'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  disabledContainer: {
    borderColor: '#555',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 12,
  },
  xpContainer: {
    alignSelf: 'flex-start',
  },
  xpCost: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpAffordable: {
    color: '#00ff88',
  },
  xpUnaffordable: {
    color: '#ff6b6b',
  },
  redeemButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#00ff88',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextEnabled: {
    color: '#000',
  },
  buttonTextDisabled: {
    color: '#888',
  },
})

export default RewardCard
