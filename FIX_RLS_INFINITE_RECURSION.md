# 🚨 Fix: Infinite Recursion in RLS Policy

## Problem
The `user_profiles` table has a Row Level Security (RLS) policy with infinite recursion. This happens when a policy references the same table it's protecting.

## Solution

You need to **disable or fix the RLS policies** on the `user_profiles` table.

### Option 1: Disable RLS (Recommended for Development)

Run this SQL in Supabase SQL Editor:

```sql
-- Disable RLS on user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

**When to use:** Development, prototyping, internal tools

### Option 2: Fix RLS Policies (For Production)

If you need RLS enabled, use these safe policies:

```sql
-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role to do everything (for backend)
CREATE POLICY "Service role has full access"
ON user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### Option 3: Disable RLS on All Tables (Quick Fix)

If you're experiencing RLS issues on multiple tables:

```sql
-- Disable RLS on all Averix tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE offices DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries DISABLE ROW LEVEL SECURITY;
```

## How to Run the SQL

1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/editor
2. Click "SQL Editor" in the left sidebar
3. Click "+ New Query"
4. Paste one of the SQL snippets above
5. Click "Run" (or press Ctrl/Cmd + Enter)

## Verify the Fix

After running the SQL:

1. Go back to Averix login page
2. Click "🔍 Debug Authentication Issues"
3. Click "Run Full Authentication Test"
4. Check Step 6 - it should no longer show the infinite recursion error

## Understanding the Issue

**What caused this:**
- RLS policies were likely auto-generated or copied from examples
- A policy tried to check permissions by querying the same table it protects
- This creates a circular reference: "To check if you can read user_profiles, I need to read user_profiles"

**Why disabling RLS works:**
- Our backend uses SERVICE_ROLE_KEY which bypasses RLS anyway
- For internal tools, RLS adds complexity without much security benefit
- Authentication is handled at the application level (not database level)

**When you need RLS:**
- Multi-tenant applications
- User-facing APIs
- Apps where users directly query the database

## Next Steps

After fixing RLS:
1. Deploy the Edge Function (see FIX_EDGE_FUNCTION_NOT_DEPLOYED.md)
2. Run the debug test again
3. Try logging in with demo accounts
