-- ============================================================================
-- VERIDEX DATABASE SETUP SCRIPT
-- Multi-Tenant Sales Analytics Platform
-- ============================================================================
-- Run this script in your Supabase SQL Editor to set up the complete database
-- with proper demo data and data isolation
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Offices table
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'rep', 'cydcor')),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  stops INTEGER DEFAULT 0,
  contacts INTEGER DEFAULT 0,
  presentations INTEGER DEFAULT 0,
  address_checks INTEGER DEFAULT 0,
  credit_checks INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  revenue NUMERIC(10, 2) DEFAULT 0,
  hours_worked NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date, store_id)
);

-- Key-value store for goals and settings
CREATE TABLE IF NOT EXISTS kv_store_45dc47a9 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_office_id ON user_profiles(office_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_stores_office_id ON stores(office_id);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_office_id ON daily_entries(office_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_store_id ON daily_entries(store_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(entry_date);

-- ============================================================================
-- 3. CLEAR EXISTING DEMO DATA (Optional - uncomment to reset)
-- ============================================================================

-- DELETE FROM daily_entries;
-- DELETE FROM stores;
-- DELETE FROM user_profiles WHERE email LIKE '%demo%' OR email LIKE '%@veridex.test';
-- DELETE FROM offices WHERE name LIKE '%Demo%' OR name LIKE '%Test%';

-- ============================================================================
-- 4. CREATE DEMO OFFICES
-- ============================================================================

-- Insert demo offices
INSERT INTO offices (id, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Los Angeles HQ'),
  ('22222222-2222-2222-2222-222222222222', 'San Diego Branch')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. CREATE DEMO USERS (via Supabase Auth)
-- ============================================================================
-- NOTE: These users need to be created via Supabase Auth first
-- You can do this through the app's signup page or via the Supabase Dashboard
-- 
-- After creating auth users, insert their profiles here:
-- 
-- LA Office:
--   owner-la@veridex.test / password: demo123
--   rep1-la@veridex.test / password: demo123  
--   rep2-la@veridex.test / password: demo123
--
-- SD Office:
--   owner-sd@veridex.test / password: demo123
--   rep1-sd@veridex.test / password: demo123

-- User profiles will be automatically created during signup
-- Or you can manually insert them if you have the auth.users IDs:

-- Example (replace with actual UUIDs from auth.users):
-- INSERT INTO user_profiles (id, email, name, role, office_id) VALUES
--   ('auth-user-id-1', 'owner-la@veridex.test', 'Maria Garcia', 'owner', '11111111-1111-1111-1111-111111111111'),
--   ('auth-user-id-2', 'rep1-la@veridex.test', 'John Smith', 'rep', '11111111-1111-1111-1111-111111111111'),
--   ('auth-user-id-3', 'rep2-la@veridex.test', 'Sarah Johnson', 'rep', '11111111-1111-1111-1111-111111111111'),
--   ('auth-user-id-4', 'owner-sd@veridex.test', 'Mike Chen', 'owner', '22222222-2222-2222-2222-222222222222'),
--   ('auth-user-id-5', 'rep1-sd@veridex.test', 'Lisa Martinez', 'rep', '22222222-2222-2222-2222-222222222222')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. CREATE DEMO STORES
-- ============================================================================

-- LA Office Stores
INSERT INTO stores (office_id, name, brand, location, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Best Buy Westwood', 'Best Buy', 'Westwood, CA', true),
  ('11111111-1111-1111-1111-111111111111', 'Target Santa Monica', 'Target', 'Santa Monica, CA', true),
  ('11111111-1111-1111-1111-111111111111', 'Costco Marina Del Rey', 'Costco', 'Marina Del Rey, CA', true),
  ('11111111-1111-1111-1111-111111111111', 'Walmart Culver City', 'Walmart', 'Culver City, CA', true),
  ('11111111-1111-1111-1111-111111111111', 'Home Depot West LA', 'Home Depot', 'West Los Angeles, CA', true)
ON CONFLICT DO NOTHING;

-- SD Office Stores  
INSERT INTO stores (office_id, name, brand, location, is_active) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Costco Mission Valley', 'Costco', 'Mission Valley, CA', true),
  ('22222222-2222-2222-2222-222222222222', 'Walmart Chula Vista', 'Walmart', 'Chula Vista, CA', true),
  ('22222222-2222-2222-2222-222222222222', 'Best Buy Fashion Valley', 'Best Buy', 'Fashion Valley, CA', true),
  ('22222222-2222-2222-2222-222222222222', 'Target La Jolla', 'Target', 'La Jolla, CA', true),
  ('22222222-2222-2222-2222-222222222222', 'Home Depot Clairemont', 'Home Depot', 'Clairemont, CA', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. CREATE DEMO DAILY ENTRIES (after users are created)
-- ============================================================================
-- NOTE: Replace the user_id values with actual UUIDs from user_profiles
-- after creating the auth users above

-- Example daily entries for LA office
-- INSERT INTO daily_entries (user_id, office_id, store_id, entry_date, stops, contacts, presentations, sales, revenue) 
-- SELECT 
--   'rep1-la-user-id',
--   '11111111-1111-1111-1111-111111111111',
--   id,
--   CURRENT_DATE - (random() * 30)::int,
--   (random() * 50 + 20)::int,
--   (random() * 30 + 10)::int,
--   (random() * 15 + 5)::int,
--   (random() * 5)::int,
--   (random() * 500 + 100)::numeric(10,2)
-- FROM stores 
-- WHERE office_id = '11111111-1111-1111-1111-111111111111'
-- LIMIT 10;

-- ============================================================================
-- 8. CREATE TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_daily_entries_updated_at ON daily_entries;
CREATE TRIGGER update_daily_entries_updated_at 
  BEFORE UPDATE ON daily_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store_45dc47a9;
CREATE TRIGGER update_kv_store_updated_at 
  BEFORE UPDATE ON kv_store_45dc47a9 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) - Optional but Recommended
-- ============================================================================
-- Uncomment to enable RLS for additional security

-- Enable RLS
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
-- CREATE POLICY "Users can view their own profile" ON user_profiles
--   FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "Users can view profiles in their office" ON user_profiles
--   FOR SELECT USING (
--     office_id IN (
--       SELECT office_id FROM user_profiles WHERE id = auth.uid()
--     )
--   );

-- Policies for stores
-- CREATE POLICY "Users can view stores in their office" ON stores
--   FOR SELECT USING (
--     office_id IN (
--       SELECT office_id FROM user_profiles WHERE id = auth.uid()
--     )
--   );

-- Policies for daily_entries
-- CREATE POLICY "Users can view entries in their office" ON daily_entries
--   FOR SELECT USING (
--     office_id IN (
--       SELECT office_id FROM user_profiles WHERE id = auth.uid()
--     )
--   );

-- CREATE POLICY "Reps can insert their own entries" ON daily_entries
--   FOR INSERT WITH CHECK (user_id = auth.uid());

-- CREATE POLICY "Reps can update their own entries" ON daily_entries
--   FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- Check offices
SELECT * FROM offices ORDER BY name;

-- Check stores by office
SELECT o.name as office, COUNT(s.id) as store_count
FROM offices o
LEFT JOIN stores s ON s.office_id = o.id AND s.is_active = true
GROUP BY o.id, o.name
ORDER BY o.name;

-- Check users by office
SELECT o.name as office, COUNT(u.id) as user_count, 
       COUNT(CASE WHEN u.role = 'owner' THEN 1 END) as owners,
       COUNT(CASE WHEN u.role = 'rep' THEN 1 END) as reps
FROM offices o
LEFT JOIN user_profiles u ON u.office_id = o.id
GROUP BY o.id, o.name
ORDER BY o.name;

-- Check daily entries by office
SELECT o.name as office, COUNT(e.id) as entry_count
FROM offices o
LEFT JOIN daily_entries e ON e.office_id = o.id
GROUP BY o.id, o.name
ORDER BY o.name;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Create auth users through the Veridex signup page or Supabase dashboard
-- 2. Uncomment and run the demo data sections above
-- 3. Test data isolation by logging in as different office owners
-- ============================================================================
