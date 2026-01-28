# ⚡ INSTANT FIX: "Failed to fetch user" Error

## The Problem

You clicked a demo login button and saw:
```
❌ Error: Failed to fetch user
```

## The Solution (2 minutes)

### What happened:
- ✅ User exists in Supabase Auth (login worked)
- ❌ User profile missing from database (fetch failed)

### How to fix:

#### Step 1: Get the User ID
1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/auth/users
2. Find the user you tried to login as
3. Copy their **User ID** (the UUID)

#### Step 2: Create the Profile
1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql
2. Paste this SQL (replace the UUID):

**For owner@olympus.com:**
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'PASTE_USER_ID_HERE',
  'owner@olympus.com',
  'Alex Thompson',
  'owner',
  '00000000-0000-0000-0000-000000000001'
);
```

**For jake@olympus.com:**
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'PASTE_USER_ID_HERE',
  'jake@olympus.com',
  'Jake Morrison',
  'rep',
  '00000000-0000-0000-0000-000000000001'
);
```

3. Click **"Run"**

#### Step 3: Try Login Again
- Go back to your app
- Click the demo login button
- Should work now! 🎉

---

## Visual Example

Let's say you created `owner@olympus.com` and Supabase shows:

```
Users
┌──────────────────────────────────────┬──────────────────────┬─────────┐
│ User ID                              │ Email                │ Created │
├──────────────────────────────────────┼──────────────────────┼─────────┤
│ a7f8b2c1-3456-789a-bcde-f0123456789a │ owner@olympus.com    │ 2 min   │
└──────────────────────────────────────┴──────────────────────┴─────────┘
```

Your SQL becomes:
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'a7f8b2c1-3456-789a-bcde-f0123456789a',  -- ← Copied from above
  'owner@olympus.com',
  'Alex Thompson',
  'owner',
  '00000000-0000-0000-0000-000000000001'
);
```

---

## Still Not Working?

### Error: "relation 'user_profiles' does not exist"
→ You haven't created the database tables yet
→ See: [HOW_TO_RUN_SQL.md](./HOW_TO_RUN_SQL.md)

### Error: "foreign key violation"
→ The office doesn't exist
→ Run the full `DATABASE_SCHEMA.sql` first

### Error: "duplicate key value"
→ Profile already exists!
→ Try logging in - it should work now

---

## Why This Happens

Averix uses **two systems** for users:

1. **Supabase Auth** = Login/password system
   - Created when you click "Add user" in Supabase dashboard
   - Handles authentication

2. **User Profiles Table** = Your app's user data
   - Created with SQL INSERT
   - Stores name, role, office, etc.

You created #1 but forgot #2. Now you're creating #2! 🎯

---

## Need More Help?

- [QUICK_START.md](./QUICK_START.md) - Full setup guide
- [SQL_CHEAT_SHEET.md](./SQL_CHEAT_SHEET.md) - All SQL commands
- [START_HERE.md](./START_HERE.md) - Setup overview
