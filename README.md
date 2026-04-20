# CutQuest - Gamified Fitness Tracking Backend

A comprehensive backend system for a gamified fitness tracking app that helps users progress through fitness phases while earning XP and rewards.

## Overview

CutQuest transforms fitness tracking into an engaging game where users:
- Progress through fitness phases (Aggressive Cut, Controlled Cut, Lean Build)
- Complete daily tasks to earn XP and level up
- Maintain streaks for consistency
- Redeem rewards for cheat meals and other perks
- Track weight, nutrition, and workout progress

## Tech Stack

- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Database**: PostgreSQL with advanced functions and triggers
- **Security**: Row Level Security (RLS) for data isolation
- **API**: RESTful queries + RPC functions

## Architecture

### Database Schema

The system uses a normalized schema with 9 core tables:

1. **profiles** - Extended user information (XP, level, streak, current phase)
2. **phases** - Fitness phases with duration and progression rules
3. **tasks** - Daily activities users can complete for XP
4. **daily_logs** - Nutrition and activity tracking
5. **task_completions** - Track which tasks are completed daily
6. **rewards** - Items users can redeem with XP
7. **redemptions** - Track reward redemption history
8. **weight_logs** - Weight progression tracking
9. **users** - Supabase auth users (referenced)

### Core Functions

- `complete_task()` - Mark tasks complete, award XP, update streaks
- `calculate_level()` - Convert XP to user level (500 XP per level)
- `check_phase_progress()` - Monitor phase completion and progression
- `redeem_reward()` - Handle reward redemption with XP validation
- `log_daily_data()` - Log fitness data with auto-task completion
- `get_user_dashboard()` - Complete dashboard data aggregation

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable PostgreSQL extensions in your project settings
3. Set up authentication providers as needed

### 2. Database Initialization

Execute the SQL files in order:

```bash
# 1. Create tables, indexes, and RLS policies
psql -f schema.sql

# 2. Create core functions and triggers
psql -f functions.sql

# 3. Insert seed data
psql -f seed_data.sql
```

### 3. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## File Structure

```
Fit-level/
|-- schema.sql          # Database tables, indexes, RLS policies
|-- functions.sql       # Core business logic functions
|-- seed_data.sql       # Initial data for phases, tasks, rewards
|-- api_examples.md     # Complete API usage examples
|-- README.md          # This file
```

## Key Features

### Gamification Elements

- **XP System**: Earn XP for completing tasks (20-50 XP per task)
- **Level Progression**: Level up every 500 XP
- **Streak Tracking**: Maintain streaks by completing required tasks daily
- **Phase Progression**: Sequential fitness phases with duration requirements
- **Reward System**: Redeem XP for cheat meals and other rewards

### Task Types

1. **Workout Tasks** (Required)
   - Workout Completed (50 XP)
   - Cardio Session (30 XP)
   - Stretching/Mobility (20 XP)

2. **Diet Tasks** (Required)
   - Protein Goal Met (40 XP)
   - Calorie Deficit Maintained (40 XP)
   - No Junk Food (20 XP)

3. **Steps Tasks** (Required)
   - 10k Steps Done (30 XP)
   - 15k Steps Done (45 XP)

4. **Habit Tasks** (Optional)
   - Slept 7+ Hours (35 XP)
   - Meditated 10+ Minutes (25 XP)

### Reward System

- **Cheat Meal** (500 XP) - One guilt-free meal
- **Cheat Day** (1200 XP) - Full day off tracking
- **Rest Day Pass** (300 XP) - Skip required tasks
- **Protein Shake Bonus** (150 XP) - Bonus XP for consistency
- **Workout Gear Credit** (2000 XP) - $25 gear credit
- **Personal Training Session** (3000 XP) - One-on-one coaching

## API Usage Examples

### Complete Daily Workflow

```javascript
// Log daily data (auto-completes related tasks)
const result = await supabase.rpc('log_daily_data', {
  p_user_id: userId,
  p_calories: 1800,
  p_protein: 120,
  p_steps: 12000,
  p_workout_done: true
});

// Get updated dashboard
const dashboard = await supabase.rpc('get_user_dashboard', { 
  p_user_id: userId 
});
```

### Complete Task Manually

```javascript
const completion = await supabase.rpc('complete_task', {
  p_user_id: userId,
  p_task_id: taskId
});

// Returns: { success: true, xp_earned: 50, new_level: 3 }
```

### Redeem Reward

```javascript
const redemption = await supabase.rpc('redeem_reward', {
  p_user_id: userId,
  p_reward_id: rewardId
});

// Returns: { success: true, reward_name: 'Cheat Meal', remaining_xp: 1200 }
```

## Security Features

### Row Level Security (RLS)

All user-specific tables have RLS policies ensuring users can only access their own data:

- Users can only view/update their own profile
- Users can only manage their own daily logs and task completions
- Users can only view their own weight logs and reward history

### Data Validation

- XP never goes negative (CHECK constraints)
- Tasks can only be completed once per day
- Phase progression must be sequential
- Reward redemption requires sufficient XP

## Performance Optimizations

### Database Indexes

Strategic indexes on frequently queried columns:
- `profiles(current_phase_id)`
- `daily_logs(user_id, date)`
- `task_completions(user_id, date)`
- `weight_logs(user_id, date)`

### Function Optimization

- RPC functions reduce network round trips
- Efficient joins and aggregations
- Proper use of PostgreSQL features

## Extensibility

The schema is designed for easy extension:

- Add new task types by inserting into `tasks` table
- Create new rewards in `rewards` table
- Add new phases with different durations
- Extend user profile with additional metrics
- Add new auto-completion rules in `log_daily_data` function

## Monitoring and Analytics

Built-in tracking for:

- Daily task completion rates
- XP earning patterns
- Phase progression metrics
- Reward redemption frequency
- Weight progression trends
- Streak consistency

## Deployment Notes

### Cron Jobs

Set up a daily cron job to call `daily_reset()` function:

```bash
# Daily at midnight UTC
0 0 * * * curl -X POST "https://your-project.supabase.co/rest/v1/rpc/daily_reset" -H "Authorization: Bearer $SERVICE_ROLE_KEY"
```

### Real-time Features

Enable real-time subscriptions for live updates:

```javascript
// Listen to profile changes
const subscription = supabase
  .channel('profile_updates')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'profiles' },
    (payload) => updateUI(payload.new)
  )
  .subscribe();
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Add proper RLS policies for any new tables
3. Include comprehensive error handling
4. Update API documentation for new functions
5. Test thoroughly with different user scenarios

## License

This project is licensed under the MIT License.
