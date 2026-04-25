-- CutQuest Core Functions
-- This file contains all the core business logic functions for the CutQuest app

-- ========================================
-- 1. UTILITY FUNCTIONS
-- ========================================

-- Calculate level based on XP
CREATE OR REPLACE FUNCTION calculate_level(xp_input INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(1, FLOOR(xp_input / 500) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ========================================
-- 2. TASK COMPLETION FUNCTIONS
-- ========================================

-- Complete a task for a user
CREATE OR REPLACE FUNCTION complete_task(
    p_user_id UUID,
    p_task_id UUID,
    p_completion_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    v_task_xp INTEGER;
    v_already_completed BOOLEAN;
    v_completion_record task_completions%ROWTYPE;
    v_new_level INTEGER;
    v_streak_updated BOOLEAN := FALSE;
BEGIN
    -- Check if task already completed today
    SELECT completed INTO v_already_completed
    FROM task_completions
    WHERE user_id = p_user_id AND task_id = p_task_id AND date = p_completion_date;
    
    IF v_already_completed THEN
        RETURN json_build_object('success', false, 'message', 'Task already completed today');
    END IF;
    
    -- Get task XP reward
    SELECT xp_reward INTO v_task_xp
    FROM tasks
    WHERE id = p_task_id;
    
    IF v_task_xp IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Task not found');
    END IF;
    
    -- Insert or update task completion
    INSERT INTO task_completions (user_id, task_id, date, completed, xp_earned)
    VALUES (p_user_id, p_task_id, p_completion_date, true, v_task_xp)
    ON CONFLICT (user_id, task_id, date)
    DO UPDATE SET
        completed = true,
        xp_earned = v_task_xp;
    
    -- Update user XP and level
    UPDATE profiles
    SET xp = xp + v_task_xp,
        level = calculate_level(xp + v_task_xp)
    WHERE id = p_user_id
    RETURNING level INTO v_new_level;
    
    -- Check if all required tasks are completed for streak
    PERFORM update_streak_if_all_required_completed(p_user_id, p_completion_date);
    
    RETURN json_build_object(
        'success', true,
        'xp_earned', v_task_xp,
        'new_level', v_new_level,
        'message', 'Task completed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to update streak if all required tasks are completed
CREATE OR REPLACE FUNCTION update_streak_if_all_required_completed(
    p_user_id UUID,
    p_completion_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    v_required_tasks_count INTEGER;
    v_completed_required_count INTEGER;
    v_current_streak INTEGER;
BEGIN
    -- Count total required tasks
    SELECT COUNT(*) INTO v_required_tasks_count
    FROM tasks
    WHERE is_required = true;
    
    -- Count completed required tasks today
    SELECT COUNT(*) INTO v_completed_required_count
    FROM task_completions tc
    JOIN tasks t ON tc.task_id = t.id
    WHERE tc.user_id = p_user_id 
        AND tc.date = p_completion_date 
        AND tc.completed = true 
        AND t.is_required = true;
    
    -- Get current streak
    SELECT streak INTO v_current_streak
    FROM profiles
    WHERE id = p_user_id;
    
    -- If all required tasks completed, increment streak
    IF v_completed_required_count = v_required_tasks_count AND v_required_tasks_count > 0 THEN
        UPDATE profiles
        SET streak = streak + 1
        WHERE id = p_user_id;
        
        RETURN TRUE;
    -- If some required tasks missed, reset streak
    ELSIF v_required_tasks_count > 0 AND v_completed_required_count < v_required_tasks_count THEN
        -- Check if this is the first incomplete day
        IF EXISTS (
            SELECT 1 FROM daily_logs 
            WHERE user_id = p_user_id AND date = p_completion_date - 1
        ) THEN
            UPDATE profiles
            SET streak = 0
            WHERE id = p_user_id;
        END IF;
        
        RETURN FALSE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. PHASE MANAGEMENT FUNCTIONS
-- ========================================

-- Check phase progress and move to next phase if duration completed
CREATE OR REPLACE FUNCTION check_phase_progress(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_current_phase_id UUID;
    v_phase_duration INTEGER;
    v_phase_start_date DATE;
    v_days_completed INTEGER;
    v_next_phase_id UUID;
    v_phase_name TEXT;
BEGIN
    -- Get current phase info
    SELECT p.current_phase_id, ph.duration_days, ph.name
    INTO v_current_phase_id, v_phase_duration, v_phase_name
    FROM profiles p
    JOIN phases ph ON p.current_phase_id = ph.id
    WHERE p.id = p_user_id;
    
    IF v_current_phase_id IS NULL THEN
        -- Assign first phase if none assigned
        SELECT id INTO v_current_phase_id
        FROM phases
        WHERE order_index = 1;
        
        UPDATE profiles
        SET current_phase_id = v_current_phase_id
        WHERE id = p_user_id;
        
        RETURN json_build_object('success', true, 'message', 'Assigned first phase', 'phase_name', v_phase_name);
    END IF;
    
    -- Calculate days completed in current phase
    SELECT COUNT(DISTINCT date) INTO v_days_completed
    FROM task_completions tc
    WHERE tc.user_id = p_user_id
        AND tc.completed = true
        AND tc.date >= (
            SELECT COALESCE(MAX(date), CURRENT_DATE) 
            FROM daily_logs 
            WHERE user_id = p_user_id
        ) - v_phase_duration + 1;
    
    -- Check if phase duration completed
    IF v_days_completed >= v_phase_duration THEN
        -- Move to next phase
        SELECT id INTO v_next_phase_id
        FROM phases
        WHERE order_index = (
            SELECT order_index + 1 
            FROM phases 
            WHERE id = v_current_phase_id
        );
        
        IF v_next_phase_id IS NOT NULL THEN
            UPDATE profiles
            SET current_phase_id = v_next_phase_id
            WHERE id = p_user_id;
            
            SELECT name INTO v_phase_name
            FROM phases
            WHERE id = v_next_phase_id;
            
            RETURN json_build_object(
                'success', true, 
                'message', 'Phase completed! Moved to next phase',
                'new_phase', v_phase_name,
                'days_completed', v_days_completed
            );
        ELSE
            RETURN json_build_object(
                'success', true, 
                'message', 'All phases completed!',
                'days_completed', v_days_completed
            );
        END IF;
    END IF;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Continue current phase',
        'current_phase', v_phase_name,
        'days_completed', v_days_completed,
        'total_days', v_phase_duration
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. REWARD FUNCTIONS
-- ========================================

-- Redeem a reward
CREATE OR REPLACE FUNCTION redeem_reward(
    p_user_id UUID,
    p_reward_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_reward_cost INTEGER;
    v_user_xp INTEGER;
    v_reward_name TEXT;
BEGIN
    -- Get reward cost and name
    SELECT xp_cost, name INTO v_reward_cost, v_reward_name
    FROM rewards
    WHERE id = p_reward_id;
    
    IF v_reward_cost IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Reward not found');
    END IF;
    
    -- Get user XP
    SELECT xp INTO v_user_xp
    FROM profiles
    WHERE id = p_user_id;
    
    IF v_user_xp < v_reward_cost THEN
        RETURN json_build_object(
            'success', false, 
            'message', 'Insufficient XP',
            'required', v_reward_cost,
            'current', v_user_xp
        );
    END IF;
    
    -- Deduct XP and record redemption
    UPDATE profiles
    SET xp = xp - v_reward_cost,
        level = calculate_level(xp - v_reward_cost)
    WHERE id = p_user_id;
    
    INSERT INTO redemptions (user_id, reward_id, date)
    VALUES (p_user_id, p_reward_id, NOW());
    
    RETURN json_build_object(
        'success', true,
        'message', 'Reward redeemed successfully',
        'reward_name', v_reward_name,
        'xp_deducted', v_reward_cost,
        'remaining_xp', v_user_xp - v_reward_cost
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. DAILY RESET FUNCTION
-- ========================================

-- Daily reset function (can be called by a cron job)
CREATE OR REPLACE FUNCTION daily_reset()
RETURNS VOID AS $$
BEGIN
    -- This function would be called daily to reset any daily-specific data
    -- Currently, task completions are date-specific, so no explicit reset needed
    -- But you could add cleanup logic here if needed
    
    -- Example: Clean up old temporary data older than 90 days
    -- DELETE FROM task_completions WHERE date < CURRENT_DATE - 90;
    
    -- Log the reset (optional)
    INSERT INTO daily_logs (user_id, date, notes)
    SELECT id, CURRENT_DATE, 'Daily reset completed'
    FROM profiles
    WHERE NOT EXISTS (
        SELECT 1 FROM daily_logs 
        WHERE user_id = profiles.id AND date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. DAILY DATA LOGGING FUNCTION
-- ========================================

-- Log daily data and auto-complete related tasks
CREATE OR REPLACE FUNCTION log_daily_data(
    p_user_id UUID,
    p_calories INTEGER DEFAULT NULL,
    p_protein INTEGER DEFAULT NULL,
    p_steps INTEGER DEFAULT NULL,
    p_workout_done BOOLEAN DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_log_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    v_tasks_auto_completed JSON := '[]'::JSON;
    v_task_record JSON;
    v_protein_task_id UUID;
    v_steps_task_id UUID;
    v_workout_task_id UUID;
    v_calories_task_id UUID;
BEGIN
    -- Insert or update daily log
    INSERT INTO daily_logs (user_id, date, calories, protein, steps, workout_done, notes)
    VALUES (p_user_id, p_log_date, p_calories, p_protein, p_steps, p_workout_done, p_notes)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        calories = COALESCE(EXCLUDED.calories, daily_logs.calories),
        protein = COALESCE(EXCLUDED.protein, daily_logs.protein),
        steps = COALESCE(EXCLUDED.steps, daily_logs.steps),
        workout_done = COALESCE(EXCLUDED.workout_done, daily_logs.workout_done),
        notes = COALESCE(EXCLUDED.notes, daily_logs.notes),
        updated_at = NOW();
    
    -- Auto-complete tasks based on data
    
    -- Get task IDs for auto-completion
    SELECT id INTO v_protein_task_id FROM tasks WHERE name = 'Protein Goal Met' LIMIT 1;
    SELECT id INTO v_steps_task_id FROM tasks WHERE name = '10k Steps Done' LIMIT 1;
    SELECT id INTO v_workout_task_id FROM tasks WHERE name = 'Workout Completed' LIMIT 1;
    SELECT id INTO v_calories_task_id FROM tasks WHERE name = 'Calorie Deficit Maintained' LIMIT 1;
    
    -- Auto-complete protein goal (assuming 100g+ is goal)
    IF p_protein IS NOT NULL AND p_protein >= 100 AND v_protein_task_id IS NOT NULL THEN
        PERFORM complete_task(p_user_id, v_protein_task_id, p_log_date);
        v_tasks_auto_completed := v_tasks_auto_completed || json_build_object('task', 'Protein Goal Met', 'auto_completed', true);
    END IF;
    
    -- Auto-complete steps goal (10k steps)
    IF p_steps IS NOT NULL AND p_steps >= 10000 AND v_steps_task_id IS NOT NULL THEN
        PERFORM complete_task(p_user_id, v_steps_task_id, p_log_date);
        v_tasks_auto_completed := v_tasks_auto_completed || json_build_object('task', '10k Steps Done', 'auto_completed', true);
    END IF;
    
    -- Auto-complete workout
    IF p_workout_done = true AND v_workout_task_id IS NOT NULL THEN
        PERFORM complete_task(p_user_id, v_workout_task_id, p_log_date);
        v_tasks_auto_completed := v_tasks_auto_completed || json_build_object('task', 'Workout Completed', 'auto_completed', true);
    END IF;
    
    -- Auto-complete calorie deficit (assuming <2000 calories is deficit)
    IF p_calories IS NOT NULL AND p_calories < 2000 AND v_calories_task_id IS NOT NULL THEN
        PERFORM complete_task(p_user_id, v_calories_task_id, p_log_date);
        v_tasks_auto_completed := v_tasks_auto_completed || json_build_object('task', 'Calorie Deficit Maintained', 'auto_completed', true);
    END IF;
    
    -- Check phase progress
    PERFORM check_phase_progress(p_user_id);
    
    RETURN json_build_object(
        'success', true,
        'message', 'Daily data logged successfully',
        'auto_completed_tasks', v_tasks_auto_completed
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. DASHBOARD DATA FUNCTIONS
-- ========================================

-- Get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_current_phase phases%ROWTYPE;
    v_today_tasks JSON;
    v_weekly_progress JSON;
    v_recent_weight_logs JSON;
    v_today_summary JSON;
BEGIN
    -- Get profile data
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
    
    -- Get current phase
    SELECT * INTO v_current_phase 
    FROM phases 
    WHERE id = v_profile.current_phase_id;
    
    -- Get today's tasks
    SELECT json_agg(
        json_build_object(
            'id', t.id,
            'name', t.name,
            'xp_reward', t.xp_reward,
            'type', t.type,
            'is_required', t.is_required,
            'completed', COALESCE(tc.completed, false),
            'completion_id', tc.id
        )
    ) INTO v_today_tasks
    FROM tasks t
    LEFT JOIN task_completions tc ON t.id = tc.task_id 
        AND tc.user_id = p_user_id 
        AND tc.date = CURRENT_DATE;
    
    -- Get weekly progress (last 7 days)
    SELECT json_agg(
        json_build_object(
            'date', date,
            'completed_tasks', completed_count,
            'total_tasks', total_count
        )
    ) INTO v_weekly_progress
    FROM (
        SELECT 
            dl.date,
            COUNT(tc.id) FILTER (WHERE tc.completed = true) as completed_count,
            COUNT(t.id) as total_count
        FROM daily_logs dl
        LEFT JOIN task_completions tc ON dl.user_id = tc.user_id AND dl.date = tc.date
        LEFT JOIN tasks t ON tc.task_id = t.id
        WHERE dl.user_id = p_user_id 
            AND dl.date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY dl.date
        ORDER BY dl.date
    ) weekly_data;
    
    -- Get recent weight logs
    SELECT json_agg(
        json_build_object(
            'date', date,
            'weight', weight
        )
    ) INTO v_recent_weight_logs
    FROM weight_logs
    WHERE user_id = p_user_id
        AND date >= CURRENT_DATE - INTERVAL '30 days'
        AND weight IS NOT NULL
    ORDER BY date DESC
    LIMIT 10;
    
    -- Get today's summary data
    SELECT json_build_object(
        'calories', dl.calories,
        'protein', dl.protein,
        'steps', dl.steps
    ) INTO v_today_summary
    FROM daily_logs dl
    WHERE dl.user_id = p_user_id AND dl.date = CURRENT_DATE;
    
    RETURN json_build_object(
        'profile', json_build_object(
            'xp', COALESCE(v_profile.xp, 0),
            'level', COALESCE(v_profile.level, 1),
            'streak', COALESCE(v_profile.streak, 0),
            'weight', v_profile.weight,
            'target_weight', v_profile.target_weight
        ),
        'current_phase', v_current_phase,
        'today_tasks', COALESCE(v_today_tasks, '[]'::JSON),
        'weekly_progress', COALESCE(v_weekly_progress, '[]'::JSON),
        'recent_weight_logs', COALESCE(v_recent_weight_logs, '[]'::JSON),
        'today_summary', v_today_summary
    );
END;
$$ LANGUAGE plpgsql;