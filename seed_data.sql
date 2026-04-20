-- CutQuest Seed Data
-- This file contains all the initial seed data for the CutQuest app

-- ========================================
-- 1. PHASES SEED DATA
-- ========================================

-- Insert fitness phases
INSERT INTO phases (id, name, duration_days, description, order_index) VALUES
(
    uuid_generate_v4(),
    'Aggressive Cut',
    30,
    'Intense fat loss phase with strict calorie deficit and high protein intake. Focus on rapid weight loss while preserving muscle mass.',
    1
),
(
    uuid_generate_v4(),
    'Controlled Cut',
    60,
    'Moderate fat loss phase with sustainable calorie deficit. Balanced approach to steady weight loss and improved body composition.',
    2
),
(
    uuid_generate_v4(),
    'Lean Build',
    90,
    'Muscle building phase with slight calorie surplus. Focus on strength gains and lean muscle development while minimizing fat gain.',
    3
);

-- ========================================
-- 2. TASKS SEED DATA
-- ========================================

-- Insert daily tasks
INSERT INTO tasks (id, name, xp_reward, type, is_required) VALUES
-- Workout tasks
(
    uuid_generate_v4(),
    'Workout Completed',
    50,
    'workout',
    true
),
(
    uuid_generate_v4(),
    'Cardio Session',
    30,
    'workout',
    false
),
(
    uuid_generate_v4(),
    'Stretching/Mobility',
    20,
    'workout',
    false
),

-- Diet tasks
(
    uuid_generate_v4(),
    'Protein Goal Met',
    40,
    'diet',
    true
),
(
    uuid_generate_v4(),
    'Calorie Deficit Maintained',
    40,
    'diet',
    true
),
(
    uuid_generate_v4(),
    'No Junk Food',
    20,
    'diet',
    false
),
(
    uuid_generate_v4(),
    'Ate Vegetables',
    15,
    'diet',
    false
),
(
    uuid_generate_v4(),
    'Drank 8 Glasses of Water',
    25,
    'diet',
    false
),

-- Steps tasks
(
    uuid_generate_v4(),
    '10k Steps Done',
    30,
    'steps',
    true
),
(
    uuid_generate_v4(),
    '15k Steps Done',
    45,
    'steps',
    false
),

-- Habit tasks
(
    uuid_generate_v4(),
    'Slept 7+ Hours',
    35,
    'habit',
    false
),
(
    uuid_generate_v4(),
    'Meditated 10+ Minutes',
    25,
    'habit',
    false
),
(
    uuid_generate_v4(),
    'No Late Night Snacking',
    20,
    'habit',
    false
),
(
    uuid_generate_v4(),
    'Tracked All Meals',
    30,
    'habit',
    false
);

-- ========================================
-- 3. REWARDS SEED DATA
-- ========================================

-- Insert rewards
INSERT INTO rewards (id, name, xp_cost, description) VALUES
(
    uuid_generate_v4(),
    'Cheat Meal',
    500,
    'Enjoy one guilt-free meal of your choice. Perfect for satisfying cravings while staying on track.'
),
(
    uuid_generate_v4(),
    'Cheat Day',
    1200,
    'Take a full day off from tracking and enjoy your favorite foods guilt-free.'
),
(
    uuid_generate_v4(),
    'Rest Day Pass',
    300,
    'Skip all required tasks for one day without breaking your streak.'
),
(
    uuid_generate_v4(),
    'Protein Shake Bonus',
    150,
    'Extra 50 XP for meeting your protein goal 3 days in a row.'
),
(
    uuid_generate_v4(),
    'Workout Gear Credit',
    2000,
    'Redeem for $25 credit toward workout gear or supplements.'
),
(
    uuid_generate_v4(),
    'Meal Planning Service',
    1500,
    'Get a personalized meal plan for your current phase.'
),
(
    uuid_generate_v4(),
    'Personal Training Session',
    3000,
    'One-on-one coaching session with a certified trainer.'
),
(
    uuid_generate_v4(),
    'Fitness Tracker',
    5000,
    'Redeem for a fitness tracking device to monitor your progress.'
);

-- ========================================
-- 4. SAMPLE USER PROFILE (Optional)
-- ========================================

-- This would typically be created when a user signs up
-- Example: INSERT INTO profiles (id, weight, target_weight, height, body_fat, current_phase_id)
-- VALUES (auth.uid(), 180.5, 165.0, 175, 18.5, (SELECT id FROM phases WHERE order_index = 1));

-- ========================================
-- 5. VERIFICATION QUERIES
-- ========================================

-- Verify seed data insertion
-- SELECT 'Phases inserted: ' || COUNT(*) FROM phases;
-- SELECT 'Tasks inserted: ' || COUNT(*) FROM tasks;
-- SELECT 'Rewards inserted: ' || COUNT(*) FROM rewards;

-- View all phases
-- SELECT * FROM phases ORDER BY order_index;

-- View all tasks grouped by type
-- SELECT type, COUNT(*) as task_count, SUM(xp_reward) as total_xp 
-- FROM tasks 
-- GROUP BY type 
-- ORDER BY type;

-- View all rewards ordered by XP cost
-- SELECT name, xp_cost, description 
-- FROM rewards 
-- ORDER BY xp_cost;
