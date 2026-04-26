import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface StatCardProps {
  label: string
  value: number
  unit?: string
  icon: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {unit && <Text style={styles.unit}> {unit}</Text>}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 'auto',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  unit: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'normal',
  },
})

export default StatCard
