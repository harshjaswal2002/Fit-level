import React from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import TaskCard from '../../components/TaskCard'

const TasksScreen = () => {
  const { session } = useAuth()
  const { tasks, loading, error, completeTask, todayXPEarned } = useTasks(session?.user?.id)

  const handleCompleteTask = async (taskId: string) => {
    try {
      const result = await completeTask(taskId)
      
      if (result.success) {
        Alert.alert(
          'Task Completed!',
          `You earned ${result.data?.xp_earned} XP!`
        )
      } else {
        Alert.alert('Error', result.error || 'Failed to complete task')
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
        <Text style={styles.errorText}>Error loading tasks</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Today's Tasks</Text>
          <View style={styles.xpSummary}>
            <Text style={styles.xpSummaryText}>
              XP Earned Today: {todayXPEarned}
            </Text>
          </View>
        </View>

        {/* Tasks List */}
        <View style={styles.tasksContainer}>
          {tasks.length === 0 ? (
            <Text style={styles.noTasksText}>No tasks available today</Text>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                completed={task.completed}
                onComplete={handleCompleteTask}
              />
            ))
          )}
        </View>

        {/* Task Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Progress Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Completed</Text>
              <Text style={styles.summaryValue}>
                {tasks.filter(task => task.completed).length} / {tasks.length}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total XP</Text>
              <Text style={styles.summaryValue}>{todayXPEarned}</Text>
            </View>
          </View>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  xpSummary: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00ff88',
    alignItems: 'center',
  },
  xpSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ff88',
  },
  tasksContainer: {
    marginBottom: 24,
  },
  noTasksText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  summaryContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
  },
})

export default TasksScreen
