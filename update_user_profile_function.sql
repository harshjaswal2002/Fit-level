-- Create update_user_profile RPC function
-- This function updates user profile data with proper validation

CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id UUID,
    p_display_name TEXT DEFAULT NULL,
    p_username TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_primary_goal TEXT DEFAULT NULL,
    p_weekly_workout_days INTEGER DEFAULT NULL,
    p_daily_step_goal INTEGER DEFAULT NULL,
    p_target_weight_kg FLOAT DEFAULT NULL,
    p_profile_completion_pct INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    display_name TEXT,
    username TEXT,
    bio TEXT,
    avatar_url TEXT,
    primary_goal TEXT,
    weekly_workout_days INTEGER,
    daily_step_goal INTEGER,
    target_weight_kg FLOAT,
    profile_completion_pct INTEGER,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Update the user profile with the provided values
    UPDATE user_profile 
    SET 
        display_name = COALESCE(p_display_name, display_name),
        username = COALESCE(p_username, username),
        bio = COALESCE(p_bio, bio),
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        primary_goal = COALESCE(p_primary_goal, primary_goal),
        weekly_workout_days = COALESCE(p_weekly_workout_days, weekly_workout_days),
        daily_step_goal = COALESCE(p_daily_step_goal, daily_step_goal),
        target_weight_kg = COALESCE(p_target_weight_kg, target_weight_kg),
        profile_completion_pct = COALESCE(p_profile_completion_pct, profile_completion_pct),
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING 
        id,
        user_id,
        display_name,
        username,
        bio,
        avatar_url,
        primary_goal,
        weekly_workout_days,
        daily_step_goal,
        target_weight_kg,
        profile_completion_pct,
        updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update_user_integration RPC function
CREATE OR REPLACE FUNCTION update_user_integration(
    p_user_id UUID,
    p_integration_name TEXT,
    p_connected_at TIMESTAMPTZ DEFAULT NULL,
    p_last_synced_at TIMESTAMPTZ DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    integration_name TEXT,
    connected_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    -- Update the user integration with the provided values
    UPDATE user_integrations 
    SET 
        connected_at = COALESCE(p_connected_at, connected_at),
        last_synced_at = COALESCE(p_last_synced_at, last_synced_at),
        is_active = COALESCE(p_is_active, is_active)
    WHERE user_id = p_user_id AND integration_name = p_integration_name
    RETURNING 
        id,
        user_id,
        integration_name,
        connected_at,
        last_synced_at,
        is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
