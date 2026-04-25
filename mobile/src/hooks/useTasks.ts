import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { callRPC } from '../lib/supabaseHelpers'
import { Task, TaskCompletion, TaskResponse } from '../types'

interface TaskWithCompletion extends Task {
  completed: boolean
  completionId?: string
  xpEarned: number
}

export const useTasks = (userId: string | undefined) => {
  const [tasks, setTasks] = useState<TaskWithCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_completions(
            id,
            completed,
            xp_earned
          )
        `)
        .eq('task_completions.user_id', userId)
        .eq('task_completions.date', new Date().toISOString().split('T')[0])

      if (error) {
        // If table doesn't exist, provide fallback data
        if (error.code === 'PGRST205') {
          const fallbackTasks: TaskWithCompletion[] = [
            {
              id: '1',
              name: 'Workout Completed',
              xp_reward: 50,
              type: 'workout',
              is_required: true,
              created_at: new Date().toISOString(),
              completed: false,
              xpEarned: 0,
            },
            {
              id: '2', 
              name: 'Protein Goal Met',
              xp_reward: 40,
              type: 'diet',
              is_required: true,
              created_at: new Date().toISOString(),
              completed: false,
              xpEarned: 0,
            },
            {
              id: '3',
              name: '10k Steps Done',
              xp_reward: 30,
              type: 'steps',
              is_required: true,
              created_at: new Date().toISOString(),
              completed: false,
              xpEarned: 0,
            }
          ]
          setTasks(fallbackTasks)
          setError('Database tables not set up. Please run schema.sql and functions.sql in your Supabase database.')
          return
        }
        throw error
      }

      // Format the data
      const formattedTasks: TaskWithCompletion[] = (data || []).map((task: any) => ({
        ...task,
        completed: task.task_completions?.[0]?.completed || false,
        completionId: task.task_completions?.[0]?.id,
        xpEarned: task.task_completions?.[0]?.xp_earned || 0,
      }))

      setTasks(formattedTasks)
    } catch (error: any) {
      setError(error.message)
      console.error('Tasks fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string): Promise<TaskResponse> => {
    if (!userId) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await callRPC(
        'complete_task', { 
          p_user_id: userId, 
          p_task_id: taskId 
        })

      if (error) {
        // If function doesn't exist, simulate completion with fallback
        if (error.code === 'PGRST202') {
          const task = tasks.find(t => t.id === taskId)
          if (task) {
            // Optimistic update
            setTasks(prevTasks => 
              prevTasks.map(t => 
                t.id === taskId 
                  ? { ...t, completed: true, xpEarned: task.xp_reward }
                  : t
              )
            )
            return { 
              success: true, 
              data: { 
                xp_earned: task.xp_reward, 
                new_level: 1, 
                message: 'Task completed! (Database setup required for full functionality)' 
              }
            }
          }
        }
        throw error
      }

      // Optimistic update
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: true, xpEarned: (data as any)?.xp_earned }
            : task
        )
      )

      return { success: true, data }
    } catch (error: any) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const refresh = () => {
    fetchTasks()
  }

  const todayXPEarned = tasks
    .filter(task => task.completed)
    .reduce((total, task) => total + task.xpEarned, 0)

  return {
    tasks,
    loading,
    error,
    completeTask,
    refresh,
    todayXPEarned,
  }
}
