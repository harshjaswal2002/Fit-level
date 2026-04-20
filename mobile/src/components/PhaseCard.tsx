import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface PhaseCardProps {
  phaseName: string
  daysCompleted: number
  totalDays: number
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phaseName, daysCompleted, totalDays }) => {
  const progress = totalDays > 0 ? daysCompleted / totalDays : 0

  return (
    <View style={styles.container}>
      <Text style={styles.phaseName}>{phaseName}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {daysCompleted} / {totalDays} days
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  phaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#888',
  },
})

export default PhaseCard
