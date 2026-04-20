import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface XPBarProps {
  currentXP: number
  level: number
}

const XPBar: React.FC<XPBarProps> = ({ currentXP, level }) => {
  const progress = (currentXP % 500) / 500
  const currentLevelXP = currentXP % 500
  const nextLevelXP = 500

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.xpText}>
          {currentLevelXP} / {nextLevelXP} XP
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  xpText: {
    fontSize: 14,
    color: '#888',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
})

export default XPBar
