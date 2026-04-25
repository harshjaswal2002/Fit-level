-- CutQuest Fitness Tracking App - Complete Schema
-- This file creates all tables, functions, and seed data for the CutQuest app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. TABLES
-- ========================================

-- Users table (handled by Supabase Auth, but we reference it)
-- auth.users already exists in Supabase

-- Phases table - fitness phases (created first to avoid circular reference)
CREATE TABLE phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    description TEXT,
    order_index INTEGER NOT NULL UNIQUE CHECK (order_index > 0)
);

-- Tasks table - daily tasks users can complete
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    type TEXT NOT NULL CHECK (type IN ('workout', 'diet', 'steps', 'habit')),
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards table - rewards users can redeem
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    xp_cost INTEGER NOT NULL CHECK (xp_cost > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table - extended user information (without foreign key initially)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2),
    target_weight DECIMAL(5,2),
    height INTEGER, -- in cm
    body_fat DECIMAL(4,2),
    current_phase_id UUID,
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    level INTEGER DEFAULT 1 CHECK (level > 0),
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for current_phase_id after phases table exists
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_current_phase 
    FOREIGN KEY (current_phase_id) REFERENCES phases(id);

-- Daily logs table - daily tracking data
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories INTEGER CHECK (calories >= 0),
    protein INTEGER CHECK (protein >= 0),
    steps INTEGER CHECK (steps >= 0),
    workout_done BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Task completions table - track which tasks users complete daily
CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id, date)
);

-- Redemptions table - track reward redemptions
CREATE TABLE redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight logs table - track weight progression
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ========================================
-- 2. INDEXES
-- ========================================

-- Performance indexes
CREATE INDEX idx_profiles_current_phase ON profiles(current_phase_id);
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX idx_task_completions_user_date ON task_completions(user_id, date);
CREATE INDEX idx_task_completions_task_date ON task_completions(task_id, date);
CREATE INDEX idx_redemptions_user ON redemptions(user_id);
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, date);

-- ========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles - users can only see/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily logs - users can only manage their own logs
CREATE POLICY "Users can manage own daily logs" ON daily_logs
    FOR ALL USING (auth.uid() = user_id);

-- Task completions - users can only manage their own completions
CREATE POLICY "Users can manage own task completions" ON task_completions
    FOR ALL USING (auth.uid() = user_id);

-- Redemptions - users can only manage their own redemptions
CREATE POLICY "Users can manage own redemptions" ON redemptions
    FOR ALL USING (auth.uid() = user_id);

-- Weight logs - users can only manage their own weight logs
CREATE POLICY "Users can manage own weight logs" ON weight_logs
    FOR ALL USING (auth.uid() = user_id);

-- Public tables (no RLS needed)
-- phases, tasks, rewards are read-only for all authenticated users

-- ========================================
-- 4. TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();