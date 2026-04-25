-- CutQuest Seed Data
-- This file contains all the initial seed data for the CutQuest app

-- ========================================
-- 1. PHASES SEED DATA
-- ========================================

-- Insert fitness phases
INSERT INTO phases (id, name, duration_days, description, order_index) VALUES
(
    gen_random_uuid(),
    'Aggressive Cut',
    30,
    'Intense fat loss phase with strict calorie deficit and high protein intake. Focus on rapid weight loss while preserving muscle mass.',
    1
),
(
    gen_random_uuid(),
    'Controlled Cut',
    60,
    'Moderate fat loss phase with sustainable calorie deficit. Balanced approach to steady weight loss and improved body composition.',
    2
),
(
    gen_random_uuid(),
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
    gen_random_uuid(),
    'Workout Completed',
    50,
    'workout',
    true
),
(
    gen_random_uuid(),
    'Cardio Session',
    30,
    'workout',
    false
),
(
    gen_random_uuid(),
    'Stretching/Mobility',
    20,
    'workout',
    false
),

-- Diet tasks
(
    gen_random_uuid(),
    'Protein Goal Met',
    40,
    'diet',
    true
),
(
    gen_random_uuid(),
    'Calorie Deficit Maintained',
    40,
    'diet',
    true
),
(
    gen_random_uuid(),
    'No Junk Food',
    20,
    'diet',
    false
),
(
    gen_random_uuid(),
    'Ate Vegetables',
    15,
    'diet',
    false
),
(
    gen_random_uuid(),
    'Drank 8 Glasses of Water',
    25,
    'diet',
    false
),

-- Steps tasks
(
    gen_random_uuid(),
    '10k Steps Done',
    30,
    'steps',
    true
),
(
    gen_random_uuid(),
    '15k Steps Done',
    45,
    'steps',
    false
),

-- Habit tasks
(
    gen_random_uuid(),
    'Slept 7+ Hours',
    35,
    'habit',
    false
),
(
    gen_random_uuid(),
    'Meditated 10+ Minutes',
    25,
    'habit',
    false
),
(
    gen_random_uuid(),
    'No Late Night Snacking',
    20,
    'habit',
    false
),
(
    gen_random_uuid(),
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
    gen_random_uuid(),
    'Cheat Meal',
    500,
    'Enjoy one guilt-free meal of your choice. Perfect for satisfying cravings while staying on track.'
),
(
    gen_random_uuid(),
    'Cheat Day',
    1200,
    'Take a full day off from tracking and enjoy your favorite foods guilt-free.'
),
(
    gen_random_uuid(),
    'Rest Day Pass',
    300,
    'Skip all required tasks for one day without breaking your streak.'
),
(
    gen_random_uuid(),
    'Protein Shake Bonus',
    150,
    'Extra 50 XP for meeting your protein goal 3 days in a row.'
),
(
    gen_random_uuid(),
    'Workout Gear Credit',
    2000,
    'Redeem for $25 credit toward workout gear or supplements.'
),
(
    gen_random_uuid(),
    'Meal Planning Service',
    1500,
    'Get a personalized meal plan for your current phase.'
),
(
    gen_random_uuid(),
    'Personal Training Session',
    3000,
    'One-on-one coaching session with a certified trainer.'
),
(
    gen_random_uuid(),
    'Fitness Tracker',
    5000,
    'Redeem for a fitness tracking device to monitor your progress.'
);