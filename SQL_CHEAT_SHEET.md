# 📋 SQL Cheat Sheet - Copy & Paste Commands

## Quick Reference for Setting Up Averix

---

## 1️⃣ Create Database Tables

**Go to:** https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql

**Copy from:** `/DATABASE_SCHEMA.sql` (entire file)

**What it does:** Creates all tables, indexes, RLS policies, and sample data

---

## 2️⃣ Create Demo User Profiles

**Important:** First create the auth users in the Supabase dashboard, THEN run these SQL commands.

### A. Create Owner Profile

```sql
-- Replace YOUR_OWNER_USER_ID with the actual UUID from Supabase Auth Users
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'YOUR_OWNER_USER_ID',
  'owner@olympus.com',
  'Alex Thompson',
  'owner',
  '00000000-0000-0000-0000-000000000001'
);
```

### B. Create Rep Profile (Jake)

```sql
-- Replace YOUR_JAKE_USER_ID with the actual UUID from Supabase Auth Users
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'YOUR_JAKE_USER_ID',
  'jake@olympus.com',
  'Jake Morrison',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

### C. Create Rep Profile (Sarah)

```sql
-- Replace YOUR_SARAH_USER_ID with the actual UUID from Supabase Auth Users
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'YOUR_SARAH_USER_ID',
  'sarah@olympus.com',
  'Sarah Chen',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

### D. Create Rep Profile (Mike)

```sql
-- Replace YOUR_MIKE_USER_ID with the actual UUID from Supabase Auth Users
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'YOUR_MIKE_USER_ID',
  'mike@olympus.com',
  'Mike Rodriguez',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

---

## 3️⃣ Verify Setup

```sql
-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check that office exists
SELECT * FROM offices;

-- Check that stores exist
SELECT * FROM stores;

-- Check that user profiles were created
SELECT id, email, name, role 
FROM user_profiles;
```

---

## 🔍 Quick Checks

### View all users and their roles
```sql
SELECT 
  up.email,
  up.name,
  up.role,
  o.name as office_name
FROM user_profiles up
LEFT JOIN offices o ON up.office_id = o.id;
```

### View all stores
```sql
SELECT 
  s.name,
  s.brand,
  s.location,
  o.name as office_name
FROM stores s
LEFT JOIN offices o ON s.office_id = o.id;
```

### Check if a user exists in both Auth and Profiles
```sql
-- First check Auth users at:
-- https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/auth/users

-- Then check profiles:
SELECT * FROM user_profiles WHERE email = 'owner@olympus.com';
```

---

## 🚨 Common Issues

### "relation does not exist"
→ Run `DATABASE_SCHEMA.sql` first

### "duplicate key value"
→ User profile already exists, try logging in

### "foreign key violation"
→ Office doesn't exist, run `DATABASE_SCHEMA.sql` first

### "null value in column 'office_id'"
→ Make sure office_id is: `00000000-0000-0000-0000-000000000001`

---

## 💡 Pro Tips

1. **Always create Auth users first** in the Supabase dashboard
2. **Copy the User IDs** immediately after creating each auth user
3. **Run profile INSERTs one at a time** to catch errors easily
4. **Check your work** with the verify queries above

---

## 🔗 Full Guides

- [START_HERE.md](./START_HERE.md) - Overview
- [QUICK_START.md](./QUICK_START.md) - Step-by-step
- [TROUBLESHOOTING_FAILED_TO_FETCH_USER.md](./TROUBLESHOOTING_FAILED_TO_FETCH_USER.md) - Error fixes
