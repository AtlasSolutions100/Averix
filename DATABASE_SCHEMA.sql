-- Averix Database Schema
-- This file documents the database schema for the Averix platform
-- These tables should be created in your Supabase dashboard

-- ============================================================================
-- IMPORTANT: Execute these SQL commands in your Supabase SQL Editor
-- Located at: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: offices
-- Represents Cydcor offices using the application
-- ============================================================================
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: stores
-- Retail locations where reps work (Best Buy, Target, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL, -- 'Best Buy', 'Target', etc.
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: users (extends Supabase auth.users)
-- User profile information stored in public schema
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'rep', 'cydcor')),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: daily_entries
-- Daily LOA metrics submitted by reps
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Date and time
  entry_date DATE NOT NULL,
  hours_worked DECIMAL(4,2),
  
  -- LOA Funnel Metrics
  stops INTEGER DEFAULT 0,
  contacts INTEGER DEFAULT 0,
  presentations INTEGER DEFAULT 0,
  address_checks INTEGER DEFAULT 0,
  credit_checks INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  
  -- Financial
  revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one entry per user per day per store
  UNIQUE(user_id, entry_date, store_id)
);

-- ============================================================================
-- TABLE: rep_store_assignments
-- Track which reps are assigned to which stores
-- ============================================================================
CREATE TABLE IF NOT EXISTS rep_store_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: goals
-- Performance goals for reps
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('sales', 'revenue', 'contacts', 'presentations')),
  target_value DECIMAL(10,2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_entries_office_date ON daily_entries(office_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_entries_store_date ON daily_entries(store_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_stores_office ON stores(office_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_office ON user_profiles(office_id);
CREATE INDEX IF NOT EXISTS idx_rep_store_assignments_user ON rep_store_assignments(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_store_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Offices: Owners and Cydcor admins can see their office
CREATE POLICY "Users can view their own office"
  ON offices FOR SELECT
  USING (
    id IN (
      SELECT office_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- User Profiles: Users can view profiles in their office
CREATE POLICY "Users can view profiles in their office"
  ON user_profiles FOR SELECT
  USING (
    office_id IN (
      SELECT office_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- User Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Stores: Users can view stores in their office
CREATE POLICY "Users can view stores in their office"
  ON stores FOR SELECT
  USING (
    office_id IN (
      SELECT office_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Daily Entries: Reps can insert their own entries
CREATE POLICY "Reps can insert own entries"
  ON daily_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Daily Entries: Reps can view own entries, owners can view all in office
CREATE POLICY "Users can view daily entries"
  ON daily_entries FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    office_id IN (
      SELECT office_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'cydcor')
    )
  );

-- Daily Entries: Reps can update own entries
CREATE POLICY "Reps can update own entries"
  ON daily_entries FOR UPDATE
  USING (user_id = auth.uid());

-- Goals: Users can manage their own goals
CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- SEED DATA (for development/testing)
-- ============================================================================

-- Insert sample office
INSERT INTO offices (id, name, location) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Olympus Marketing Group', 'Phoenix, AZ')
ON CONFLICT DO NOTHING;

-- Insert sample stores
INSERT INTO stores (office_id, name, brand, location) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Best Buy NFW', 'Best Buy', 'North Fort Worth'),
  ('00000000-0000-0000-0000-000000000001', 'Best Buy SFW', 'Best Buy', 'South Fort Worth'),
  ('00000000-0000-0000-0000-000000000001', 'Target Arlington', 'Target', 'Arlington'),
  ('00000000-0000-0000-0000-000000000001', 'Target Terhama', 'Target', 'Terhama')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_offices_updated_at BEFORE UPDATE ON offices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
