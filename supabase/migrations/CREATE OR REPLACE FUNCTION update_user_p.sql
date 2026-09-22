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
    id UUID, user_id UUID, display_name TEXT, username TEXT, bio TEXT,
    avatar_url TEXT, primary_goal TEXT, weekly_workout_days INTEGER,
    daily_step_goal INTEGER, target_weight_kg FLOAT,
    profile_completion_pct INTEGER, updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    UPDATE user_profile up
    SET display_name = COALESCE(p_display_name, up.display_name),
        username = COALESCE(p_username, up.username),
        bio = COALESCE(p_bio, up.bio),
        avatar_url = COALESCE(p_avatar_url, up.avatar_url),
        primary_goal = COALESCE(p_primary_goal, up.primary_goal),
        weekly_workout_days = COALESCE(p_weekly_workout_days, up.weekly_workout_days),
        daily_step_goal = COALESCE(p_daily_step_goal, up.daily_step_goal),
        target_weight_kg = COALESCE(p_target_weight_kg, up.target_weight_kg),
        profile_completion_pct = COALESCE(p_profile_completion_pct, up.profile_completion_pct),
        updated_at = NOW()
    WHERE up.user_id = p_user_id
    RETURNING up.id, up.user_id, up.display_name, up.username, up.bio,
        up.avatar_url, up.primary_goal, up.weekly_workout_days, up.daily_step_goal,
        up.target_weight_kg, up.profile_completion_pct, up.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_integration(
    p_user_id UUID,
    p_integration_name TEXT,
    p_connected_at TIMESTAMPTZ DEFAULT NULL,
    p_last_synced_at TIMESTAMPTZ DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID, user_id UUID, integration_name TEXT,
    connected_at TIMESTAMPTZ, last_synced_at TIMESTAMPTZ, is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    UPDATE user_integrations ui
    SET connected_at = COALESCE(p_connected_at, ui.connected_at),
        last_synced_at = COALESCE(p_last_synced_at, ui.last_synced_at),
        is_active = COALESCE(p_is_active, ui.is_active)
    WHERE ui.user_id = p_user_id AND ui.integration_name = p_integration_name
    RETURNING ui.id, ui.user_id, ui.integration_name, ui.connected_at, ui.last_synced_at, ui.is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;