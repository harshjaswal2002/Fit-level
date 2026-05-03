export interface User {
  id: string
  email?: string
}

export interface Profile {
  id: string
  weight?: number
  target_weight?: number
  height?: number
  body_fat?: number
  current_phase_id?: string
  xp: number
  level: number
  streak: number
  created_at: string
  updated_at: string
}

export interface Phase {
  id: string
  name: string
  duration_days: number
  description?: string
  order_index: number
}

export interface Task {
  id: string
  name: string
  xp_reward: number
  type: 'workout' | 'diet' | 'steps' | 'habit'
  is_required: boolean
  created_at: string
}

export interface TaskCompletion {
  id: string
  user_id: string
  task_id: string
  date: string
  completed: boolean
  xp_earned: number
  created_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  date: string
  calories?: number
  protein?: number
  steps?: number
  workout_done: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Reward {
  id: string
  name: string
  xp_cost: number
  description?: string
  created_at: string
}

export interface Redemption {
  id: string
  user_id: string
  reward_id: string
  date: string
  created_at: string
  rewards?: Reward
}

export interface WeightLog {
  id: string
  user_id: string
  weight: number
  date: string
  created_at: string
}

export interface DashboardData {
  profile: {
    xp: number
    level: number
    streak: number
    weight?: number
    target_weight?: number
  }
  current_phase?: Phase
  today_tasks: (Task & {
    completed: boolean
    completion_id?: string
    xp_earned: number
  })[]
  weekly_progress: Array<{
    date: string
    completed_tasks: number
    total_tasks: number
  }>
  recent_weight_logs: WeightLog[]
  today_summary?: {
    calories?: number
    protein?: number
    steps?: number
  }
}

export interface AuthResponse {
  success: boolean
  data?: any
  error?: string
}

export interface TaskResponse {
  success: boolean
  data?: {
    xp_earned: number
    new_level: number
    message: string
  }
  error?: string
}

export interface RewardResponse {
  success: boolean
  data?: {
    reward_name: string
    xp_deducted: number
    remaining_xp: number
    message: string
  }
  error?: string
}

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Login: undefined
  Signup: undefined
  Dashboard: undefined
  Tasks: undefined
  Log: undefined
  Progress: undefined
  Rewards: undefined
  Profile: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Signup: undefined
}

export type TabParamList = {
  Dashboard: undefined
  Tasks: undefined
  Progress: undefined
  Rewards: undefined
}
