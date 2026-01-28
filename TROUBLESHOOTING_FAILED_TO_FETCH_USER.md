# 🔧 Troubleshooting: "Failed to fetch user"

## What This Error Means

You're seeing **"Error: Failed to fetch user"** when clicking the demo login buttons.

This means:
- ✅ The demo user exists in Supabase Auth (they can login)
- ❌ The user profile doesn't exist in your database yet

---

## Quick Fix (2 minutes)

### Step 1: Find Your User ID

1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/auth/users
2. You should see your demo users listed
3. Click on the user (e.g., `owner@olympus.com`)
4. Copy their **User ID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Create User Profile

1. Go to SQL Editor: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql
2. Paste this SQL (replace `YOUR_USER_ID_HERE` with the actual ID from Step 1):

```sql
-- For Owner
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'YOUR_USER_ID_HERE',  -- ⚠️ REPLACE THIS with the User ID you copied
  'owner@olympus.com',
  'Alex Thompson',
  'owner',
  '00000000-0000-0000-0000-000000000001'
);
```

3. Click **"Run"**
4. Repeat for other demo users (jake@olympus.com, etc.)

---

## Complete Example

Let's say you created a user `owner@olympus.com` and Supabase gave it the ID:
```
a7f8b2c1-3456-789a-bcde-f0123456789a
```

Your SQL should look like:
```sql
INSERT INTO user_profiles (id, email, name, role, office_id)
VALUES (
  'a7f8b2c1-3456-789a-bcde-f0123456789a',  -- Actual ID
  'owner@olympus.com',
  'Alex Thompson',
  'owner',
  '00000000-0000-0000-0000-000000000001'
);
```

---

## Why Does This Happen?

Averix uses a **two-table authentication system**:

1. **Supabase Auth** (`auth.users`) - Handles login/passwords
2. **User Profiles** (`user_profiles`) - Stores role, name, office

When you create a user in Supabase Auth, it only creates the authentication record. You need to ALSO create their profile in the database.

---

## Verify It Worked

After running the SQL, test the login again:
1. Go back to your Averix app
2. Click the demo login button
3. You should now see: ✅ **"Demo login successful!"**

---

## Still Getting Errors?

### "relation 'user_profiles' does not exist"
You haven't run the database schema yet. See [HOW_TO_RUN_SQL.md](./HOW_TO_RUN_SQL.md)

### "duplicate key value violates unique constraint"
The user profile already exists! Try logging in again - it should work now.

### "foreign key violation on office_id"
The office doesn't exist. Make sure you ran the full DATABASE_SCHEMA.sql which creates the sample office.

---

## Need More Help?

See the full setup guides:
- **[QUICK_START.md](./QUICK_START.md)** - Step-by-step setup
- **[START_HERE.md](./START_HERE.md)** - Overview and checklist
- **[HOW_TO_RUN_SQL.md](./HOW_TO_RUN_SQL.md)** - Visual SQL guide
