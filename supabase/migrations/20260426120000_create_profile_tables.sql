-- Profile Tables Migration
-- This migration creates all tables needed for the comprehensive profile feature

-- Main profile table
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

-- Body metrics table
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

-- Integrations table for fitness app connections
CREATE TABLE user_integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_name text NOT NULL,
  connected_at timestamptz,
  last_synced_at timestamptz,
  is_active boolean DEFAULT false,
  UNIQUE(user_id, integration_name)
);

-- Preferences table
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

-- Enable Row Level Security for all tables
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Own profile" ON user_profile FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own metrics" ON user_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own integrations" ON user_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX user_profile_user_id_idx ON user_profile(user_id);
CREATE INDEX user_metrics_user_id_idx ON user_metrics(user_id);
CREATE INDEX user_integrations_user_id_idx ON user_integrations(user_id);
CREATE INDEX user_integrations_active_idx ON user_integrations(is_active);
CREATE INDEX user_preferences_user_id_idx ON user_preferences(user_id);

-- Create function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id uuid)
RETURNS integer AS $$
DECLARE
    v_completion integer := 0;
    v_profile user_profile%ROWTYPE;
    v_metrics user_metrics%ROWTYPE;
    v_preferences user_preferences%ROWTYPE;
    v_integration_count integer;
BEGIN
    -- Get user data
    SELECT * INTO v_profile FROM user_profile WHERE user_id = p_user_id;
    SELECT * INTO v_metrics FROM user_metrics WHERE user_id = p_user_id;
    SELECT * INTO v_preferences FROM user_preferences WHERE user_id = p_user_id;
    
    -- Calculate completion percentage
    IF v_profile.avatar_url IS NOT NULL THEN v_completion := v_completion + 10; END IF;
    IF v_profile.display_name IS NOT NULL THEN v_completion := v_completion + 5; END IF;
    IF v_metrics.date_of_birth IS NOT NULL THEN v_completion := v_completion + 5; END IF;
    IF v_metrics.weight_kg IS NOT NULL THEN v_completion := v_completion + 10; END IF;
    IF v_metrics.height_cm IS NOT NULL THEN v_completion := v_completion + 10; END IF;
    IF v_profile.primary_goal IS NOT NULL THEN v_completion := v_completion + 10; END IF;
    IF v_preferences.workout_types IS NOT NULL AND array_length(v_preferences.workout_types, 1) > 0 THEN v_completion := v_completion + 10; END IF;
    
    -- Check for active integrations (15% weight)
    SELECT count(*) INTO v_integration_count 
    FROM user_integrations 
    WHERE user_id = p_user_id AND is_active = true;
    
    IF v_integration_count > 0 THEN v_completion := v_completion + 15; END IF;
    
    IF v_profile.weekly_workout_days IS NOT NULL THEN v_completion := v_completion + 10; END IF;
    IF v_profile.bio IS NOT NULL THEN v_completion := v_completion + 5; END IF;
    IF v_preferences.notifications IS NOT NULL AND jsonb_typeof(v_preferences.notifications) = 'object' THEN
        IF jsonb_object_keys(v_preferences.notifications) IS NOT NULL THEN
            v_completion := v_completion + 5;
        END IF;
    END IF;
    IF v_preferences.unit_system IS NOT NULL THEN v_completion := v_completion + 5; END IF;
    
    -- Update the profile completion percentage
    UPDATE user_profile SET profile_completion_pct = v_completion WHERE user_id = p_user_id;
    
    RETURN v_completion;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS trigger AS $$
BEGIN
    PERFORM calculate_profile_completion(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic completion updates
CREATE TRIGGER update_profile_completion_on_profile
    AFTER INSERT OR UPDATE ON user_profile
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profile_completion_on_metrics
    AFTER INSERT OR UPDATE ON user_metrics
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profile_completion_on_preferences
    AFTER INSERT OR UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profile_completion_on_integrations
    AFTER INSERT OR UPDATE ON user_integrations
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();
