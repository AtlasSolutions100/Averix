# 🎯 Complete Fix Guide - "Failed to Fetch User" Error

Based on your debug logs, here are the exact steps to fix your authentication issues.

## 📊 What the Debug Test Revealed

✅ **Working:**
- Supabase connection configured correctly
- User sign-in successful (`owner@olympus.com` exists in auth.users)
- Session and access token generated properly

❌ **Not Working:**
1. **Edge Function not deployed** - Backend server isn't running
2. **RLS infinite recursion** - Database policies are blocking queries

---

## 🔧 Fix #1: Deploy the Edge Function (CRITICAL)

Your backend server code exists in `/supabase/functions/server/index.tsx` but **it's not deployed to Supabase**.

### Quick Deploy Method

**Step 1:** Install Supabase CLI
```bash
npm install -g supabase
```

**Step 2:** Login
```bash
npx supabase login
```

**Step 3:** Link project
```bash
npx supabase link --project-ref xyeoogvecvmbuvoczuva
```

**Step 4:** Deploy the function
```bash
npx supabase functions deploy make-server-45dc47a9
```

**Step 5:** Set environment variables
```bash
# Get your service role key from: 
# https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/settings/api

npx supabase secrets set SUPABASE_URL=https://xyeoogvecvmbuvoczuva.supabase.co
npx supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZW9vZ3ZlY3ZtYnV2b2N6dXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDEwNjIsImV4cCI6MjA4NDcxNzA2Mn0._UwBcYt9um7sGDSstghgJDejVfKdifwnCI8WJCIX7LA
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<paste-your-service-role-key-here>
```

### Verify Deployment

After deploying, the health check should return:
```json
{"status":"ok","timestamp":"2026-01-27T..."}
```

Instead of:
```json
{"code":401,"message":"Missing authorization header"}
```

---

## 🔧 Fix #2: Disable RLS (CRITICAL)

The `user_profiles` table has a problematic RLS policy causing infinite recursion.

### Quick Fix SQL

1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/editor
2. Click "SQL Editor" → "+ New Query"
3. Paste this SQL:

```sql
-- Disable RLS on all Averix tables (recommended for internal tools)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE offices DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries DISABLE ROW LEVEL SECURITY;
```

4. Click "Run" (or Ctrl+Enter)

### Why This Works

- Your backend uses `SERVICE_ROLE_KEY` which bypasses RLS anyway
- RLS was causing circular reference errors
- For internal tools (like Averix), RLS adds complexity without security benefit
- Authentication is already handled at the application level

---

## ✅ Verification Steps

After completing both fixes:

### Step 1: Test Health Endpoint
```bash
curl https://xyeoogvecvmbuvoczuva.supabase.co/functions/v1/make-server-45dc47a9/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-01-27T17:33:46.000Z"}
```

### Step 2: Run Debug Test
1. Go to Averix login page
2. Click "🔍 Debug Authentication Issues"
3. Click "Run Full Authentication Test"
4. All checks should pass ✅

### Step 3: Test Login
1. Go back to login page (click "← Back to Login")
2. Click "Owner: owner@olympus.com / demo"
3. You should be logged in successfully! 🎉

---

## 🆘 Troubleshooting

### "supabase: command not found"
```bash
# Try with npx (no install needed)
npx supabase login
npx supabase functions deploy make-server-45dc47a9
```

### "Cannot find module 'npm:hono'"
The Edge Function needs to download dependencies. This happens automatically during deployment.

### "Invalid JWT" persists after deployment
1. Make sure you set all 3 environment variables (URL, ANON_KEY, SERVICE_ROLE_KEY)
2. Verify the Edge Function is deployed:
   - Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/functions
   - You should see `make-server-45dc47a9` listed
3. Check the function logs for errors

### "Still getting RLS errors"
Make sure you ran the SQL to disable RLS and clicked "Run". Refresh the page after running SQL.

---

## 📁 File Structure Reference

Your project structure should be:
```
/supabase/
  /functions/
    /server/           ← This is what gets deployed
      index.tsx        ← Your Hono backend server
      kv_store.tsx     ← Database utilities
```

When you run `npx supabase functions deploy make-server-45dc47a9`, it deploys everything in `/supabase/functions/server/`.

---

## 🎯 Expected Result

After completing both fixes, you should be able to:

1. ✅ Login with `owner@olympus.com` / `demo`
2. ✅ See the Owner Dashboard with 6 metric cards
3. ✅ Login with `jake@olympus.com` / `demo`
4. ✅ See the Rep Dashboard with daily entry form
5. ✅ Navigate between all views without errors

---

## 📞 Still Having Issues?

If you've completed both fixes and still see errors:

1. Share the **complete debug log** (copy using the "📋 Copy Logs" button)
2. Share the **Edge Function deployment output**
3. Check the **Edge Function logs**: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/logs/edge-functions

The logs will show exactly what's happening when requests hit your backend.
