-- QUICK FIX: Create missing profile tables
-- Run this in your Supabase SQL Editor to fix the user_integrations error

-- User integrations table (for fitness app connections)
CREATE TABLE user_integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_name text NOT NULL,
  connected_at timestamptz,
  last_synced_at timestamptz,
  is_active boolean DEFAULT false,
  UNIQUE(user_id, integration_name)
);

-- User profile table
CREATE TABLE user_profile (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name text,
  username text UNIQUE,
  bio text,
  avatar_url text,
  primary_goal text,
  weekly_workout_days int DEFAULT 3,
  daily_step_goal int DEFAULT 8000,
  target_weight_kg float,
  profile_completion_pct int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- User metrics table
CREATE TABLE user_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weight_kg float,
  height_cm float,
  date_of_birth date,
  gender text,
  body_fat_pct float,
  updated_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  unit_system text DEFAULT 'metric',
  workout_types text[] DEFAULT '{}',
  workout_duration text,
  workout_time text,
  fitness_level text,
  notifications jsonb DEFAULT '{}',
  theme text DEFAULT 'system',
  language text DEFAULT 'en',
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Own integrations" ON user_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own profile" ON user_profile FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own metrics" ON user_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX user_integrations_user_id_idx ON user_integrations(user_id);
CREATE INDEX user_integrations_active_idx ON user_integrations(is_active);
CREATE INDEX user_profile_user_id_idx ON user_profile(user_id);
CREATE INDEX user_metrics_user_id_idx ON user_metrics(user_id);
CREATE INDEX user_preferences_user_id_idx ON user_preferences(user_id);
