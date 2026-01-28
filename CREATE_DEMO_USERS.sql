-- ============================================================================
-- CREATE DEMO USERS FOR AVERIX
-- ============================================================================
-- IMPORTANT: Run this AFTER you've run DATABASE_SCHEMA.sql
-- This creates demo users that you can use to test the application
-- ============================================================================

-- Note: To create auth users, you need to use the Supabase dashboard
-- This script only creates the user profiles AFTER you've created the auth users

-- ============================================================================
-- STEP 1: Create Auth Users (Do this in Supabase Dashboard)
-- ============================================================================
-- Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/auth/users
-- Click "Add user" → "Create new user"
-- 
-- Create these users:
-- 1. Email: owner@olympus.com, Password: demo
-- 2. Email: jake@olympus.com, Password: demo
-- 3. Email: sarah@olympus.com, Password: demo
-- 4. Email: mike@olympus.com, Password: demo
-- 
-- After creating each user, copy their User ID (UUID)
-- ============================================================================

-- ============================================================================
-- STEP 2: Run This SQL (Replace UUIDs with actual User IDs from Step 1)
-- ============================================================================

-- Insert Owner Profile
-- REPLACE 'OWNER_USER_ID_HERE' with the actual UUID from Supabase Auth for owner@olympus.com
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'OWNER_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'owner@olympus.com',
  'Alex Thompson',
  'owner',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Rep #1 (Jake)
-- REPLACE 'JAKE_USER_ID_HERE' with the actual UUID from Supabase Auth for jake@olympus.com
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'JAKE_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'jake@olympus.com',
  'Jake Morrison',
  'rep',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Rep #2 (Sarah)
-- REPLACE 'SARAH_USER_ID_HERE' with the actual UUID from Supabase Auth for sarah@olympus.com
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'SARAH_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'sarah@olympus.com',
  'Sarah Chen',
  'rep',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Rep #3 (Mike)
-- REPLACE 'MIKE_USER_ID_HERE' with the actual UUID from Supabase Auth for mike@olympus.com
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'MIKE_USER_ID_HERE',  -- ⚠️ REPLACE THIS
  'mike@olympus.com',
  'Mike Rodriguez',
  'rep',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Verify the demo users were created
-- ============================================================================
SELECT 
  id,
  email,
  name,
  role
FROM user_profiles
WHERE email IN ('owner@olympus.com', 'jake@olympus.com', 'sarah@olympus.com', 'mike@olympus.com');
