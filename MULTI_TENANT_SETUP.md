# Veridex Multi-Tenant Data Structure

## Overview
Veridex is a multi-tenant application where each office operates independently with complete data isolation.

## Database Tables

### 1. **offices** - Office/Location Information
```sql
CREATE TABLE offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **user_profiles** - User Authentication & Profile
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'rep', 'cydcor')),
  office_id UUID NOT NULL REFERENCES offices(id),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **stores** - Retail Locations
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_id UUID NOT NULL REFERENCES offices(id),
  name TEXT NOT NULL,
  brand TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. **daily_entries** - Daily Performance Tracking
```sql
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  office_id UUID NOT NULL REFERENCES offices(id),
  store_id UUID NOT NULL REFERENCES stores(id),
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
  UNIQUE(user_id, entry_date, store_id)
);
```

### 5. **kv_store_45dc47a9** - Key-Value Store for Goals & Settings
This is a flexible table for storing JSON data like goals:
```sql
CREATE TABLE kv_store_45dc47a9 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Patterns:**
- `goals_array:{officeId}` - Array of goals for an office
  ```json
  [
    {
      "id": "goal_12345",
      "officeId": "uuid",
      "repId": "uuid-or-null-for-office-wide",
      "metric": "sales|contacts|revenue",
      "target": 100,
      "current": 45,
      "period": "daily|weekly|monthly",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
  ```

## Data Isolation Rules

### By Office (`office_id`)
All queries MUST filter by `office_id` to ensure data isolation:

1. **Owners** can only see data for their `office_id`
2. **Reps** can only see data for their `office_id` 
3. **Cydcor Admins** can see all data across offices (future feature)

### Backend Enforcement
The backend automatically enforces isolation by:
1. Looking up the user's `office_id` from their profile
2. Filtering all queries by that `office_id`
3. Verifying permissions before allowing modifications

## Demo Data Setup

### Initial Offices
```sql
INSERT INTO offices (name) VALUES 
  ('Los Angeles HQ'),
  ('San Diego Branch'),
  ('Phoenix Office');
```

### Demo Users
```sql
-- LA Office Owner
INSERT INTO user_profiles (id, email, name, role, office_id) VALUES
  ('owner-la-uuid', 'owner@la.veridex.com', 'Maria Garcia', 'owner', 'la-office-uuid');

-- LA Office Reps
INSERT INTO user_profiles (id, email, name, role, office_id) VALUES
  ('rep1-la-uuid', 'rep1@la.veridex.com', 'John Smith', 'rep', 'la-office-uuid'),
  ('rep2-la-uuid', 'rep2@la.veridex.com', 'Sarah Johnson', 'rep', 'la-office-uuid');

-- SD Office Owner & Reps
INSERT INTO user_profiles (id, email, name, role, office_id) VALUES
  ('owner-sd-uuid', 'owner@sd.veridex.com', 'Mike Chen', 'owner', 'sd-office-uuid'),
  ('rep1-sd-uuid', 'rep1@sd.veridex.com', 'Lisa Martinez', 'rep', 'sd-office-uuid');
```

### Demo Stores
```sql
-- LA Office Stores
INSERT INTO stores (office_id, name, brand, location) VALUES
  ('la-office-uuid', 'Best Buy Westwood', 'Best Buy', 'Westwood, CA'),
  ('la-office-uuid', 'Target Santa Monica', 'Target', 'Santa Monica, CA');

-- SD Office Stores
INSERT INTO stores (office_id, name, brand, location) VALUES
  ('sd-office-uuid', 'Costco Mission Valley', 'Costco', 'Mission Valley, CA'),
  ('sd-office-uuid', 'Walmart Chula Vista', 'Walmart', 'Chula Vista, CA');
```

## Current Status

✅ **Working:**
- User authentication with Supabase
- Office-based data isolation in backend
- Daily entries properly scoped to office
- Store listings filtered by office
- Analytics filtered by office

⚠️ **Issues to Fix:**
1. Demo data is not properly isolated - all owners seeing same demo data
2. Need SQL setup script to create proper demo offices with isolated data
3. Goals system needs to properly scope to office_id
4. Need to verify user signup properly assigns office_id

## Next Steps

1. Create SQL setup script with proper demo data
2. Verify all API endpoints properly filter by office_id
3. Add ability for owners to create/manage their own reps
4. Add ability for owners to create/manage their own stores
5. Ensure goals are properly scoped to office
