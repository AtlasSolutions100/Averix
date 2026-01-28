# Fix: "Only owners can create goals" Error

## Date: January 28, 2026

---

## ✅ What Was Fixed

1. **Enhanced Backend Logging** - Added detailed debug logs to show exactly what role the user has
2. **Fixed Signup Bug** - Corrected SignupPage.tsx to pass `officeName` instead of empty string
3. **Added Debug Endpoint** - Created `/debug/my-profile` to check your actual profile data

---

## 🔍 Diagnosis

You're seeing this error:
```
Create goal API error: Error: Only owners can create goals
Failed to add goal: Error: Only owners can create goals
```

This means your user profile's `role` field is NOT set to `'owner'` in the database.

---

## ✅ How to Check Your Role

### Option 1: Check Supabase Logs

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **make-server-45dc47a9** → **Logs**
3. Try to create a goal again
4. Look for this log line:
   ```
   ✅ User profile for goal creation: { userId: xxx, role: 'YOUR_ROLE', officeId: xxx }
   ```
5. If `role` is not `'owner'`, that's the problem!

### Option 2: Use Debug Endpoint

Open your browser console and run:

```javascript
async function checkMyProfile() {
  const session = await (await fetch('https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: localStorage.getItem('sb-YOUR_PROJECT-auth-token') })
  })).json();
  
  const response = await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-45dc47a9/debug/my-profile', {
    headers: {
      'X-User-Token': session.access_token,
      'Authorization': 'Bearer YOUR_ANON_KEY'
    }
  });
  
  console.log(await response.json());
}

checkMyProfile();
```

Replace:
- `YOUR_PROJECT` with your Supabase project ID
- `YOUR_ANON_KEY` with your anon key

---

## 🔧 How to Fix Your Role

### Method 1: SQL Editor (Recommended)

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query:

```sql
-- Check your current role
SELECT id, email, name, role, office_id 
FROM user_profiles 
WHERE email = 'your_email@example.com';

-- If role is wrong, fix it:
UPDATE user_profiles 
SET role = 'owner' 
WHERE email = 'your_email@example.com';

-- Verify the change:
SELECT id, email, name, role, office_id 
FROM user_profiles 
WHERE email = 'your_email@example.com';
```

Replace `your_email@example.com` with your actual email.

### Method 2: Table Editor

1. Go to Supabase Dashboard → **Table Editor**
2. Select `user_profiles` table
3. Find your row (search by email)
4. Click the `role` cell
5. Change it to `owner`
6. Save

---

## 🔍 Why Did This Happen?

There was a bug in `SignupPage.tsx` (now fixed) where it was passing an empty string instead of the office name during owner signup:

```typescript
// ❌ OLD (BUG):
authAPI.signUp(email, password, name, role, role === "owner" ? "" : officeId)

// ✅ NEW (FIXED):
authAPI.signUp(email, password, name, role, role === "owner" ? officeName : officeId)
```

If you signed up as an owner **before this fix**, your account was created but you may need to verify the role was set correctly.

---

## ✅ After Fixing

Once your role is set to `'owner'` in the database:

1. **Refresh your browser** (or log out and log back in)
2. Try creating a goal again
3. It should work! ✨

---

## 🧪 Test All Owner Features

After fixing your role, test these features (owner-only):

- ✅ Create goals
- ✅ Update goals  
- ✅ Delete goals
- ✅ Add stores
- ✅ Edit stores
- ✅ Delete stores
- ✅ Create rep accounts
- ✅ Edit rep accounts
- ✅ Delete rep accounts
- ✅ View all office entries
- ✅ View team management
- ✅ Update office settings

All of these require `role = 'owner'` in the database.

---

## 🚨 Still Not Working?

If you've fixed your role and it's still not working:

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Log out completely** and log back in
3. **Check the console** for any JavaScript errors
4. **Check Supabase logs** to see the actual API calls
5. **Verify the token** contains the correct user ID:
   ```javascript
   // In console:
   const token = localStorage.getItem('sb-YOUR_PROJECT-auth-token');
   console.log(JSON.parse(atob(token.split('.')[1])));
   ```

---

## 📝 Prevention

This bug is now fixed in the codebase. Any **NEW** signups as owner will work correctly.

If you have multiple owners who signed up before this fix, they may all need their roles verified/fixed using the SQL query above.

---

## 🎯 Summary

| Issue | Solution |
|-------|----------|
| "Only owners can create goals" | Set `role = 'owner'` in `user_profiles` table |
| SignupPage bug | Fixed - now passes `officeName` correctly |
| Can't debug role | Use `/debug/my-profile` endpoint or check Supabase logs |
| Need to verify role | Run SQL query in Supabase Dashboard |

**Status:** ✅ Fixed - Enhanced logging + signup bug resolved + debug endpoint added
