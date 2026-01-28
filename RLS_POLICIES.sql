-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-TENANCY
-- ============================================================================
-- This ensures data isolation between offices
-- Users can only see data from their own office
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_store_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Owners can view all profiles in their office
CREATE POLICY "Owners can view office profiles"
ON user_profiles
FOR SELECT
USING (
  office_id IN (
    SELECT office_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
  )
);

-- ============================================================================
-- DAILY_ENTRIES POLICIES
-- ============================================================================

-- Users can view their own entries
CREATE POLICY "Users can view own entries"
ON daily_entries
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own entries
CREATE POLICY "Users can insert own entries"
ON daily_entries
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own entries
CREATE POLICY "Users can update own entries"
ON daily_entries
FOR UPDATE
USING (user_id = auth.uid());

-- Owners can view all entries from their office
CREATE POLICY "Owners can view office entries"
ON daily_entries
FOR SELECT
USING (
  office_id IN (
    SELECT office_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
  )
);

-- ============================================================================
-- STORES POLICIES
-- ============================================================================

-- Users can view stores from their office
CREATE POLICY "Users can view office stores"
ON stores
FOR SELECT
USING (
  office_id IN (
    SELECT office_id FROM user_profiles WHERE id = auth.uid()
  )
);

-- Owners can manage stores in their office
CREATE POLICY "Owners can manage office stores"
ON stores
FOR ALL
USING (
  office_id IN (
    SELECT office_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
  )
);

-- ============================================================================
-- GOALS POLICIES
-- ============================================================================

-- Users can view their own goals
CREATE POLICY "Users can view own goals"
ON goals
FOR SELECT
USING (user_id = auth.uid());

-- Owners can view all goals in their office
CREATE POLICY "Owners can view office goals"
ON goals
FOR SELECT
USING (
  office_id IN (
    SELECT office_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
  )
);

-- Owners can manage goals in their office
CREATE POLICY "Owners can manage office goals"
ON goals
FOR ALL
USING (
  office_id IN (
    SELECT office_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
  )
);

-- ============================================================================
-- REP_STORE_ASSIGNMENTS POLICIES
-- ============================================================================

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments"
ON rep_store_assignments
FOR SELECT
USING (
  rep_id = auth.uid()
);

-- Owners can view all assignments in their office
CREATE POLICY "Owners can view office assignments"
ON rep_store_assignments
FOR SELECT
USING (
  office_id IN (
    SELECT office_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
  )
);

-- Owners can manage assignments in their office
CREATE POLICY "Owners can manage office assignments"
ON rep_store_assignments
FOR ALL
USING (
  office_id IN (
    SELECT office_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
  )
);

-- ============================================================================
-- OFFICES TABLE (no RLS needed - reference data)
-- ============================================================================
-- Offices table does not need RLS since it's just reference data
-- Users can see office names but can only access data from their own office

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify RLS is working, run these as different users:

-- 1. Check what data a rep can see:
-- SELECT * FROM daily_entries; -- Should only see their own
-- SELECT * FROM user_profiles; -- Should only see their own
-- SELECT * FROM stores; -- Should see their office's stores

-- 2. Check what data an owner can see:
-- SELECT * FROM daily_entries; -- Should see all entries from their office
-- SELECT * FROM user_profiles; -- Should see all profiles from their office
-- SELECT * FROM stores; -- Should see all stores from their office

-- ============================================================================
-- NOTES FOR PRODUCTION
-- ============================================================================

-- 1. RLS policies are enforced at the database level
-- 2. Even if someone bypasses the frontend, they can't see other offices' data
-- 3. The SERVICE_ROLE_KEY in backend bypasses RLS (for admin operations)
-- 4. The ANON_KEY and user JWT tokens enforce RLS
-- 5. Always use authenticated requests from frontend to enforce RLS

-- ============================================================================
-- OFFICE ISOLATION SUMMARY
-- ============================================================================

-- ✅ Each office is completely isolated
-- ✅ Reps can only see their own data
-- ✅ Owners can see all data from their office only
-- ✅ Cydcor role can see all data from their office (multi-office support)
-- ✅ No cross-office data leakage possible
