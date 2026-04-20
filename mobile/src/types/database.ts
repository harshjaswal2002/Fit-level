export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          weight: number | null
          target_weight: number | null
          height: number | null
          body_fat: number | null
          current_phase_id: string | null
          xp: number
          level: number
          streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          weight?: number | null
          target_weight?: number | null
          height?: number | null
          body_fat?: number | null
          current_phase_id?: string | null
          xp?: number
          level?: number
          streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          weight?: number | null
          target_weight?: number | null
          height?: number | null
          body_fat?: number | null
          current_phase_id?: string | null
          xp?: number
          level?: number
          streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      phases: {
        Row: {
          id: string
          name: string
          duration_days: number
          description: string | null
          order_index: number
        }
        Insert: {
          id?: string
          name: string
          duration_days: number
          description?: string | null
          order_index: number
        }
        Update: {
          id?: string
          name?: string
          duration_days?: number
          description?: string | null
          order_index?: number
        }
      }
      tasks: {
        Row: {
          id: string
          name: string
          xp_reward: number
          type: 'workout' | 'diet' | 'steps' | 'habit'
          is_required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          xp_reward: number
          type: 'workout' | 'diet' | 'steps' | 'habit'
          is_required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          xp_reward?: number
          type?: 'workout' | 'diet' | 'steps' | 'habit'
          is_required?: boolean
          created_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          calories: number | null
          protein: number | null
          steps: number | null
          workout_done: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          calories?: number | null
          protein?: number | null
          steps?: number | null
          workout_done?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          calories?: number | null
          protein?: number | null
          steps?: number | null
          workout_done?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_completions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          date: string
          completed: boolean
          xp_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          date: string
          completed?: boolean
          xp_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          date?: string
          completed?: boolean
          xp_earned?: number
          created_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          name: string
          xp_cost: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          xp_cost: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          xp_cost?: number
          description?: string | null
          created_at?: string
        }
      }
      redemptions: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reward_id: string
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reward_id?: string
          date?: string
          created_at?: string
        }
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          weight: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_dashboard: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      complete_task: {
        Args: {
          p_user_id: string
          p_task_id: string
          p_completion_date?: string
        }
        Returns: Json
      }
      redeem_reward: {
        Args: {
          p_user_id: string
          p_reward_id: string
        }
        Returns: Json
      }
      log_daily_data: {
        Args: {
          p_user_id: string
          p_calories?: number
          p_protein?: number
          p_steps?: number
          p_workout_done?: boolean
          p_notes?: string
          p_log_date?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
