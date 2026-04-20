# Database Setup Guide

## Required Setup Steps

To make the CutQuest app fully functional, you need to set up the database schema and functions in your Supabase project.

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Update Environment Variables

Update the following files with your Supabase credentials:

**`mobile/src/lib/supabase.ts`:**
```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Execute Database Setup

Execute these SQL files in order in your Supabase SQL Editor:

1. **schema.sql** - Creates tables, indexes, and RLS policies
2. **functions.sql** - Creates core business logic functions  
3. **seed_data.sql** - Inserts initial data (phases, tasks, rewards)

### 4. Enable Extensions

In your Supabase project settings, enable:
- `uuid-ossp` extension
- Row Level Security (RLS)

### 5. Test the Setup

After setup, the app should:
- Allow user registration/login
- Load dashboard data
- Display tasks and progress

## Troubleshooting

**Error: "Database functions not set up"**
- Run the SQL files in the correct order
- Check that all functions were created successfully

**Error: "Permission denied"**
- Ensure RLS policies are correctly configured
- Check that your anon key has proper permissions

## Current Status

✅ App structure fixed
✅ Authentication integration working
⚠️ Database setup required for full functionality

The app will show fallback data until database is properly set up.
