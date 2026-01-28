# 🚀 Averix Quick Start Guide

## Get Your App Running in 5 Minutes

Follow these steps **in order** to set up your Averix dashboard with demo users.

---

## Step 1: Create Database Tables (2 minutes)

### 1.1 Open Supabase SQL Editor

Go to: **https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql**

### 1.2 Run the Schema

1. Open the file `/DATABASE_SCHEMA.sql` in your project
2. **Copy everything** from that file
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
5. ✅ You should see: **"Success. No rows returned"**

This creates all your tables: `offices`, `stores`, `user_profiles`, `daily_entries`, etc.

---

## Step 2: Create Demo Users (3 minutes)

### 2.1 Create Auth Users in Supabase Dashboard

Go to: **https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/auth/users**

Click **"Add user"** → **"Create new user"**

Create these 4 users one by one:

| Email | Password | Name |
|-------|----------|------|
| `owner@olympus.com` | `demo` | Alex Thompson |
| `jake@olympus.com` | `demo` | Jake Morrison |
| `sarah@olympus.com` | `demo` | Sarah Chen |
| `mike@olympus.com` | `demo` | Mike Rodriguez |

**Important:** After creating each user, **copy their User ID** (the UUID shown in the users table)

### 2.2 Create User Profiles

1. Go back to SQL Editor: **https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql**
2. Run these queries **one at a time**, replacing the UUIDs with the actual User IDs from step 2.1:

#### For Owner (Alex Thompson)
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'PASTE_OWNER_UUID_HERE',
  'owner@olympus.com',
  'Alex Thompson',
  'owner',
  '00000000-0000-0000-0000-000000000001'
);
```

#### For Rep Jake Morrison
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'PASTE_JAKE_UUID_HERE',
  'jake@olympus.com',
  'Jake Morrison',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

#### For Rep Sarah Chen
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'PASTE_SARAH_UUID_HERE',
  'sarah@olympus.com',
  'Sarah Chen',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

#### For Rep Mike Rodriguez
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'PASTE_MIKE_UUID_HERE',
  'mike@olympus.com',
  'Mike Rodriguez',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

---

## Step 3: Test Your Login! 🎉

Go back to your Averix app and try the demo login buttons:

- **Owner Dashboard**: `owner@olympus.com` / `demo`
- **Rep Dashboard**: `jake@olympus.com` / `demo`

---

## ✅ What You Just Created

- 🏢 **1 Office**: Olympus Marketing Group (Phoenix, AZ)
- 🏪 **4 Stores**: Best Buy NFW, Best Buy SFW, Target Arlington, Target Terhama
- 👤 **1 Owner**: Alex Thompson (full dashboard access)
- 👥 **3 Reps**: Jake, Sarah, Mike (can submit daily entries)

---

## 🆘 Troubleshooting

### "Invalid login credentials" error?
- Make sure you created the auth users in Step 2.1
- Double-check the password is exactly `demo` (lowercase)
- Verify the email matches exactly

### "Failed to fetch user" error?
- Make sure you ran the user profile INSERT queries in Step 2.2
- Check that you replaced the UUIDs with the actual User IDs from Supabase Auth

### Still having issues?
- Check the browser console for detailed error messages
- Verify all tables were created in Step 1
- Make sure the office ID `00000000-0000-0000-0000-000000000001` exists in the offices table

---

## 🎯 Next Steps

Once you're logged in:

1. **As Owner**: View office-wide analytics, rep leaderboard, and store performance
2. **As Rep**: Submit daily entries, view your stats, and track store history
3. **Add Real Data**: Start entering actual daily metrics
4. **Create More Users**: Use the signup flow or Supabase dashboard

Enjoy your Averix dashboard! 📊
