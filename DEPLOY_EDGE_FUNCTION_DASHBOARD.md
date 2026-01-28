# 🚀 Deploy Edge Function via Dashboard (iPad/Mobile Friendly)

## Current Status
- ✅ RLS fixed (database queries work)
- ❌ Edge Function not running (health check fails)
- ❌ Backend returns "Invalid JWT"

The health endpoint should return `{"status":"ok"}` but instead returns `{"code":401,"message":"Missing authorization header"}`. This proves the Edge Function isn't deployed correctly.

---

## 📋 Step-by-Step Dashboard Deployment

### Step 1: Open Edge Functions Page

Go to:
```
https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/functions
```

You should see a list of Edge Functions. Look for `make-server-45dc47a9`.

---

### Step 2: Deploy/Update the Function

**If `make-server-45dc47a9` exists:**
1. Click on the function name
2. Click **"Deploy new version"** or **"Edit"**
3. Make sure the function name is: `make-server-45dc47a9`

**If `make-server-45dc47a9` doesn't exist:**
1. Click **"+ Create a new function"**
2. Function name: `make-server-45dc47a9`
3. Click **"Create function"**

---

### Step 3: Configure Function Settings

**CRITICAL: Check these settings**

1. **Function Name:** `make-server-45dc47a9` (must match exactly!)
2. **Import map:** Should be blank or default
3. **Verify JWT:** ❌ **UNCHECK THIS BOX** ← This is probably why it's failing!

**Why "Verify JWT" must be unchecked:**
- When checked, Supabase validates JWTs BEFORE your code runs
- Our `/health` endpoint doesn't need auth, so it should work without a token
- Our custom code handles JWT validation using the `requireAuth` middleware

---

### Step 4: Copy Function Code

You need to copy the code from your local file to the dashboard editor.

**Option A: From your computer (when you're back)**
1. Open `/supabase/functions/server/index.tsx`
2. Copy all the code
3. Paste into the dashboard editor

**Option B: From iPad (use this raw URL)**
Since you can't easily access the file on iPad, I'll provide the deployment URL:

The code is too long to paste here, but here's what you need:
- All imports (Hono, cors, logger, supabase-js)
- All middleware (CORS, logger, auth)
- All routes (health, auth, users, offices, stores, daily-entries, analytics)
- Deno.serve(app.fetch) at the end

---

### Step 5: Verify Environment Variables

Make sure these 3 secrets are set (from earlier):

Go to: Edge Functions → Settings → Secrets

✅ `SUPABASE_URL` = `https://xyeoogvecvmbuvoczuva.supabase.co`
✅ `SUPABASE_ANON_KEY` = `eyJhbGci...` (the long key)
✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGci...` (from Settings → API)

---

### Step 6: Deploy

1. Click **"Deploy function"** or **"Save"**
2. Wait for deployment to complete (usually 30-60 seconds)
3. Check for any error messages

---

## ✅ Verification

After deployment, test the health endpoint:

**Method 1: Browser**
Open this URL in Safari:
```
https://xyeoogvecvmbuvoczuva.supabase.co/functions/v1/make-server-45dc47a9/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-01-28T..."}
```

**Method 2: Debug Tool**
1. Go to Averix app
2. Click "🔍 Debug Authentication Issues"
3. Click "Run Full Authentication Test"
4. Step 2 should now show: `✅ Health check: {"status":"ok",...}`

---

## 🚨 Troubleshooting

### Still seeing "Missing authorization header"?

**Check 1: Function name**
- Must be exactly: `make-server-45dc47a9`
- No spaces, no typos

**Check 2: Verify JWT setting**
- Go to function settings
- Make sure "Verify JWT" is **UNCHECKED**
- This is the most common issue!

**Check 3: Code deployed**
- Click on the function
- Check if code is present in the editor
- Should have all routes (health, auth, users, etc.)

### Error: "Function not found"

The function wasn't created or has the wrong name.
- Delete and recreate with exact name: `make-server-45dc47a9`

### Error: "Module not found"

The imports are wrong. Make sure you're using:
- `npm:hono` (not just `hono`)
- `npm:hono/cors` (not `npm:hono/middleware`)
- `jsr:@supabase/supabase-js@2`

### Deployment succeeds but still doesn't work

Check the function logs:
1. Go to: https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/logs/edge-functions
2. Look for errors
3. Share any error messages you see

---

## 🎯 Quick Checklist

Before testing:
- [ ] Function name is `make-server-45dc47a9`
- [ ] "Verify JWT" is **UNCHECKED**
- [ ] All 3 environment variables are set
- [ ] Function code is deployed
- [ ] Deployment succeeded (no errors)
- [ ] Waited 1-2 minutes after deployment

---

## 💡 Why This Matters

Once the Edge Function is deployed correctly:
- ✅ Health check will return `{"status":"ok"}`
- ✅ `/auth/me` will work
- ✅ Login will work
- ✅ All API endpoints will work
- ✅ Averix will be fully functional!

The Edge Function is your backend server - without it running, the frontend can't communicate with the database (except for direct queries).

---

## 📞 Need Help?

If you're still stuck after trying these steps, share:
1. Screenshot of the Edge Functions page
2. Screenshot of the function settings (especially "Verify JWT" checkbox)
3. Any error messages from deployment or logs
4. The latest debug test results
