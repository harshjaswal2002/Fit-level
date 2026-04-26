# Profile Feature Database Setup

## Required Migration

The profile feature requires running the database migration to create the necessary tables. Please follow these steps:

### 1. Run the Migration

Execute the SQL migration file in your Supabase database:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manual SQL execution
# Copy the contents of: supabase/migrations/20260426120000_create_profile_tables.sql
# And run it in your Supabase SQL Editor
```

### 2. Tables Created

The migration creates these tables:
- `user_profile` - Main profile information
- `user_metrics` - Body metrics (weight, height, etc.)
- `user_preferences` - App preferences and settings
- `user_integrations` - Connected fitness apps

### 3. Functions Created

- `calculate_profile_completion()` - Calculates profile completion percentage
- `update_profile_completion()` - Trigger function for automatic updates

### 4. Verification

After running the migration, you can verify the tables exist by running:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'user_%'
ORDER BY table_name;
```

Expected output:
- user_integrations
- user_metrics  
- user_preferences
- user_profile

### 5. RLS Policies

All tables have Row Level Security (RLS) policies enabled, ensuring users can only access their own data.

## Migration File Location

The migration file is located at:
`supabase/migrations/20260426120000_create_profile_tables.sql`

## Troubleshooting

If you encounter the error `Could not find the table 'public.user_integrations'`, it means the migration hasn't been run yet.

After running the migration, the Profile feature should work correctly without database errors.
