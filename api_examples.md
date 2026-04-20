# CutQuest API Examples and Usage

This document provides examples of how to use the CutQuest backend functions and queries with Supabase.

## Table of Contents
1. [Setup and Authentication](#setup-and-authentication)
2. [Core API Functions](#core-api-functions)
3. [Common Queries](#common-queries)
4. [Example Usage Patterns](#example-usage-patterns)
5. [Error Handling](#error-handling)

---

## Setup and Authentication

### Initialize Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// All API calls require authentication
const { data: { user } } = await supabase.auth.getUser();
```

---

## Core API Functions

### 1. Get User Dashboard

```javascript
// Get complete dashboard data for a user
async function getUserDashboard(userId) {
  const { data, error } = await supabase
    .rpc('get_user_dashboard', { p_user_id: userId });
  
  if (error) throw error;
  return data;
}

// Usage
const dashboard = await getUserDashboard(user.id);
console.log(dashboard);
// Returns: { profile, current_phase, today_tasks, weekly_progress, recent_weight_logs }
```

### 2. Get Today's Tasks

```javascript
// Get tasks for today with completion status
async function getTodayTasks(userId) {
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
    .eq('task_completions.date', new Date().toISOString().split('T')[0]);

  if (error) throw error;
  return data;
}

// Alternative using RPC
async function getTodayTasksRPC(userId) {
  const { data, error } = await supabase
    .rpc('get_today_tasks', { p_user_id: userId });
  
  if (error) throw error;
  return data;
}
```

### 3. Complete Task

```javascript
// Complete a task and earn XP
async function completeTask(userId, taskId) {
  const { data, error } = await supabase
    .rpc('complete_task', { 
      p_user_id: userId, 
      p_task_id: taskId 
    });
  
  if (error) throw error;
  return data;
}

// Usage
const result = await completeTask(user.id, 'task-uuid-here');
console.log(result);
// Returns: { success: true, xp_earned: 50, new_level: 3, message: 'Task completed successfully' }
```

### 4. Log Daily Data

```javascript
// Log daily fitness data with auto-task completion
async function logDailyData(userId, data) {
  const { data: result, error } = await supabase
    .rpc('log_daily_data', {
      p_user_id: userId,
      p_calories: data.calories,
      p_protein: data.protein,
      p_steps: data.steps,
      p_workout_done: data.workoutDone,
      p_notes: data.notes
    });
  
  if (error) throw error;
  return result;
}

// Usage
const logResult = await logDailyData(user.id, {
  calories: 1800,
  protein: 120,
  steps: 12000,
  workoutDone: true,
  notes: 'Great workout today!'
});
```

### 5. Get Progress

```javascript
// Get user progress across different metrics
async function getUserProgress(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, phases(*)')
    .eq('id', userId)
    .single();

  const { data: weightLogs } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30);

  const { data: taskHistory } = await supabase
    .from('task_completions')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(100);

  return {
    profile,
    weightLogs,
    taskHistory
  };
}
```

### 6. Get Rewards

```javascript
// Get available rewards
async function getRewards() {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('xp_cost', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Get user's reward history
async function getRewardHistory(userId) {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, rewards(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### 7. Redeem Reward

```javascript
// Redeem a reward with XP
async function redeemReward(userId, rewardId) {
  const { data, error } = await supabase
    .rpc('redeem_reward', { 
      p_user_id: userId, 
      p_reward_id: rewardId 
    });
  
  if (error) throw error;
  return data;
}

// Usage
const redemption = await redeemReward(user.id, 'reward-uuid-here');
console.log(redemption);
// Returns: { success: true, reward_name: 'Cheat Meal', xp_deducted: 500, remaining_xp: 1200 }
```

---

## Common Queries

### User Profile Management

```javascript
// Create/update user profile
async function upsertProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profileData
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get current phase details
async function getCurrentPhase(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      current_phase_id,
      phases(*)
    `)
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data.phases;
}
```

### Task Management

```javascript
// Get tasks by type
async function getTasksByType(taskType) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('type', taskType);
  
  if (error) throw error;
  return data;
}

// Get task completion history
async function getTaskHistory(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('task_completions')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### Weight Tracking

```javascript
// Log weight
async function logWeight(userId, weight, date = new Date()) {
  const { data, error } = await supabase
    .from('weight_logs')
    .upsert({
      user_id: userId,
      weight: weight,
      date: date.toISOString().split('T')[0]
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get weight trend
async function getWeightTrend(userId, days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data;
}
```

---

## Example Usage Patterns

### Complete Daily Workflow

```javascript
async function completeDailyWorkflow(userId, dailyData) {
  try {
    // 1. Log daily data (auto-completes tasks)
    const logResult = await logDailyData(userId, dailyData);
    
    // 2. Get updated dashboard
    const dashboard = await getUserDashboard(userId);
    
    // 3. Check phase progress
    const phaseProgress = await supabase
      .rpc('check_phase_progress', { p_user_id: userId });
    
    // 4. Return complete status
    return {
      success: true,
      logResult,
      dashboard,
      phaseProgress
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Usage
const workflowResult = await completeDailyWorkflow(user.id, {
  calories: 1850,
  protein: 110,
  steps: 8500,
  workoutDone: false,
  notes: 'Rest day'
});
```

### Task Completion with Streak Check

```javascript
async function completeTaskWithStreakCheck(userId, taskId) {
  // Complete the task
  const completionResult = await completeTask(userId, taskId);
  
  if (!completionResult.success) {
    return completionResult;
  }
  
  // Check if all required tasks are completed
  const { data: requiredTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('is_required', true);
  
  const { data: completedTasks } = await supabase
    .from('task_completions')
    .select('task_id')
    .eq('user_id', userId)
    .eq('date', new Date().toISOString().split('T')[0])
    .eq('completed', true);
  
  const allRequiredCompleted = requiredTasks.every(task => 
    completedTasks.some(completed => completed.task_id === task.id)
  );
  
  return {
    ...completionResult,
    allRequiredCompleted,
    message: allRequiredCompleted 
      ? 'Task completed! All required tasks done today!' 
      : 'Task completed! Keep going!'
  };
}
```

### Reward Redemption Flow

```javascript
async function redeemRewardFlow(userId, rewardId) {
  // Get user current XP
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single();
  
  // Get reward details
  const { data: reward } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .single();
  
  // Check if user can afford it
  if (profile.xp < reward.xp_cost) {
    return {
      success: false,
      message: 'Insufficient XP',
      required: reward.xp_cost,
      current: profile.xp
    };
  }
  
  // Redeem the reward
  const redemption = await redeemReward(userId, rewardId);
  
  return redemption;
}
```

---

## Error Handling

### Standard Error Response Format

```javascript
function handleSupabaseError(error) {
  console.error('Supabase error:', error);
  
  switch (error.code) {
    case 'PGRST116':
      return { success: false, message: 'Resource not found' };
    case 'PGRST301':
      return { success: false, message: 'Permission denied' };
    case '23505':
      return { success: false, message: 'Duplicate entry' };
    case '23514':
      return { success: false, message: 'Constraint violation' };
    default:
      return { 
        success: false, 
        message: error.message || 'An unexpected error occurred' 
      };
  }
}

// Usage example
try {
  const result = await completeTask(userId, taskId);
  return result;
} catch (error) {
  return handleSupabaseError(error);
}
```

### Validation Before API Calls

```javascript
// Validate task completion
async function validateTaskCompletion(userId, taskId) {
  // Check if task exists
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  if (taskError || !task) {
    return { valid: false, message: 'Task not found' };
  }
  
  // Check if already completed today
  const { data: completion } = await supabase
    .from('task_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .eq('date', new Date().toISOString().split('T')[0])
    .eq('completed', true)
    .single();
  
  if (completion) {
    return { valid: false, message: 'Task already completed today' };
  }
  
  return { valid: true, task };
}
```

---

## Performance Tips

1. **Use RPC functions for complex operations** - They reduce network round trips
2. **Implement proper indexing** - Already done in the schema
3. **Use pagination for large datasets**:
   ```javascript
   const { data } = await supabase
     .from('task_completions')
     .select('*', { count: 'exact' })
     .range(0, 49)
     .order('date', { ascending: false });
   ```
4. **Cache frequently accessed data** like user profile and current phase
5. **Use realtime subscriptions** for live updates:
   ```javascript
   const subscription = supabase
     .channel('profile_changes')
     .on('postgres_changes', 
       { event: 'UPDATE', schema: 'public', table: 'profiles' },
       (payload) => {
         console.log('Profile updated:', payload.new);
       }
     )
     .subscribe();
   ```

---

## Security Considerations

1. **Always validate user input** before database operations
2. **Use RLS policies** - Already configured in the schema
3. **Never expose sensitive data** in client-side queries
4. **Implement rate limiting** for reward redemption
5. **Audit sensitive operations** like XP changes and reward redemptions
