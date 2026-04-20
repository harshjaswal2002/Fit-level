import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Task } from '../types'

interface TaskCardProps {
  task: Task
  completed: boolean
  onComplete: (taskId: string) => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, completed, onComplete }) => {
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'workout':
        return '#ff6b6b'
      case 'diet':
        return '#4ecdc4'
      case 'steps':
        return '#45b7d1'
      case 'habit':
        return '#f9ca24'
      default:
        return '#888'
    }
  }

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'workout':
        return '💪'
      case 'diet':
        return '🥗'
      case 'steps':
        return '👟'
      case 'habit':
        return '⭐'
      default:
        return '📋'
    }
  }

  const handlePress = () => {
    if (!completed && onComplete) {
      onComplete(task.id)
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        completed && styles.completedContainer,
      ]}
      onPress={handlePress}
      disabled={completed}
    >
      <View style={styles.header}>
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskName,
            completed && styles.completedText
          ]}>
            {task.name}
          </Text>
          <View style={styles.typeContainer}>
            <Text style={styles.typeIcon}>
              {getTypeIcon(task.type)}
            </Text>
            <Text style={[
              styles.typeText,
              { color: getTypeColor(task.type) }
            ]}>
              {task.type.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.xpContainer}>
          <Text style={[
            styles.xpText,
            completed && styles.completedText
          ]}>
            +{task.xp_reward} XP
          </Text>
          {completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </View>
      {task.is_required && (
        <Text style={styles.requiredText}>Required</Text>
      )}
    </TouchableOpacity>
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
  completedContainer: {
    borderColor: '#00ff88',
    backgroundColor: '#1a1a1a',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  completedText: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00ff88',
    marginBottom: 4,
  },
  checkmark: {
    fontSize: 20,
    color: '#00ff88',
    fontWeight: 'bold',
  },
  requiredText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 8,
    fontStyle: 'italic',
  },
})

export default TaskCard
