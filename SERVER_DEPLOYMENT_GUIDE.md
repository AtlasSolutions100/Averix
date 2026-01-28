# Server Deployment Guide for Veridex

## 🚨 Current Status

You're seeing these errors because the **Supabase Edge Function server is not deployed yet**:

```
⚠️ Server health check error: TypeError: Load failed
❌ getMe API error: TypeError: Load failed
Login error: TypeError: Load failed
```

**This is normal!** The frontend is ready, but the backend needs to be deployed to Supabase.

---

## 🎯 What Needs to Be Deployed

The Veridex backend is a **Supabase Edge Function** located at:
```
/supabase/functions/server/index.tsx
```

This Hono web server handles:
- Authentication (signup, login, session management)
- User profiles (get user data, create reps)
- Office management (create offices, assign users)
- Store management (CRUD operations)
- Daily entries (logging production data)
- Goals management
- Analytics and reporting

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. ✅ **Supabase Project Created**
   - Project ID: `xyeoogvecvmbuvoczuva` (already in your config)
   - Project URL: `https://xyeoogvecvmbuvoczuva.supabase.co`

2. ✅ **Database Tables Created**
   - Run `/database-setup.sql` in Supabase SQL Editor
   - Creates: `offices`, `user_profiles`, `stores`, `daily_entries` tables

3. ✅ **Supabase CLI Installed**
   ```bash
   npm install -g supabase
   ```

4. ✅ **Logged into Supabase CLI**
   ```bash
   supabase login
   ```

---

## 🚀 Deployment Steps

### Step 1: Link Your Project

Navigate to your project root and link to your Supabase project:

```bash
supabase link --project-ref xyeoogvecvmbuvoczuva
```

You'll be prompted for your database password (the one you set when creating the project).

### Step 2: Deploy the Edge Function

Deploy the server function:

```bash
supabase functions deploy server
```

This will:
- Package `/supabase/functions/server/index.tsx`
- Upload to Supabase
- Make it available at: `https://xyeoogvecvmbuvoczuva.supabase.co/functions/v1/make-server-45dc47a9`

### Step 3: Set Environment Variables

The server needs these environment variables (automatically set by Supabase):

```bash
# These are automatically available in Edge Functions:
SUPABASE_URL=https://xyeoogvecvmbuvoczuva.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is sensitive. Get it from:
- Supabase Dashboard → Project Settings → API → Service Role Key

Set it with:
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Step 4: Verify Deployment

Test the health endpoint:

```bash
curl https://xyeoogvecvmbuvoczuva.supabase.co/functions/v1/make-server-45dc47a9/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZW9vZ3ZlY3ZtYnV2b2N6dXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDEwNjIsImV4cCI6MjA4NDcxNzA2Mn0._UwBcYt9um7sGDSstghgJDejVfKdifwnCI8WJCIX7LA"
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T..."
}
```

---

## 🧪 Testing After Deployment

Once deployed, test the full flow:

### Test 1: Health Check (Frontend)

Reload the app. You should see in the console:
```
✅ Config loaded: { projectId: 'xyeoogvecvmbuvoczuva', hasKey: true }
🏥 Testing server health: https://...
✅ Server is healthy: { status: 'healthy', ... }
```

### Test 2: Signup

1. Click "Create one now" on login page
2. Fill in owner details:
   - Name: Test Owner
   - Email: test@example.com
   - Password: test123
   - Role: Owner
   - Office Name: Test Office
3. Click "Create Account"

**Expected:**
- Account created successfully
- Automatically logged in
- Empty dashboard appears
- New office created in database

### Test 3: Create Rep

1. Navigate to Team Management
2. Click "Add Rep"
3. Fill in rep details
4. Click "Create Rep"

**Expected:**
- Rep created successfully
- Credentials shown
- Rep appears in team list

### Test 4: Rep Login

1. Log out
2. Log in with rep credentials
3. **Expected:** Rep dashboard appears

---

## 🐛 Troubleshooting

### Error: "Function not found"

**Cause:** Function not deployed or deployed with wrong name.

**Fix:**
```bash
# Check deployed functions
supabase functions list

# Should show 'server' in the list
# If not, deploy again:
supabase functions deploy server
```

### Error: "Invalid JWT"

**Cause:** Wrong anon key or service role key.

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the correct keys
3. Update `/utils/supabase/info.tsx` with anon key
4. Set service role key:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<correct-key>
   ```

### Error: "CORS error"

**Cause:** CORS not configured properly in Edge Function.

**Fix:** The server already has CORS configured in `/supabase/functions/server/index.tsx`:
```typescript
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-Token'],
}));
```

If still getting CORS errors, redeploy:
```bash
supabase functions deploy server
```

### Error: "Database error"

**Cause:** Database tables not created.

**Fix:**
1. Open Supabase Dashboard → SQL Editor
2. Run the entire `/database-setup.sql` file
3. Verify tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Error: "Signup works but login fails"

**Cause:** User created in Auth but not in `user_profiles` table.

**Fix:**
Check if user exists in both:
```sql
-- Check Auth users (via Supabase Dashboard → Authentication)
-- Check user_profiles
SELECT * FROM user_profiles WHERE email = 'your-email@example.com';
```

If missing from `user_profiles`, the signup endpoint failed. Check Edge Function logs:
```bash
supabase functions logs server
```

---

## 📊 Verifying Everything Works

After deployment, you should be able to:

✅ See "Server is healthy" in browser console  
✅ Sign up as a new owner  
✅ Automatically log in after signup  
✅ See your new office in Team Management  
✅ Create reps from Team Management  
✅ Log out and log in as rep  
✅ See rep dashboard with stores from your office  
✅ Complete data isolation between offices  

---

## 🔍 Viewing Logs

To debug issues, view real-time logs:

```bash
# View logs for the server function
supabase functions logs server --follow
```

This shows:
- All console.log() output
- Errors and stack traces
- Request/response data
- Database queries

---

## 📝 Quick Deploy Checklist

```bash
# 1. Install Supabase CLI (if not already)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link project
supabase link --project-ref xyeoogvecvmbuvoczuva

# 4. Deploy function
supabase functions deploy server

# 5. Set service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# 6. Test deployment
curl https://xyeoogvecvmbuvoczuva.supabase.co/functions/v1/make-server-45dc47a9/health \
  -H "Authorization: Bearer <your-anon-key>"

# 7. Reload frontend app
# Should now work! ✅
```

---

## 🎯 What Happens After Deployment

1. **Frontend connects to backend** ✅
2. **Health check passes** ✅
3. **Signup/login works** ✅
4. **Demo accounts accessible** ✅
5. **New offices can be created** ✅
6. **Reps can be added** ✅
7. **Complete multi-tenant isolation** ✅
8. **Production-ready!** 🚀

---

## 💡 Alternative: Local Development

If you want to test locally before deploying:

```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve server --env-file ./supabase/.env.local

# Update frontend to point to local server
# In /src/services/api.ts, temporarily change:
return `http://localhost:54321/functions/v1/make-server-45dc47a9`;
```

**Note:** Local development requires Docker to be running.

---

## ✅ Summary

The errors you're seeing are **expected** because the server isn't deployed yet.

**To fix:**
1. Run `supabase functions deploy server`
2. Set the service role key secret
3. Reload the frontend
4. Everything should work! 🎉

The frontend is **completely ready**. Once the backend is deployed, you'll have a fully functional multi-tenant analytics platform! 🚀
